import Link from "next/link";
import Image from "next/image";
import styles from "./educationCanada.module.css";
import LeadModalProvider from "./LeadModalProvider";
import LeadTrigger from "./LeadTrigger";

/** 👉 Put your WhatsApp number here (E.164 format) */
const WHATSAPP_NUMBER = "+919999999999"; // TODO: replace with your real number

export const metadata = {
  title: "Education Loan for Canada Without Collateral – 2025 Guide | StudySahara",
  description:
    "Step-by-step guide for Indian students to get an education loan for Canada without collateral. Eligibility, documents, timelines, FAQs, and tips.",
  alternates: { canonical: "/education-loan-canada-no-collateral" },
  openGraph: {
    title: "Education Loan for Canada Without Collateral – StudySahara",
    description:
      "How to get a collateral-free education loan for Canada: eligibility, documents, timelines, FAQs, and mistakes to avoid.",
    url: "https://www.studysahara.com/education-loan-canada-no-collateral",
    siteName: "StudySahara",
    type: "article",
  },
};

function JsonLd() {
  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Education Loan for Canada Without Collateral",
    description:
      "Step-by-step guide for Indian students to get a Canada education loan without collateral.",
    mainEntityOfPage:
      "https://www.studysahara.com/education-loan-canada-no-collateral",
    author: { "@type": "Organization", name: "StudySahara" },
    publisher: { "@type": "Organization", name: "StudySahara" },
  };

  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Can I get a Canada education loan without collateral?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Yes. Several lenders offer unsecured (collateral-free) loans based on your admit, co-applicant profile, income proofs, and credit history.",
        },
      },
      {
        "@type": "Question",
        name: "What documents are required for a collateral-free loan?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Typically: admission/offer letter, fee structure, KYC docs, academic records, co-applicant KYC + income proof (salary slips/ITR/bank statements).",
        },
      },
      {
        "@type": "Question",
        name: "How long does approval and disbursement take?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Typical TAT is 5–15 working days after complete documents. Disbursement is aligned to university fee deadlines and your visa timeline.",
        },
      },
      {
        "@type": "Question",
        name: "Are living expenses covered?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Yes. Tuition plus living expenses, insurance, travel, and equipment (e.g., laptop) can be included up to the sanctioned limit.",
        },
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />
    </>
  );
}

