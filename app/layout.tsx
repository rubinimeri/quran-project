import type { Metadata } from "next";
import { Amiri, Cormorant_Garamond } from "next/font/google";
import localFont from "next/font/local";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { Navbar } from "@/components/navbar";

const satoshi = localFont({
  src: "./fonts/Satoshi-Variable.woff2",
  variable: "--font-sans",
  weight: "300 900",
  display: "swap",
});
const amiri = Amiri({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  variable: "--font-arabic",
});
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-display",
});
// KFGQPC QPC HAFS mushaf font — used only for Quran verse text.
const quran = localFont({
  src: "./fonts/UthmanicHafs1Ver18.woff2",
  variable: "--font-quran",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nur — The Noble Qur'an",
  description: "A beautiful, modern Qur'an reading experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${satoshi.variable} ${amiri.variable} ${cormorant.variable} ${quran.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Navbar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
