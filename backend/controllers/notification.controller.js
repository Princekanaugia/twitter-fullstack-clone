import Notification from "../models/notification.model.js"

export const getNotifications = async (req, res) => {
    const userId = req.user._id

    try {
        const notifications = await Notification.find({ to: userId })
        .sort({ createdAt: -1 })
        .populate({
            path: "from",
            select: "username profileImg"
        })

        await Notification.updateMany({ to: userId }, { read: true })

        res.status(200).json(notifications)

    } catch (error) {
        console.log("Error in getNotifications controller: ", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export const deleteNotifications = async (req, res) => {
    try {
        const userId = req.user._id
        
        await Notification.deleteMany({ to: userId})
        
        res.status(200).json({ message: "Notification Deleted Successfully" })

    } catch (error) {
        console.log("Error in deleteNotifications controller: ", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export const deleteOneNotification = async (req, res) => {
    try {
        const userId = req.user._id
        const notificationId = req.params.id
        const notification = await Notification.findById(notificationId)

        if (!notification) {
            return res.sataus(404).json({ error: "Notification Not Found" })
        }

        if (notification.to.toString() !== userId.toString()) {
            return res.status(403).json({ error: "You are not allowed to Delete this Notification" })
        }
        
        await Notification.findByIdAndDelete(notificationId)
        
        res.status(200).json({ message: "Notification Deleted Successfully" })

    } catch (error) {
        console.log("Error in deleteOneNotification controller: ", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}