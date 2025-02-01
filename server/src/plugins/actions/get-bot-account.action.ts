import {
  ActionExample,
  Handler,
  HandlerCallback,
  Validator,
  Memory,
  getEmbeddingZeroVector,
} from "@ai16z/eliza";
import { CollabLandBaseAction } from "./collabland.action.js";
import { randomUUID } from "crypto";
import { chainMap } from "../../utils.js";
import { BotAccountMemory, BotAccountResponse } from "../types.js";

export class GetBotAccountAction extends CollabLandBaseAction {
  constructor() {
    const name = "GET_SMART_ACCOUNT";
    const similes = [
      "GET_ACCOUNT",
      "GET_ETHEREUM_ACCOUNT",
      "ACCOUNT",
      "WALLET",
      "WALLET_ADDRESS",
      "GET_EVM_WALLET",
    ];
    const description = "Get's the agent's smart account details";
    const handler: Handler = async (
      _runtime,
      _message,
      _state,
      _options?: { [key: string]: unknown },
      _callback?: HandlerCallback
    ): Promise<boolean> => {
      let chain: string | null = null;
      const onChainMemoryManager = _runtime.getMemoryManager("onchain")!;
      // this is newest to oldest
      const onChainMemories = await onChainMemoryManager.getMemories({
        roomId: _message.roomId,
        unique: false,
      });
      console.log("[GetBotAccountAction] onChainMemories", onChainMemories);
      for (const memory of onChainMemories) {
        if (memory.content.chain !== undefined) {
          chain = memory.content.chain as string;
          break;
        }
      }

      // Get the chain Id
      if (chain == null) {
        _callback?.({
          text: "I cannot proceed because I don't know the chain you're looking for. I support Ethereum, Linea, Base, Solana and others.",
        });
        return false;
      }

      const chainId = chainMap[chain as keyof typeof chainMap];

      if (chainId == null) {
        console.log("[GetBotAccountAction] chainId is null");
        _callback?.({
          text: "I cannot proceed because I don't know which chain you're looking for. I support Ethereum, Linea, Base, Solana and others.",
        });
        return false;
      }
      console.log("[GetBotAccountAction] chainId", chainId);
      let account: BotAccountMemory | null = null;
      for (const memory of onChainMemories) {
        if (
          memory.content.smartAccount != null &&
          memory.content.signerAccount != null &&
          memory.content.type == "evm" &&
          memory.content.chainId == chainId
        ) {
          console.log("Account found in memory", memory.content);
          account = memory.content as unknown as BotAccountMemory;
          break;
        }

        if (
          memory.content.smartAccount != null &&
          memory.content.signerAccount != null &&
          memory.content.type == "solana" &&
          memory.content.network == chainId
        ) {
          console.log("Solana account found in memory", memory.content);
          account = memory.content as unknown as BotAccountMemory;
          break;
        }
      }
      if (account != null) {
        _callback?.({
          text:
            `My Account Details:\nAddress: ${account.smartAccount}\nPKP Signer: ${account.signerAccount}\n` +
            (account.type == "evm"
              ? `Chain ID: ${account.chainId} (${chain})`
              : `Network: ${account.network} (${chain})`),
        });
        return true;
      }
      try {
        console.log("Hitting Collab.Land APIs to get the smart accounts...");
        const response = await this.client.get<BotAccountResponse>(
          `/telegrambot/accounts`,
          {
            headers: {
              "Content-Type": "application/json",
              "X-TG-BOT-TOKEN": process.env.TELEGRAM_BOT_TOKEN,
              "X-API-KEY": process.env.COLLABLAND_API_KEY,
            },
          }
        );
        console.log(
          "[GetBotAccountAction] response from Collab.Land API",
          response.data
        );
        // const memory: Memory = {
        // 	..._message,
        // 	content: {
        // 		text: `My Smart Account Details:\nAddress: ${response.data.address}\nSigner: ${response.data.signerAddress}\nChain ID: ${response.data.chainId}`,
        // 		action: "GET_SMART_ACCOUNT_RESPONSE",
        // 	},
        // }
        // await _runtime.knowledgeManager.createMemory(memory) // THOUGHTS: adding to knowledge manager isn't necessary.

        _callback?.({
          text: `
Provisioned Accounts:
PKP Signer: ${response.data.pkpAddress}
Ethereum:
${response.data.evm.map((evmAccount) => `• ${evmAccount.address} (${evmAccount.chainId})`).join("\n")}
Solana:
${response.data.solana.map((solanaAccount) => `• ${solanaAccount.address} (${solanaAccount.network})`).join("\n")}
`,
        });
        // Create memory
        const smartAccountMemories: Memory[] = response.data.evm.map(
          (evmAccount) => {
            return {
              id: randomUUID(),
              agentId: _message.agentId,
              userId: _message.userId,
              roomId: _message.roomId,
              content: {
                text: "",
                smartAccount: evmAccount.address,
                signerAccount: response.data.pkpAddress,
                chainId: evmAccount.chainId,
                type: "evm",
              },
              createdAt: Date.now(),
              embedding: getEmbeddingZeroVector(),
              unique: true,
            };
          }
        );
        const solanaAccountMemories: Memory[] = response.data.solana.map(
          (solanaAccount) => {
            return {
              id: randomUUID(),
              agentId: _message.agentId,
              userId: _message.userId,
              roomId: _message.roomId,
              content: {
                text: "",
                smartAccount: solanaAccount.address,
                signerAccount: response.data.pkpAddress,
                network: solanaAccount.network,
                type: "solana",
              },
              createdAt: Date.now(),
              embedding: getEmbeddingZeroVector(),
              unique: true,
            };
          }
        );
        console.log(
          "[GetBotAccountAction] creating smartAccountMemories",
          smartAccountMemories
        );
        console.log(
          "[GetBotAccountAction] creating solanaAccountMemories",
          solanaAccountMemories
        );
        const onChainMemoryManager = _runtime.getMemoryManager("onchain")!;
        await Promise.all(
          [...smartAccountMemories, ...solanaAccountMemories].map((memory) =>
            onChainMemoryManager.createMemory(memory, true)
          )
        );
        return true;
      } catch (error) {
        this.handleError(error);
        return false;
      }
    };
    const validate: Validator = async (): Promise<boolean> => {
      return true;
    };
    const examples: ActionExample[][] = [
      [
        {
          user: "{{user1}}",
          content: {
            text: "What is your smart account?",
          },
        },
        {
          user: "{{agentName}}",
          content: {
            text: "",
            action: "GET_SMART_ACCOUNT",
          },
        },
      ],
      [
        {
          user: "{{user1}}",
          content: {
            text: "What is your account?",
          },
        },
        {
          user: "{{agentName}}",
          content: {
            text: "",
            action: "GET_SMART_ACCOUNT",
          },
        },
      ],
      [
        {
          user: "{{user1}}",
          content: {
            text: "I don't know the chain but can you get the smart account?",
          },
        },
        {
          user: "{{agentName}}",
          content: {
            text: "I don't know which chain you're looking for but I support Ethereum, Linea, Base, Solana and others.",
          },
        },
        {
          user: "{{user1}}",
          content: {
            text: "I will go with Ethereum",
          },
        },
        {
          user: "{{agentName}}",
          content: {
            text: "",
            action: "EXTRACT_CHAIN",
          },
        },
        {
          user: "{{agentName}}",
          content: {
            text: "",
            action: "GET_SMART_ACCOUNT",
          },
        },
      ],
      // [
      // 	{
      // 		user: "{{user1}}",
      // 		content: {
      // 			text: "What is your smart account?",
      // 		},
      // 	},
      // 	{
      // 		user: "{{agentName}}",
      // 		content: {
      // 			text: "",
      // 			action: "GET_SMART_ACCOUNT",
      // 		},
      // 	},
      // 	{
      // 		user: "{{agentName}}",
      // 		content: {
      // 			text: "I cannot proceed because I don't know which chain you're looking for. I support Ethereum, Linea, Base, and others.",
      // 		},
      // 	},
      // 	{
      // 		user: "{{user1}}",
      // 		content: {
      // 			text: "I will choose polygon",
      // 			action: "EXTRACT_CHAIN",
      // 		},
      // 	},
      // 	{
      // 		user: "{{agentName}}",
      // 		content: {
      // 			text: "",
      // 			action: "GET_SMART_ACCOUNT",
      // 		},
      // 	},
      // ],
    ];
    super(name, description, similes, examples, handler, validate);
  }
}
