import "./globals.css";
import { Header } from "../components/Header";
import { Tabs } from "../components/Tabs";
import { ServiceWorkerRegistration } from "../components/ServiceWorkerRegistration";
import { registerSW } from "../src/sw-register";

import { useEffect } from "react";

export const metadata = {
  title: "Nexus Crypto",
  description: "Currency & crypto P&L",
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => { registerSW(); }, []);
  return (
    <html lang="en">
      <head> 
        {/* PWA manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* PWA icons */}
        <link rel="icon" href="/icon-192.svg" sizes="192x192" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon-192.svg" />

        {/* Theme color (status bar on Android) */}
        <meta name="theme-color" content="#0f172a" />
    
      </head>
      <body>
        <ServiceWorkerRegistration />
        <Header />
        <Tabs />
        {children}
      </body>
    </html>
  );
}
