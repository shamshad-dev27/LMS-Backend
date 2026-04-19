import { Router } from "express";
import { authorization, isLoggedIn } from "../middleware/auth.middleware.js";
import { getMessage, sendMessage } from '../controllers/contact.controller.js'
import { contactLimiter } from "../middleware/rateLimit.middleware.js";

const router = Router();

router.get("/getMessage",
    isLoggedIn,
    // authorization('ADMIN'),
    getMessage

)

router.post("/sendMessage",
    isLoggedIn,
    contactLimiter,
    sendMessage
)

export default router;