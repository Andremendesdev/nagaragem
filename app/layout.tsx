import type { Metadata } from "next";
import { Montserrat, Playfair_Display } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "600", "700"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  style: ["normal", "italic"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Na Garage Barbearia | Desde 2019 – Piraju",

  description:
    "Barbearia Na Garage. Cortes modernos, barba, cabelo e bigode com estilo e qualidade. Atendimento de respeito, sem frescura. Saia bonito!",

  keywords: [
    "barbearia",
    "corte de cabelo",
    "barba",
    "estilo masculino",
    "barbearia premium",
    "Piraju",
    "cuidados masculinos",
  ],

  authors: [{ name: "Na Garage Barbearia" }],

  openGraph: {
    title: "Na Garage Barbearia | Premium | Piraju",
    description: "Descubra a experiência única da nossa barbearia.",
    type: "website",
    locale: "pt_BR",
  },

  // remove qualquer favicon padrão
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${montserrat.variable} ${playfair.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-background font-sans antialiased">
        <GoogleAnalytics />
        {children}

        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}
