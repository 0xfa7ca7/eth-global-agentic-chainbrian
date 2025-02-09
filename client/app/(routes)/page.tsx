"use client";

import { ReactElement } from "react";
import ChatBox from "../_components/ChatBox";

export default function Home(): ReactElement {
  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto">
        <ChatBox />
      </div>
    </main>
  );
}
