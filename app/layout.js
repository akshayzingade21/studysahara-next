// app/layout.js
import '../styles/globals.css';
import dynamic from 'next/dynamic';

const ChatWidget = dynamic(() => import('./components/ChatWidget'), { ssr: false });

export const metadata = {
  metadataBase: new URL("https://www.studysahara.com"),
  title: {
    default: "StudySahara – Education Loans for Studying Abroad",
    template: "%s | StudySahara",
  },
  icons: { icon: "/images/logo.png" },
  alternates: {
    canonical: "https://www.studysahara.com/",
  },
  openGraph: {
    type: "website",
    url: "https://www.studysahara.com/",
    siteName: "StudySahara",
    title: "Study Abroad Education Loans for Students | StudySahara",
    description:
      "Compare options with or without collateral and co-applicant. Free eligibility check and expert help.",
    images: [
      {
        url: "https://www.studysahara.com/images/og-banner.jpg",
        width: 1200,
        height: 630,
        alt: "StudySahara – Education Loans for Students",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Study Abroad Education Loans for Students | StudySahara",
    description:
      "Compare options with or without collateral and co-applicant. Free eligibility check and expert help.",
    images: ["https://www.studysahara.com/images/og-banner.jpg"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&family=Montserrat:wght@700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"
        />
      </head>
      <body>
        {children}
        <ChatWidget />
      </body>
    </html>
  );
}