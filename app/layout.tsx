import "./globals.css";
import { Header } from "../components/Header";
import { Tabs } from "../components/Tabs";
import { Footer } from "../components/Footer";
import { ServiceWorkerRegistration } from "../components/ServiceWorkerRegistration";

export const metadata = {
  title: "Nexus Crypto",
  description: "Currency & crypto P&L",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Mobile viewport optimization */}
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover, user-scalable=no" />

        {/* PWA manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* PWA icons */}
        <link rel="icon" href="/icon-192.svg" sizes="192x192" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon-192.svg" />

        {/* Theme color (status bar on Android) */}
        <meta name="theme-color" content="#0f172a" />

        {/* Mobile optimization */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

      </head>
      <body className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 touch-manipulation overscroll-y-contain">
        <ServiceWorkerRegistration />
        <Header />
        <Tabs />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
