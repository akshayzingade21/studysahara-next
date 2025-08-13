// app/layout.js
import '../styles/globals.css';
import dynamic from 'next/dynamic';

// Lazy-load the ChatWidget to avoid hydration issues
const ChatWidget = dynamic(() => import('./components/ChatWidget'), { ssr: false });

export const metadata = {
  metadataBase: new URL("https://studysahara.com"),
  title: {
    // Make the default equal to what you want on the homepage
    default: "Study Abroad Education Loans for Students | StudySahara",
    template: "%s | StudySahara"
  },
  description:
    "Compare education loans for USA, UK, Germany, Canada and more. Free eligibility check, clear guidance, and faster approvals with trusted lenders.",
  alternates: {
    canonical: "https://studysahara.com/"
  },
  robots: { index: true, follow: true },
  icons: {
    icon: "/images/logo.png"
  },
  openGraph: {
    title: "Study Abroad Education Loans for Students | StudySahara",
    description:
      "Compare options with or without collateral and co-applicant. Free eligibility check and expert help.",
    url: "https://studysahara.com/",
    siteName: "StudySahara",
    type: "website",
    images: [
      {
        url: "/images/og-banner.jpg",   // put the file at /public/images/og-banner.jpg
        width: 1200,
        height: 630,
        alt: "StudySahara – Education Loans for Students"
      }
    ]
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Your external stylesheets can stay here */}
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