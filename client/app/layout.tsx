import "@coinbase/onchainkit/styles.css";
import "@/styles/globals.css";
import { Inter } from "next/font/google";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Collab.Land Starter Kit",
  description: "Get started with Collab.Land",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <body className={`${inter.className} bg-white min-h-screen`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
