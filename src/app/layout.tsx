import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RollIt - Telegram Mini App",
  description: "Увлекательная мини-игра в рулетку прямо в Telegram",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
