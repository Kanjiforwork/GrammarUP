import type { Metadata } from "next";
import "./globals.css";
import {Lexend} from "next/font/google"

const lexend = Lexend({subsets: ["latin"]});

export const metadata: Metadata = {
  title: "Grammar UP",
  description: "Your personal English grammar tutor",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${lexend.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}