import { Router, Request, Response } from "express";

const router = Router();

router.post("/send", async (req: Request, res: Response) => {
  try {
    console.log("chat");
    const { message } = req.body;
    console.log("Chat message:", message);

    res.status(200).json({ message: "Message sent successfully" });
  } catch (error) {
    console.error("Mesasge Error:", error);
    res.status(500).json({ error: "Sending message failed" });
  }
});

export default router;
