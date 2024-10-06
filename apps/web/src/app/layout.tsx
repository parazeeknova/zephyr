import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const SofiaProSoft = localFont({
  src: "./fonts/SofiaProSoftReg.woff2",
  variable: "--font-sofia-pro-soft",
  weight: "100 900"
});

const _SofiaProSoftMed = localFont({
  src: "./fonts/SofiaProSoftMed.woff2",
  variable: "--font-sofia-pro-soft-med",
  weight: "100 900"
});

const _SofiaProSoftBold = localFont({
  src: "./fonts/SofiaProSoftBold.woff2",
  variable: "--font-sofia-pro-soft-bold",
  weight: "100 900"
});

const description: string =
  "The Next-Generation content aggregator for Content Creation and Collaboration platform";

export const metadata: Metadata = {
  title: {
    template: "%s | Zephyr",
    default: "Zephyr"
  },
  description: `${description}`,
  keywords:
    "blog accelerator, blogs, blogging platform, content, creation, collaboration, platform, zephyr, parazeeknova, hashcodes, AI, social, platform, content, creators, researchers, blogpost, summarization, collaborative, knowledge, sharing, blogging, research, writing, publishing, blog, accelerator, research accelerator, writing accelerator, collaborative accelerator, smart accelerator, AI accelerator, messaging",
  authors: [
    { name: "Parazeeknova", url: "https://harshsahu-portfolio.vercel.app/" }
  ],
  creator: "Harsh",
  publisher: "Parazeeknova",
  openGraph: {
    title: "Zephyr",
    description: `${description}`,
    url: "https://github.com/Parazeeknova/zephyr",
    siteName: "Zephyr - The Next-Generation Blog Accelerator",
    images: ["/Banner.png"],
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Zephyr",
    description: `${description}`,
    images: ["/Banner.png"]
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${SofiaProSoft.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
