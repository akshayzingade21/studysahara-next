"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import Head from "next/head";
import styles from "./prodigyfinance.module.css";

const supabase = createClient(
  "https://afbybnlmgntiggetonaa.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmYnlibmxtZ250aWdnZXRvbmFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1NDg3NjIsImV4cCI6MjA2NDEyNDc2Mn0.KNeuwHnFp0H97w2jOgE9vOaOhfwNuHwSdiRlB9tphqo"
);

export default function ProdigyFinance() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formStep, setFormStep] = useState(1);
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
  const [universitiesData, setUniversitiesData] = useState({});
  const [universityList, setUniversityList] = useState([]);
  const [progress, setProgress] = useState(50);

  useEffect(() => {
    fetch("/universities.json")
      .then((response) => {
        if (!response.ok) throw new Error(`Failed to load universities.json: ${response.status}`);
        return response.json();
      })
      .then((data) => setUniversitiesData(data))
      .catch((error) => console.error("Error loading universities:", error.message));

    const handleResize = () => {
      if (window.innerWidth > 768 && isSidebarOpen) setIsSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isSidebarOpen]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const openModal = () => {
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormStep(1);
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
    setProgress(50);
    clearErrors();
    document.body.style.overflow = "auto";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    console.log(`Updated ${name} to ${value}`);
    if (name === "university" && value.trim().length >= 3 && formData.country) {
      const filtered = universitiesData[formData.country]?.filter((uni) =>
        uni.toLowerCase().startsWith(value.trim().toLowerCase())
      ) || [];
      setUniversityList(filtered);
    } else if (name === "country") {
      setFormData((prev) => ({ ...prev, university: "" }));
      setUniversityList([]);
    }
  };

  const validateStep1 = () => {
    clearErrors();
    let errors = [];
    if (!formData.fullName.trim()) {
      errors.push("Full name is empty");
      document.getElementById("fullName-error").classList.remove("hidden");
    }
    if (!formData.email.match(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
      errors.push("Invalid email");
      document.getElementById("email-error").classList.remove("hidden");
    }
    const fullContactNumber = formData.countryCode + formData.contactNumber;
    if (
      !formData.countryCode ||
      !formData.contactNumber.match(/^\d{10,12}$/) ||
      !fullContactNumber.match(/^\+\d{1,3}\d{10,12}$/)
    ) {
      errors.push("Invalid contact number");
      document.getElementById("contactNumber-error").classList.remove("hidden");
    }
    if (errors.length > 0) {
      alert("Please correct errors in Step 1.");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    clearErrors();
    let errors = [];
    if (!formData.country) {
      errors.push("Country not selected");
      document.getElementById("country-error").classList.remove("hidden");
    }
    if (!formData.university.trim()) {
      errors.push("University not specified");
      document.getElementById("university-error").classList.remove("hidden");
    }
    if (!formData.course.trim()) {
      errors.push("Course not specified");
      document.getElementById("course-error").classList.remove("hidden");
    }
    if (!formData.intakeMonth || !formData.intakeYear) {
      errors.push("Intake not selected");
      document.getElementById("intake-error").classList.remove("hidden");
    }
    if (!formData.admitStatus) {
      errors.push("Admit status not selected");
      document.getElementById("admitStatus-error").classList.remove("hidden");
    }
    if (errors.length > 0) {
      alert("Please correct errors in Step 2.");
      return false;
    }
    return true;
  };

  const clearErrors = () => {
    [
      "fullName",
      "email",
      "countryCode",
      "contactNumber",
      "country",
      "university",
      "course",
      "intakeMonth",
      "intakeYear",
      "admitStatus",
    ].forEach((id) => {
      const input = document.getElementById(id);
      const error = document.getElementById(`${id}-error`);
      if (input) input.classList.remove("border-red-500");
      if (error) error.classList.add("hidden");
    });
  };

  const submitToSupabase = async (data) => {
    try {
      const response = await supabase
        .from("student_applications")
        .insert([data]);
      return response.status === 201;
    } catch (error) {
      console.error("Supabase fetch error:", error.message);
      alert(`Error: ${error.message}. Please try again.`);
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
      source_url: "/ProdigyFinance",
    };

    if (await submitToSupabase(data)) {
      window.location.href = "/success";
    }
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

  return (
    <>
      <Head>
        <title>Prodigy Finance Education Loan - StudySahara</title>
        <meta name="description" content="Get education loans from Prodigy Finance without collateral or co-applicant. Ideal for students studying in top universities across the world." />
        <meta name="keywords" content="Prodigy Finance loan, Prodigy study loan, international student loan without collateral, Prodigy MS loan, Prodigy Finance abroad education loan" />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta charSet="UTF-8" />
        <meta name="author" content="StudySahara" />
        <link rel="canonical" href="https://www.studysahara.com/prodigyfinance" />
      </Head>
      <div className={styles.prodigyContainer}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <Link href="/" className={styles.logo}>
              <Image src="/images/logo.png" alt="StudySahara Logo" width={40} height={48} className={styles.logoImage} />
              <span className={styles.logoText}>StudySahara</span>
            </Link>
              <Link href="/" className={styles.navLink}>
                  <svg className={styles.homeIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </Link>
                </div>
        </header>

        <main className={styles.main}>
          <section className={`${styles.hero} ${styles.fadeIn}`}>
            <div className={styles.heroContent}>
              <div className={styles.heroText}>
                <h1 className={styles.heroTitle}>Prodigy Finance Education Loan</h1>
                <p className={styles.heroSubtitle}>
                  Pursue your global education with Prodigy Finance’s collateral-free and no-coapplicant loans, covering 100% of costs with APRs starting at ~8%.
                </p>
                <button id="heroApplyBtn" className={styles.heroButton} onClick={openModal}>
                  Apply Now
                </button>
              </div>
              <div className={styles.heroImage}>
                <div className={styles.imageWrapper}>
                  <Image
                    src="/images/prodigyfinance.png"
                    alt="Prodigy Finance Logo"
                    width={180}
                    height={180}
                    className={styles.prodigyImage}
                    onError={(e) => (e.target.src = "/images/prodigy-finance.png")}
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
                  <li><a href="#overview" className={styles.asideLink}>Overview</a></li>
                  <li><a href="#features" className={styles.asideLink}>Features & Benefits</a></li>
                  <li><a href="#eligibility" className={styles.asideLink}>Eligibility</a></li>
                  <li><a href="#documents" className={styles.asideLink}>Documents</a></li>
                  <li><a href="#interest-rates" className={styles.asideLink}>Interest Rates</a></li>
                  <li><a href="#application-process" className={styles.asideLink}>Application Process</a></li>
                  <li><a href="#faqs" className={styles.asideLink}>FAQs</a></li>
                </ul>
              </div>
            </aside>

            <div className={styles.mainContent}>
              <section id="overview" className={`${styles.section} ${styles.fadeInUp}`}>
                <h2 className={styles.sectionTitle}>Overview</h2>
                <p className={styles.sectionText}>
                  Prodigy Finance is a UK-based international student loan provider that helps students from over 150 countries fund their higher education abroad — without requiring a co-signer, collateral, or credit history in the destination country.
                  Founded in 2007, Prodigy Finance has supported over 30,000 students globally by partnering with top universities and programs in the USA, Canada, UK, Germany, France and beyond.
                </p>
              </section>

              <section id="features" className={`${styles.section} ${styles.fadeInUp}`}>
                <h2 className={styles.sectionTitle}>Key Features & Benefits</h2>
                <ul className={styles.featuresList}>
                  <li className={styles.featureItem}><span>✔</span> No Collateral or Co-signer Required: Apply independently without needing security or a guarantor.</li>
                  <li className={styles.featureItem}><span>✔</span> Full Cost Coverage: Loans can cover tuition, living expenses, and other education-related costs.</li>
                  <li className={styles.featureItem}><span>✔</span> Deferred Repayment: No payments required during the study period and a 6-month grace period after graduation.</li>
                  <li className={styles.featureItem}><span>✔</span> Top University Coverage: Loans available for 1000+ programs at globally recognized institutions.</li>
                  <li className={styles.featureItem}><span>✔</span> 100% Online Process: Simple digital application with fast approvals and document uploads.</li>
                  <li className={styles.featureItem}><span>✔</span> No Local Credit History Needed: Approval is based on your future earning potential, not credit score.</li>
                  <li className={styles.featureItem}><span>✔</span> No Prepayment Charges: Repay early anytime without penalty or extra fees.</li>
                  <li className={styles.featureItem}><span>✔</span> Transparent Interest Rates: Competitive variable interest rates based on your profile and university.</li>
                  <li className={styles.featureItem}><span>✔</span> Multi-Currency Repayment: Repay in USD, GBP, EUR, or other major currencies as per your location.</li>
                </ul>
              </section>

              <section id="eligibility" className={`${styles.section} ${styles.fadeInUp}`}>
                <h2 className={styles.sectionTitle}>Eligibility Criteria</h2>
                <div className={styles.eligibilityContent}>
                  <div>
                    <h3 className={styles.subTitle}>Student:</h3>
                    <ul className={styles.eligibilityList}>
                      <li>Enrollment in Supported Program: Admitted to a postgraduate program at one of 1,700+ supported schools in 19 countries (e.g., USA, UK, Canada).</li>
                      <li>Age Requirement: Be 18 years or older at the time of application.</li>
                      <li>Supported Country of Residence: Reside in one of 150+ supported countries.</li>
                      <li>No Collateral or Co-Signer: Collateral-free loans; co-signer optional for Indian students (co-signer requires strong credit/income).</li>
                      <li>Study Abroad Requirement: Study in a country different from your home country. US/UK residents may qualify for domestic programs.</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section id="documents" className={`${styles.section} ${styles.fadeInUp}`}>
                <h2 className={styles.sectionTitle}>Documents Required</h2>
                <div className={styles.documentsContent}>
                  <div>
                    <h3 className={styles.subTitle}>Student:</h3>
                    <ul className={styles.documentsList}>
                      <li>Passport.</li>
                      <li>Admission letter from supported school.</li>
                      <li>Academic records (degree, transcripts).</li>
                      <li>Cost of attendance breakdown (tuition, living).</li>
                      <li>Proof of funds (if partially funded).</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className={styles.subTitle}>Other:</h3>
                    <ul className={styles.documentsList}>
                      <li>Prodigy Finance loan application form.</li>
                      <li>Credit report or income proof (if required).</li>
                      <li>Bank details for disbursal.</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section id="interest-rates" className={`${styles.section} ${styles.fadeInUp}`}>
                <h2 className={styles.sectionTitle}>Interest Rates & Charges</h2>
                <p className={styles.sectionText}>
                  Prodigy Finance offers variable APRs with no prepayment penalties after 6 months and a digital application process.
                </p>
                <div className={styles.tableContainer}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Loan Type</th>
                        <th>APR (p.a.)*</th>
                        <th>Admin Fee</th>
                        <th>Collateral/Cosigner</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Abroad (Master’s, up to 100% cost)</td>
                        <td>Starting from 8.30%</td>
                        <td>4%-5% Admin Fee added in Loan Amount + $500 Processing Fee</td>
                        <td>Not required</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className={styles.tableNote}>
                  *APRs are variable, based on creditworthiness, course, and school.
                </p>
              </section>

              <section id="application-process" className={`${styles.section} ${styles.fadeInUp}`}>
                <h2 className={styles.sectionTitle}>Application Process</h2>
                <ol className={styles.processList}>
                  <li><strong>Submit Inquiry:</strong> Fill out our quick online form.</li>
                  <li><strong>Expert Guidance:</strong> Connect with our loan advisor for Prodigy Finance options.</li>
                  <li><strong>Document Prep:</strong> Gather documents with our assistance.</li>
                  <li><strong>Disbursal:</strong> Funds released to university or account within 7–10 days.</li>
                </ol>
                <button id="applyNowBtn" className={styles.applyButton} onClick={openModal}>
                  Apply Now
                </button>
                <div id="messageBox" className={styles.messageBox} style={{ display: "none" }}>
                  <p id="messageText"></p>
                </div>
              </section>

              <section id="faqs" className={`${styles.section} ${styles.fadeInUp}`}>
                <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
                <div className={styles.faqs}>
                  <div className={styles.faqItem}>
                    <h3 className={styles.faqQuestion} onClick={() => toggleFAQ("faq1")}>
                      What is the maximum loan amount from Prodigy Finance? <span id="faq1-icon" className={styles.faqIcon}>+</span>
                    </h3>
                    <p id="faq1-answer" className={styles.faqAnswer} style={{ display: "none" }}>
                      Up to 100% of the cost of attendance (tuition + living expenses) for eligible master’s programs.
                    </p>
                  </div>
                  <div className={styles.faqItem}>
                    <h3 className={styles.faqQuestion} onClick={() => toggleFAQ("faq2")}>
                      Is collateral required for Prodigy Finance loans? <span id="faq2-icon" className={styles.faqIcon}>+</span>
                    </h3>
                    <p id="faq2-answer" className={styles.faqAnswer} style={{ display: "none" }}>
                      No, Prodigy Finance loans are collateral-free, with no co-signer needed for most cases.
                    </p>
                  </div>
                  <div className={styles.faqItem}>
                    <h3 className={styles.faqQuestion} onClick={() => toggleFAQ("faq3")}>
                      Can I apply before getting an admission letter? <span id="faq3-icon" className={styles.faqIcon}>+</span>
                    </h3>
                    <p id="faq3-answer" className={styles.faqAnswer} style={{ display: "none" }}>
                      You can request a loan quote before admission, but an official admission letter is required to finalize the loan.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </main>

        <div id="applicationModal" className={`${styles.modalOverlay} ${isModalOpen ? styles.show : ""}`} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.progressBar} style={{ width: `${progress}%`, background: "#2b6cb0" }}></div>
            <h2 className={styles.modalTitle}>Prodigy Finance Education Loan Application</h2>
            <form id="applicationForm" onSubmit={handleSubmit}>
              <div id="formStep1" className={`${styles.formStep} ${formStep === 1 ? "" : styles.hidden}`}>
                <h3 className={styles.stepTitle}>Personal Details</h3>
                <div className={styles.formGroup}>
                  <label htmlFor="fullName" className={styles.label}>Full Name <span className={styles.required}>*</span></label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    className={`${styles.input} ${styles.inputFocus}`}
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    onFocus={(e) => e.target.classList.add(styles.inputActive)}
                    onBlur={(e) => e.target.classList.remove(styles.inputActive)}
                    required
                  />
                  <p id="fullName-error" className={styles.error} style={{ display: "none" }}>Please enter your full name.</p>
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.label}>Email Address <span className={styles.required}>*</span></label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className={`${styles.input} ${styles.inputFocus}`}
                    placeholder="john.doe@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    onFocus={(e) => e.target.classList.add(styles.inputActive)}
                    onBlur={(e) => e.target.classList.remove(styles.inputActive)}
                    required
                  />
                  <p id="email-error" className={styles.error} style={{ display: "none" }}>Please enter a valid email.</p>
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="contactNumber" className={styles.label}>Contact Number <span className={styles.required}>*</span></label>
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
                    <span className={styles.selectedCode}>{formData.countryCode}</span>
                    <input
                      type="tel"
                      id="contactNumber"
                      name="contactNumber"
                      className={`${styles.input} ${styles.inputFocus}`}
                      placeholder="9876543210"
                      value={formData.contactNumber}
                      onChange={handleInputChange}
                      onFocus={(e) => e.target.classList.add(styles.inputActive)}
                      onBlur={(e) => e.target.classList.remove(styles.inputActive)}
                      required
                    />
                  </div>
                  <p id="contactNumber-error" className={styles.error} style={{ display: "none" }}>Please enter a valid contact number (10-12 digits).</p>
                </div>
                <div className={styles.buttonGroup}>
                  <button type="button" className={`${styles.cancelButton} ${styles.buttonHover}`} onClick={closeModal}>Cancel</button>
                  <button type="button" className={`${styles.nextButton} ${styles.buttonHover}`} onClick={handleNext}>Next</button>
                </div>
              </div>
              <div id="formStep2" className={`${styles.formStep} ${formStep === 2 ? "" : styles.hidden}`}>
                <h3 className={styles.stepTitle}>Education Details</h3>
                <div className={styles.formGroup}>
                  <label htmlFor="country" className={styles.label}>Country of Study <span className={styles.required}>*</span></label>
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
                  <p id="country-error" className={styles.error} style={{ display: "none" }}>Please select a country.</p>
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="university" className={styles.label}>University/College Name <span className={styles.required}>*</span></label>
                  <input
                    type="text"
                    id="university"
                    name="university"
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
                      {universityList.map((uni) => (
                        <div
                          key={uni}
                          className={styles.autocompleteItem}
                          onClick={() => {
                            setFormData((prev) => ({ ...prev, university: uni }));
                            setUniversityList([]);
                          }}
                        >
                          {uni}
                        </div>
                      ))}
                    </div>
                  )}
                  <p id="university-error" className={styles.error} style={{ display: "none" }}>Please select a university.</p>
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="course" className={styles.label}>Course Name <span className={styles.required}>*</span></label>
                  <input
                    type="text"
                    id="course"
                    name="course"
                    className={`${styles.input} ${styles.inputFocus}`}
                    placeholder="e.g., Master of Business Administration"
                    value={formData.course}
                    onChange={handleInputChange}
                    onFocus={(e) => e.target.classList.add(styles.inputActive)}
                    onBlur={(e) => e.target.classList.remove(styles.inputActive)}
                    required
                  />
                  <p id="course-error" className={styles.error} style={{ display: "none" }}>Please enter the course name.</p>
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="intake" className={styles.label}>Intake <span className={styles.required}>*</span></label>
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
                      <option value="January">January</option>
                      <option value="February">February</option>
                      <option value="March">March</option>
                      <option value="April">April</option>
                      <option value="May">May</option>
                      <option value="June">June</option>
                      <option value="July">July</option>
                      <option value="August">August</option>
                      <option value="September">September</option>
                      <option value="October">October</option>
                      <option value="November">November</option>
                      <option value="December">December</option>
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
                      <option value="2023">2023</option>
                      <option value="2024">2024</option>
                      <option value="2025">2025</option>
                      <option value="2026">2026</option>
                      <option value="2027">2027</option>
                    </select>
                  </div>
                  <p id="intake-error" className={styles.error} style={{ display: "none" }}>Please select an intake period.</p>
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="admitStatus" className={styles.label}>Admit Status <span className={styles.required}>*</span></label>
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
                  <p id="admitStatus-error" className={styles.error} style={{ display: "none" }}>Please select an admit status.</p>
                </div>
                <div className={styles.buttonGroup}>
                  <button type="button" className={`${styles.prevButton} ${styles.buttonHover}`} onClick={handlePrev}>Previous</button>
                  <button type="submit" className={`${styles.submitButton} ${styles.buttonHover}`}>Submit</button>
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
                  <svg className={styles.socialIcon} viewBox="0 0 24 24">
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                  </svg>
                </a>
                <a href="#" className={`${styles.socialLink} ${styles.socialHover}`} aria-label="Twitter">
                  <svg className={styles.socialIcon} viewBox="0 0 24 24">
                    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
                  </svg>
                </a>
                <a href="#" className={`${styles.socialLink} ${styles.socialHover}`} aria-label="LinkedIn">
                  <svg className={styles.socialIcon} viewBox="0 0 24 24">
                    <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h3 className={styles.footerTitle}>Newsletter</h3>
              <form className={styles.newsletterForm}>
                <input type="email" placeholder="Enter your email" className={`${styles.newsletterInput} ${styles.inputFocus}`} aria-label="Newsletter email" onFocus={(e) => e.target.classList.add(styles.inputActive)} onBlur={(e) => e.target.classList.remove(styles.inputActive)} />
                <button type="submit" className={`${styles.newsletterButton} ${styles.buttonHover}`}>Subscribe</button>
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
    const isHidden = answer.style.display === "none";
    answer.style.display = isHidden ? "block" : "none";
    icon.classList.toggle(styles.rotateIcon);
  }
}