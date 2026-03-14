import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Heat Archive Portal",
  description: "Curated luxury inventory participation portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
