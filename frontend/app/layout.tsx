import type { Metadata } from "next";
import { Anton, Work_Sans } from "next/font/google";
import "./globals.css";

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
});

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Stallfront – Your shop, live in minutes",
  description:
    "Fill in your products once. Get a catalog page customers can browse, search, and filter — shared with one link or a QR code, no app required.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${anton.variable} ${workSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
