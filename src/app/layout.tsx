import type { Metadata } from "next";
import { Root } from "@/components/Root/Root";

import "@telegram-apps/telegram-ui/dist/styles.css";
import "./globals.css";

// Initialize mock environment for development
if (process.env.NODE_ENV === 'development') {
  // Initialize mock environment immediately
  import('@/mockEnv').then(({ mockEnv }) => {
    mockEnv().catch(console.error);
  });
}

export const metadata: Metadata = {
  title: "RollIt - Telegram Mini App",
  description: "Увлекательная мини-игра в рулетку прямо в Telegram",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body>
        <Root>{children}</Root>
      </body>
    </html>
  );
}
