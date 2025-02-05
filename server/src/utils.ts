import { ElizaService } from "./services/eliza.service.js";
import { Bot } from "grammy";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { resolve } from "path";
const __dirname = new URL(".", import.meta.url).pathname;
import { config } from "dotenv";
import { AgentRuntime } from "@ai16z/eliza";
config();

export type AnyType = any;
export const chainMap: Record<string, string> = {
  ethereum: "11155111",
  base: "84532",
  linea: "59141",
  solana: "sol_dev",
};

export const getTokenMetadataPath = () => {
  const path = resolve(
    __dirname,
    "..",
    "..",
    process.env.TOKEN_DETAILS_PATH || "token_metadata.example.jsonc"
  );
  console.log("tokenMetadataPath:", path);
  return path;
};

export interface TokenMetadata {
  name: string;
  symbol: string;
  description: string;
  websiteLink: string;
  twitter: string;
  discord: string;
  telegram: string;
  nsfw: boolean;
  image: string;
}

export interface MintResponse {
  response: {
    contract: {
      fungible: {
        object: string;
        name: string;
        symbol: string;
        media: string | null;
        address: string;
        decimals: number;
      };
    };
  };
}

export const getCollablandApiUrl = () => {
  return (
    process.env.COLLABLAND_API_URL || "https://api-qa.collab.land/accountkit/v1"
  );
};

export const getCardHTML = (botUsername: string, claimURL: string) => {
  return `<!DOCTYPE html>
<html lang="en">

<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<meta name="twitter:card" content="player" />
	<meta name="twitter:site" content="@${botUsername}" />
	<meta name="twitter:title" content="AI Agent Starter Kit" />
	<meta name="twitter:description"
		content="This is a sample card for claiming airdrops with the AI Agent Starter Kit" />
	<meta name="twitter:image" content="https://assets.collab.land/collabland-logo.png" />
	<meta name="twitter:player" content="${claimURL}" />
	<meta name="twitter:player:width" content="480" />
	<meta name="twitter:player:height" content="480" />
</head>

<body>
	<title>Claim token airdrop.</title>
</body>

</html>`;
};

export const getElizaRuntime: () => AgentRuntime = () => {
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    throw new Error("TELEGRAM_BOT_TOKEN is required to get eliza runtime");
  }

  const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);
  const elizaService = ElizaService.getInstance(bot);
  if (!elizaService.getRuntime()) {
    throw new Error("Failed to get Eliza runtime");
  }

  return elizaService.getRuntime();
};
