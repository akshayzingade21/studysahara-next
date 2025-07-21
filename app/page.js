"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from '../styles/Home.module.css';
import Head from 'next/head';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  "https://afbybnlmgntiggetonaa.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmYnlibmxtZ250aWdnZXRvbmFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1NDg3NjIsImV4cCI6MjA2NDEyNDc2Mn0.KNeuwHnFp0H97w2jOgE9vOaOhfwNuHwSdiRlB9tphqo"
);

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoanDropdownOpen, setIsLoanDropdownOpen] = useState(false);
  const [isLenderDropdownOpen, setIsLenderDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);

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

  // Handle scroll for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    setIsLoanDropdownOpen(false); // Close dropdowns when menu toggles
    setIsLenderDropdownOpen(false);
  };

  // Toggle dropdowns for mobile
  const toggleLoanDropdown = (e) => {
    e.preventDefault();
    setIsLoanDropdownOpen(!isLoanDropdownOpen);
    setIsLenderDropdownOpen(false); // Close other dropdown
  };

  const toggleLenderDropdown = (e) => {
    e.preventDefault();
    setIsLenderDropdownOpen(!isLenderDropdownOpen);
    setIsLoanDropdownOpen(false); // Close other dropdown
  };

  // Handle mouse events for desktop
  const handleLoanDropdownEnter = () => {
    if (window.innerWidth > 768) {
      setIsLoanDropdownOpen(true);
      setIsLenderDropdownOpen(false);
    }
  };

  const handleLoanDropdownLeave = () => {
    if (window.innerWidth > 768) {
      setIsLoanDropdownOpen(false);
    }
  };

  const handleLenderDropdownEnter = () => {
    if (window.innerWidth > 768) {
      setIsLenderDropdownOpen(true);
      setIsLoanDropdownOpen(false);
    }
  };

  const handleLenderDropdownLeave = () => {
    if (window.innerWidth > 768) {
      setIsLenderDropdownOpen(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('referrals')
        .insert([{ name: formData.name, email: formData.email, phone: formData.phone }]);
      if (error) throw error;
      setIsSuccess(true);
      setError(null);
      setFormData({ name: '', email: '', phone: '' });
    } catch (err) {
      setError('Failed to submit referral. Please try again.');
      setIsSuccess(false);
    }
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setIsSuccess(false);
    setError(null);
  };

  // Debug handler for lender clicks
  const handleLenderClick = (url) => {
    console.log(`Navigating to: ${url} (Timestamp: ${new Date().toISOString()})`);
  };

  // Debug handler for touch events
  const handleLenderTouch = (url) => {
    console.log(`Touch event on: ${url} (Timestamp: ${new Date().toISOString()})`);
  };

  return (
    <>
    <Head>
        <title>StudySahara U+002d Education Loans for Studying Abroad</title>
        <link
          rel="preload"
          as="image"
          href="/_next/image?url=%2Fimages%2Fnewposter.webp&w=3840&q=75"
          imagesrcset="
          /_next/image?url=%2Fimages%2Fnewposter.webp&w=640&q=75 640w,
          /_next/image?url=%2Fimages%2Fnewposter.webp&w=750&q=75 750w,
          /_next/image?url=%2Fimages%2Fnewposter.webp&w=828&q=75 828w,
          /_next/image?url=%2Fimages%2Fnewposter.webp&w=1080&q=75 1080w,
          /_next/image?url=%2Fimages%2Fnewposter.webp&w=1200&q=75 1200w,
          /_next/image?url=%2Fimages%2Fnewposter.webp&w=1920&q=75 1920w,
          /_next/image?url=%2Fimages%2Fnewposter.webp&w=2048&q=75 2048w,
          /_next/image?url=%2Fimages%2Fnewposter.webp&w=3840&q=75 3840w
          "
          imagesizes="100vw"
          />
        <meta name="description" content="Get the best education loan options for studying abroad. Compare lenders, check eligibility, and apply with no charges. Trusted by 2000+ Indian students." />
        <meta name="keywords" content="education loan, study abroad loan, International student loan, no collateral loan, no co-applicant loan, no cosigner loan, overseas education loan, SBI education loan, ICICI education loan, NBFC loan for study, HDFC Credila education loan, Avanse education loan, gyandhan, nomad credit, prodigy finance, tata capital education loan, student loan India, loan for USA studies, loan for UK studies, US International student loan, no cosigner and no collateral loan, no cosigner loan," />
        <meta name="author" content="StudySahara" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* Canonical URL */}
        <link rel="canonical" href="https://www.studysahara.com/" />

        {/* Favicon (Main logo for homepage) */}
        <link rel="icon" type="image/png" href="/favicon.ico" />

        {/* Open Graph for social sharing */}
        <meta property="og:title" content="StudySahara U+002d Education Loans for Studying Abroad" />
        <meta property="og:description" content="Compare education loan options with or without collateral and co-applicant. Get expert help for faster approvals from trusted lenders." />
        <meta property="og:image" content="https://www.studysahara.com/og-banner.jpg" />
        <meta property="og:url" content="https://www.studysahara.com/" />
        <meta property="og:type" content="website" />
      </Head>
      <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
        <div className={styles.container}>
          <div className={styles.logo}>
            <Image src="/images/logo.png" alt="StudySahara Logo" width={40} height={40} />
            <div className={styles['logo-text']}>
              <h1>StudySahara</h1>
              <p className={styles.tagline}>Empowering Education</p>
            </div>
          </div>
          <div className={`${styles.hamburger} ${isMenuOpen ? styles.open : ''}`} onClick={toggleMenu}>
            <span></span>
            <span></span>
            <span></span>
          </div>
          <ul className={`${styles['nav-menu']} ${isMenuOpen ? styles.active : ''}`}>
            <li
              className={styles.dropdown}
              onMouseEnter={handleLoanDropdownEnter}
              onMouseLeave={handleLoanDropdownLeave}
            >
              <a
                href="#"
                className={`${styles['dropdown-toggle']} ${isLoanDropdownOpen ? styles.active : ''}`}
                onClick={toggleLoanDropdown}
              >
                Loan Options
              </a>
              <ul className={`${styles['dropdown-menu']} ${isLoanDropdownOpen ? styles.show : ''}`}>
                <li><Link href="/no-co-applicant-and-no-collateral">No Co-Applicant & No Collateral</Link></li>
                <li><Link href="/co-applicant-and-no-collateral">Co-Applicant & No Collateral</Link></li>
                <li><Link href="/co-applicant-and-collateral">Co-Applicant and Collateral</Link></li>
                <li><Link href="/us-co-applicant">US Co-Applicant</Link></li>
              </ul>
            </li>
            <li><Link href="/eligibility">Loan Eligibility</Link></li>
            <li
              className={styles.dropdown}
              onMouseEnter={handleLenderDropdownEnter}
              onMouseLeave={handleLenderDropdownLeave}
            >
              <a
                href="#"
                className={`${styles['dropdown-toggle']} ${isLenderDropdownOpen ? styles.active : ''}`}
                onClick={toggleLenderDropdown}
              >
                Partnered Lenders
              </a>
              <ul className={`${styles['dropdown-menu']} ${styles['partners-menu']} ${isLenderDropdownOpen ? styles.show : ''}`}>
                {lenders.map((lender) => (
                  <li key={lender.name}>
                    <Link href={lender.url} legacyBehavior>
                      <a
                        onClick={() => handleLenderClick(lender.url)}
                        onTouchStart={() => handleLenderTouch(lender.url)}
                        data-testid={`lender-link-${lender.name.toLowerCase().replace(/\s/g, '-')}`}
                      >
                        {lender.name}
                      </a>
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
            <li><Link href="/ourcompany">Our Company</Link></li>
            <li><a href="#" onClick={() => setIsModalOpen(true)}>Refer & Earn</a></li>
          </ul>
        </div>
      </header>

      <main>
        <section className={styles.banner}>
          <div className={styles.container}>
            <div className={styles['banner-image-wrapper']}>
              <Image
                src="/images/newposter.webp"
                alt="Students"
                fill
                style={{ objectFit: 'contain' }}
                priority
              />
            </div>
            <div className={styles['banner-text']}>
              <h2>Empower Your Education with StudySahara</h2>
              <p>Discover affordable education loans to fuel your dreams.</p>
            </div>
          </div>
        </section>

        <section className={`${styles['loan-options']} ${styles['section-padding']}`}>
          <div className={styles.container}>
            <h2 className={styles['section-heading']}>Our Loan Options</h2>
            <div className={styles['loan-grid']}>
              <div className={styles['loan-card']}>
                <i className="fas fa-graduation-cap"></i>
                <h3>No Co-Applicant & No Collateral</h3>
                <p>Loans without the need for a co-applicant/collateral, ideal for independent students.</p>
                <Link href="/no-co-applicant-and-no-collateral" className={styles['btn-primary']}>Learn More</Link>
              </div>
              <div className={styles['loan-card']}>
                <i className="fas fa-user-graduate"></i>
                <h3>Co-Applicant & No Collateral</h3>
                <p>Loans with a co-applicant but no collateral, offering flexibility and security.</p>
                <Link href="/co-applicant-and-no-collateral" className={styles['btn-primary']}>Learn More</Link>
              </div>
              <div className={styles['loan-card']}>
                <i className="fas fa-briefcase"></i>
                <h3>Co-Applicant and Collateral</h3>
                <p>Loans backed by both a co-applicant and collateral for higher loan amounts.</p>
                <Link href="/co-applicant-and-collateral" className={styles['btn-primary']}>Learn More</Link>
              </div>
              <div className={styles['loan-card']}>
                <i className="fas fa-money-check-alt"></i>
                <h3>US Co-Applicant for study in US</h3>
                <p>Loans facilitated with a US-based co-applicant for international students.</p>
                <Link href="/us-co-applicant" className={styles['btn-primary']}>Learn More</Link>
              </div>
            </div>
          </div>
        </section>

        <section className={`${styles['featured-lenders']} ${styles['section-padding']}`}>
          <div className={styles.container}>
            <h2 className={styles['section-heading']}>Our Partnered Lenders</h2>
            <div className={styles['lender-carousel']}>
              <div className={styles['lender-track']}>
                {[...lenders, ...lenders, ...lenders].map((lender, index) => (
                  <Link
                    href={lender.url}
                    key={`${lender.name}-${index}`}
                    className={styles['lender-item']}
                    legacyBehavior
                  >
                    <a
                      onClick={() => handleLenderClick(lender.url)}
                      onTouchStart={() => handleLenderTouch(lender.url)}
                    >
                      <Image src={lender.logo} alt={lender.name} width={180} height={70} />
                    </a>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className={`${styles['how-it-works']} ${styles['section-padding']}`}>
          <div className={styles.container}>
            <h2 className={styles['section-heading']}>How It Works</h2>
            <div className={styles['steps-grid']}>
              <div className={styles['step-item']}>
                <div className={styles['step-icon']}>1</div>
                <h3>Personalized Consultation</h3>
                <p>Tell us about your academic goals, desired country, and financial needs. Our experts provide tailored advice on the best loan options for you.</p>
              </div>
              <div className={styles['step-item']}>
                <div className={styles['step-icon']}>2</div>
                <h3>Compare & Choose</h3>
                <p>Access a curated list of loan products from various lenders, comparing interest rates, repayment terms, and eligibility criteria with ease.</p>
              </div>
              <div className={styles['step-item']}>
                <div className={styles['step-icon']}>3</div>
                <h3>Application Assistance</h3>
                <p>Receive end-to-end support with documentation, application forms, and lender communication to ensure a smooth process.</p>
              </div>
              <div className={styles['step-item']}>
                <div className={styles['step-icon']}>4</div>
                <h3>Loan Sanction & Disbursement</h3>
                <p>We help you navigate the final stages, from understanding sanction letters to ensuring timely disbursement of funds.</p>
              </div>
            </div>
          </div>
        </section>

        <section className={`${styles['about-us-section']} ${styles['section-padding']}`}>
          <div className={styles.container}>
            <Image src="/images/logo.png" alt="StudySahara Logo" width={80} height={80} className={styles['logo-large']} />
            <h2>About StudySahara</h2>
            <p>
              StudySahara is dedicated to making education accessible by connecting students with the best loan options.
              Our mission is to empower the next generation through affordable financing solutions.
            </p>
            <Link href="/ourcompany" className={styles['btn-primary']}>Learn More</Link>
          </div>
        </section>

        <section className={`${styles['why-choose-us']} ${styles['section-padding']}`}>
          <div className={styles.container}>
            <h2 className={styles['section-heading']}>Why Choose StudySahara?</h2>
            <div className={styles['features-grid']}>
              <div className={styles['feature-item']}>
                <svg className={styles['feature-icon']} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
                <div className={styles['feature-content']}>
                  <h3>Unbiased Advice</h3>
                  <p>Our recommendations are always in your best interest, not tied to any single lender.</p>
                </div>
              </div>
              <div className={styles['feature-item']}>
                <svg className={styles['feature-icon']} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4-8h-3v-3h-2v3H8v2h3v3h2v-3h3v-2z"/>
                </svg>
                <div className={styles['feature-content']}>
                  <h3>Extensive Network</h3>
                  <p>Access to a wide range of public and private lenders, including international options.</p>
                </div>
              </div>
              <div className={styles['feature-item']}>
                <svg className={styles['feature-icon']} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                </svg>
                <div className={styles['feature-content']}>
                  <h3>Transparent Process</h3>
                  <p>No hidden fees or surprises. We ensure you understand every aspect of your loan.</p>
                </div>
              </div>
              <div className={styles['feature-item']}>
                <svg className={styles['feature-icon']} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                </svg>
                <div className={styles['feature-content']}>
                  <h3>End-to-End Support</h3>
                  <p>From application to disbursement, our team is with you at every step.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={`${styles['cta-section']} ${styles['section-padding']}`}>
          <div className={styles.container}>
            <h2>Ready to Start Your Journey?</h2>
            <p>Join thousands of students who have achieved their dreams with StudySahara.</p>
            <Link href="/eligibility" className={styles['btn-secondary']}>Apply for a Loan</Link>
          </div>
        </section>
      </main>

      <div className={`${styles.modal} ${isModalOpen ? styles.show : ''}`}>
        <div className={styles['modal-content']}>
          <span className={styles['close-btn']} onClick={closeModal}>×</span>
          <h2>Refer & Earn <span className={styles['reward-highlight']}>₹1000</span></h2>
          <p>Invite your friends and earn rewards when they apply for a loan!</p>
          <div className={styles['refer-benefits']}>
            <h3>Why Refer?</h3>
            <ul>
              <li><i className="fas fa-check-circle"></i><span>Earn ₹1000 for each successful referral.</span></li>
              <li><i className="fas fa-gift"></i><span>Exclusive rewards for top referrers.</span></li>
              <li><i className="fas fa-users"></i><span>Help friends achieve their dreams.</span></li>
            </ul>
          </div>
          {!isSuccess ? (
            <form className={styles['referral-form']} onSubmit={handleSubmit}>
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
              <input
                type="tel"
                name="phone"
                placeholder="Your Phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
              <button type="submit">Submit Referral</button>
            </form>
          ) : (
            <div className={`${styles['success-message']} ${styles.show}`}>
              <i className="fas fa-check-circle"></i>
              <p>Thank you! Your referral has been submitted successfully.</p>
              <button onClick={closeModal}>Close</button>
            </div>
          )}
          {error && (
            <div className={`${styles['error-message']} ${styles.show}`}>
              {error}
            </div>
          )}
        </div>
      </div>

      <footer className={styles.footer}>
        <div className={styles.container}>
          <p>© 2025 StudySahara. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}