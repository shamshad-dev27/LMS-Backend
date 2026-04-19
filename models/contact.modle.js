import { model, Schema } from "mongoose";

const contactSchema = new Schema({
    Name: {
        type: String,
        required: [true, 'Name is require'],
        minLength: [5, 'Name is require of 5 character'],
        maxLength: [50, 'Name is under of 50 character'],
        lowercase: true,
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'email is require'],
        lowercase: true,
        trim: true,
        match: [
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            " Please enter a valid email address"
        ],
    },
    Message: {
        type: String,
        required: [true, 'description is required'],
        minLength: [8, 'description most be 8 charactor'],
        maxLength: [1000, 'description should be more than 1000 character'],
    },
}, { timestamps: true })

const Contact = model('Contact', contactSchema);

export default Contact;