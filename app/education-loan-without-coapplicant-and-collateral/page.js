import Link from "next/link";
import Image from "next/image";
import styles from "./noCoappNoCollateral.module.css";
import LeadModalProvider from "../education-loan-without-coapplicant-and-collateral/LeadModalProvider";
import LeadTrigger from "../education-loan-without-coapplicant-and-collateral/LeadTrigger";

// ✅ Use the updated number you set earlier (or pull from env if you switched)
const WHATSAPP_NUMBER = "+919741723972";// <-- replace if needed
const wa = (label) =>
  `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi StudySahara – ${label}`)}`;

export const metadata = {
  title: "Education Loan Without Co-Applicant and Collateral – 2025 Guide | StudySahara",
  description:
    "Can Indian students get an education loan without a co-applicant and without collateral? Learn eligibility, lenders, documents, timelines, and next steps.",
  alternates: {
    canonical: "https://www.studysahara.com/education-loan-without-coapplicant-and-collateral",
  },
  openGraph: {
    title: "Education Loan Without Co-Applicant and Collateral – StudySahara",
    description:
      "When co-applicant and collateral are not required, how eligibility works, documents, timelines, and lender options.",
    url: "https://www.studysahara.com/education-loan-without-coapplicant-and-collateral",
    siteName: "StudySahara",
    type: "article",
    images: [
      {
        url: "https://www.studysahara.com/images/og/no-coapp-nocollateral.jpg",
        width: 1200,
        height: 630,
        alt: "Education Loan Without Co-Applicant and Collateral",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
};

function JsonLd() {
  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Education Loan Without Co-Applicant and Collateral",
    description:
      "Step-by-step guide for Indian students to get an education loan without co-applicant and collateral.",
    mainEntityOfPage:
      "https://www.studysahara.com/education-loan-without-coapplicant-and-collateral",
    inLanguage: "en",
    isAccessibleForFree: true,
    author: { "@type": "Organization", name: "StudySahara" },
    publisher: {
      "@type": "Organization",
      name: "StudySahara",
      logo: {
        "@type": "ImageObject",
        url: "https://www.studysahara.com/images/logo.png"
      }
    },
    image: ["https://www.studysahara.com/images/og/no-coapp-nocollateral.jpg"],
    datePublished: "2025-11-05",
    dateModified: "2025-11-05",
    articleSection: ["Education Loans", "Abroad", "Unsecured"],
    keywords: [
      "education loan without co-applicant",
      "education loan without collateral",
      "study abroad loan"
    ]
  };

  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is it possible to get an education loan without a co-applicant and collateral?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Yes. Certain lenders and international financing platforms offer unsecured loans without co-applicants for select universities and courses."
        }
      },
      {
        "@type": "Question",
        name: "Which lenders offer such loans?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Some private banks, NBFCs, and international lenders offer loans without co-applicant and collateral, depending on your admit and credit profile."
        }
      },
      {
        "@type": "Question",
        name: "What documents are required?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "You’ll typically need your offer letter, passport, academic records, and financial documents if applicable."
        }
      },
      {
        "@type": "Question",
        name: "What’s the usual approval time?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Loan approval typically takes 5–15 working days after complete document submission."
        }
      }
    ]
  };

  // Output both in ONE script
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify([article, faq]) }}
    />
  );
}

export default function Page() {
  return (
 <main className={styles.page}>
  <JsonLd />
      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <Image
            src="/images/hero/study-abroad.png"
            alt="Student planning study abroad"
            fill
            priority
            className={styles.heroImg}
          />
          <div className={styles.heroOverlay} />
        </div>

        <div className={styles.heroInner}>
          <img src="/images/logo.png" alt="StudySahara" width="56" height="56" className={styles.logo} />
          <h1 className={styles.title}>
            Education Loan <span>Without Co-Applicant and Collateral</span>
          </h1>
          <p className={styles.bottomLine}>
            When lenders waive co-applicant and collateral, what changes for eligibility, documents, and timelines?
          </p>

          <LeadTrigger className={styles.primaryCta} title="Check Loan Eligibility">
            Check Loan Eligibility
          </LeadTrigger>
          <a href={wa("No Co-Applicant & No Collateral – Hero")} target="_blank" rel="noopener noreferrer" className={styles.secondaryCta}>
            <i className="fab fa-whatsapp" aria-hidden="true"></i> WhatsApp Loan Expert
          </a>
        </div>
      </section>

      {/* STRIP */}
      <section className={styles.strip}>
        <div className={styles.stripItem}>No co-applicant? Possible in select cases</div>
        <div className={styles.stripItem}>Collateral-free options available</div>
        <div className={styles.stripItem}>Typical TAT: 5–15 working days</div>
      </section>

      {/* HIGHLIGHTS */}
      <section className={styles.highlights}>
        <div className={`${styles.card} ${styles.cardHover}`}>
          <div className={styles.cardHead}>When Co-Applicant Isn’t Required</div>
          <ul className={styles.list}>
            <li>Strong university/course and clean academic record</li>
            <li>Clear fee plan and proof of funds for living expenses</li>
            <li>Good credit track (if applicable) or strong employability prospects</li>
          </ul>
        </div>
        <div className={`${styles.card} ${styles.cardHover}`}>
          <div className={styles.cardHead}>What Changes Without Collateral</div>
          <ul className={styles.list}>
            <li>Sanction limits may be tighter vs. secured loans</li>
            <li>More focus on program/university and repayment capacity</li>
            <li>Faster processing if documents are complete</li>
          </ul>
        </div>
        <div className={`${styles.card} ${styles.cardHover}`}>
          <div className={styles.cardHead}>Fast Path</div>
          <ol className={styles.ol}>
            <li>Offer letter + fee structure ready</li>
            <li>Gather KYC + academics + test scores (if any)</li>
            <li>Submit; respond quickly to queries</li>
            <li>Sanction → disbursement per deadlines</li>
          </ol>
        </div>
      </section>

      {/* ELIGIBILITY */}
      <section className={styles.section}>
        <h2 className={styles.h2}>Eligibility</h2>
        <ul className={styles.list}>
          <li>Offer/admission letter from a recognized institution</li>
          <li>Strong academic profile and employability</li>
          <li>For India-based lenders: alternative income/repayment support may be reviewed</li>
          <li>For some international lenders: co-applicant often not required</li>
        </ul>
        <p className={styles.note}>
          Unsure if you qualify?{" "}
          <LeadTrigger className={styles.inlineLink} title="Check Loan Eligibility">
            Check Loan Eligibility
          </LeadTrigger>{" "}
          and a StudySahara expert will assess your profile.
        </p>
      </section>

      {/* DOCUMENTS */}
      <section className={styles.section}>
        <h2 className={styles.h2}>Documents</h2>
        <div className={styles.grid2}>
          <ul className={styles.list}>
            <li>Offer Letter & Fee Structure</li>
            <li>Passport, PAN, Aadhaar</li>
            <li>10th/12th/UG/PG Marksheets</li>
            <li>IELTS/TOEFL/GMAT/GRE (if applicable)</li>
          </ul>
          <ul className={styles.list}>
            <li>Address proof</li>
            <li>Bank statements / financial profile</li>
            <li>Recent photos</li>
            <li>Any scholarship/assistantship letters</li>
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section className={styles.section}>
        <h2 className={styles.h2}>FAQs</h2>
        <details className={styles.details}>
          <summary>Which lenders don’t need a co-applicant?</summary>
          <p>Some international providers and a few specific programs. Terms vary; we’ll shortlist based on your profile.</p>
        </details>
        <details className={styles.details}>
          <summary>Are interest rates higher without collateral?</summary>
          <p>They can be comparatively higher than secured loans. Final rate depends on risk profile and lender.</p>
        </details>
        <details className={styles.details}>
          <summary>Will living expenses be covered?</summary>
          <p>Often yes, within policy limits and sanctioned amount.</p>
        </details>
      </section>

      {/* CTA */}
      <section className={styles.ctaWrap}>
        <div className={`${styles.ctaCard} ${styles.cardHover}`}>
          <h3 className={styles.ctaTitle}>Want a lender short-list for your profile?</h3>
          <p className={styles.p}>StudySahara helps you compare options and apply smoothly.</p>
          <div className={styles.ctaBtns}>
            <LeadTrigger className={styles.primaryCta} title="Check Loan Eligibility">
              Check Loan Eligibility
            </LeadTrigger>
            <a href={wa("No Co-Applicant & No Collateral – CTA")} target="_blank" rel="noopener noreferrer" className={styles.secondaryCta}>
              <i className="fab fa-whatsapp" aria-hidden="true"></i> WhatsApp Loan Expert
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER (same brand style) */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <img src="/images/logo.png" alt="StudySahara" width="36" height="36" />
            <div>
              <div className={styles.footerTitle}>StudySahara</div>
              <div className={styles.footerTag}>Education Loans for Studying Abroad</div>
            </div>
          </div>

          <div className={styles.footerLinks}>
            <a href={wa("No Co-Applicant & No Collateral – Footer")} target="_blank" rel="noopener noreferrer" className={styles.footerBtnPrimary}>
              <i className="fab fa-whatsapp" aria-hidden="true"></i> Chat on WhatsApp
            </a>
            <a href="mailto:hello@studysahara.com" className={styles.footerBtnSecondary}>Email: hello@studysahara.com</a>
            <LeadTrigger className={styles.footerBtnOutline} title="Get a Callback">Get a Callback</LeadTrigger>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <span>© {new Date().getFullYear()} StudySahara. All rights reserved.</span>
          <span>
            <Link href="/ourcompany" className={styles.footerLink}>About</Link>
            <span className={styles.footerSep}>•</span>
            <Link href="/eligibility" className={styles.footerLink}>Check Eligibility</Link>
          </span>
        </div>
      </footer>

      {/* Floating WhatsApp */}
      <a href={wa("No Co-Applicant & No Collateral – FAB")} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp" className={styles.floatingWhatsApp}>
        <i className="fab fa-whatsapp" aria-hidden="true"></i>
      </a>

      <LeadModalProvider />
    </main>
  );
}