/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep clean URLs without trailing slash
  trailingSlash: false,

  async redirects() {
    return [
      // Host canonicalization: non-www -> www
      {
        source: "/:path*",
        has: [{ type: "host", value: "studysahara.com" }],
        destination: "https://www.studysahara.com/:path*",
        permanent: true,
      },

      // Case/slug normalization
      { source: "/PNB", destination: "/pnb", permanent: true },

      // ---- Your existing redirects
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/icici-bank", destination: "/icicibank", permanent: true },
      { source: "/axis-bank", destination: "/axisbank", permanent: true },
      { source: "/avanse-financial-services", destination: "/avanse", permanent: true },
      { source: "/auxilo-finserv", destination: "/auxilo", permanent: true },
      { source: "/union-bank", destination: "/unionbank", permanent: true },
      { source: "/punjab-national-bank", destination: "/pnb", permanent: true }, // lowercased
      { source: "/idfc-first-bank", destination: "/idfc", permanent: true },
      { source: "/yes-bank", destination: "/yesbank", permanent: true },
      { source: "/incred-finance", destination: "/incred", permanent: true },
      { source: "/tata-capital", destination: "/tatacapital", permanent: true },
      { source: "/poonawalla-fincorp", destination: "/poonawallafincorp", permanent: true },
      { source: "/prodigy-finance", destination: "/prodigyfinance", permanent: true },
      { source: "/mpower-financing", destination: "/mpowerfinancing", permanent: true },
      { source: "/sallie-mae", destination: "/salliemae", permanent: true },
      { source: "/no-coapplicant-no-collateral", destination: "/no-co-applicant-and-no-collateral", permanent: true },
      { source: "/coapplicant-no-collateral", destination: "/co-applicant-and-no-collateral", permanent: true },
      { source: "/coapplicant-collateral", destination: "/co-applicant-and-collateral", permanent: true },
      { source: "/us-coapplicant", destination: "/us-co-applicant", permanent: true },
      { source: "/check-loan-eligibility", destination: "/eligibility", permanent: true },
      { source: "/our-company-studysahara", destination: "/ourcompany", permanent: true },
    ];
  },
};

module.exports = nextConfig;