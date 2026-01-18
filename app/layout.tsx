import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "UnlmtdProof - Preuve d'antériorité blockchain",
  description: "Protégez vos créations sur la blockchain Polygon. Certificat horodaté, immuable et vérifiable par tous.",
  keywords: ["blockchain", "preuve", "antériorité", "polygon", "certificat", "propriété intellectuelle", "UnlmtdProof", "UnlmtdGuilds"],
  authors: [{ name: "Artys Factory" }],
  openGraph: {
    title: "UnlmtdProof - Preuve d'antériorité blockchain",
    description: "Protégez vos créations sur la blockchain Polygon",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          crossOrigin="anonymous"
        />
      </head>
      <body className="font-sans antialiased bg-[#0b0124] text-white min-h-screen">
        {/* Aurora Background */}
        <div className="aurora-bg">
          <div className="aurora-stars"></div>
          <div className="aurora-layer"></div>
          <div className="aurora-layer aurora-layer-2"></div>
        </div>
        
        {/* Main Content */}
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
