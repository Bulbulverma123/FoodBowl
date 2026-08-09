import jwt from "jsonwebtoken"

const isAuth = async (req, res, next) => {
    try {
        const token = req.cookies && req.cookies.token
        if (!token) {
            return res.status(401).json({ message: "Unauthorized: No token provided" })
        }
        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET not set in environment")
            return res.status(500).json({ message: "Server configuration error: JWT_SECRET missing" })
        }
        const decodeToken = jwt.verify(token, process.env.JWT_SECRET)
        if (!decodeToken || !decodeToken.userId) {
            return res.status(401).json({ message: "Unauthorized: Invalid token payload" })
        }
        req.userId = decodeToken.userId
        return next()
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized: Invalid token" })
    }
}

export default isAuth