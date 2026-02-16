import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Khel-Khoj AI",
  description: "AI-powered platform for identifying rural sports talent",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
