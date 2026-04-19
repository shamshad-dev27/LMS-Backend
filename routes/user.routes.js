import { Router } from "express";
import { Alluser, changePassword, forgotpassword, getProfile, login, logout, register, resetpassword, updateUser } from "../controllers/user.controller.js";
import { authorization, isLoggedIn } from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.middleware.js";

const router = Router();
router.post('/register', upload.single('avatar'), register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', isLoggedIn, getProfile);
router.post('/forgot-password', forgotpassword);
router.post('/reset/:resetToken', resetpassword);
router.post('/change-password', isLoggedIn, changePassword);
router.put('/update', isLoggedIn, upload.single('avatar'), updateUser);
router.get('/stat', isLoggedIn, Alluser);
export default router;