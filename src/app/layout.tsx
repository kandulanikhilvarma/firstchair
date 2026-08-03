import type { Metadata } from "next";
import { Courier_Prime, Libre_Caslon_Display, Public_Sans } from "next/font/google";
import "./globals.css";

/* Caslon is the historic face of American legal printing; Public Sans carries
   the US federal design-system lineage; Courier is what a court transcript is
   actually set in. Faces chosen as objects from this audience's world. */
const caslonDisplay = Libre_Caslon_Display({
  variable: "--font-caslon-display",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
  display: "swap",
});

const courierPrime = Courier_Prime({
  variable: "--font-courier-prime",
  subsets: ["latin"],
  weight: ["400", "700"],
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
THESIS: An AI answer is a record, so this surface is set as legal publishing sets a record — refusing the light-SaaS hero-with-floating-dashboard the GEO category ships.
OWN-WORLD: West reporter oxblood as committed field, canary legal-pad yellow as the only signal, blue-black pleading ink, red margin rule as structural hairline, foil for detail. Caslon display, Public Sans UI, Courier for verbatim answers. Square corners, hairline rules, no cards-as-scaffold.
STORY: A partner or agency owner learns the machines already answer questions about their firm daily, sees a verbatim answer naming someone else, and runs a free audit.
FIRST VIEWPORT: Full-bleed oxblood field. Caslon headline left at display scale, the audit form as a filed form on white to its right, and beneath the fold line a real transcript excerpt with the competitor's name struck in canary.
FORM: Editorial Law Review, brief-pinned by the user; roll assigned candidate 7 (counsel table), pin overrides per skill.
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
      className={`${caslonDisplay.variable} ${publicSans.variable} ${courierPrime.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <div hidden dangerouslySetInnerHTML={{ __html: DIRECTION_CONTRACT }} />
        {children}
      </body>
    </html>
  );
}
