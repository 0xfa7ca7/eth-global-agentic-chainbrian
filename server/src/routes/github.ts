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

    const authUrl = new URL("https://github.com/login/oauth/authorize");
    authUrl.searchParams.set("client_id", process.env.GITHUB_CLIENT_ID!);
    authUrl.searchParams.set(
      "redirect_uri",
      `${ngrokURL}/auth/github/callback`
    );
    authUrl.searchParams.set("scope", "read:user user:email");
    authUrl.searchParams.set("state", state);

    res.json({ authUrl: authUrl.toString() });
  } catch (error) {
    console.error("[GitHub Auth] Error:", error);
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

    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code: code,
        redirect_uri: `${ngrokURL}/auth/github/callback`,
        state: state,
      },
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    states.delete(state as string);
    return res.redirect(
      302,
      `${ngrokURL}/auth/github/success?github_token=${tokenResponse.data.access_token}`
    );
  } catch (error) {
    const ngrokURL = await NgrokService.getInstance().getUrl();
    console.error("[GitHub Callback] Error:", error);
    return res.redirect(302, `${ngrokURL}/auth/github/error`);
  }
});

router.get("/success", async (req: Request, res: Response) => {
  try {
    const { github_token } = req.query;

    if (!github_token) {
      throw new Error("No token provided");
    }

    const profileResponse = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${github_token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    res.json({
      success: true,
      message: "GitHub authentication successful",
      token: github_token,
      profile: profileResponse.data,
    });
  } catch (error) {
    console.error("[GitHub Success] Error:", error);
    res.status(400).json({
      success: false,
      error: "Failed to fetch profile information",
    });
  }
});

export default router;
