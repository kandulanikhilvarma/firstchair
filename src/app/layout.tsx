import type { Metadata } from "next";
import { Archivo, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

/* Prism: Archivo is a wide grotesque set tight and heavy, so a score reads as a
   figure. IBM Plex Sans carries the UI; IBM Plex Mono is its sibling, reserved
   for verbatim engine answers so a transcript sits inside the product. */
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://rankwell-seven.vercel.app";
const title = "First Chair — what AI tells clients about your firm";
const description =
  "ChatGPT, Gemini and Perplexity answer legal questions all day. First Chair records whether they recommend your firm, name a competitor, or never mention you at all.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  openGraph: {
    title,
    description,
    url: siteUrl,
    siteName: "First Chair",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

const DIRECTION_CONTRACT = `<!--
impeccable-direction seed:993d9e85
THESIS: One question enters, three engines answer. The product holds those three answers side by side, so the identity is the instrument that splits — not a metaphor borrowed from law.
OWN-WORLD: Prism. Indigo is always "your firm"; each engine owns a hue forever — ChatGPT emerald, Gemini azure, Perplexity rose — in the mark, charts, badges and email. Archivo display, IBM Plex Sans UI, IBM Plex Mono for verbatim answers. Radius 6/10/14, measured contrast, dark mode as a peer.
STORY: A partner or agency owner learns the machines already answer questions about their firm daily, sees a verbatim answer naming someone else, and runs a free audit.
FIRST VIEWPORT: Marketing may express the split at full strength; the product stays quiet and dense. A display headline, the audit form to its side, and beneath it a real transcript excerpt with a competitor named.
FORM: Prism, two registers — marketing expressive, product quiet and fast.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
-->`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${plexSans.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <div hidden dangerouslySetInnerHTML={{ __html: DIRECTION_CONTRACT }} />
        {children}
      </body>
    </html>
  );
}
