import User from "../models/user.model.js"

export const getCurrentUser = async (req, res) => {
    try {
        const userId = req.userId
        if (!userId) {
            return res.status(400).json({ message: "userId is not found" })
        }
        const user = await User.findById(userId)
        if (!user) {
            return res.status(400).json({ message: "user is not found" })
        }
        return res.status(200).json(user)
    } catch (error) {
        return res.status(500).json({ message: `get current user error ${error.message || error}` })
    }
}

export const updateUserLocation = async (req, res) => {
    try {
        const { lat, lon } = req.body
        if (lat === undefined || lon === undefined || lat === null || lon === null) {
            return res.status(400).json({ message: "latitude (lat) and longitude (lon) are required" })
        }
        const user = await User.findByIdAndUpdate(req.userId, {
            location: {
                type: 'Point',
                coordinates: [Number(lon), Number(lat)]
            }
        }, { new: true })
        if (!user) {
            return res.status(400).json({ message: "user is not found" })
        }
        
        return res.status(200).json({ message: 'location updated', user })
    } catch (error) {
        return res.status(500).json({ message: `update location user error ${error.message || error}` })
    }
}


