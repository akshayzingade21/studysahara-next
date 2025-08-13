// app/layout.js
import '../styles/globals.css';
import dynamic from 'next/dynamic';

const ChatWidget = dynamic(() => import('./components/ChatWidget'), { ssr: false });

export const metadata = {
  metadataBase: new URL("https://www.studysahara.com"),
  title: {
    default: "StudySahara – Education Loans for Studying Abroad",
    template: "%s | StudySahara"
  },
  description:
    "Get the best education loan deals for studying abroad – lowest interest rates, discounted processing fees, and 100% free support.",
  icons: {
    icon: "/images/logo.png"
  },
  alternates: {
    canonical: "https://www.studysahara.com/"
  },
  openGraph: {
    title: "StudySahara – Education Loans for Studying Abroad",
    description:
      "Get the best education loan deals for studying abroad – lowest interest rates, discounted processing fees, and 100% free support.",
    url: "https://www.studysahara.com/",
    siteName: "StudySahara",
    images: [
      {
        url: "https://www.studysahara.com/images/og-banner.jpg",
        width: 1200,
        height: 630,
        alt: "StudySahara – Education Loans for Studying Abroad"
      }
    ],
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "StudySahara – Education Loans for Studying Abroad",
    description:
      "Get the best education loan deals for studying abroad – lowest interest rates, discounted processing fees, and 100% free support.",
    images: ["https://www.studysahara.com/images/og-banner.jpg"]
  }
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