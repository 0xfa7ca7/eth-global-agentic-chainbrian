import { AnyType } from "../../utils.js";
import { Memory, Provider, IAgentRuntime, State } from "@ai16z/eliza";
import { ethers } from "ethers";
import { chainMap } from "../../utils.js";
import { BotAccountMemory, WalletResponse } from "../types.js";

export class CollabLandWalletBalanceProvider implements Provider {
  async get(
    _runtime: IAgentRuntime,
    _message: Memory,
    _state?: State
  ): Promise<AnyType> {
    let chain: string | null = null;
    const onChainMemoryManager = _runtime.getMemoryManager("onchain")!;
    // this is newest to oldest
    const onChainMemories = await onChainMemoryManager.getMemories({
      roomId: _message.roomId,
      unique: false,
    });

    console.log(
      "[CollabLandWalletBalanceProvider] onChainMemories",
      onChainMemories
    );

    const wallet = await _runtime.cacheManager.get<WalletResponse>("wallet");

    if (!wallet) {
      console.log("[CollabLandWalletBalanceProvider] wallet is null");
      return;
    }

    for (const memory of onChainMemories) {
      if (memory.content.chain !== undefined) {
        chain = memory.content.chain as string;
        break;
      }
    }
    console.log(
      "[CollabLandWalletBalanceProvider] chain found in memories",
      chain
    );

    let chainId = chainMap[chain as keyof typeof chainMap];
    if (!chainId) {
      console.log("[CollabLandWalletBalanceProvider] chainId is null");
      chainId = String(wallet.chainId);
    }

    let account: BotAccountMemory | null = null;
    for (const memory of onChainMemories) {
      if (
        memory.content.smartAccount &&
        memory.content.type === "evm" &&
        memory.content.chainId == chainId
      ) {
        account = memory.content as unknown as BotAccountMemory;
        break;
      }
    }

    if (!account?.smartAccount) {
      console.log("[CollabLandWalletBalanceProvider] account is null");
      // Fetch account from wallet
      account = {
        smartAccount: wallet.address,
        signerAccount: wallet.address,
        chainId: wallet.chainId,
        type: "evm",
      }
    }

    console.log(
      "[CollabLandWalletBalanceProvider] account found in memories",
      account
    );

    const provider = ethers.getDefaultProvider(account.chainId);
    const balance = await provider.getBalance(account.smartAccount as string);
    const formattedBalance = ethers.formatEther(balance);
    console.log("[CollabLandWalletBalanceProvider] balance", formattedBalance);
    return `Agent's balance is ${formattedBalance} ETH on ${chain}`;
  }
}
