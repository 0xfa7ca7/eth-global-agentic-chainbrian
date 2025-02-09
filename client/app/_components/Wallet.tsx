"use client";

import {
  ConnectWallet,
  Wallet as OnchainKitWallet,
  WalletDropdown,
  WalletDropdownFundLink,
  WalletDropdownLink,
  WalletDropdownDisconnect,
  ConnectWalletText,
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
import { useRouter } from "next/navigation";
import { Wallet as WalletIcon } from "lucide-react"

export default function Wallet() {
  const account = useAccount();
  const router = useRouter();

  useEffect(() => {
    (async function () {
      try {
        const res = await fetch("/api/wallet/save", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            address: account.address,
          }),
        });

        if (!res.ok) {
          // Remove cookie
          document.cookie = "session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
          
          throw new Error(res.statusText);
        }

        const { token } = await res.json();
        // Set cookie
        document.cookie = `session=${token}; path=/;`;

        router.push("/");
      } catch (e) {
        // console.log(e);
        router.push("/login");
      }
    })();
  }, [account, router]);

  return (
    <OnchainKitWallet>
      <ConnectWallet className="flex items-center gap-2 rounded py-2 px-4">
        <ConnectWalletText className="text-[15px]">
          <div className="flex items-center gap-2 text-white rounded w-full">
            <WalletIcon size={32} />
            Connect Wallet
          </div>
        </ConnectWalletText>
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