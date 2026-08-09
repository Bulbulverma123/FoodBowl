import { v2 as cloudinary } from 'cloudinary'
import fs from "fs"

const uploadOnCloudinary = async (file) => {
    if (!file) return null;
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
    try {
        const result = await cloudinary.uploader.upload(file)
        if (fs.existsSync(file)) {
            fs.unlinkSync(file)
        }
        return result.secure_url
    } catch (error) {
        if (fs.existsSync(file)) {
            fs.unlinkSync(file)
        }
        console.error("Cloudinary upload error:", error)
        return null
    }
}

export default uploadOnCloudinary