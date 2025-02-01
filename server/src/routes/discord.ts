import { Router, Request, Response } from "express";
import axios from "axios";
import crypto from "crypto";
import { NgrokService } from "../services/ngrok.service.js";

const router = Router();
const states = new Set<string>();

router.post("/init", async (_req: Request, res: Response) => {
  try {
    const ngrokURL = await NgrokService.getInstance().getUrl();
    const state = crypto.randomBytes(16).toString("hex");
    states.add(state);

    const authUrl = new URL("https://discord.com/api/oauth2/authorize");
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("client_id", process.env.DISCORD_CLIENT_ID!);
    authUrl.searchParams.set(
      "redirect_uri",
      `${ngrokURL}/auth/discord/callback`
    );
    authUrl.searchParams.set("scope", "identify email");
    authUrl.searchParams.set("state", state);

    res.json({ authUrl: authUrl.toString() });
  } catch (error) {
    console.error("[Discord Auth] Error:", error);
    res.status(500).json({ error: "Auth initialization failed" });
  }
});

router.get("/callback", async (req: Request, res: Response) => {
  try {
    const ngrokURL = await NgrokService.getInstance().getUrl();
    const { code, state } = req.query;

    if (!states.has(state as string)) {
      throw new Error("Invalid state parameter");
    }

    const params = new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID!,
      client_secret: process.env.DISCORD_CLIENT_SECRET!,
      grant_type: "authorization_code",
      code: code as string,
      redirect_uri: `${ngrokURL}/auth/discord/callback`,
    });

    const tokenResponse = await axios.post(
      "https://discord.com/api/oauth2/token",
      params,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    states.delete(state as string);
    return res.redirect(
      302,
      `${ngrokURL}/auth/discord/success?discord_token=${tokenResponse.data.access_token}`
    );
  } catch (error) {
    const ngrokURL = await NgrokService.getInstance().getUrl();
    console.error("[Discord Callback] Error:", error);
    return res.redirect(302, `${ngrokURL}/auth/discord/error`);
  }
});

router.get("/success", async (req: Request, res: Response) => {
  try {
    const { discord_token } = req.query;

    if (!discord_token) {
      throw new Error("No token provided");
    }

    const profileResponse = await axios.get(
      "https://discord.com/api/users/@me",
      {
        headers: {
          Authorization: `Bearer ${discord_token}`,
        },
      }
    );

    res.json({
      success: true,
      message: "Discord authentication successful",
      token: discord_token,
      profile: profileResponse.data,
    });
  } catch (error) {
    console.error("[Discord Success] Error:", error);
    res.status(400).json({
      success: false,
      error: "Failed to fetch profile information",
    });
  }
});

export default router;
