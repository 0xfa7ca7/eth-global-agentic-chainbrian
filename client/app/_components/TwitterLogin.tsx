"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface TwitterLoginProps {
  successUri?: string;
}

export function TwitterLogin({ successUri }: TwitterLoginProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [hostname, setHostname] = useState("");

  useEffect(() => {
    setHostname(window.location.origin);
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "TWITTER_AUTH_SUCCESS") {
        const redirectURI = event.data.successUri;
        if (redirectURI) {
          window.location.href = redirectURI;
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [successUri]);

  const handleTwitterLogin = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/auth/twitter/init`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          success_uri: successUri
            ? `${hostname ?? process.env.NEXT_PUBLIC_HOSTNAME}/claim/interstitial?successUri=${encodeURIComponent(
                successUri || ""
              )}`
            : ``,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Try popup first
      const width = 600;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      const popup = window.open(
        data.authUrl,
        "twitter-auth",
        `width=${width},height=${height},left=${left},top=${top}`
      );

      if (!popup || popup.closed) {
        // Fallback to direct navigation if popup blocked
        window.location.href = data.authUrl;
      }
    } catch (error: unknown) {
      console.error("Twitter login error:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center w-full my-4">
      <Button
        type="button"
        onClick={handleTwitterLogin}
        disabled={isLoading}
        className="flex items-center gap-2 bg-[#1DA1F2] hover:bg-[#1a91da]-text-black text-white rounded"
      >
        {isLoading ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <span>Connecting...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
            </svg>
            <span>Connect with Twitter</span>
          </>
        )}
      </Button>
    </div>
  );
}
