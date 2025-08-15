import express from "express";
import { chatMethod } from "./prompting.js";

const app = express();
app.use(express.json());
app.post("/chat", async (req: express.Request, res) => {
  try {
    const newMessage = req.body.message;
    console.log("Received message:", newMessage);
    if (!newMessage || typeof newMessage !== "string") {
      return res.status(400).json({ error: "Invalid message format" });
    }

    const response = await chatMethod(newMessage);
    res.json({ response });
  } catch (error) {
    console.error("Error in chat endpoint:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
