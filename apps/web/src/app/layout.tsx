import { Toaster } from "@/components/ui/toaster";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import localFont from "next/font/local";
import ReactQueryProvider from "./ReactQueryProvider";
import "./globals.css";
import { VerificationProvider } from "@/context/VerificationContext";

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
  description,
  keywords:
    "blog accelerator, blogs, blogging platform, content, creation, collaboration, platform, zephyr, parazeeknova, hashcodes, AI, social, platform, content, creators, researchers, blogpost, summarization, collaborative, knowledge, sharing, blogging, research, writing, publishing, blog, accelerator, research accelerator, writing accelerator, collaborative accelerator, smart accelerator, AI accelerator, messaging",
  authors: [
    { name: "Parazeeknova", url: "https://harshsahu-portfolio.vercel.app/" }
  ],
  creator: "Harsh",
  publisher: "Parazeeknova",
  openGraph: {
    title: "Zephyr",
    description,
    url: "https://github.com/Parazeeknova/zephyr",
    siteName: "Zephyr - The Next-Generation Blog Accelerator",
    images: ["/Banner.png"],
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Zephyr",
    description,
    images: ["/Banner.png"]
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          defer
          src="https://analytics-umami.zephyyrr.in/script.js"
          data-website-id="fcacb118-4db6-446b-909f-0f95a3ccf0a3"
        />
      </head>
      <body
        className={`${SofiaProSoft.variable} min-h-screen font-sofiaProSoft antialiased`}
      >
        <ReactQueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <VerificationProvider>{children}</VerificationProvider>
          </ThemeProvider>
        </ReactQueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
