import { Router, Request, Response } from "express";
import { getElizaRuntime } from "../utils.js";

const router = Router();

router.post("/save", async (req: Request, res: Response) => {
  try {
    console.log("[Wallet] Entered saveWallet route");
    const { address, chainId } = req.body;
    console.log("[Wallet] Wallet address:", address);
    console.log("[Wallet] Wallet chainId:", chainId);

    // Get Eliza runtime and save wallet
    const runtime = getElizaRuntime();
    await runtime.cacheManager.set("wallet", { address, chainId });

    res.status(200).json({ message: "Wallet saved successfully" });
  } catch (error) {
    console.error("[Wallet] Error:", error);
    res.status(500).json({ error: "Saving wallet failed" });
  }
});

export default router;
