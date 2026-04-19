import { Schema, model } from "mongoose";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from "crypto";
const userSchema = new Schema({
    fullName: {
        type: 'String',
        required: [true, 'Name is require'],
        minLenght: [5, 'Name is require of 5 character'],
        maxLenght: [50, 'Name is under of 50 character'],
        lowercase: true,
        trim: true,
    },
    email: {
        type: 'String',
        required: [true, 'email is require'],
        lowercase: true,
        trim: true,
        unique: true,
        match: [
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            " Please enter a valid email address"
        ],
    },
    password: {
        type: 'String',
        required: [true, 'password is require'],
        minLenght: [8, 'password must be 8 character'],
        select: false,
    }
    ,
    avatar: {
        public_id: {
            type: 'String'
        },
        secure_url: {
            type: 'String'
        }
    },
    role: {
        type: 'String',
        enum: ['User', 'ADMIN'],
        default: 'User'
    },
    forgotPasswordToken: String,
    forgotPasswordExpire: Date,
    subscription: {
        id: String,
        status: String,
    }
}, {
    timestamps: true
});

userSchema.methods = {
    generateJWTtoken: async function () {
        return await jwt.sign(
            {
                id: this._id, email: this.email, subscription: this.subscription, role: this.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRE
            }
        )
    },
    comparePassword: async function (plaintextPassword) {
        return await bcrypt.compare(plaintextPassword, this.password)
    },
    generatePasswordResetToken: async function () {
        const resetToken = await crypto.randomBytes(20).toString('hex');
        this.forgotPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');
        this.forgotPasswordExpire = Date.now() + 15 * 60 * 1000;
        return resetToken;
    }

}

userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    this.password = await bcrypt.hash(this.password, 10);

})

const User = model('Users', userSchema);


export default User;