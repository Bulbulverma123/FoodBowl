import express from "express"
import dotenv from "dotenv"
dotenv.config({ quiet: true })
import connectDb from "./config/db.js"
import cookieParser from "cookie-parser"
import cors from "cors"
import http from "http"
import { Server } from "socket.io"
import { socketHandler } from "./socket.js"

import authRoutes from "./routes/auth.routes.js"
import userRoutes from "./routes/user.routes.js"
import shopRoutes from "./routes/shop.routes.js"
import itemRoutes from "./routes/item.routes.js"
import orderRoutes from "./routes/order.routes.js"
import deliveryRoutes from "./routes/delivery.routes.js"

const app = express()
const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "http://localhost:5174", "https://food-bowl.vercel.app"],
        credentials: true
    }
})

app.set("io", io)
socketHandler(io)

const port = process.env.PORT || 8000
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174", "https://food-bowl.vercel.app"],
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())

app.use('/api/auth', authRoutes)
app.use('/', authRoutes) // root alias for direct frontend auth routes like /send-otp
app.use('/api/user', userRoutes)
app.use('/api/shop', shopRoutes)
app.use('/api/item', itemRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/order', orderRoutes) // alias for singular /api/order calls
app.use('/api/delivery', deliveryRoutes)

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`\n❌ Port ${port} is already in use.`)
        console.error(`   Run this to free it:  npx kill-port ${port}\n`)
        process.exit(1)
    } else {
        throw err
    }
})

server.listen(port, () => {
    connectDb()
    console.log(`✅ Server started at port ${port}`)
})

