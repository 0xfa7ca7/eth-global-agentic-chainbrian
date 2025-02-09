"use client";

import type { ReactNode } from "react";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { sepolia } from "wagmi/chains"; // add baseSepolia for testing
import { usePathname } from 'next/navigation'
import NavigationBar from "./_components/NavigationBar";

export function Providers(props: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <OnchainKitProvider
      apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
      chain={sepolia} // add baseSepolia for testing -- todo add more chains
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
      {pathname !== "/login" ? 
        <div className="flex justify-start">
          <NavigationBar />
          {props.children}
        </div>
       : 
        props.children
      }
    </OnchainKitProvider>
  );
}