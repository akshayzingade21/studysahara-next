// app/pnb/page.js
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import { createClient } from "@supabase/supabase-js";
import styles from "./pnb.module.css";

const supabase = createClient(
  "https://afbybnlmgntiggetonaa.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmYnlibmxtZ250aWdnZXRvbmFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1NDg3NjIsImV4cCI6MjA2NDEyNDc2Mn0.KNeuwHnFp0H97w2jOgE9vOaOhfwNuHwSdiRlB9tphqo"
);

export default function pnb() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [progress, setProgress] = useState(50);
  const [universitiesData, setUniversitiesData] = useState({});
  const [universityList, setUniversityList] = useState([]);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    countryCode: "+91",
    contactNumber: "",
    country: "",
    university: "",
    course: "",
    intakeMonth: "",
    intakeYear: "",
    admitStatus: "",
  });

  useEffect(() => {
    fetch("/universities.json")
      .then((r) => {
        if (!r.ok) throw new Error(`universities.json ${r.status}`);
        return r.json();
      })
      .then((data) => setUniversitiesData(data))
      .catch((e) => console.error("University load error:", e.message));
  }, []);

  const openModal = () => {
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setFormStep(1);
    setProgress(50);
    setFormData({
      fullName: "",
      email: "",
      countryCode: "+91",
      contactNumber: "",
      country: "",
      university: "",
      course: "",
      intakeMonth: "",
      intakeYear: "",
      admitStatus: "",
    });
    setUniversityList([]);
    clearErrors();
    document.body.style.overflow = "auto";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const next = { ...formData, [name]: value };
    // reset university if country changes
    if (name === "country") {
      next.university = "";
      setUniversityList([]);
    }
    setFormData(next);

    if (name === "university" && value.trim().length >= 3 && next.country) {
      const filtered =
        universitiesData[next.country]?.filter((u) =>
          u.toLowerCase().startsWith(value.trim().toLowerCase())
        ) || [];
      setUniversityList(filtered.slice(0, 12));
    }
  };

  const clearErrors = () => {
    [
      "fullName",
      "email",
      "contactNumber",
      "country",
      "university",
      "course",
      "intakeMonth",
      "intakeYear",
      "admitStatus",
    ].forEach((id) => {
      const el = document.getElementById(id + "-error");
      if (el) el.classList.add("hidden");
    });
  };

  const validateStep1 = () => {
    clearErrors();
    let ok = true;

    if (!formData.fullName.trim()) {
      document.getElementById("fullName-error")?.classList.remove("hidden");
      ok = false;
    }
    if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(formData.email.trim())) {
      document.getElementById("email-error")?.classList.remove("hidden");
      ok = false;
    }
    const numOk =
      /^\+\d{1,3}$/.test(formData.countryCode) &&
      /^\d{10,12}$/.test(formData.contactNumber);
    if (!numOk) {
      document
        .getElementById("contactNumber-error")
        ?.classList.remove("hidden");
      ok = false;
    }
    if (!ok) alert("Please correct errors in Step 1.");
    return ok;
  };

  const validateStep2 = () => {
    clearErrors();
    let ok = true;

    if (!formData.country) {
      document.getElementById("country-error")?.classList.remove("hidden");
      ok = false;
    }
    if (!formData.university.trim()) {
      document.getElementById("university-error")?.classList.remove("hidden");
      ok = false;
    }
    if (!formData.course.trim()) {
      document.getElementById("course-error")?.classList.remove("hidden");
      ok = false;
    }
    if (!formData.intakeMonth || !formData.intakeYear) {
      document.getElementById("intake-error")?.classList.remove("hidden");
      ok = false;
    }
    if (!formData.admitStatus) {
      document.getElementById("admitStatus-error")?.classList.remove("hidden");
      ok = false;
    }
    if (!ok) alert("Please correct errors in Step 2.");
    return ok;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setFormStep(2);
      setProgress(100);
    }
  };
  const handlePrev = () => {
    setFormStep(1);
    setProgress(50);
  };

  const submitToSupabase = async (payload) => {
    try {
      const { status, error } = await supabase
        .from("student_applications")
        .insert([payload]);
      if (error) throw error;
      return status === 201 || status === 200;
    } catch (e) {
      console.error("Supabase error:", e.message);
      alert(`Error: ${e.message}. Please try again.`);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;

    const data = {
      full_name: formData.fullName.trim(),
      email: formData.email.trim(),
      contact_number: `${formData.countryCode}${formData.contactNumber}`,
      country_of_study: formData.country,
      university: formData.university.trim(),
      course: formData.course.trim(),
      intake: `${formData.intakeMonth} ${formData.intakeYear}`,
      admit_status: formData.admitStatus,
      created_at: new Date().toISOString(),
      source_url: "/pnb",
    };

    if (await submitToSupabase(data)) {
      window.location.href = "/success";
    }
  };

  return (
    <>
      <Head>
  {/* Primary SEO */}
  <title>PNB Education Loan for Abroad Studies | StudySahara</title>
  <meta
    name="description"
    content="Apply for Punjab National Bank (PNB) education loans for studying abroad. Flexible repayment, concessions, and expert assistance from StudySahara."
  />
  <meta
    name="keywords"
    content="PNB education loan, Punjab National Bank study loan, PNB abroad loan, PNB student loan, PNB education loan interest rate"
  />
  <link rel="canonical" href="https://www.studysahara.com/pnb" />
  <meta name="robots" content="index, follow" />
  <meta name="author" content="StudySahara" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />

  {/* Open Graph */}
  <meta property="og:type" content="website" />
  <meta property="og:title" content="PNB Education Loan for Abroad Studies | StudySahara" />
  <meta
    property="og:description"
    content="Punjab National Bank education loans for abroad studies. Compare amounts, rates, and repayment with StudySahara’s free guidance."
  />
  <meta property="og:url" content="https://www.studysahara.com/pnb" />
  <meta property="og:site_name" content="StudySahara" />
  <meta property="og:image" content="https://www.studysahara.com/og/pnb.jpg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="PNB Education Loan - StudySahara" />

  {/* Twitter */}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="PNB Education Loan for Abroad Studies | StudySahara" />
  <meta
    name="twitter:description"
    content="PNB education loans for global studies with flexible repayment. Free guidance to apply via StudySahara."
  />
  <meta name="twitter:image" content="https://www.studysahara.com/og/pnb.jpg" />

  {/* JSON-LD FAQ (existing) */}
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "What is the maximum PNB loan amount?",
            acceptedAnswer: {
              "@type": "Answer",
              text:
                "Punjab National Bank can fund large education loan amounts depending on the course, country and collateral. Both unsecured and secured options are available.",
            },
          },
          {
            "@type": "Question",
            name: "Is collateral required with PNB?",
            acceptedAnswer: {
              "@type": "Answer",
              text:
                "Collateral may not be required for smaller loans. Higher loan amounts typically need acceptable collateral or co-borrower strength.",
            },
          },
          {
            "@type": "Question",
            name: "What is the repayment period?",
            acceptedAnswer: {
              "@type": "Answer",
              text:
                "Repayment tenure can extend up to 15 years after the moratorium (course duration plus buffer).",
            },
          },
        ],
      }),
    }}
  />

  {/* JSON-LD Breadcrumb */}
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://www.studysahara.com",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "PNB Education Loan",
            item: "https://www.studysahara.com/pnb",
          },
        ],
      }),
    }}
  />

  {/* JSON-LD LoanOrCredit */}
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "LoanOrCredit",
        name: "PNB Education Loan",
        url: "https://www.studysahara.com/pnb",
        provider: { "@type": "BankOrCreditUnion", name: "Punjab National Bank" },
        areaServed: "IN",
        loanType: "EducationLoan",
        interestRate: {
          "@type": "QuantitativeValue",
          minValue: 8.75,
          maxValue: 10.5,
          unitText: "PERCENT",
        },
        offers: {
          "@type": "Offer",
          availability: "https://schema.org/InStock",
          url: "https://www.studysahara.com/pnb",
          priceCurrency: "INR",
          price: "0",
        },
      }),
    }}
  />
