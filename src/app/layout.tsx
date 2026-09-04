import type { Metadata } from "next";
import { Fraunces, Hanken_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

/* Quiet sans-serifs: Hanken Grotesk is a calm neutral grotesque that still has
   heavy weights, so a score reads as a figure without shouting. Inter carries
   the UI; JetBrains Mono is reserved for verbatim engine answers so a transcript
   sits inside the product. Fraunces is the one serif — pull-quotes and editorial
   moments only, warmth against the sans. */
const displayFont = Hanken_Grotesk({
  variable: "--font-display-face",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const serifFont = Fraunces({
  variable: "--font-serif-face",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const uiFont = Inter({
  variable: "--font-ui-face",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const monoFont = JetBrains_Mono({
  variable: "--font-mono-face",
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
OWN-WORLD: Prism. Teal is always "your firm"; each engine owns a hue forever — ChatGPT clay, Gemini slate blue, Perplexity plum — in the mark, charts, badges and email. Quiet sans-serifs: Hanken Grotesk display, Inter UI, JetBrains Mono for verbatim answers, Fraunces serif for pull-quotes. Warm-stone neutrals, marketing accents amber + rose. Radius 6/10/14, measured contrast, dark mode as a peer.
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
      className={`${displayFont.variable} ${uiFont.variable} ${monoFont.variable} ${serifFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <div hidden dangerouslySetInnerHTML={{ __html: DIRECTION_CONTRACT }} />
        {children}
      </body>
    </html>
  );
}
