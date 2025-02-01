"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useParams, useRouter } from "next/navigation";
import { TwitterLogin } from "@/app/_components/TwitterLogin";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ClaimPage() {
  const { tokenId } = useParams();
  const router = useRouter();
  const [hostname, setHostname] = useState("");
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const init = async () => {
      setHostname(window.location.origin);
      // Check if token exists in session storage
      const token = sessionStorage.getItem("twitter_token");
      if (token) {
        // Redirect to success page if token exists
        router.push(`/claim/${tokenId}/success?token=${token}`);
      } else {
        setIsChecking(false);
      }
    };
    init();
  }, [tokenId, router]);

  if (isChecking) {
    return (
      <div className="container mx-auto flex items-center justify-center min-h-screen p-4 bg-white">
        <Card className="w-full max-w-md bg-white border-gray-200">
          <CardHeader className="bg-white">
            <Skeleton className="h-8 w-[200px] mb-2" />
            <Skeleton className="h-4 w-[150px]" />
          </CardHeader>
          <CardContent className="bg-white">
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1DA1F2] border-t-transparent" />
                <div className="text-sm text-gray-500">
                  Loading your experience...
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex items-center justify-center min-h-screen p-4 bg-white">
      <Card className="w-full max-w-md bg-white border-gray-200">
        <CardHeader className="bg-white">
          <CardTitle>Claim Wow.XYZ Airdrop</CardTitle>
          <CardDescription>
            Token:{" "}
            <a
              href={`https://wow.xyz/${tokenId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              {tokenId}
            </a>
          </CardDescription>
        </CardHeader>
        <CardContent className="bg-white">
          <TwitterLogin
            successUri={
              hostname
                ? `${hostname}/claim/${tokenId}/success`
                : `${process.env.NEXT_PUBLIC_HOSTNAME}/claim/${tokenId}/success`
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
