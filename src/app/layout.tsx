import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bristol",
  description: "Bristol",
  icons: {
    icon: [
      {
        url: '/favicon/favicon.svg',
        type: 'image/svg+xml',
      },
    ],
    shortcut: '/favicon/favicon.svg',
    apple: '/favicon/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="w-full h-full">
      <head>
        <link rel="dns-prefetch" href="https://player.vimeo.com" />
        <link rel="preconnect" href="https://player.vimeo.com" />
        <link rel="preconnect" href="https://vimeo.com" />
        <link rel="dns-prefetch" href="https://f.vimeocdn.com" />
        <link rel="preconnect" href="https://f.vimeocdn.com" crossOrigin="" />
      </head>
      <body className="w-full h-full m-0 p-0 overflow-hidden">
        {children}
      </body>
    </html>
  );
}