export default function Page() {
  const waLink = `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, "")}`;

  return (
    <main className={styles.page}>
      <JsonLd />

      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <Image
            src="/images/canada/toronto-skyline.jpg"
            alt="Toronto skyline, Canada"
            fill
            priority
            className={styles.heroImg}
          />
          <div className={styles.heroOverlay} />
        </div>

        <div className={styles.heroInner}>
          <img
            src="/images/logo.png"
            alt="StudySahara"
            width="56"
            height="56"
            className={styles.logo}
          />
          <h1 className={styles.title}>
            StudySahara - Education Loan for Canada <span>Without Collateral</span>
          </h1>
          <p className={styles.bottomLine}>
            Get a collateral-free education loan for Canada with the right file:
            clear fee plan, complete documents, and a lender that fits your profile.
          </p>

          {/* One shared modal; multiple triggers */}
          <LeadTrigger className={styles.primaryCta} title="Check Loan Eligibility">
            Check Loan Eligibility
          </LeadTrigger>

          <a href={waLink} target="_blank" rel="noopener noreferrer" className={styles.secondaryCta}>
            <i className="fab fa-whatsapp" aria-hidden="true"></i> WhatsApp Loan Expert
          </a>
        </div>
      </section>

      {/* IMAGE STRIP */}
      <section className={styles.strip}>
        <div className={styles.stripItem}>
          <Image src="/images/canada/maple-leaf.jpg" alt="Maple leaf icon" width={36} height={36} />
          <span>Canada intakes: Jan / May / Sep</span>
        </div>
        <div className={styles.stripItem}>
          <Image src="/images/canada/campus.jpg" alt="Campus icon" width={36} height={36} />
          <span>Tuition + Living + Travel can be covered</span>
        </div>
        <div className={styles.stripItem}>
          <Image src="/images/canada/plane.jpg" alt="Plane icon" width={36} height={36} />
          <span>Approval TAT: ~5–15 working days</span>
        </div>
      </section>

      {/* HIGHLIGHTS */}
      <section className={styles.highlights}>
        <div className={`${styles.card} ${styles.cardHover}`}>
          <div className={styles.cardHead}>Key Takeaways</div>
          <ul className={styles.list}>
            <li>Unsecured = no collateral; depends on admit + co-applicant income.</li>
            <li>Covers tuition, living, visa, insurance, and equipment (within limits).</li>
            <li>Respond fast to queries to avoid delays.</li>
            <li>Apply early to align with intake and visa timelines.</li>
          </ul>
        </div>

        <div className={`${styles.card} ${styles.cardHover}`}>
          <div className={styles.cardHead}>What’s Covered</div>
          <ul className={styles.list}>
            <li>Tuition (as per university fee structure)</li>
            <li>Living & accommodation</li>
            <li>Visa, travel, and insurance</li>
            <li>Books and laptop (as allowed by policy)</li>
          </ul>
        </div>

        <div className={`${styles.card} ${styles.cardHover}`}>
          <div className={styles.cardHead}>Fast Path</div>
          <ol className={styles.ol}>
            <li>Offer letter + fee plan ready</li>
            <li>Prep documents</li>
            <li>Submit + respond quickly</li>
            <li>Sanction → disbursement aligned to fee deadlines</li>
          </ol>
        </div>
      </section>

      {/* ELIGIBILITY & DOCUMENTS */}
      <section className={styles.section}>
        <h2 className={styles.h2}>Eligibility</h2>
        <ul className={styles.list}>
          <li>Offer/admission letter from a recognized Canadian institution</li>
          <li>Co-applicant with verifiable income proofs (salary slips/ITR, bank statements)</li>
          <li>Clean credit history improves limits and terms</li>
          <li>Course aligned with employability and your academic record</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.h2}>Documents Required</h2>
        <div className={styles.grid2}>
          <ul className={styles.list}>
            <li>Offer Letter & Fee Structure</li>
            <li>Passport, PAN, Aadhaar</li>
            <li>10th/12th/UG/PG Marksheets</li>
            <li>IELTS/TOEFL/GMAT/GRE (if applicable)</li>
          </ul>
          <ul className={styles.list}>
            <li>Co-applicant KYC & relationship proof</li>
            <li>Co-applicant income proofs (salary slips/ITR, bank statements)</li>
            <li>Address proof</li>
            <li>Recent photos</li>
          </ul>
        </div>
        <p className={styles.note}>
          Want a customized checklist?{" "}
          <LeadTrigger className={styles.inlineLink} title="Check Loan Eligibility">
            Check Loan Eligibility
          </LeadTrigger>{" "}
          and we’ll reach out.
        </p>
      </section>

      {/* FAQ */}
      <section className={styles.section}>
        <h2 className={styles.h2}>FAQs</h2>
        <details className={styles.details}>
          <summary>Can I get a Canada education loan without collateral?</summary>
          <p>Yes — several providers offer unsecured loans based on your admit and co-applicant profile.</p>
        </details>
        <details className={styles.details}>
          <summary>What documents are required?</summary>
          <p>Offer letter, fee structure, KYC, academic records, and co-applicant income proofs.</p>
        </details>
        <details className={styles.details}>
          <summary>How long does it take?</summary>
          <p>Typically 5–15 working days after complete documents. Apply early to match visa/fee timelines.</p>
        </details>
        <details className={styles.details}>
          <summary>Are living expenses covered?</summary>
          <p>Usually yes — within the sanctioned limit, subject to policy.</p>
        </details>
      </section>

      {/* CTA */}
      <section className={styles.ctaWrap}>
        <div className={`${styles.ctaCard} ${styles.cardHover}`}>
          <h3 className={styles.ctaTitle}>Need a lender short-list and checklist?</h3>
          <p className={styles.p}>
            StudySahara helps you compare options, prepare documents, and apply smoothly.
          </p>
          <div className={styles.ctaBtns}>
            <LeadTrigger className={styles.primaryCta} title="Check Loan Eligibility">
              Check Loan Eligibility
            </LeadTrigger>
            <a href={waLink} target="_blank" rel="noopener noreferrer" className={styles.secondaryCta}>
              <i className="fab fa-whatsapp" aria-hidden="true"></i> WhatsApp Loan Expert
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER (brand blue) */}
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
            <a href={waLink} target="_blank" rel="noopener noreferrer" className={styles.footerBtnPrimary}>
              <i className="fab fa-whatsapp" aria-hidden="true"></i> Chat on WhatsApp
            </a>
            <a href="mailto:hello@studysahara.com" className={styles.footerBtnSecondary}>
              Email: hello@studysahara.com
            </a>
            <LeadTrigger className={styles.footerBtnOutline} title="Get a Callback">
              Get a Callback
            </LeadTrigger>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <span>© {new Date().getFullYear()} StudySahara. All rights reserved.</span>
        </div>
        <div className={styles.footerBottom}>
   <a href="/" className={styles.footerLink}>www.studysahara.com</a>
</div>
      </footer>

      {/* Floating WhatsApp Button */}
      <a
        href={waLink}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className={styles.floatingWhatsApp}
      >
        <i className="fab fa-whatsapp" aria-hidden="true"></i>
      </a>

      {/* Mount the singleton modal ONCE for the page */}
      <LeadModalProvider />
    </main>
  );
}