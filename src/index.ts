import express from "express";
import { chatMethod } from "./prompting.js";
import cors from "cors";
import { limiter } from "./utils/rate-limit.js";

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "https://kalph-ai-chat-front-t6tu.vercel.app",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(limiter);
app.post("/api/chat", async (req: express.Request, res) => {
  try {
    const newMessage = req.body.message;
    const persona = req.body.persona;

    if (!persona || (persona !== "kalph-chill" && persona !== "kalph-work")) {
      return res.status(400).json({ error: "Invalid persona specified" });
    }
    if (!newMessage || typeof newMessage !== "string") {
      return res.status(400).json({ error: "Invalid message format" });
    }

    let payload = {
      message: newMessage,
      persona: persona,
    };

    await chatMethod(payload, res);
  } catch (error) {
    console.error("Error in chat endpoint:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
