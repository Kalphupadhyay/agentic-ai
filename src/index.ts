import express from "express";
import { chatMethod } from "./prompting.js";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());
app.post("/api/chat", async (req: express.Request, res) => {
  try {
    const newMessage = req.body.message;
    const persona = req.body.persona;

    console.log("Received message:", newMessage);
    console.log("Received persona:", persona);

    if (!persona || (persona !== "kalph-chill" && persona !== "kalph-work")) {
      return res.status(400).json({ error: "Invalid persona specified" });
    }

    if (!newMessage || typeof newMessage !== "string") {
      return res.status(400).json({ error: "Invalid message format" });
    }

    const response = await chatMethod(newMessage, persona);
    res.json({ message: response });
  } catch (error) {
    console.error("Error in chat endpoint:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
