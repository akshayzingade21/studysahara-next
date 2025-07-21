"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../../styles/Eligibility.module.css';
import Confetti from 'react-confetti';

const supabase = createClient(
  'https://afbybnlmgntiggetonaa.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmYnlibmxtZ250aWdnZXRvbmFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1NDg3NjIsImV4cCI6MjA2NDEyNDc2Mn0.KNeuwHnFp0H97w2jOgE9vOaOhfwNuHwSdiRlB9tphqo'
);

export default function Eligibility() {
  const [view, setView] = useState('home');
  const [formData, setFormData] = useState({
    country: '',
    university: '',
    otherCountry: '',
    admissionStatus: '',
    intakeMonth: '',
    intakeYear: '',
    course: '',
    loanAmount: '',
    coApplicant: '',
    coApplicantRelationship: '',
    fullName: '',
    mobile: '',
    email: '',
  });
  const [universities, setUniversities] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoanDropdownOpen, setIsLoanDropdownOpen] = useState(false);
  const [isLenderDropdownOpen, setIsLenderDropdownOpen] = useState(false);

  const lenders = [
    { name: 'SBI', logo: '/images/sbi.png', url: '/sbi' },
    { name: 'Credila', logo: '/images/credila.png', url: '/credila' },
    { name: 'Union Bank', logo: '/images/unionbank.png', url: '/unionbank' },
    { name: 'PNB', logo: '/images/pnb.png', url: '/PNB' },
    { name: 'ICICI Bank', logo: '/images/icicibank.png', url: '/icicibank' },
    { name: 'Avanse', logo: '/images/avanse.png', url: '/avanse' },
    { name: 'IDFC First Bank', logo: '/images/idfc.png', url: '/idfc' },
    { name: 'Axis Bank', logo: '/images/axisbank.png', url: '/axisbank' },
    { name: 'Yes Bank', logo: '/images/yesbank.png', url: '/yesbank' },
    { name: 'Auxilo', logo: '/images/auxilo.png', url: '/auxilo' },
    { name: 'Incred', logo: '/images/incred.png', url: '/incred' },
    { name: 'Tata Capital', logo: '/images/tatacapital.png', url: '/tatacapital' },
    { name: 'Poonawalla Fincorp', logo: '/images/poonawallafincorp.png', url: '/poonawallafincorp' },
    { name: 'Prodigy Finance', logo: '/images/prodigyfinance.png', url: '/prodigyfinance' },
    { name: 'Mpower Financing', logo: '/images/mpowerfinancing.png', url: '/mpowerfinancing' },
    { name: 'Earnest', logo: '/images/earnest.png', url: '/earnest' },
    { name: 'Sallie Mae', logo: '/images/salliemae.png', url: '/salliemae' },
    { name: 'Ascent', logo: '/images/ascent.png', url: '/ascent' },
  
  ];

  const years = [2022, 2023, 2024, 2025, 2026];

  useEffect(() => {
    fetch('/universities.json')
      .then((response) => {
        if (!response.ok) throw new Error('Failed to load universities');
        return response.json();
      })
      .then((data) => setUniversities(data))
      .catch((error) => console.error('[2025-07-08] University load error:', error.message));

    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLoanDropdownEnter = () => {
    setIsLoanDropdownOpen(true);
    setIsLenderDropdownOpen(false);
  };

  const handleLoanDropdownLeave = () => setIsLoanDropdownOpen(false);

  const handleLenderDropdownEnter = () => {
    setIsLenderDropdownOpen(true);
    setIsLoanDropdownOpen(false);
  };

  const handleLenderDropdownLeave = () => setIsLenderDropdownOpen(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleCountryChange = (e) => {
    const country = e.target.value;
    setFormData((prev) => ({ ...prev, country, university: '', otherCountry: '' }));
    setSuggestions([]);
  };

  const handleUniversityInput = (e) => {
    const query = e.target.value.toLowerCase();
    setFormData((prev) => ({ ...prev, university: e.target.value }));
    if (formData.country && formData.country !== 'Other' && universities[formData.country] && query.length >= 3) {
      const matches = universities[formData.country]
        .filter((uni) => uni.toLowerCase().includes(query))
        .slice(0, 10);
      setSuggestions(matches);
    } else {
      setSuggestions([]);
    }
  };

  const handleUniversitySelect = (uni) => {
    setFormData((prev) => ({ ...prev, university: uni }));
    setSuggestions([]);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.country) newErrors.country = 'Please pick a country!';
    if (formData.country === 'Other' && !formData.otherCountry)
      newErrors.otherCountry = 'Please tell us the country!';
    if (formData.country !== 'Other' && !formData.university)
      newErrors.university = 'Please select your university!';
    if (!formData.admissionStatus) newErrors.admissionStatus = 'Please share your status!';
    if (!formData.intakeMonth) newErrors.intakeMonth = 'Please pick a month!';
    if (!formData.intakeYear) newErrors.intakeYear = 'Please pick a year!';
    if (!formData.course) newErrors.course = 'Please enter your course!';
    if (!formData.loanAmount || formData.loanAmount < 100000)
      newErrors.loanAmount = 'Please enter at least 100,000 INR!';
    if (!formData.coApplicant) newErrors.coApplicant = 'Please choose an option!';
    if (formData.coApplicant === 'yes' && !formData.coApplicantRelationship)
      newErrors.coApplicantRelationship = 'Please select a relationship!';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLoanSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!validateForm()) {
      setFormError('Oops! Fix the highlighted fields.');
      return;
    }
    setIsLoading(true);
    localStorage.setItem('loanApplication', JSON.stringify(formData));
    setView('result');
    setIsLoading(false);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setIsSuccess(true);
    }, 100);
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.fullName) newErrors.fullName = 'Please enter your name!';
    if (!formData.mobile || !/^[0-9]{10}$/.test(formData.mobile))
      newErrors.mobile = 'Enter a valid 10-digit number!';
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = 'Enter a valid email!';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const fullData = {
      country: formData.country,
      university: formData.country === 'Other' ? formData.otherCountry : formData.university,
      admission_status: formData.admissionStatus,
      intake_month: formData.intakeMonth,
      intake_year: parseInt(formData.intakeYear),
      course: formData.course,
      loan_amount: parseInt(formData.loanAmount),
      co_applicant: formData.coApplicant,
      co_applicant_relationship: formData.coApplicantRelationship || null,
      full_name: formData.fullName,
      mobile: formData.mobile,
      email: formData.email,
    };
    const { data, error } = await supabase.from('loan_applications').insert([fullData]);
    setIsLoading(false);
    if (error) {
      setFormError(`Error: ${error.message}. Try again or contact us!`);
      return;
    }
    setView('success');
    localStorage.setItem('loanApplication', JSON.stringify(fullData));
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setIsSuccess(true);
    }, 100);
  };

  const renderResult = () => {
    const result = formData.coApplicant === 'yes' ? {
      loanType: 'No Collateral Loan',
      interestRate: 'Starting at 8.45%',
      repayment: 'Moratorium available',
    } : {
      loanType: 'No Co-applicant, No Collateral',
      interestRate: 'Starting at 8.45%',
      repayment: 'Moratorium available',
    };
    return (
      <motion.div
        className={styles.resultContent}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7 }}
      >
        <i className="fas fa-check-circle text-5xl text-teal-600 mb-6"></i>
        <h2 className="text-3xl font-semibold text-gray-800 mb-4">You’re Eligible! 🎉</h2>
        <div className={styles.resultCard}>
          <p className="text-gray-700 text-lg mb-3"><strong>Loan Type:</strong> {result.loanType}</p>
          <p className="text-gray-700 text-lg mb-3"><strong>Amount:</strong> INR {formData.loanAmount.toLocaleString()}</p>
          <p className="text-gray-700 text-lg mb-3"><strong>Interest Rate:</strong> {result.interestRate}</p>
          <p className="text-gray-700 text-lg"><strong>Repayment:</strong> {result.repayment}</p>
        </div>
      </motion.div>
    );
  };

  return (
    <>
      {isSuccess && <Confetti recycle={false} numberOfPieces={200} colors={['#14b8a6', '#f97316', '#3b82f6']} />}
      {isLoading && (
        <div className={styles.loadingOverlay}>
          <div className="animate-spin h-12 w-12 border-4 border-teal-600 border-t-transparent rounded-full"></div>
        </div>
      )}
      <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
        <div className={styles.container}>
          <Link href="/" className={styles.logo}>
              <Image
                src="/images/logo.png"
                alt="StudySahara Logo"
                width={40}
                height={48}
                className={styles.logoImage}
              />
              <h1 className={styles.logoText}>StudySahara</h1>
            </Link>
          <div className={`${styles.hamburger} ${isMenuOpen ? styles.open : ''}`} onClick={toggleMenu}>
            <span></span>
            <span></span>
            <span></span>
          </div>
          <ul className={`${styles['nav-menu']} ${isMenuOpen ? styles.active : ''}`}>
            <li className={styles.dropdown} onMouseEnter={handleLoanDropdownEnter} onMouseLeave={handleLoanDropdownLeave}>
              <a href="#" className={`${styles['dropdown-toggle']} ${isLoanDropdownOpen ? styles.active : ''}`}>
                Loan  Options
              </a>
              <ul className={`${styles['dropdown-menu']} ${isLoanDropdownOpen ? styles.show : ''}`}>
                <li><Link href="/no-co-applicant-and-no-collateral">No Co-Applicant & No Collateral</Link></li>
                <li><Link href="/co-applicant-and-no-collateral">Co-Applicant & No Collateral</Link></li>
                <li><Link href="/co-applicant-and-collateral">Co-Applicant and Collateral</Link></li>
                <li><Link href="/us-co-applicant">US Co-Applicant</Link></li>
              </ul>
            </li>
            <li><Link href="/eligibility" className={styles.active}>Loan Eligibility</Link></li>
            <li className={styles.dropdown} onMouseEnter={handleLenderDropdownEnter} onMouseLeave={handleLenderDropdownLeave}>
              <a href="#" className={`${styles['dropdown-toggle']} ${isLenderDropdownOpen ? styles.active : ''}`}>
                Partnered Lenders
              </a>
              <ul className={`${styles['dropdown-menu']} ${styles['partners-menu']} ${isLenderDropdownOpen ? styles.show : ''}`}>
                {lenders.map((lender) => (
                  <li key={lender.name}>
                    <Link href={lender.url}>{lender.name}</Link>
                  </li>
                ))}
              </ul>
            </li>
            <li><Link href="/ourcompany">Our Company</Link></li>
          </ul>
        </div>
      </header>

      <main className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-br from-teal-50 to-white">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div
              key="home"
              className={`${styles.formContainer} p-8 rounded-xl`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
            >
              <div className={styles.formHeader}>
                <h1 className="text-2xl font-semibold text-gray-800">Start Your Study Abroad Journey!</h1>
                <p className="text-gray-600 mt-3">Check loan eligibility in a few simple steps.</p>
              </div>
              <button
                onClick={() => setView('form')}
                className={styles.primaryButton}
              >
                <i className="fas fa-rocket mr-2"></i> Get Started
              </button>
            </motion.div>
          )}

          {view === 'form' && (
            <motion.div
              key="form"
              className={`${styles.formContainer} p-8 rounded-xl relative`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
            >
              <button
                onClick={() => {
                  setView('home');
                  setFormData((prev) => ({
                    ...prev,
                    country: '',
                    university: '',
                    otherCountry: '',
                    admissionStatus: '',
                    intakeMonth: '',
                    intakeYear: '',
                    course: '',
                    loanAmount: '',
                    coApplicant: '',
                    coApplicantRelationship: '',
                  }));
                  setSuggestions([]);
                  setErrors({});
                }}
                className={styles.homeButton}
              >
                <i className="fas fa-home"></i>
              </button>
              <div className={styles.formHeader}>
                <h1 className="text-2xl font-semibold text-gray-800">Loan Eligibility Check</h1>
                <p className="text-gray-600 mt-3">Provide your study details below.</p>
              </div>
              {formError && (
                <motion.div
                  className="text-red-600 text-center mb-6 bg-red-50 p-3 rounded-lg"
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {formError}
                </motion.div>
              )}
              <form onSubmit={handleLoanSubmit} className="space-y-6">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
                  <label className="block text-base font-medium text-gray-800 mb-2">Destination Country</label>
                  <div className="relative">
                    <i className="fas fa-globe absolute left-4 top-1/2 transform -translate-y-1/2 text-teal-600"></i>
                    <select
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleCountryChange}
                      required
                      className={styles.input}
                    >
                      <option value="">Select a country</option>
                      <option value="USA">United States</option>
                      <option value="UK">United Kingdom</option>
                      <option value="Canada">Canada</option>
                      <option value="Germany">Germany</option>
                      <option value="Ireland">Ireland</option>
                      <option value="Australia">Australia</option>
                      <option value="France">France</option>
                      <option value="New Zealand">New Zealand</option>
                      <option value="Dubai">United Arab Emirates</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  {errors.country && <p className={styles.errorMessage}>{errors.country}</p>}
                </motion.div>

                {formData.country && formData.country !== 'Other' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <label className="block text-base font-medium text-gray-800 mb-2">University</label>
                    <div className="relative">
                      <i className="fas fa-university absolute left-4 top-1/2 transform -translate-y-1/2 text-teal-600"></i>
                      <input
                        type="text"
                        id="university"
                        name="university"
                        value={formData.university}
                        onChange={handleUniversityInput}
                        placeholder="Type 3+ characters"
                        required
                        className={styles.input}
                      />
                    </div>
                    {errors.university && <p className={styles.errorMessage}>{errors.university}</p>}
                    {suggestions.length > 0 && (
                      <ul className={styles.suggestions}>
                        {suggestions.map((uni) => (
                          <li
                            key={uni}
                            onClick={() => handleUniversitySelect(uni)}
                            className={styles.suggestionItem}
                          >
                            {uni}
                          </li>
                        ))}
                      </ul>
                    )}
                  </motion.div>
                )}

                {formData.country === 'Other' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <label className="block text-base font-medium text-gray-800 mb-2">Other Country</label>
                    <div className="relative">
                      <i className="fas fa-globe absolute left-4 top-1/2 transform -translate-y-1/2 text-teal-600"></i>
                      <input
                        type="text"
                        id="otherCountry"
                        name="otherCountry"
                        value={formData.otherCountry}
                        onChange={handleInputChange}
                        placeholder="Enter country"
                        required
                        className={styles.input}
                      />
                    </div>
                    {errors.otherCountry && <p className={styles.errorMessage}>{errors.otherCountry}</p>}
                  </motion.div>
                )}

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
                  <label className="block text-base font-medium text-gray-600 mb-2">Admission Status</label>
                  <div className="relative">
                    <i className="fas fa-clipboard-check absolute left-4 top-1/2 transform -translate-y-1/2 text-teal-600"></i>
                    <select
                      id="admissionStatus"
                      name="admissionStatus"
                      value={formData.admissionStatus}
                      onChange={handleInputChange}
                      required
                      className={styles.input}
                    >
                      <option value="">Select status</option>
                      <option value="applied">Applied</option>
                      <option value="waiting">Waiting for letter</option>
                      <option value="received">Got letter!</option>
                      <option value="started">Started classes</option>
                    </select>
                  </div>
                  {errors.admissionStatus && <p className={styles.errorMessage}>{errors.admissionStatus}</p>}
                </motion.div>

                <motion.div
                  className="grid grid-cols-2 gap-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <div>
                    <label className="block text-base font-medium text-gray-600 mb-2">Intake Month</label>
                    <div className="relative">
                      <i className="fas fa-calendar-alt absolute left-4 top-1/2 transform -translate-y-1/2 text-teal-600"></i>
                      <select
                        id="intakeMonth"
                        name="intakeMonth"
                        value={formData.intakeMonth}
                        onChange={handleInputChange}
                        required
                        className={styles.input}
                      >
                        <option value="">Select month</option>
                        {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month) => (
                          <option key={month} value={month}>{month}</option>
                        ))}
                      </select>
                    </div>
                    {errors.intakeMonth && <p className={styles.errorMessage}>{errors.intakeMonth}</p>}
                  </div>
                  <div>
                    <label className="block text-base font-medium text-gray-600 mb-2">Intake Year</label>
                    <div className="relative">
                      <i className="fas fa-calendar-alt absolute left-4 top-1/2 transform -translate-y-1/2 text-teal-600"></i>
                      <select
                        id="intakeYear"
                        name="intakeYear"
                        value={formData.intakeYear}
                        onChange={handleInputChange}
                        required
                        className={styles.input}
                      >
                        <option value="">Select year</option>
                        {years.map((year) => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                    {errors.intakeYear && <p className={styles.errorMessage}>{errors.intakeYear}</p>}
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
                  <label className="block text-base font-medium text-gray-600 mb-2">Course of Study</label>
                  <div className="relative">
                    <i className="fas fa-book-open absolute left-4 top-1/2 transform -translate-y-1/2 text-teal-600"></i>
                    <input
                      type="text"
                      id="course"
                      name="course"
                      value={formData.course}
                      onChange={handleInputChange}
                      placeholder="e.g., Computer Science"
                      required
                      className={styles.input}
                    />
                  </div>
                  {errors.course && <p className={styles.errorMessage}>{errors.course}</p>}
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }}>
                  <label className="block text-base font-medium text-gray-600 mb-2">Loan Amount (INR)</label>
                  <div className="relative">
                    <i className="fas fa-rupee-sign absolute left-4 top-1/2 transform -translate-y-1/2 text-teal-600"></i>
                    <input
                      type="number"
                      id="loanAmount"
                      name="loanAmount"
                      value={formData.loanAmount}
                      onChange={handleInputChange}
                      min="100000"
                      placeholder="e.g., 5000000"
                      required
                      className={styles.input}
                    />
                  </div>
                  {errors.loanAmount && <p className={styles.errorMessage}>{errors.loanAmount}</p>}
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.7 }}>
                  <label className="block text-base font-medium text-gray-600 mb-2">Co-applicant in India?</label>
                  <div className="relative">
                    <i className="fas fa-users absolute left-4 top-1/2 transform -translate-y-1/2 text-teal-600"></i>
                    <select
                      id="coApplicant"
                      name="coApplicant"
                      value={formData.coApplicant}
                      onChange={handleInputChange}
                      required
                      className={styles.input}
                    >
                      <option value="">Select option</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                  {errors.coApplicant && <p className={styles.errorMessage}>{errors.coApplicant}</p>}
                </motion.div>

                {formData.coApplicant === 'yes' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                  >
                    <label className="block text-base font-medium text-gray-600 mb-2">Co-applicant Relationship</label>
                    <div className="relative">
                      <i className="fas fa-user-friends absolute left-4 top-1/2 transform -translate-y-1/2 text-teal-600"></i>
                      <select
                        id="coApplicantRelationship"
                        name="coApplicantRelationship"
                        value={formData.coApplicantRelationship}
                        onChange={handleInputChange}
                        required
                        className={styles.input}
                      >
                        <option value="">Select relationship</option>
                        <option value="spouse">Spouse</option>
                        <option value="inLaws">In-laws</option>
                        <option value="parents">Parents</option>
                        <option value="siblings">Siblings</option>
                        <option value="grandparents">Grandparents</option>
                        <option value="paternalRelatives">Paternal Relatives</option>
                        <option value="maternalRelatives">Maternal Relatives</option>
                        <option value="cousins">Cousins</option>
                      </select>
                    </div>
                    {errors.coApplicantRelationship && <p className={styles.errorMessage}>{errors.coApplicantRelationship}</p>}
                  </motion.div>
                )}

                <motion.button
                  type="submit"
                  className={styles.primaryButton}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <i className="fas fa-check-circle mr-2"></i> Check Eligibility
                </motion.button>
              </form>
            </motion.div>
          )}

          {view === 'result' && (
            <motion.div
              key="result"
              className={`${styles.formContainer} p-8 rounded-xl flex flex-col items-center justify-center relative`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.7 }}
            >
              <button
                onClick={() => {
                  setView('home');
                  setFormData((prev) => ({
                    ...prev,
                    country: '',
                    university: '',
                    otherCountry: '',
                    admissionStatus: '',
                    intakeMonth: '',
                    intakeYear: '',
                    course: '',
                    loanAmount: '',
                    coApplicant: '',
                    coApplicantRelationship: '',
                  }));
                  setSuggestions([]);
                  setErrors({});
                  setIsSuccess(false);
                }}
                className={styles.homeButton}
              >
                <i className="fas fa-home"></i>
              </button>
              {renderResult()}
              <motion.button
                onClick={() => setView('apply')}
                className={styles.applyButton}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <i className="fas fa-arrow-right mr-2"></i> Apply Now
              </motion.button>
            </motion.div>
          )}

          {view === 'apply' && (
            <motion.div
              key="apply"
              className={`${styles.formContainer} p-8 rounded-xl relative`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
            >
              <button
                onClick={() => {
                  setView('home');
                  setFormData((prev) => ({
                    ...prev,
                    country: '',
                    university: '',
                    otherCountry: '',
                    admissionStatus: '',
                    intakeMonth: '',
                    intakeYear: '',
                    course: '',
                    loanAmount: '',
                    coApplicant: '',
                    coApplicantRelationship: '',
                    fullName: '',
                    mobile: '',
                    email: '',
                  }));
                  setSuggestions([]);
                  setErrors({});
                }}
                className={styles.homeButton}
              >
                <i className="fas fa-home"></i>
              </button>
              <div className={styles.formHeader}>
                <h2 className="text-2xl font-semibold text-gray-800">Complete Your Application</h2>
                <p className="text-gray-600 mt-3">A few final details are needed.</p>
              </div>
              <form onSubmit={handleApplySubmit} className="space-y-6">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
                  <label className="block text-base font-medium text-gray-600 mb-2">Full Name</label>
                  <div className="relative">
                    <i className="fas fa-user absolute left-4 top-1/2 transform -translate-y-1/2 text-teal-600"></i>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      className={styles.input}
                      placeholder="e.g., Priya Sharma"
                    />
                  </div>
                  {errors.fullName && <p className={styles.errorMessage}>{errors.fullName}</p>}
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                  <label className="block text-base font-medium text-gray-600 mb-2">Mobile Number</label>
                  <div className="relative">
                    <i className="fas fa-phone-alt absolute left-4 top-1/2 transform -translate-y-1/2 text-teal-600"></i>
                    <input
                      type="tel"
                      id="mobile"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      pattern="[0-9]{10}"
                      placeholder="e.g., 9876543210"
                      required
                      className={styles.input}
                    />
                  </div>
                  {errors.mobile && <p className={styles.errorMessage}>{errors.mobile}</p>}
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
                  <label className="block text-base font-medium text-gray-600 mb-2">Email Address</label>
                  <div className="relative">
                    <i className="fas fa-envelope absolute left-4 top-1/2 transform -translate-y-1/2 text-teal-600"></i>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className={styles.input}
                      placeholder="e.g., priya.sharma@example.com"
                    />
                  </div>
                  {errors.email && <p className={styles.errorMessage}>{errors.email}</p>}
                </motion.div>
                <motion.button
                  type="submit"
                  className={styles.applyButton}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <i className="fas fa-paper-plane mr-2"></i> Submit Application
                </motion.button>
              </form>
            </motion.div>
          )}

          {view === 'success' && (
            <motion.div
              key="success"
              className={`${styles.formContainer} p-8 rounded-xl text-center`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
            >
              <button
                onClick={() => (window.location.href = '/')}
                className={styles.homeButton}
              >
                <i className="fas fa-home"></i>
              </button>
              <h2 className="text-2xl font-semibold text-teal-600 mb-6">Application Submitted! 🚀</h2>
              <p className="text-gray-600 mb-4">We’ll reach out within an hour.</p>
              <p className="text-gray-500 mb-6 text-sm">Hours: 10 AM - 7 PM IST</p>
              <motion.button
                onClick={() => (window.location.href = '/')}
                className={styles.primaryButton}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <i className="fas fa-home mr-2"></i> Return to Home
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className={styles.footer}>
        <div className={styles.container}>
          <p className="text-gray-600">© 2025 StudySahara. All rights reserved.</p>
          <p className="text-gray-500 text-sm mt-2">Support: support@studysahara.com | +91-123-456-7890</p>
        </div>
      </footer>
    </>
  );
}