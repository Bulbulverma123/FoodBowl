import Shop from "../models/shop.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

export const createEditShop = async (req, res) => {
    try {
        const { name, city, state, address } = req.body
        let image;
        if (req.file) {
            image = await uploadOnCloudinary(req.file.path)
        } 
        let shop = await Shop.findOne({ owner: req.userId })
        if (!shop) {
            shop = await Shop.create({
                name, city, state, address, image, owner: req.userId
            })
        } else {
            const updateData = { name, city, state, address, owner: req.userId }
            if (image) {
                updateData.image = image
            }
            shop = await Shop.findByIdAndUpdate(shop._id, updateData, { new: true })
        }
      
        await shop.populate("owner items")
        return res.status(201).json(shop)
    } catch (error) {
        return res.status(500).json({ message: `create shop error ${error.message || error}` })
    }
}

export const getMyShop = async (req, res) => {
    try {
        const shop = await Shop.findOne({ owner: req.userId }).populate("owner").populate({
            path: "items",
            options: { sort: { updatedAt: -1 } }
        })
        if (!shop) {
            return res.status(200).json(null)
        }
        return res.status(200).json(shop)
    } catch (error) {
        return res.status(500).json({ message: `get my shop error ${error.message || error}` })
    }
}

export const getShopByCity = async (req, res) => {
    try {
        const { city } = req.params
        if (!city || city.trim() === "") {
            return res.status(400).json({ message: "Invalid city parameter" });
        }
        const shops = await Shop.find({
            city: { $regex: new RegExp(`^${city}$`, "i") }
        }).populate('items')
        
        return res.status(200).json(shops || [])
    } catch (error) {
        console.error("get shop by city error:", error);
        return res.status(500).json({ message: `get shop by city error ${error.message || error}` })
    }
}

