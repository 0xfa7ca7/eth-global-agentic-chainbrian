"use client";

import {
  ConnectWallet,
  Wallet as OnchainKitWallet,
  WalletDropdown,
  WalletDropdownFundLink,
  WalletDropdownLink,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import {
  Address,
  Avatar,
  Name,
  Identity,
  EthBalance,
} from "@coinbase/onchainkit/identity";

import { useAccount } from "wagmi";
import { useEffect } from "react";

export default function Wallet() {
  const account = useAccount();

  useEffect(() => {
    // Save the wallet with route wallet/save
    if (!account || !account.address) return;
    console.log("Saving wallet...");
    fetch("/api/wallet/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        address: account.address,
        chainId: account.chainId,
      }),
    })
      .then((res) => console.log(res))
      .catch((error) => console.error(error));
  }, [account]);
  return (
    <OnchainKitWallet>
      <ConnectWallet>
        <Avatar className="h-6 w-6" />
        <Name />
      </ConnectWallet>
      <WalletDropdown>
        <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
          <Avatar />
          <Name />
          <Address />
          <EthBalance />
        </Identity>
        <WalletDropdownLink icon="wallet" href="https://keys.coinbase.com">
          Wallet
        </WalletDropdownLink>
        <WalletDropdownFundLink />
        <WalletDropdownDisconnect />
      </WalletDropdown>
    </OnchainKitWallet>
  );
}
