import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AppbarClient } from "../components/AppbarClient";
import { Providers } from "../Provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Wallet",
  description: "Simple wallet app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <AppbarClient />
          {children}
        </Providers>
      </body>
    </html>
  );
}

