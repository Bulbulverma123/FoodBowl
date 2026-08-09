import Item from "../models/item.model.js";
import Shop from "../models/shop.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

export const addItem = async (req, res) => {
    try {
        const { name, category, foodType, price } = req.body
        let image;
        if (req.file) {
            image = await uploadOnCloudinary(req.file.path)
        }
        const shop = await Shop.findOne({ owner: req.userId })
        if (!shop) {
            return res.status(400).json({ message: "shop not found" })
        }
        const item = await Item.create({
            name, category, foodType, price: Number(price), image, shop: shop._id
        })

        shop.items.push(item._id)
        await shop.save()
        await shop.populate("owner")
        await shop.populate({
            path: "items",
            options: { sort: { updatedAt: -1 } }
        })
        return res.status(201).json(shop)

    } catch (error) {
        return res.status(500).json({ message: `add item error ${error.message || error}` })
    }
}

export const editItem = async (req, res) => {
    try {
        const itemId = req.params.itemId
        const { name, category, foodType, price } = req.body
        let image;
        if (req.file) {
            image = await uploadOnCloudinary(req.file.path)
        }
        const updateData = { name, category, foodType }
        if (price !== undefined) {
            updateData.price = Number(price)
        }
        if (image) {
            updateData.image = image
        }
        const item = await Item.findByIdAndUpdate(itemId, updateData, { new: true })
        if (!item) {
            return res.status(400).json({ message: "item not found" })
        }
        const shop = await Shop.findOne({ owner: req.userId }).populate({
            path: "items",
            options: { sort: { updatedAt: -1 } }
        })
        return res.status(200).json(shop)

    } catch (error) {
        return res.status(500).json({ message: `edit item error ${error.message || error}` })
    }
}

export const getItemById = async (req, res) => {
    try {
        const itemId = req.params.itemId
        const item = await Item.findById(itemId)
        if (!item) {
            return res.status(400).json({ message: "item not found" })
        }
        return res.status(200).json(item)
    } catch (error) {
        return res.status(500).json({ message: `get item error ${error.message || error}` })
    }
}

export const deleteItem = async (req, res) => {
    try {
        const itemId = req.params.itemId
        const item = await Item.findByIdAndDelete(itemId)
        if (!item) {
            return res.status(400).json({ message: "item not found" })
        }
        const shop = await Shop.findOne({ owner: req.userId })
        if (shop) {
            shop.items = shop.items.filter(i => i.toString() !== item._id.toString())
            await shop.save()
            await shop.populate({
                path: "items",
                options: { sort: { updatedAt: -1 } }
            })
            return res.status(200).json(shop)
        }
        return res.status(200).json({ message: "Item deleted successfully" })

    } catch (error) {
        return res.status(500).json({ message: `delete item error ${error.message || error}` })
    }
}

export const getItemByCity = async (req, res) => {
    try {
        const { city } = req.params
        if (!city) {
            return res.status(400).json({ message: "city is required" })
        }
        const shops = await Shop.find({
            city: { $regex: new RegExp(`^${city}$`, "i") }
        }).populate('items')
        if (!shops || shops.length === 0) {
            return res.status(200).json([])
        }
        const shopIds = shops.map((shop) => shop._id)

        const items = await Item.find({ shop: { $in: shopIds } })
        return res.status(200).json(items)

    } catch (error) {
        return res.status(500).json({ message: `get item by city error ${error.message || error}` })
    }
}

export const getItemsByShop = async (req, res) => {
    try {
        const { shopId } = req.params
        const shop = await Shop.findById(shopId).populate("items")
        if (!shop) {
            return res.status(400).json({ message: "shop not found" })
        }
        return res.status(200).json({
            shop, items: shop.items
        })
    } catch (error) {
        return res.status(500).json({ message: `get item by shop error ${error.message || error}` })
    }
}

export const searchItems = async (req, res) => {
    try {
        const { query, city } = req.query
        if (!query || !city) {
            return res.status(200).json([])
        }
        const shops = await Shop.find({
            city: { $regex: new RegExp(`^${city}$`, "i") }
        }).populate('items')
        if (!shops || shops.length === 0) {
            return res.status(200).json([])
        }
        const shopIds = shops.map(s => s._id)
        const items = await Item.find({
            shop: { $in: shopIds },
            $or: [
                { name: { $regex: query, $options: "i" } },
                { category: { $regex: query, $options: "i" } }
            ]

        }).populate("shop", "name image")

        return res.status(200).json(items)

    } catch (error) {
        return res.status(500).json({ message: `search item error ${error.message || error}` })
    }
}

export const rating = async (req, res) => {
    try {
        const { itemId, rating } = req.body

        if (!itemId || rating === undefined || rating === null) {
            return res.status(400).json({ message: "itemId and rating is required" })
        }

        const numRating = Number(rating)
        if (numRating < 1 || numRating > 5) {
            return res.status(400).json({ message: "rating must be between 1 to 5" })
        }

        const item = await Item.findById(itemId)
        if (!item) {
            return res.status(400).json({ message: "item not found" })
        }

        if (!item.rating) {
            item.rating = { average: 0, count: 0 }
        }

        const currentCount = item.rating.count || 0
        const currentAvg = item.rating.average || 0

        const newCount = currentCount + 1
        const newAverage = (currentAvg * currentCount + numRating) / newCount

        item.rating.count = newCount
        item.rating.average = newAverage
        await item.save()
        return res.status(200).json({ rating: item.rating })

    } catch (error) {
        return res.status(500).json({ message: `rating error ${error.message || error}` })
    }
}