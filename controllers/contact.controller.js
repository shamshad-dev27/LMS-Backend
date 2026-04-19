
import Contact from "../models/contact.modle.js";

export const sendMessage = async (req, res, next) => {
    try {
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            return next(new appError("All fields are required", 400));
        }

        // Save in DB
        const contact = await Contact.create({
            Name: name,
            email,
            Message: message,
        });

        res.status(201).json({
            success: true,
            message: "Message sent successfully",
            contact,
        });

    } catch (error) {
        next(error);
    }
};

export const getMessage = async (req, res, next) => {
    try {
        const messages = await Contact.find({})
            .sort({ createdAt: -1 })
            .lean();

        if (!messages || messages.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No messages found",
            });
        }

        res.status(200).json({
            success: true,
            count: messages.length,
            messages,
        });

    } catch (error) {
        next(error);
    }
};