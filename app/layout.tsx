import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MIXXN Claude - n8n Workflow System",
  description: "Transform n8n workflows into interactive web applications",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
