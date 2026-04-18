import type { Metadata, Viewport } from "next";
import { Inter, Patrick_Hand } from "next/font/google"; 
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const patrickHand = Patrick_Hand({ 
  weight: "400", 
  subsets: ["latin"],
  variable: "--font-hand"
});

export const viewport: Viewport = {
  themeColor: "#ea580c",
};

export const metadata: Metadata = {
  title: "Ma, Anong Ulam?",
  description: "AI Recipe Generator at Weekly Planner",
  manifest: "/manifest.json",
  themeColor: "#ea580c",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Ma, Anong Ulam?",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fil">
      <body className={`${inter.className} ${patrickHand.variable} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}