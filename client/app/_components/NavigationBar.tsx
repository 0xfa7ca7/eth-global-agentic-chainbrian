"use client";

import TelegramUser from "./TelegramUser";
import { TwitterLogin } from "./TwitterLogin";
import { DiscordLogin } from "./DiscordLogin";
import { GithubLogin } from "./GithubLogin";
import Wallet from "./Wallet";

import { MessageSquare, Brain } from 'lucide-react';

// Menu items.
const items = [
  {
    title: "FAQ",
    url: "#",
  },
  {
    title: "Welcome",
    url: "#",
  },
  {
    title: "Testing",
    url: "#",
  }
]

export default function NavigationBar() {
  return (
    <div className="flex flex-col bg-gray-50 p-4">
      <div>
        <div className="space-y-1">
          <div className="flex">
            <Brain />
            <h3 className="pl-2 font-medium">ChainBrian</h3>
          </div>
        </div>
      </div>

      <div className="mt-10">
        {items.map((item) => (
          <div className="bg-gray-200 my-2 rounded" key={item.title}>
            <a className="flex items-center p-2" href={item.url}>
              <MessageSquare />
              <span className="pl-4">{item.title}</span>
            </a>
          </div>
        ))}
      </div>

      <div className="mt-auto">
        <TelegramUser />
        <div className="flex items-center justify-start w-full my-1">
          <Wallet />
        </div>
        <TwitterLogin />
        <DiscordLogin />
        <GithubLogin />
      </div>
    </div>
  );
}
