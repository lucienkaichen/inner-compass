
import type { Metadata } from "next";
import { Noto_Serif_TC } from "next/font/google";
import "./globals.css";

const notoserif = Noto_Serif_TC({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-noto-serif",
});

export const metadata: Metadata = {
  title: "Inner Compass",
  description: "你的數位情緒伴侶",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body className={`${notoserif.className} font-serif bg-stone-50 text-stone-800 antialiased`}>
        {children}
      </body>
    </html>
  );
}
