import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zephyr",
  description: "Elevate your ideas, accelerate your impact."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
