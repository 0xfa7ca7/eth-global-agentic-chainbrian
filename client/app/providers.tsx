"use client";

import type { ReactNode } from "react";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { base } from "wagmi/chains"; // add baseSepolia for testing

export function Providers(props: { children: ReactNode }) {
  return (
    <OnchainKitProvider
      apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
      chain={base} // add baseSepolia for testing -- todo add more chains
      config={{
        appearance: {
          name: "ChainBrian", //  header
          logo: "https://image.jpg", // Displayed in modal header
          mode: "auto", // 'light' | 'dark' | 'auto'
          theme: "hacker", // 'default' or custom theme
        },
        wallet: {
          display: "modal",
          termsUrl: "https://...",
          privacyUrl: "https://...",
        },
      }}
    >
      {props.children}
    </OnchainKitProvider>
  );
}
