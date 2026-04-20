import User from "../models/user.modle.js";
import appError from "../utils/error.utils.js";
import cloudinary from 'cloudinary';
import fs from 'fs/promises';
import sendEmail from "../utils/sendEmail.js";
import crypto from 'crypto';
import bcrypt from "bcryptjs";

const cookiesOption = {
  maxAge: 7 * 24 * 60 * 60 * 1000,
  httpOnly: true,
  secure: true,
  sameSite: 'none',
};

const register = async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) {
      return next(new appError('All fields are required', 400));
    }
    const userExist = await User.findOne({ email });
    if (userExist) {
      return next(new appError('User already exists', 409));
    }
    const user = await User.create({
      fullName, email, password,
      avatar: {
        public_id: email,
        secure_url: "https://res.cloudinary.com/demo/image/upload/v12345/user.png"
      }
    });
    if (!user) {
      return next(new appError('User registration failed, please try again', 500));
    }
    if (req.file) {
      try {
        const result = await cloudinary.v2.uploader.upload(req.file.path, {
          folder: 'LMS', width: 250, height: 250,
          gravity: 'faces', crop: 'fill'
        });
        if (result) {
          user.avatar.public_id = result.public_id;
          user.avatar.secure_url = result.secure_url;
          await fs.rm(`uploads/${req.file.filename}`);
        }
      } catch (e) {
        return next(new appError(e.message || 'File not uploaded, please try again', 500));
      }
    }
    await user.save();
    const token = await user.generateJWTtoken();
    res.cookie('token', token, cookiesOption);
    user.password = undefined;
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user,
    });
  } catch (e) {
    return next(new appError(e.message, 500));
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new appError('All fields are required', 400));
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return next(new appError('Email or password does not match', 401));
    }
    const token = await user.generateJWTtoken();
    user.password = undefined;
    res.cookie('token', token, cookiesOption);
    res.status(200).json({
      success: true,
      message: 'User logged in successfully',
      user
    });
  } catch (e) {
    return next(new appError(e.message, 500));
  }
};

const logout = (req, res) => {
  res.cookie('token', null, {
    secure: true, sameSite: 'none',
    httpOnly: true, maxAge: 0,
  });
  res.status(200).json({
    success: true,
    message: 'User logged out successfully'
  });
};

const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    res.status(200).json({
      success: true,
      message: 'User detail',
      user
    });
  } catch (e) {
    return next(new appError('Failed to fetch profile detail', 500));
  }
};

const forgotpassword = async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(new appError('Email is required', 400));
  }
  const user = await User.findOne({ email });
  if (!user) {
    return next(new appError('Email does not exist', 400));
  }
  const resetToken = await user.generatePasswordResetToken();
  await user.save();

  // ✅ Frontend reset page URL
  const resetpasswordUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  const subject = 'Reset Password';
  const message = `Reset your password here: ${resetpasswordUrl}`;
  try {
    await sendEmail(email, subject, message);
    res.status(200).json({
      success: true,
      message: `Reset password link sent to ${email} successfully`
    });
  } catch (e) {
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpire = undefined;
    await user.save();
    return next(new appError(e.message, 500));
  }
};

const resetpassword = async (req, res, next) => {
  const { resetToken } = req.params;
  const { password } = req.body;
  const forgotPasswordToken = crypto.createHash('sha256')
    .update(resetToken)
    .digest('hex');
  const user = await User.findOne({
    forgotPasswordToken,
    forgotPasswordExpire: { $gt: Date.now() }
  });
  if (!user) {
    return next(new appError('Token is invalid or expired, please try again', 400));
  }
  user.password = password;
  user.forgotPasswordToken = undefined;
  user.forgotPasswordExpire = undefined;
  await user.save();
  res.status(200).json({
    success: true,
    message: 'Password changed successfully!'
  });
};

const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const { id } = req.user;
    if (!oldPassword || !newPassword) {
      return next(new appError('All fields are mandatory', 400));
    }
    const user = await User.findById(id).select('+password');
    if (!user) {
      return next(new appError('User does not exist', 400));
    }
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      return next(new appError('Invalid old password', 400));
    }
    if (oldPassword === newPassword) {
      return next(new appError('New password cannot be same as old password', 400));
    }
    user.password = newPassword;
    await user.save();
    user.password = undefined;
    res.status(200).json({
      success: true,
      message: 'Password changed successfully!'
    });
  } catch (e) {
    return next(new appError(e.message, 500));
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { fullName } = req.body;
    const { id } = req.user;
    const user = await User.findById(id);
    if (!user) {
      return next(new appError('User does not exist', 404));
    }
    if (fullName) {
      user.fullName = fullName;
    }
    if (req.file) {
      await cloudinary.v2.uploader.destroy(user.avatar.public_id);
      try {
        const result = await cloudinary.v2.uploader.upload(req.file.path, {
          folder: 'LMS', width: 250, height: 250,
          gravity: 'faces', crop: 'fill'
        });
        if (result) {
          user.avatar.public_id = result.public_id;
          user.avatar.secure_url = result.secure_url;
          await fs.rm(`uploads/${req.file.filename}`);
        }
      } catch (e) {
        return next(new appError(e.message || 'File not uploaded', 500));
      }
    }
    await user.save();
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (e) {
    return next(new appError(e.message, 500));
  }
};

const Alluser = async (req, res, next) => {
  try {
    const userCount = await User.countDocuments({ role: 'User' });
    const subscribedCount = await User.countDocuments({
      role: 'User',
      'subscription.status': 'active'
    });
    res.status(200).json({
      success: true,
      message: 'User statistics fetched successfully!',
      userData: {
        userCount: userCount || 0,
        subscribedCount: subscribedCount || 0
      }
    });
  } catch (error) {
    return next(new appError(error.message || 'Failed to fetch user data', 500));
  }
};

export {
  register, login, logout, getProfile,
  forgotpassword, resetpassword, changePassword,
  updateUser, Alluser
};