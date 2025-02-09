import "@coinbase/onchainkit/styles.css";
import "@/styles/globals.css";
import { Inter } from "next/font/google";
import { Providers } from "../providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Login page",
  description: "Login page description",
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
