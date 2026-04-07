import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        type: {
            type: String,
            default: "system", // E.g., 'schedule', 'payment', 'system'
        },
        link: {
            type: String,
            default: "", // Optional link to redirect when clicked
        }
    },
    {
        timestamps: true,
    }
);

// Index to quickly find unread notifications for a user
notificationSchema.index({ userId: 1, isRead: 1 });

export default mongoose.model("Notification", notificationSchema);
