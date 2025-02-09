import {
	ActionExample,
	composeContext,
	generateObject,
	Handler,
	Memory,
	ModelClass,
	Validator,
  } from "@ai16z/eliza";
  import { CollabLandBaseAction } from "./collabland.action.js";
  import { randomUUID } from "crypto";
  import axios from "axios";
  import { CollabLandWalletBalanceProvider } from "../providers/collabland-wallet-balance.provider.js";
  
  const swapTemplate = `Respond with a JSON markdown block containing only the extracted values.
  
  \`\`\`json
  {
	  "fromAsset": "string",
	  "toAsset": "string",
	  "amount": "string",
	  "canSwap": "boolean"
  }
  \`\`\`
  
  # Explanation:
  - fromAsset: The token to swap from.
  - toAsset: The token to swap to.
  - amount: The amount to swap.
  - canSwap: True if the user has enough balance, otherwise false.
  
  # User request:
  "{{userRequest}}"
  
  # User's current token balance:
  {{userBalance}}
  
  Respond only with JSON.
  `;
  
  export class SwapTokenAction extends CollabLandBaseAction {
	constructor() {
	  const name = "SWAP_TOKENS";
	  const similes = ["SWAP_CRYPTO", "TRADE_TOKENS", "EXCHANGE_TOKENS"];
	  const description = "Swaps one crypto asset for another using Coinbase API.";
  
	  const handler: Handler = async (_runtime, _message, _state, _options, _callback) => {
		try {
		  console.log("[SwapTokenAction] options", _options);
  
		  const balance = await new CollabLandWalletBalanceProvider().get(_runtime, _message, _state);
		  console.log("[SwapTokenAction] user balance", balance);
  
		  const extractContext = composeContext({
			state: {
			  ..._state!,
			  userRequest: _message.content.text,
			  userBalance: balance,
			},
			template: swapTemplate,
		  });
  
		  const extractedSwapData = await generateObject({
			context: extractContext,
			modelClass: ModelClass.SMALL,
			runtime: _runtime,
		  });
  
		  console.log("[SwapTokenAction] extracted data", extractedSwapData);
  
		  if (!extractedSwapData.canSwap || !extractedSwapData.fromAsset || !extractedSwapData.toAsset || !extractedSwapData.amount) {
			_callback?.({ text: "I cannot proceed, the necessary swap details are missing or you lack enough balance." });
			return false;
		  }
  
		  console.log("Calling Coinbase API to swap tokens...");
		  const apiKey = process.env.COINBASE_API_KEY;
		  const swapPayload = {
			from: extractedSwapData.fromAsset,
			to: extractedSwapData.toAsset,
			amount: extractedSwapData.amount,
		  };
  
		  const { data: swapResponse } = await axios.post(
			"https://api.coinbase.com/v2/trade/swap",
			swapPayload,
			{
			  headers: {
				"Authorization": `Bearer ${apiKey}`,
				"Content-Type": "application/json",
			  },
			}
		  );
  
		  console.log("[SwapTokenAction] Swap successful", swapResponse);
  
		  const swapMemory: Memory = {
			id: randomUUID(),
			agentId: _message.agentId,
			userId: _message.userId,
			roomId: _message.roomId,
			content: {
			  text: "",
			  fromAsset: extractedSwapData.fromAsset,
			  toAsset: extractedSwapData.toAsset,
			  amount: extractedSwapData.amount,
			  swapId: swapResponse.data.swap_id,
			  status: "COMPLETED",
			},
		  };
  
		  const memoryManager = _runtime.getMemoryManager("onchain")!;
		  await memoryManager.createMemory(swapMemory);
  
		  _callback?.({
			text: `Swap successful! ${extractedSwapData.amount} ${extractedSwapData.fromAsset} → ${extractedSwapData.toAsset}.\nTransaction ID: ${swapResponse.data.swap_id}`,
		  });
  
		  return true;
		} catch (error) {
		  console.error("[SwapTokenAction] Error:", error);
		  _callback?.({ text: "Swap failed. Please try again later." });
		  return false;
		}
	  };
  
	  const validate: Validator = async () => true;
  
	  const examples: ActionExample[][] = [
		[
		  { user: "{{user1}}", content: { text: "Swap 10 USDC to ETH" } },
		  { user: "{{agentName}}", content: { text: "", action: "SWAP_TOKENS" } },
		],
	  ];
  
	  super(name, description, similes, examples, handler, validate);
	}
  }
  