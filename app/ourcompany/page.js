'use client';

import styles from './ourcompany.module.css';
import Link from 'next/link';
import Image from 'next/image';
import Head from 'next/head';
import { useEffect, useState } from 'react';

export default function OurCompanyPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
    <Head>
        <title>About StudySahara | Your Trusted Education Loan Partner</title>
        <meta name="description" content="StudySahara is India’s leading education loan marketplace helping students secure the best loan deals for studying abroad from top banks, NBFCs, and international lenders." />
        <meta name="keywords" content="about StudySahara, education loan consultant, study abroad finance, best loan advisor for students, education loan marketplace, loan support for overseas education, who is StudySahara, US Education loan, International student loan, free education loan assistance, education loan assitance, abroad student loan, abroad education loan" />
        <meta name="author" content="StudySahara" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* Canonical URL */}
        <link rel="canonical" href="https://www.studysahara.com/ourcompany" />

        {/* Favicon (you can keep main logo or add a specific icon) */}
        <link rel="icon" href="/favicon.ico" />

        {/* Open Graph for sharing */}
        <meta property="og:title" content="About StudySahara | Your Trusted Education Loan Partner" />
        <meta property="og:description" content="Learn how StudySahara empowers Indian students with reliable education loan support for studying abroad." />
        <meta property="og:image" content="https://www.studysahara.com/og-about.jpg" />
        <meta property="og:url" content="https://www.studysahara.com/ourcompany" />
        <meta property="og:type" content="website" />
      </Head>

    <div>
      {/* Header */}
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
        <div className={styles.headerContainer}>
          <Link href="/" className={styles.logo}>
            <Image
              src="/images/logo.png"
              alt="StudySahara Logo"
              width={40}
              height={40}
              className={styles.logoImage}
            />
            <span>StudySahara</span>
          </Link>
          <nav className={styles.desktopNav}>
            <ul>
              <li>
                <Link href="/" className={styles.navLink}>
                  <svg className={styles.homeIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1>Empowering Your Study Abroad Dreams</h1>
          <p>
            StudySahara is India’s premier education loan marketplace, connecting students with
            top government banks, private banks, NBFCs, and international lenders for the best study
            abroad loan deals — all at no cost.
          </p>
        </div>
      </section>

      {/* About Section */}
      <section className={styles.aboutSection}>
        <div className={styles.container}>
          <h2>About StudySahara</h2>
          <p>
            StudySahara is India’s premier education loan marketplace, offering a free service to connect
            students with the best financing options for studying abroad. We partner with trusted government banks,
            private banks, NBFCs, and international lenders to secure competitive loan deals tailored to your needs.
          </p>
          <ul className={styles.featureList}>
            <li>✅ Free service for students</li>
            <li>✅ Compare loans from multiple lenders</li>
            <li>✅ Flexible options with or without collateral</li>
            <li>✅ Support for USA, UK, Canada, India and more</li>
            <li>✅ Higher Approval Rates</li>
            <li>✅ Help in negotiating interest rates</li>
            <li>✅ Discounts on processing fees</li>
            <li>✅ End-to-end assistance</li>
            <li>✅ Fast loan processing and approvals (Better TAT)</li>
          </ul>
          <div className={styles.visionMissionContainer}>
            <div className={styles.visionMissionCard}>
              <h3>Our Vision</h3>
              <p>
                A world where financial barriers never limit potential.
                We see a future where every student — no matter their background — has the power to access global education without stress or confusion.
              </p>
            </div>
            <div className={styles.visionMissionCard}>
              <h3>Our Mission</h3>
              <p>
                StudySahara blends automation, AI, and expert insight to simplify education financing.
                We connect students to top Indian and international lenders in minutes, not weeks — with honest comparisons, fast support, and no hidden fees.
                Because we believe getting a loan should be easier than getting a visa.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className={styles.valuesSection}>
        <div className={styles.container}>
          <h2>Our Core Values</h2>
          <div className={styles.valuesGrid}>
            <div className={styles.valueCard}>
              <h3>Transparency</h3>
              <p>Clear, unbiased loan comparisons with no hidden fees.</p>
            </div>
            <div className={styles.valueCard}>
              <h3>Efficiency</h3>
              <p>Streamlined processes to secure the best loan deals quickly.</p>
            </div>
            <div className={styles.valueCard}>
              <h3>Empowerment</h3>
              <p>Free access to top loan options for every student.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className={styles.partnersSection}>
        <div className={styles.container}>
          <h2>Our Trusted Partners</h2>
          <p>We collaborate with a wide network of lenders to offer you the most competitive education loan options.</p>
          <div className={styles.partnersGrid}>
            <div className={styles.partnerCard}>
              <h3>Government Banks</h3>
              <p>Reliable public-sector banks with low interest rates.</p>
            </div>
            <div className={styles.partnerCard}>
              <h3>Private Banks</h3>
              <p>Flexible financing from top private institutions.</p>
            </div>
            <div className={styles.partnerCard}>
              <h3>NBFCs</h3>
              <p>Fast approvals from non-banking financial companies.</p>
            </div>
            <div className={styles.partnerCard}>
              <h3>International Lenders</h3>
              <p>Global financing for international study programs.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Partner With Us Section */}
      <section className={styles.partnerWithUsSection}>
        <div className={styles.container}>
          <h2>Partner With StudySahara</h2>
          <p>
            Collaborate with us to connect students with the best education loan options. Our free platform empowers admission consultancies and counsellors to unlock global opportunities.
          </p>
          <a href="mailto:hello@studysahara.com" className={styles.ctaButton}>Get in Touch</a>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p>© 2025 StudySahara. All rights reserved.</p>
          <p>No 51, 5th Floor, 5th Main Road, Above Alchemy Coffee Roasters, Bengaluru-560041</p>
          <p>
            <a href="mailto:hello@studysahara.com" className={styles.footerLink}>hello@studysahara.com</a>
          </p>
        </div>
      </footer>
    </div>
    </>
  );
}