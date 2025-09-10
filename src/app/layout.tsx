import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bristol",
  description: "Bristol es una productora de contenido audiovisual",
  metadataBase: new URL('https://heybristol.com'),
  openGraph: {
    title: "Bristol",
    description: "Bristol es una productora de contenido audiovisual",
    url: 'https://heybristol.com',
    siteName: 'Bristol',
    type: 'website',
    images: [
      {
        url: '/opengraph-image.svg',
        width: 1200,
        height: 630,
        alt: 'Bristol - Productora de contenido audiovisual',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Bristol",
    description: "Bristol es una productora de contenido audiovisual",
    images: ['/opengraph-image.svg'],
  },
  icons: {
    icon: [
      {
        url: '/favicon.png',
        type: 'image/png',
      },
    ],
    shortcut: '/favicon.png',
    apple: '/favicon.png',
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
        {/* Meta tags para optimización de carga */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      </head>
      <body className="w-full h-full m-0 p-0 overflow-hidden">
        {children}
      </body>
    </html>
  );
}
