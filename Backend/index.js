import express from "express"
import dotenv from "dotenv"
dotenv.config()
import connectDb from "./config/db.js"
import cookieParser from "cookie-parser"
import cors from "cors"
import http from "http"

import authRoutes from "./routes/auth.routes.js"
import userRoutes from "./routes/user.routes.js"
import shopRoutes from "./routes/shop.routes.js"
import itemRoutes from "./routes/item.routes.js"
import orderRoutes from "./routes/order.routes.js"
import deliveryRoutes from "./routes/delivery.routes.js"

const app = express()
const server = http.createServer(app)

const port = process.env.PORT || 5001
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174", "https://food-bowl.vercel.app"],
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())

app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/shop', shopRoutes)
app.use('/api/item', itemRoutes)
app.use('/api/orders', orderRoutes) // corrected: plural 'orders' to match frontend
app.use('/api/delivery', deliveryRoutes)

server.listen(port, () => {
    connectDb()
    console.log(`server started at ${port}`)
})
