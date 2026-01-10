import type { Metadata } from "next";
import { Inter, Patrick_Hand } from "next/font/google"; 
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const patrickHand = Patrick_Hand({ 
  weight: "400", 
  subsets: ["latin"],
  variable: "--font-hand"
});

export const metadata: Metadata = {
  title: "Ma, Anong Ulam?",
  description: "AI Recipe Generator",
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