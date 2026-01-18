import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TimeCapsule - Messagerie Vidéo Temporelle",
  description: "Envoyez des messages vidéo qui ne s'ouvrent qu'à une date future choisie",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased">
        <div className="animated-bg" />
        {children}
      </body>
    </html>
  );
}
