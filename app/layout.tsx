import type { Metadata, Viewport } from "next";
import { Inter, Patrick_Hand } from "next/font/google"; 
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
  manifest: "/manifest.json", // 👈 Dito binabasa yung pangalan at icons ng app mo
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Anong Ulam?",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${patrickHand.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}