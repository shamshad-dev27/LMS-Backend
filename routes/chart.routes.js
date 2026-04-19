import Groq from 'groq-sdk';
import { Router } from 'express';
import { isLoggedIn } from '../middleware/auth.middleware.js';
import 'dotenv/config';
import dotenv from 'dotenv';
dotenv.config();

const router = Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post('/ask', isLoggedIn, async (req, res) => {
    const { messages, courseContext } = req.body;

    try {
        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "system",
                    content: `Tu ek AI tutor hai "${courseContext}" course ke liye. Hinglish mein jawab de. Concise reh.`
                },
                ...messages
            ],
            max_tokens: 8000,
        });

        res.json({ reply: response.choices[0].message.content });

    } catch (err) {
        console.error("Groq Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

export default router;