</Head>

      <div className={styles.pnbContainer}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <Link href="/" className={styles.logo}>
              <Image
                src="/images/logo.png"
                alt="StudySahara Logo"
                width={40}
                height={48}
                className={styles.logoImage}
              />
              <span className={styles.logoText}>StudySahara</span>
            </Link>

            <Link href="/" className={styles.navLink} aria-label="Go to home">
              <svg
                className={styles.homeIcon}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            </Link>
          </div>
        </header>

        <main className={styles.main}>
          <section className={`${styles.hero} ${styles.fadeIn}`}>
            <div className={styles.heroContent}>
              <div className={styles.heroText}>
                <h1 className={styles.heroTitle}>pnb Education Loan</h1>
                <p className={styles.heroSubtitle}>
                  Finance your global education with Punjab National Bank’s trusted
                  study loan options and flexible repayment plans.
                </p>
                <button
                  id="heroApplyBtn"
                  className={styles.heroButton}
                  onClick={openModal}
                >
                  Apply Now
                </button>
              </div>
              <div className={styles.heroImage}>
                <div className={styles.imageWrapper}>
                  <Image
                    src="/images/pnb.png"
                    alt="PNB Logo"
                    width={140}
                    height={110}
                    className={styles.pnbImage}
                  />
                </div>
              </div>
            </div>
          </section>

          <div className={styles.contentGrid}>
            <aside className={`${styles.aside} ${styles.fadeIn}`}>
              <div className={styles.asideContent}>
                <h2 className={styles.asideTitle}>Quick Navigation</h2>
                <ul className={styles.asideList}>
                  <li>
                    <a href="#overview" className={styles.asideLink}>
                      Overview
                    </a>
                  </li>
                  <li>
                    <a href="#features" className={styles.asideLink}>
                      Features & Benefits
                    </a>
                  </li>
                  <li>
                    <a href="#eligibility" className={styles.asideLink}>
                      Eligibility
                    </a>
                  </li>
                  <li>
                    <a href="#documents" className={styles.asideLink}>
                      Documents
                    </a>
                  </li>
                  <li>
                    <a href="#interest-rates" className={styles.asideLink}>
                      Interest Rates
                    </a>
                  </li>
                  <li>
                    <a
                      href="#application-process"
                      className={styles.asideLink}
                    >
                      Application Process
                    </a>
                  </li>
                  <li>
                    <a href="#faqs" className={styles.asideLink}>
                      FAQs
                    </a>
                  </li>
                </ul>
              </div>
            </aside>

            <div className={styles.mainContent}>
              <section
                id="overview"
                className={`${styles.section} ${styles.fadeInUp}`}
              >
                <h2 className={styles.sectionTitle}>Overview</h2>
                <p className={styles.sectionText}>
                  Punjab National Bank (pnb) provides education loans that support
                  undergraduate, postgraduate and professional programs in India
                  and abroad. With competitive interest rates, sensible moratorium,
                  and long tenures, pnb is a dependable option for students planning
                  overseas education.
                </p>
              </section>

              <section
                id="features"
                className={`${styles.section} ${styles.fadeInUp}`}
              >
                <h2 className={styles.sectionTitle}>Key Features & Benefits</h2>
                <ul className={styles.featuresList}>
                  <li className={styles.featureItem}>
                    <span>✔</span> Loan Amount: High limits depending on course, country and profile.
                  </li>
                  <li className={styles.featureItem}>
                    <span>✔</span> Moratorium: Course period + buffer for job search.
                  </li>
                  <li className={styles.featureItem}>
                    <span>✔</span> Tenure: Up to ~15 years post-moratorium.
                  </li>
                  <li className={styles.featureItem}>
                    <span>✔</span> Collateral: Optional for lower amounts; required for higher limits.
                  </li>
                  <li className={styles.featureItem}>
                    <span>✔</span> Concessions: Possible rebates or concessions for eligible categories.
                  </li>
                </ul>
              </section>

              <section
                id="eligibility"
                className={`${styles.section} ${styles.fadeInUp}`}
              >
                <h2 className={styles.sectionTitle}>Eligibility Criteria</h2>
                <div className={styles.eligibilityContent}>
                  <div>
                    <h3 className={styles.subTitle}>Student</h3>
                    <ul className={styles.eligibilityList}>
                      <li>Indian citizen, usually 18+ at loan execution.</li>
                      <li>Admission to recognized universities/colleges.</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className={styles.subTitle}>Co-applicant</h3>
                    <ul className={styles.eligibilityList}>
                      <li>Parent/guardian/spouse or acceptable relative.</li>
                      <li>Stable income and satisfactory credit standing.</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section
                id="documents"
                className={`${styles.section} ${styles.fadeInUp}`}
              >
                <h2 className={styles.sectionTitle}>Documents Required</h2>
                <div className={styles.documentsContent}>
                  <div>
                    <h3 className={styles.subTitle}>Student</h3>
                    <ul className={styles.documentsList}>
                      <li>KYC (PAN, Aadhaar, Passport if applicable)</li>
                      <li>Academic marksheets & transcripts</li>
                      <li>Admission letter/offer (if available)</li>
                      <li>Passport-size photographs</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className={styles.subTitle}>Co-applicant</h3>
                    <ul className={styles.documentsList}>
                      <li>KYC & address proof</li>
                      <li>Income proof (ITR/salary slips/bank statements)</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className={styles.subTitle}>Other</h3>
                    <ul className={styles.documentsList}>
                      <li>Loan application form</li>
                      <li>Course fee structure</li>
                      <li>Collateral documents (if applicable)</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section
                id="interest-rates"
                className={`${styles.section} ${styles.fadeInUp}`}
              >
                <h2 className={styles.sectionTitle}>Interest Rates & Charges</h2>
                <p className={styles.sectionText}>
                  pnb links education loan rates to benchmark lending rates. Actual
                  pricing depends on program, security and applicant profile.
                </p>
                <div className={styles.tableContainer}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Loan Bucket</th>
                        <th>Indicative Rate (p.a.)*</th>
                        <th>Processing</th>
                        <th>Collateral</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Lower amounts (unsecured)</td>
                        <td>Typically competitive</td>
                        <td>As per scheme</td>
                        <td>Not required</td>
                      </tr>
                      <tr>
                        <td>Higher amounts (secured)</td>
                        <td>Preferential with security</td>
                        <td>As per scheme</td>
                        <td>Required</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className={styles.tableNote}>
                  *Rates/fees are indicative and vary by profile and scheme. Final
                  sanction terms are issued by pnb.
                </p>
              </section>

              <section
                id="application-process"
                className={`${styles.section} ${styles.fadeInUp}`}
              >
                <h2 className={styles.sectionTitle}>Application Process</h2>
                <ol className={styles.processList}>
                  <li><strong>Submit Inquiry:</strong> Share your basic details online.</li>
                  <li><strong>Shortlisting:</strong> Our advisor maps suitable pnb options.</li>
                  <li><strong>Documents:</strong> We help compile & review your file.</li>
                  <li><strong>Application:</strong> Apply via pnb with our guidance.</li>
                  <li><strong>Sanction & Disbursal:</strong> Receive sanction; funds as per schedule.</li>
                </ol>
                <button
                  id="applyNowBtn"
                  className={styles.applyButton}
                  onClick={openModal}
                >
                  Apply Now
                </button>
                <div
                  id="messageBox"
                  className={styles.messageBox}
                  style={{ display: "none" }}
                >
                  <p id="messageText"></p>
                </div>
              </section>

              <section id="faqs" className={`${styles.section} ${styles.fadeInUp}`}>
                <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
                <div className={styles.faqs}>
                  <div className={styles.faqItem}>
                    <h3
                      className={styles.faqQuestion}
                      onClick={() => toggleFAQ("faq1")}
                    >
                      What is the maximum loan amount with pnb?
                      <span id="faq1-icon" className={styles.faqIcon}>+</span>
                    </h3>
                    <p
                      id="faq1-answer"
                      className={styles.faqAnswer}
                      style={{ display: "none" }}
                    >
                      pnb can fund significant amounts based on the course,
                      institution and collateral/guarantor strength.
                    </p>
                  </div>
                  <div className={styles.faqItem}>
                    <h3
                      className={styles.faqQuestion}
                      onClick={() => toggleFAQ("faq2")}
                    >
                      Is collateral mandatory?
                      <span id="faq2-icon" className={styles.faqIcon}>+</span>
                    </h3>
                    <p
                      id="faq2-answer"
                      className={styles.faqAnswer}
                      style={{ display: "none" }}
                    >
                      For smaller loans, collateral may not be needed. Higher
                      amounts usually require acceptable security.
                    </p>
                  </div>
                  <div className={styles.faqItem}>
                    <h3
                      className={styles.faqQuestion}
                      onClick={() => toggleFAQ("faq3")}
                    >
                      How long is the repayment period?
                      <span id="faq3-icon" className={styles.faqIcon}>+</span>
                    </h3>
                    <p
                      id="faq3-answer"
                      className={styles.faqAnswer}
                      style={{ display: "none" }}
                    >
                      Tenures commonly extend up to ~15 years after the course and
                      moratorium.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </main>

        {/* Modal */}
        <div
          id="applicationModal"
          className={`${styles.modalOverlay} ${isModalOpen ? styles.show : ""}`}
          onClick={closeModal}
          aria-hidden={!isModalOpen}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="pnb-modal-title"
          >
            <div
              className={styles.progressBar}
              style={{ width: `${progress}%`, background: "#2b6cb0" }}
            ></div>
            <h2 id="pnb-modal-title" className={styles.modalTitle}>
              pnb Education Loan Application
            </h2>

            <form id="applicationForm" onSubmit={handleSubmit}>
              {/* Step 1 */}
              <div
                id="formStep1"
                className={`${styles.formStep} ${formStep === 1 ? "" : styles.hidden}`}
              >
                <h3 className={styles.stepTitle}>Personal Details</h3>

                <div className={styles.formGroup}>
                  <label htmlFor="fullName" className={styles.label}>
                    Full Name <span className={styles.required}>*</span>
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    className={`${styles.input} ${styles.inputFocus}`}
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    onFocus={(e) => e.target.classList.add(styles.inputActive)}
                    onBlur={(e) => e.target.classList.remove(styles.inputActive)}
                    required
                    autoComplete="name"
                  />
                  <p id="fullName-error" className={styles.error} style={{ display: "none" }}>
                    Please enter your full name.
                  </p>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.label}>
                    Email Address <span className={styles.required}>*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className={`${styles.input} ${styles.inputFocus}`}
                    placeholder="john.doe@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    onFocus={(e) => e.target.classList.add(styles.inputActive)}
                    onBlur={(e) => e.target.classList.remove(styles.inputActive)}
                    required
                    autoComplete="email"
                  />
                  <p id="email-error" className={styles.error} style={{ display: "none" }}>
                    Please enter a valid email.
                  </p>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="contactNumber" className={styles.label}>
                    Contact Number <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.phoneInput}>
                    <select
                      id="countryCode"
                      name="countryCode"
                      className={`${styles.select} ${styles.selectFocus}`}
                      value={formData.countryCode}
                      onChange={handleInputChange}
                      onFocus={(e) => e.target.classList.add(styles.selectActive)}
                      onBlur={(e) => e.target.classList.remove(styles.selectActive)}
                      required
                    >
                      <option value="+1">+1 (USA)</option>
                      <option value="+44">+44 (UK)</option>
                      <option value="+1">+1 (Canada)</option>
                      <option value="+49">+49 (Germany)</option>
                      <option value="+353">+353 (Ireland)</option>
                      <option value="+61">+61 (Australia)</option>
                      <option value="+33">+33 (France)</option>
                      <option value="+64">+64 (New Zealand)</option>
                      <option value="+971">+971 (Dubai)</option>
                      <option value="+91">+91 (India)</option>
                    </select>
                    <input
                      id="contactNumber"
                      name="contactNumber"
                      type="tel"
                      className={`${styles.input} ${styles.inputFocus}`}
                      placeholder="9876543210"
                      value={formData.contactNumber}
                      onChange={handleInputChange}
                      onFocus={(e) => e.target.classList.add(styles.inputActive)}
                      onBlur={(e) => e.target.classList.remove(styles.inputActive)}
                      required
                      inputMode="numeric"
                    />
                  </div>
                  <p id="contactNumber-error" className={styles.error} style={{ display: "none" }}>
                    Please enter a valid contact number (10–12 digits).
                  </p>
                </div>

                <div className={styles.buttonGroup}>
                  <button
                    type="button"
                    className={`${styles.cancelButton} ${styles.buttonHover}`}
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className={`${styles.nextButton} ${styles.buttonHover}`}
                    onClick={handleNext}
                  >
                    Next
                  </button>
                </div>
              </div>

              {/* Step 2 */}
              <div
                id="formStep2"
                className={`${styles.formStep} ${formStep === 2 ? "" : styles.hidden}`}
              >
                <h3 className={styles.stepTitle}>Education Details</h3>

                <div className={styles.formGroup}>
                  <label htmlFor="country" className={styles.label}>
                    Country of Study <span className={styles.required}>*</span>
                  </label>
                  <select
                    id="country"
                    name="country"
                    className={`${styles.select} ${styles.selectFocus}`}
                    value={formData.country}
                    onChange={handleInputChange}
                    onFocus={(e) => e.target.classList.add(styles.selectActive)}
                    onBlur={(e) => e.target.classList.remove(styles.selectActive)}
                    required
                  >
                    <option value="">Select Country</option>
                    <option value="USA">USA</option>
                    <option value="UK">UK</option>
                    <option value="Canada">Canada</option>
                    <option value="Germany">Germany</option>
                    <option value="Ireland">Ireland</option>
                    <option value="Australia">Australia</option>
                    <option value="France">France</option>
                    <option value="New Zealand">New Zealand</option>
                    <option value="Dubai">Dubai</option>
                    <option value="Others">Others</option>
                  </select>
                  <p id="country-error" className={styles.error} style={{ display: "none" }}>
                    Please select a country.
                  </p>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="university" className={styles.label}>
                    University/College Name <span className={styles.required}>*</span>
                  </label>
                  <input
                    id="university"
                    name="university"
                    type="text"
                    className={`${styles.input} ${styles.inputFocus}`}
                    placeholder="Type first 3 letters"
                    value={formData.university}
                    onChange={handleInputChange}
                    onFocus={(e) => e.target.classList.add(styles.inputActive)}
                    onBlur={(e) => e.target.classList.remove(styles.inputActive)}
                    required
                  />
                  {universityList.length > 0 && (
                    <div className={`${styles.autocompleteList} ${styles.fadeIn}`}>
                      {universityList.map((u) => (
                        <div
                          key={u}
                          className={styles.autocompleteItem}
                          onClick={() => {
                            setFormData((p) => ({ ...p, university: u }));
                            setUniversityList([]);
                          }}
                        >
                          {u}
                        </div>
                      ))}
                    </div>
                  )}
                  <p id="university-error" className={styles.error} style={{ display: "none" }}>
                    Please select a university.
                  </p>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="course" className={styles.label}>
                    Course Name <span className={styles.required}>*</span>
                  </label>
                  <input
                    id="course"
                    name="course"
                    type="text"
                    className={`${styles.input} ${styles.inputFocus}`}
                    placeholder="e.g., Master of Science in Computer Science"
                    value={formData.course}
                    onChange={handleInputChange}
                    onFocus={(e) => e.target.classList.add(styles.inputActive)}
                    onBlur={(e) => e.target.classList.remove(styles.inputActive)}
                    required
                  />
                  <p id="course-error" className={styles.error} style={{ display: "none" }}>
                    Please enter the course name.
                  </p>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Intake <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.intakeInput}>
                    <select
                      id="intakeMonth"
                      name="intakeMonth"
                      className={`${styles.select} ${styles.selectFocus}`}
                      value={formData.intakeMonth}
                      onChange={handleInputChange}
                      onFocus={(e) => e.target.classList.add(styles.selectActive)}
                      onBlur={(e) => e.target.classList.remove(styles.selectActive)}
                      required
                    >
                      <option value="">Select Month</option>
                      {[
                        "January","February","March","April","May","June",
                        "July","August","September","October","November","December",
                      ].map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    <select
                      id="intakeYear"
                      name="intakeYear"
                      className={`${styles.select} ${styles.selectFocus}`}
                      value={formData.intakeYear}
                      onChange={handleInputChange}
                      onFocus={(e) => e.target.classList.add(styles.selectActive)}
                      onBlur={(e) => e.target.classList.remove(styles.selectActive)}
                      required
                    >
                      <option value="">Select Year</option>
                      {["2025","2026","2027"].map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                  <p id="intake-error" className={styles.error} style={{ display: "none" }}>
                    Please select an intake period.
                  </p>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="admitStatus" className={styles.label}>
                    Admit Status <span className={styles.required}>*</span>
                  </label>
                  <select
                    id="admitStatus"
                    name="admitStatus"
                    className={`${styles.select} ${styles.selectFocus}`}
                    value={formData.admitStatus}
                    onChange={handleInputChange}
                    onFocus={(e) => e.target.classList.add(styles.selectActive)}
                    onBlur={(e) => e.target.classList.remove(styles.selectActive)}
                    required
                  >
                    <option value="">Select Status</option>
                    <option value="Applied for the university">Applied for the university</option>
                    <option value="Received Offer/Admit letter">Received Offer/Admit letter</option>
                    <option value="Yet to apply for the university">Yet to apply for the university</option>
                  </select>
                  <p id="admitStatus-error" className={styles.error} style={{ display: "none" }}>
                    Please select an admit status.
                  </p>
                </div>

                <div className={styles.buttonGroup}>
                  <button
                    type="button"
                    className={`${styles.prevButton} ${styles.buttonHover}`}
                    onClick={handlePrev}
                  >
                    Previous
                  </button>
                  <button
                    type="submit"
                    className={`${styles.submitButton} ${styles.buttonHover}`}
                  >
                    Submit
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        <footer className={`${styles.footer} ${styles.fadeIn}`}>
          <div className={styles.footerContent}>
            <div>
              <h3 className={styles.footerTitle}>StudySahara</h3>
              <p className={styles.footerText}>
                Simplifying your journey to global education with tailored loan solutions.
              </p>
            </div>
            <div>
              <h3 className={styles.footerTitle}>Stay Connected</h3>
              <div className={styles.socialLinks}>
                <a href="#" className={`${styles.socialLink} ${styles.socialHover}`} aria-label="Facebook">
                  <svg className={styles.socialIcon} viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                  </svg>
                </a>
                <a href="#" className={`${styles.socialLink} ${styles.socialHover}`} aria-label="Twitter">
                  <svg className={styles.socialIcon} viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
                  </svg>
                </a>
                <a href="#" className={`${styles.socialLink} ${styles.socialHover}`} aria-label="LinkedIn">
                  <svg className={styles.socialIcon} viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h3 className={styles.footerTitle}>Newsletter</h3>
              <form className={styles.newsletterForm}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className={`${styles.newsletterInput} ${styles.inputFocus}`}
                  aria-label="Newsletter email"
                  onFocus={(e) => e.target.classList.add(styles.inputActive)}
                  onBlur={(e) => e.target.classList.remove(styles.inputActive)}
                />
                <button type="submit" className={`${styles.newsletterButton} ${styles.buttonHover}`}>
                  Subscribe
                </button>
              </form>
            </div>
          </div>
          <p className={styles.footerCopyright}>© 2025 StudySahara. All rights reserved.</p>
        </footer>
      </div>
    </>
  );

  function toggleFAQ(id) {
    const answer = document.getElementById(`${id}-answer`);
    const icon = document.getElementById(`${id}-icon`);
    const show = answer.style.display === "none";
    answer.style.display = show ? "block" : "none";
    icon?.classList.toggle(styles.rotateIcon);
  }
}