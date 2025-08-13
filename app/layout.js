import '../styles/globals.css';
import dynamic from 'next/dynamic';

// Lazy-load the ChatWidget to avoid hydration issues
const ChatWidget = dynamic(() => import('./components/ChatWidget'), { ssr: false });

// app/layout.js
export const metadata = {
  metadataBase: new URL("https://studysahara.com"),
  title: {
    default: "StudySahara – Education Loans for Studying Abroad",
    template: "%s | StudySahara"
  },
  icons: {
    icon: "/favicon.ico" // keep your existing icon
  },
  alternates: {
    canonical: "https://studysahara.com/"
  }
  // (You can add robots or verification here if needed)
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