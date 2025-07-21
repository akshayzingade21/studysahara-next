"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import Head from "next/head";
import styles from "./us-co-applicant.module.css";
import { useRouter } from "next/navigation";

const supabase = createClient(
  "https://afbybnlmgntiggetonaa.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmYnlibmxtZ250aWdnZXRvbmFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1NDg3NjIsImV4cCI6MjA2NDEyNDc2Mn0.KNeuwHnFp0H97w2jOgE9vOaOhfwNuHwSdiRlB9tphqo"
);

export default function LoanOptionUS() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    contactNumber: "",
    countryCode: "+91",
    email: "",
    countryOfStudy: "",
    university: "",
    course: "",
    intakeMonth: "",
    intakeYear: "",
    admitStatus: "",
  });
  const [universitiesData, setUniversitiesData] = useState({});
  const [universityList, setUniversityList] = useState([]);
  const [errors, setErrors] = useState({});
  const router = useRouter();

  useEffect(() => {
    fetch("/universities.json")
      .then((response) => {
        if (!response.ok) throw new Error(`Failed to load universities.json: ${response.status}`);
        return response.json();
      })
      .then((data) => setUniversitiesData(data))
      .catch((error) => console.error("Error loading universities:", error.message));
  }, []);

  const openModal = () => {
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({
      fullName: "",
      contactNumber: "",
      countryCode: "+91",
      email: "",
      countryOfStudy: "",
      university: "",
      course: "",
      intakeMonth: "",
      intakeYear: "",
      admitStatus: "",
    });
    setErrors({});
    document.body.style.overflow = "auto";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "university" && value.trim().length >= 3 && formData.countryOfStudy) {
      const filtered = universitiesData[formData.countryOfStudy]?.filter((uni) =>
        uni.toLowerCase().startsWith(value.trim().toLowerCase())
      ) || [];
      setUniversityList(filtered);
    } else if (name === "countryOfStudy") {
      setFormData((prev) => ({ ...prev, university: "" }));
      setUniversityList([]);
    }
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email.match(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)) newErrors.email = "Valid email is required";
    const fullContactNumber = formData.countryCode + formData.contactNumber;
    if (!formData.contactNumber.match(/^\d{10,12}$/) || !fullContactNumber.match(/^\+\d{1,3}\d{10,12}$/))
      newErrors.contactNumber = "Valid contact number (10-12 digits) is required";
    if (!formData.countryOfStudy) newErrors.countryOfStudy = "Country of study is required";
    if (!formData.university.trim()) newErrors.university = "University is required";
    if (!formData.course.trim()) newErrors.course = "Course is required";
    if (!formData.intakeMonth || !formData.intakeYear) newErrors.intake = "Intake details are required";
    if (!formData.admitStatus) newErrors.admitStatus = "Admit status is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted at", new Date().toISOString());
    console.log("Form data:", formData);
    if (!validateForm()) {
      console.log("Validation errors:", errors);
      return;
    }

    const source_url = window.location.pathname;
    const data = {
      full_name: formData.fullName.trim(),
      email: formData.email.trim(),
      contact_number: `${formData.countryCode}${formData.contactNumber}`,
      country_of_study: formData.countryOfStudy,
      university: formData.university.trim(),
      course: formData.course.trim(),
      intake: `${formData.intakeMonth} ${formData.intakeYear}`,
      admit_status: formData.admitStatus,
      created_at: new Date().toISOString(),
      source_url: source_url,
    };

    console.log("Data to insert:", data);
    try {
      const { error } = await supabase.from("student_loan_applications").insert([data]);
      if (error) throw error;
      router.push("/success");
    } catch (error) {
      console.error("Supabase error:", error.message, error.details, error.code);
      alert("Error submitting application. Please try again. Check console for details.");
    }
  };

  return (
    <>
      <Head>
        <title>US Co-Applicant/Co-Signer Loan | StudySahara</title>
        <meta
          name="description"
          content="Secure a US co-applicant/co-signer education loan for studying in the USA with StudySahara. Requires a US citizen or permanent resident co-signer. Apply now!"
        />
        <meta
          name="keywords"
          content="US education loan, co-signer loan, study in USA, US co-applicant loan, StudySahara loan, US study abroad loan"
        />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta charSet="UTF-8" />
        <meta name="author" content="StudySahara" />
        <link rel="icon" href="/images/logo2.webp" type="image/webp" />
        <meta property="og:title" content="US Co-Applicant/Co-Signer Loan | StudySahara" />
        <meta
          property="og:description"
          content="Get a US co-applicant/co-signer loan for studying in the USA. Requires a US citizen or permanent resident co-signer. Apply with StudySahara!"
        />
        <meta property="og:url" content="https://studysahara.com/us-co-applicant" />
        <meta property="og:type" content="website" />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content="US Co-Applicant/Co-Signer Loan | StudySahara" />
        <meta
          property="twitter:description"
          content="Affordable US co-signer loan for international students studying in the USA. Apply now with StudySahara!"
        />
        <link rel="canonical" href="https://www.studysahara.com/us-co-applicant" />
      </Head>
      <div className={styles.PNBContainer}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <Link href="/" className={styles.logo}>
              <Image src="/images/logo2.webp" alt="StudySahara Logo" width={40} height={40} className={styles.logoImage} />
              <span className={styles.logoText}>StudySahara</span>
            </Link>
            <Link href="/" className={styles.homeButton}>Home</Link>
          </div>
        </header>

        <main className={styles.main}>
          <section className={styles.hero}>
            <div className={styles.heroContent}>
              <h1 className={styles.heroTitle}>US Co-Applicant/Co-Signer Loan</h1>
              <p className={styles.heroSubtitle}>
                Unlock your US study dreams with a loan supported by a US co-signer!
              </p>
              <button className={styles.applyButton} onClick={openModal}>
                Apply Now
              </button>
            </div>
          </section>

          <section className={styles.infoSection}>
            <div className={styles.infoCard}>
              <h2 className={styles.sectionTitle}>What is US Co-Applicant/Co-Signer Loan?</h2>
              <p className={styles.infoText}>
                This is an education loan that requires a co-signer who is a US citizen or permanent resident.
              </p>
            </div>
            <div className={styles.infoCard}>
              <h2 className={styles.sectionTitle}>Key Features</h2>
              <ul className={styles.featureList}>
                <li><span className={styles.checkIcon}>✔</span> The co-signer can be anybody within or outside the family such as relative, friends or colleague etc.</li>
                <li><span className={styles.checkIcon}>✔</span> The co-signer&#39;s credit score is a critical factor for approval.</li>
                <li><span className={styles.checkIcon}>✔</span> Can get lower interest rates as the rates are based on US Central Bank rates.</li>
                <li><span className={styles.checkIcon}>✔</span> Available only for students who are planning to study in the US.</li>
              </ul>
            </div>
            <div className={styles.infoCard}>
              <h2 className={styles.sectionTitle}>Eligibility</h2>
              <ul className={styles.eligibilityList}>
                <li>A US-based co-signer with a good credit score.</li>
                <li>Admission to a US university.</li>
              </ul>
            </div>
            <div className={styles.infoCard}>
              <h2 className={styles.sectionTitle}>Suitable For:</h2>
              <ul className={styles.featureList}>
                <li><span className={styles.checkIcon}>✔</span> Students with relatives or trusted contacts in the US willing to be co-signers.</li>
                <li><span className={styles.checkIcon}>✔</span> Students aiming for low-interest loans for US studies.</li>
              </ul>
            </div>
            <div className={styles.infoCard}>
              <h2 className={styles.sectionTitle}>Benefits</h2>
              <ul className={styles.featureList}>
                <li><span className={styles.checkIcon}>✔</span> Lower interest rates.</li>
                <li><span className={styles.checkIcon}>✔</span> Higher loan limits due to security.</li>
              </ul>
            </div>
          </section>

          <section className={styles.faqSection}>
            <h2 className={styles.sectionTitle}>Frequently Asked Questions (FAQs)</h2>
            <div className={styles.faqContainer}>
              <div className={styles.faqItem}>
                <h3 className={styles.faqQuestion} onClick={() => toggleFAQ("faq1")}>
                  What is the maximum loan amount available? <span id="faq1-icon" className={styles.faqIcon}>+</span>
                </h3>
                <p id="faq1-answer" className={styles.faqAnswer}>
                  The maximum loan amount varies based on the lender and your profile. It can cover both tuition fees and living expenses.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h3 className={styles.faqQuestion} onClick={() => toggleFAQ("faq2")}>
                  What is the interest rate? <span id="faq2-icon" className={styles.faqIcon}>+</span>
                </h3>
                <p id="faq2-answer" className={styles.faqAnswer}>
                  Interest rates start from 3.45% and depend on the lender and your eligibility.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h3 className={styles.faqQuestion} onClick={() => toggleFAQ("faq3")}>
                  Can I repay the loan before the scheduled time? <span id="faq3-icon" className={styles.faqIcon}>+</span>
                </h3>
                <p id="faq3-answer" className={styles.faqAnswer}>
                  Yes, you can prepay the loan without any foreclosure charges.
                </p>
              </div>
            </div>
          </section>
        </main>

        <footer className={styles.footer}>
          <div className={styles.footerContent}>
            <div className={styles.footerSection}>
              <h3>Contact Us</h3>
              <p>Email: support@studysahara.com</p>
              <p>Address: No 51, 5th Floor, 5th Main Road, Above Alchemy Coffee Roasters, Bengaluru-560041</p>
            </div>
            <div className={styles.footerSection}>
              <h3>Quick Links</h3>
              <ul>
                <li><Link href="/">Home</Link></li>
                <li><Link href="/eligibility">Check your Loan Eligibility</Link></li>
                <li><Link href="/ourcompany">About Us</Link></li>
              </ul>
            </div>
            <div className={styles.footerSection}>
              <h3>Follow Us</h3>
              <ul className={styles.socialLinks}>
                <li><Link href="https://facebook.com/studysahara">Facebook</Link></li>
                <li><Link href="https://twitter.com/studysahara">Twitter</Link></li>
                <li><Link href="https://linkedin.com/company/studysahara">LinkedIn</Link></li>
              </ul>
            </div>
          </div>
          <p className={styles.footerCopyright}>© 2025 StudySahara. All rights reserved.</p>
        </footer>

        <div className={`${styles.modalOverlay} ${isModalOpen ? styles.show : ""}`} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <span className={styles.close} onClick={closeModal}>×</span>
            <h2 className={styles.modalTitle}>Apply for Co-Applicant Loan</h2>
            <form onSubmit={handleSubmit} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label htmlFor="fullName" className={styles.label}>Full Name <span className={styles.required}>*</span></label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  className={`${styles.input} ${styles.inputFocus}`}
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                />
                {errors.fullName && <p className={styles.error}>{errors.fullName}</p>}
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
                  >
                    <option value="+91">+91 (India)</option>
                    <option value="+1">+1 (USA)</option>
                    <option value="+44">+44 (UK)</option>
                    <option value="+1">+1 (Canada)</option>
                    <option value="+49">+49 (Germany)</option>
                    <option value="+33">+33 (France)</option>
                    <option value="+353">+353 (Ireland)</option>
                    <option value="+39">+39 (Italy)</option>
                    <option value="+61">+61 (Australia)</option>
                    <option value="+64">+64 (New Zealand)</option>
                    <option value="+971">+971 (Dubai)</option>
                    <option value="+41">+41 (Switzerland)</option>
                  </select>
                  <input
                    type="tel"
                    id="contactNumber"
                    name="contactNumber"
                    className={`${styles.input} ${styles.inputFocus}`}
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                    placeholder="9876543210"
                  />
                </div>
                {errors.contactNumber && <p className={styles.error}>{errors.contactNumber}</p>}
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.label}>Email Address <span className={styles.required}>*</span></label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className={`${styles.input} ${styles.inputFocus}`}
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="john.doe@example.com"
                />
                {errors.email && <p className={styles.error}>{errors.email}</p>}
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="countryOfStudy" className={styles.label}>Country of Study <span className={styles.required}>*</span></label>
                <select
                  id="countryOfStudy"
                  name="countryOfStudy"
                  className={`${styles.select} ${styles.selectFocus}`}
                  value={formData.countryOfStudy}
                  onChange={handleInputChange}
                >
                  <option value="">Select Country</option>
                  <option value="USA">USA</option>
                  <option value="UK">UK</option>
                  <option value="Canada">Canada</option>
                  <option value="Ireland">Ireland</option>
                  <option value="Germany">Germany</option>
                  <option value="France">France</option>
                  <option value="Australia">Australia</option>
                  <option value="New Zealand">New Zealand</option>
                  <option value="Italy">Italy</option>
                  <option value="Dubai">Dubai</option>
                  <option value="Other Country">Other Country</option>
                </select>
                {errors.countryOfStudy && <p className={styles.error}>{errors.countryOfStudy}</p>}
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="university" className={styles.label}>University Name <span className={styles.required}>*</span></label>
                <input
                  type="text"
                  id="university"
                  name="university"
                  className={`${styles.input} ${styles.inputFocus}`}
                  value={formData.university}
                  onChange={handleInputChange}
                  placeholder="Type first 3 characters"
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
                {errors.university && <p className={styles.error}>{errors.university}</p>}
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="course" className={styles.label}>Course Name <span className={styles.required}>*</span></label>
                <input
                  type="text"
                  id="course"
                  name="course"
                  className={`${styles.input} ${styles.inputFocus}`}
                  value={formData.course}
                  onChange={handleInputChange}
                  placeholder="e.g., Master of Business Administration"
                />
                {errors.course && <p className={styles.error}>{errors.course}</p>}
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
                  >
                    <option value="">Select Year</option>
                    <option value="2023">2023</option>
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                    <option value="2028">2028</option>
                  </select>
                </div>
                {errors.intake && <p className={styles.error}>{errors.intake}</p>}
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="admitStatus" className={styles.label}>Admit Status <span className={styles.required}>*</span></label>
                <select
                  id="admitStatus"
                  name="admitStatus"
                  className={`${styles.select} ${styles.selectFocus}`}
                  value={formData.admitStatus}
                  onChange={handleInputChange}
                >
                  <option value="">Select Status</option>
                  <option value="Yet to apply">Yet to apply</option>
                  <option value="Waiting for offer/admit letter">Waiting for offer/admit letter</option>
                  <option value="Offer/Admit letter received">Offer/Admit letter received</option>
                  <option value="Enrolled to the College/University">Enrolled to the College/University</option>
                </select>
                {errors.admitStatus && <p className={styles.error}>{errors.admitStatus}</p>}
              </div>
              <div className={styles.buttonGroup}>
                <button type="button" className={`${styles.cancelButton} ${styles.buttonHover}`} onClick={closeModal}>Cancel</button>
                <button type="submit" className={`${styles.submitButton} ${styles.buttonHover}`}>Submit Application</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );

  function toggleFAQ(id) {
    const answer = document.getElementById(`${id}-answer`);
    const icon = document.getElementById(`${id}-icon`);
    answer.style.display = answer.style.display === "block" ? "none" : "block";
    icon.classList.toggle(styles.rotateIcon);
  }
}
