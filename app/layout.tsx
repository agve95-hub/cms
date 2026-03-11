import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: process.env.SITE_NAME || "CMS",
  description: "Content Management System",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        {process.env.ANALYTICS_SCRIPT && (
          <div dangerouslySetInnerHTML={{ __html: process.env.ANALYTICS_SCRIPT }} />
        )}
      </head>
      <body className="font-sans">{children}</body>
    </html>
  );
}
