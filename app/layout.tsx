import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Акустический отдел",
  description: "Корпоративная система задач, календаря, склада и уведомлений",
  manifest: "/manifest.json"
};

export const viewport: Viewport = {
  themeColor: "#101113",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className="dark">
      <body>{children}</body>
    </html>
  );
}
