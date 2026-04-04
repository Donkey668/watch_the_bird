import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "WTB观鸟助手",
    template: "%s | WTB观鸟助手",
  },
  description:
    "一个浅色主题、优先适配手机竖屏的观鸟网页，提供分析、识别与观测记录功能。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[var(--shell-canvas)] text-[var(--text-primary)]">
        {children}
      </body>
    </html>
  );
}