import jwt from "jsonwebtoken";

const isAuth = async (req, res, next) => {
  try {
    // require cookie-parser middleware in your app:
    // app.use(cookieParser());
    const token = req.cookies && req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET not set in environment");
      return res.status(500).json({ message: "Server configuration error" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      // token invalid or expired
      return res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
    }

    if (!decoded || !decoded.userId) {
      return res.status(401).json({ message: "Unauthorized: Invalid token payload" });
    }

    req.userId = decoded.userId;
    return next();
  } catch (error) {
    console.error("isAuth middleware error:", error);
    return res.status(500).json({ message: "Internal auth error" });
  }
};

export default isAuth;
