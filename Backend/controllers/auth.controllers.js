import User from "../models/user.model.js"
import bcrypt from "bcryptjs"
import genToken from "../utils/token.js"
import { sendOtpMail } from "../utils/mail.js"

const getCookieOptions = (req) => {
    const origin = req?.headers?.origin || req?.headers?.referer || "";
    const isDeployed = origin.includes("vercel.app") || origin.includes("onrender.com") || process.env.NODE_ENV === 'production' || Boolean(process.env.RENDER);
    return {
        secure: isDeployed,
        sameSite: isDeployed ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    };
};

export const signUp = async (req, res) => {
    try {
        const { fullName, email, password, mobile, role } = req.body
        if (!fullName || !email || !password || !mobile) {
            return res.status(400).json({ message: "All fields (fullName, email, password, mobile) are required." })
        }
        let user = await User.findOne({ email })
        if (user) {
            return res.status(400).json({ message: "User Already exist." })
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "password must be at least 6 characters." })
        }
        if (mobile.length < 10) {
            return res.status(400).json({ message: "mobile no must be at least 10 digits." })
        }
     
        const hashedPassword = await bcrypt.hash(password, 10)
        user = await User.create({
            fullName,
            email,
            role: role || "user",
            mobile,
            password: hashedPassword
        })

        const token = await genToken(user._id)
        res.cookie("token", token, getCookieOptions(req))
  
        return res.status(201).json(user)

    } catch (error) {
        return res.status(500).json({ message: `sign up error: ${error.message || error}` })
    }
}

export const signIn = async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." })
        }
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: "User does not exist." })
        }
        if (!user.password) {
            return res.status(400).json({ message: "User registered via Google. Please use Google Sign-In." })
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({ message: "incorrect Password" })
        }

        const token = await genToken(user._id)
        res.cookie("token", token, getCookieOptions(req))
  
        return res.status(200).json(user)

    } catch (error) {
        return res.status(500).json({ message: `sign In error: ${error.message || error}` })
    }
}

export const signOut = async (req, res) => {
    try {
        res.clearCookie("token", getCookieOptions(req))
        return res.status(200).json({ message: "log out successfully" })
    } catch (error) {
        return res.status(500).json({ message: `sign out error: ${error.message || error}` })
    }
}

export const sendOtp = async (req, res) => {
    try {
        const { email } = req.body
        if (!email) {
            return res.status(400).json({ message: "Email is required" })
        }
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: "User does not exist." })
        }
        const otp = Math.floor(1000 + Math.random() * 9000).toString()
        user.resetOtp = otp
        user.otpExpires = Date.now() + 5 * 60 * 1000
        user.isOtpVerified = false
        await user.save()
        await sendOtpMail(email, otp)
        return res.status(200).json({ message: "otp sent successfully" })
    } catch (error) {
        return res.status(500).json({ message: `send otp error: ${error.message || error}` })
    }  
}

export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body
        if (!email || !otp) {
            return res.status(400).json({ message: "Email and OTP are required" })
        }
        const user = await User.findOne({ email })
        if (!user || !user.resetOtp || user.resetOtp !== String(otp) || !user.otpExpires || user.otpExpires < Date.now()) {
            return res.status(400).json({ message: "invalid/expired otp" })
        }
        user.isOtpVerified = true
        user.resetOtp = undefined
        user.otpExpires = undefined
        await user.save()
        return res.status(200).json({ message: "otp verify successfully" })
    } catch (error) {
        return res.status(500).json({ message: `verify otp error: ${error.message || error}` })
    }
}

export const resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body
        if (!email || !newPassword) {
            return res.status(400).json({ message: "Email and newPassword are required" })
        }
        const user = await User.findOne({ email })
        if (!user || !user.isOtpVerified) {
            return res.status(400).json({ message: "otp verification required" })
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10)
        user.password = hashedPassword
        user.isOtpVerified = false
        await user.save()
        return res.status(200).json({ message: "password reset successfully" })
    } catch (error) {
        return res.status(500).json({ message: `reset password error: ${error.message || error}` })
    }
}

export const googleAuth = async (req, res) => {
    try {
        const { fullName, email, mobile, role } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email is required for Google auth" })
        }
        let user = await User.findOne({ email });
        if (!user) {
            user = await User.create({
                fullName: fullName || email.split('@')[0],
                email,
                mobile: mobile || "",
                role: role || "user"
            });
        }

        const token = await genToken(user._id);
        res.cookie("token", token, getCookieOptions(req));
  
        return res.status(200).json(user);

    } catch (error) {
        return res.status(500).json({ message: `googleAuth error: ${error.message || error}` });
    }
}

