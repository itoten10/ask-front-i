// ask-front-i/app/layout.tsx

import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "KATARIBA",
  description: "“KATARIBA”へようこそ！ “KATARIBA”は、生徒が探究学習での「やってみた」を気軽に共有できるプラットフォームです。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
