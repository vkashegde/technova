import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { SiteHeader } from "@/components/site/site-header";

// Auth state is cookie-based; force per-request rendering so the header reflects login/logout.
export const dynamic = "force-dynamic";

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
    default: "NewsBlogs",
    template: "%s · NewsBlogs",
  },
  description: "A modern news & blogging platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-dvh bg-background font-sans antialiased`}
      >
        <Providers>
          <SiteHeader />
          <main className="mx-auto w-full max-w-6xl px-4 py-8">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
