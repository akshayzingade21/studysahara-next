"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "./landingpage.module.css";
import { createClient } from "@supabase/supabase-js";
import {
  ShieldCheck,
  HandCoins,
  UsersRound,
  Globe2,
  CheckCircle2,
  Loader2,
  Info,
} from "lucide-react";

/**
 * StudySahara – Lead Gen Landing Page (CSS Modules)
 * - Mobile-optimized
 * - Form is at the top
 * - University autocomplete from /public/universities.json (array OR { country: [..] })
 * - No external redirects (all CTAs scroll to the form)
 * - Supabase INSERT on submit (replace URL+KEY below)
 * - Loan Types: multi-select chips (stores loan_types array + primary loan_type)
 */

// ✅ Inline Supabase anon client (safe with proper RLS)
const supabase = createClient(
  "https://afbybnlmgntiggetonaa.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmYnlibmxtZ250aWdnZXRvbmFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1NDg3NjIsImV4cCI6MjA2NDEyNDc2Mn0.KNeuwHnFp0H97w2jOgE9vOaOhfwNuHwSdiRlB9tphqo"
);


export default function LandingPage() {
  const formRef = useRef(null);

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [lead, setLead] = useState({
    name: "",
    email: "",
    phone: "",
    country: "USA",
    course: "MS",
    intake_month: "January",
    intake_year: String(new Date().getFullYear()),
    university: "",
    // ⬇️ multi-select array
    loan_types: ["no_co_no_collateral"],
    co_applicant: "Yes", // kept in state for compatibility (not shown in UI)
    notes: "",
    consent: false,
  });

  // UTM + UA
  const [meta, setMeta] = useState({
    utm_source: "",
    utm_campaign: "",
    utm_medium: "",
    user_agent: "",
  });

  useEffect(() => {
    try {
      const p = new URLSearchParams(window.location.search);
      setMeta((m) => ({
        ...m,
        utm_source: p.get("utm_source") || "",
        utm_campaign: p.get("utm_campaign") || "",
        utm_medium: p.get("utm_medium") || "",
        user_agent: navigator.userAgent || "",
      }));
    } catch {}
  }, []);

  // ===== University autocomplete (country-aware) =====
  // Supports either:
  // 1) { "USA": ["Univ A","Univ B"], "UK": [...] }  OR
  // 2) ["Univ A", "Univ B", ...]
  const [uniMap, setUniMap] = useState(null);       // object keyed by country
  const [uniList, setUniList] = useState([]);       // flat list fallback
  const [uniFiltered, setUniFiltered] = useState([]); // suggestions
  const [uniOpen, setUniOpen] = useState(false);

  useEffect(() => {
    fetch("/universities.json", { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load universities");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setUniList(data);
          setUniMap(null);
        } else if (data && typeof data === "object") {
          setUniMap(data);
          setUniList([]);
        }
      })
      .catch((err) =>
        console.error("[universities] load error:", err?.message || err)
      );
  }, []);

  // filter when typing 3+ chars (country-aware)
  useEffect(() => {
    const q = (lead.university || "").trim().toLowerCase();
    if (q.length < 3) {
      setUniFiltered([]);
      setUniOpen(false);
      return;
    }

    let source = [];
    if (uniMap && lead.country && lead.country !== "Other") {
      // when JSON is a map keyed by country
      const listForCountry = uniMap[lead.country];
      if (Array.isArray(listForCountry)) source = listForCountry;
    } else if (Array.isArray(uniList) && uniList.length) {
      // fallback: flat array list
      source = uniList.map((u) => (typeof u === "string" ? u : u?.name)).filter(Boolean);
    }

    if (!source.length) {
      setUniFiltered([]);
      setUniOpen(false);
      return;
    }

    const out = source
      .filter((name) => String(name).toLowerCase().includes(q))
      .slice(0, 12);

    setUniFiltered(out);
    setUniOpen(out.length > 0);
  }, [lead.university, lead.country, uniMap, uniList]);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const validate = () => {
    if (!lead.name.trim()) return "Please enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email))
      return "Please enter a valid email.";
    if (!/^\+?\d{10,15}$/.test(lead.phone.replace(/\s|-/g, "")))
      return "Please enter a valid phone number (10–15 digits).";
    if (!lead.consent) return "Please accept the consent to proceed.";
    return "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const v = validate();
    if (v) return setError(v);
    setSubmitting(true);
    try {
      // backward compatibility: also store a primary string field
      const payload = {
        ...lead,
        loan_type: lead.loan_types?.[0] || null,
        ...meta,
      };
      const { error } = await supabase.from("leads").insert(payload);
      if (error) throw error;
      setSuccess(true);
      setLead((l) => ({
        ...l,
        name: "",
        email: "",
        phone: "",
        notes: "",
        consent: false,
      }));
    } catch (err) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Loan type options (multi-select chips)
  const LOAN_OPTIONS = [
    { key: "no_co_no_collateral", label: "No Co-Applicant & No Collateral", Icon: HandCoins },
    { key: "co_yes_no_collateral", label: "Co-Applicant & No Collateral", Icon: UsersRound },
    { key: "co_yes_collateral_yes", label: "Co-Applicant & Collateral", Icon: ShieldCheck },
    { key: "us_cosigner", label: "US Co-Applicant (Cosigner)", Icon: Globe2 },
  ];

  const toggleLoanType = (key) => {
    setLead((l) => {
      const exists = l.loan_types.includes(key);
      return {
        ...l,
        loan_types: exists
          ? l.loan_types.filter((k) => k !== key)
          : [...l.loan_types, key],
      };
    });
  };

  const banks = [
    { src: "/images/sbi.png", alt: "SBI" },
    { src: "/images/pnb.png", alt: "PNB" },
    { src: "/images/unionbank.png", alt: "Union Bank" },
    { src: "/images/idfc.png", alt: "IDFC First Bank" },
    { src: "/images/icicibank.png", alt: "ICICI Bank" },
    { src: "/images/axisbank.png", alt: "Axis Bank" },
    { src: "/images/yesbank.png", alt: "Yesbank" },
    { src: "/images/credila.png", alt: "Credila" },
    { src: "/images/avanse.png", alt: "Avanse" },
    { src: "/images/auxilo.png", alt: "Auxilo" },
    { src: "/images/incred.png", alt: "Incred" },
    { src: "/images/tatacapital.png", alt: "Tata Capital" },
    { src: "/images/poonawallafincorp.png", alt: "Poonawalla Fincorp" },
    { src: "/images/prodigyfinance.png", alt: "Prodigy Finance" },
    { src: "/images/mpowerfinancing.png", alt: "Mpower Financing" },
    { src: "/images/earnest.png", alt: "Earnest" },
    { src: "/images/salliemae.png", alt: "Sallie Mae" },
    { src: "/images/ascent.png", alt: "Ascent" },
  ];

  return (
    <main className={styles.page}>
      {/* Decorative BG */}
      <div className={styles.bgDecor} aria-hidden />

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.brand}>
            <Image
              src="/images/logo.png"
              alt="StudySahara"
              width={38}
              height={38}
              className={styles.logo}
              priority
            />
            <span className={styles.brandText}>StudySahara</span>
          </div>
          <div className={styles.trustBadge}>
            <CheckCircle2 size={14} />
            <span>Trusted education-loan guidance • Free for students</span>
          </div>
        </div>
      </header>

      {/* FORM AT THE TOP */}
      <section ref={formRef} className={styles.formWrap} aria-label="Application form">
        <div className={styles.formCard}>
          <h2 className={styles.formTitle}>Apply Now — Get a Call from a StudySahara Expert</h2>
          <p className={styles.formSub}>
            Fill your details and we’ll reach out within 24 hours. No charges, no obligations.
          </p>

        <form className={styles.form} onSubmit={onSubmit}>
            <div className={styles.twoCol}>
              <Field label="Full Name" required>
                <input
                  className={styles.input}
                  value={lead.name}
                  onChange={(e) => setLead({ ...lead, name: e.target.value })}
                  placeholder="Your full name"
                  aria-required
                />
              </Field>
              <Field label="Phone" required>
                <input
                  className={styles.input}
                  value={lead.phone}
                  onChange={(e) => setLead({ ...lead, phone: e.target.value })}
                  placeholder="+91XXXXXXXXXX"
                  aria-required
                />
              </Field>
              <Field label="Email" required>
                <input
                  className={styles.input}
                  value={lead.email}
                  onChange={(e) => setLead({ ...lead, email: e.target.value })}
                  placeholder="you@example.com"
                  aria-required
                />
              </Field>
              <Field label="Country of Study">
                <select
                  className={styles.input}
                  value={lead.country}
                  onChange={(e) => setLead({ ...lead, country: e.target.value })}
                >
                  {["USA", "UK", "Canada", "Germany", "Ireland", "France"].map(
                    (c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    )
                  )}
                </select>
              </Field>
            </div>

            <div className={styles.threeCol}>
              <Field label="Course">
                <input
                  className={styles.input}
                  value={lead.course}
                  onChange={(e) => setLead({ ...lead, course: e.target.value })}
                  placeholder="MS, MBA, MSc…"
                />
              </Field>
              <Field label="Intake Month">
                <select
                  className={styles.input}
                  value={lead.intake_month}
                  onChange={(e) =>
                    setLead({ ...lead, intake_month: e.target.value })
                  }
                >
                  {["January", "May", "September"].map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Intake Year">
                <select
                  className={styles.input}
                  value={lead.intake_year}
                  onChange={(e) =>
                    setLead({ ...lead, intake_year: e.target.value })
                  }
                >
                  {Array.from({ length: 5 }).map((_, i) => {
                    const y = new Date().getFullYear() + i;
                    return (
                      <option key={y} value={String(y)}>
                        {y}
                      </option>
                    );
                  })}
                </select>
              </Field>
            </div>

            {/* University Autocomplete */}
            <Field label="University (type 3+ letters)" required>
              <div className={styles.autoWrap}>
                <input
                  className={styles.input}
                  value={lead.university}
                  onChange={(e) =>
                    setLead({ ...lead, university: e.target.value })
                  }
                  placeholder="e.g., Northeastern University"
                  onFocus={() =>
                    lead.university.length >= 3 &&
                    uniFiltered.length &&
                    setUniOpen(true)
                  }
                  onBlur={() => setTimeout(() => setUniOpen(false), 150)}
                />
                {lead.university.length >= 3 && uniOpen && (
                  <div className={styles.autoMenu} role="listbox">
                    {uniFiltered.map((name) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => {
                          setLead({ ...lead, university: name });
                          setUniOpen(false);
                        }}
                        className={styles.autoItem}
                        role="option"
                      >
                        {name}
                      </button>
                    ))}
                    <div className={styles.autoOther}>
                      <button
                        type="button"
                        onClick={() => {
                          setLead({ ...lead, university: "Other" });
                          setUniOpen(false);
                        }}
                        className={styles.autoItem}
                      >
                        Can’t find it? Select <strong>Other</strong>
                      </button>
                    </div>
                  </div>
                )}
                <p className={styles.autoHint}>
                  <Info size={14} />
                  If your university doesn’t appear, type <b>Other</b>.
                </p>
              </div>
            </Field>

            {/* Loan Types (multi-select chips) */}
            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>Loan Types (select one or more)</legend>
              <div className={styles.chipGroup}>
                {LOAN_OPTIONS.map(({ key, label, Icon }) => {
                  const active = lead.loan_types.includes(key);
                  return (
                    <button
                      key={key}
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggleLoanType(key)}
                      className={`${styles.chip} ${
                        active ? styles.chipActive : ""
                      }`}
                    >
                      <span
                        className={`${styles.dotSm} ${
                          active ? styles.dotOn : ""
                        }`}
                      />
                      <Icon size={16} />
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>
              <p className={styles.hintSmall}>
                You can choose multiple options if you’d like us to compare across them.
              </p>
            </fieldset>

            <div className={styles.twoCol}>
              {/* Co-Applicant field removed from UI as requested */}
              <Field label="Anything we should know? (optional)">
                <input
                  className={styles.input}
                  value={lead.notes}
                  onChange={(e) => setLead({ ...lead, notes: e.target.value })}
                  placeholder="Scholarship, score, special cases…"
                />
              </Field>
            </div>

            <label className={styles.consent}>
              <input
                type="checkbox"
                checked={lead.consent}
                onChange={(e) =>
                  setLead({ ...lead, consent: e.target.checked })
                }
              />
              <span>
                I agree to be contacted by StudySahara via call, WhatsApp, or
                email for loan assistance. My details are stored securely and
                not shared for marketing.
              </span>
            </label>

            {error && <div className={styles.alertError}>{error}</div>}
            {success && (
              <div className={styles.alertSuccess}>
                Thank you! Your application has been submitted. Our expert will
                contact you shortly.
              </div>
            )}

            <button type="submit" disabled={submitting} className={styles.submitBtn}>
              {submitting ? (
                <>
                  <Loader2 className={styles.spinner} /> Submitting…
                </>
              ) : (
                <>Submit Application</>
              )}
            </button>

            <p className={styles.disclaimer}>
              By submitting, you acknowledge that the information provided is
              accurate to the best of your knowledge. You can request deletion of
              your data at any time via hello@studysahara.com.
            </p>
          </form>
        </div>
      </section>

      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroGrid}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              Get the Right <span>Education Loan</span> for Your Study Abroad Journey
            </h1>
            <p className={styles.heroSub}>
              No-collateral, co-applicant, and international loan options — all in one
              place. Zero consultation fees.
            </p>
            <div className={styles.ctaRow}>
              <button className={styles.primaryBtn} onClick={scrollToForm}>
                Check Eligibility & Apply
              </button>
              <button className={styles.secondaryBtn} onClick={scrollToForm}>
                Fill Application Form
              </button>
            </div>
            <div className={styles.heroChips}>
              {[
                "Lowest interest bands, lender comparison",
                "Up to 100% funding (tuition + living)",
                "Fast sanctions with guided documentation",
              ].map((t) => (
                <div key={t} className={styles.chipStrong}>
                  <CheckCircle2 size={16} />
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.heroArtWrap}>
            <Image
              src="/images/hero-illustration.png"
              alt="Study abroad loans"
              width={640}
              height={480}
              className={styles.heroArt}
              priority
            />
          </div>
        </div>

        <div className={styles.statsBar}>
          <div>
            <div className={styles.statK}>+200</div>
            <div className={styles.statV}>Students guided</div>
          </div>
          <div>
            <div className={styles.statK}>3–7 days</div>
            <div className={styles.statV}>Typical sanction</div>
          </div>
          <div>
            <div className={styles.statK}>₹2Cr+</div>
            <div className={styles.statV}>High sanction potential</div>
          </div>
        </div>
      </section>

      {/* PARTNERS */}
      <section className={styles.partners}>
        <h2 className={styles.sectionTitle}>Our Lending Partners</h2>
        <p className={styles.sectionSub}>Compare options from leading banks & NBFCs</p>
        <div className={styles.logosGrid}>
          {banks.map((b) => (
            <div key={b.alt} className={styles.logoCard}>
              <Image
                src={b.src}
                alt={b.alt}
                width={120}
                height={40}
                className={styles.bankLogo}
              />
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className={styles.how}>
        <h2 className={styles.sectionTitle}>How StudySahara Works</h2>
        <div className={styles.howGrid}>
          {[
            { title: "1. Tell us your plan", body: "Share course, intake, country, and university." },
            { title: "2. Get matched", body: "We compare 15+ banks/NBFCs to find your best fit." },
            { title: "3. Fast sanction", body: "Guided docs, quick sanction, disbursal before visa." },
          ].map((s) => (
            <div key={s.title} className={styles.howCard}>
              <div className={styles.howTitle}>{s.title}</div>
              <div className={styles.howBody}>{s.body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* OPTIONS */}
      <section className={styles.options}>
        <h2 className={styles.sectionTitle}>Choose Your Loan Path</h2>
        <p className={styles.sectionSub}>Four clear options. We match you to the best fit.</p>
        <div className={styles.cards}>
          <OptionCard
            title="No Co-Applicant & No Collateral"
            Icon={HandCoins}
            points={["Up to ~₹1Cr (profile-based)", "Digital process", "Fast sanction"]}
            onApply={scrollToForm}
          />
          <OptionCard
            title="Co-Applicant & No Collateral"
            Icon={UsersRound}
            points={["Better approval odds", "Potentially lower rate", "Zero collateral"]}
            onApply={scrollToForm}
          />
          <OptionCard
            title="Co-Applicant & Collateral"
            Icon={ShieldCheck}
            points={["₹40L–₹4Cr+", "Lower interest bands", "Up to 15-year tenure"]}
            onApply={scrollToForm}
          />
          <OptionCard
            title="US Co-Applicant (Cosigner)"
            Icon={Globe2}
            points={["US cosigner credit history", "University-direct disbursal", "Fast decisions"]}
            onApply={scrollToForm}
          />
        </div>
      </section>

      {/* WHY US */}
      <section className={styles.why}>
        <h2 className={styles.sectionTitle}>Why Choose StudySahara?</h2>
        <div className={styles.whyGrid}>
          {[{ Icon: ShieldCheck, t: "Zero-cost guidance" },
            { Icon: HandCoins, t: "Lowest interest bands" },
            { Icon: UsersRound, t: "Dedicated loan expert" },
            { Icon: Globe2, t: "Global lender network" }].map(({ Icon, t }) => (
            <div key={t} className={styles.whyCard}>
              <Icon size={18} />
              <span>{t}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className={styles.faq}>
        <h2 className={styles.sectionTitle}>FAQs</h2>
        <div className={styles.faqBox}>
          {[
            {
              q: "Do you charge students?",
              a: "No. Our counseling is free for students. We may receive partner compensation from lenders, but your rates and offers are unaffected.",
            },
            {
              q: "How fast can I get a sanction?",
              a: "Many profiles are sanctioned within 3–7 days once documents are complete. Timelines can vary by lender and university.",
            },
            {
              q: "Can I get a no-collateral loan?",
              a: "Yes, depending on your university/course and co-applicant income. We’ll check eligibility across multiple NBFCs and banks.",
            },
            {
              q: "Is my data safe?",
              a: "We store only what’s needed to process your loan. Data isn’t sold or shared for marketing and can be deleted upon request.",
            },
          ].map(({ q, a }) => (
            <details key={q} className={styles.faqItem}>
              <summary className={styles.faqSummary}>
                {q}
                <span className={styles.faqChevron}>▾</span>
              </summary>
              <p className={styles.faqAnswer}>{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Sticky mobile CTA */}
      <div className={styles.stickyCta}>
        <button onClick={scrollToForm}>Apply for your education loan</button>
      </div>

      <footer className={styles.footer}>
        © {new Date().getFullYear()} StudySahara Financial Consultants LLP. All rights reserved.
      </footer>
    </main>
  );
}

function OptionCard({ title, Icon, points, onApply }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardTop}>
        <div className={styles.iconWrap}>
          <Icon size={18} />
        </div>
        <h3 className={styles.cardTitle}>{title}</h3>
      </div>
      <ul className={styles.cardList}>
        {points.map((p) => (
          <li key={p}>
            <span className={styles.dot} />
            {p}
          </li>
        ))}
      </ul>
      <button className={styles.cardBtn} onClick={onApply}>
        Apply for this option
      </button>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <label className={styles.field}>
      <span className={styles.fieldLabel}>
        {label} {required && <span className={styles.req}>*</span>}
      </span>
      {children}
    </label>
  );
}

/* Keeping Radio component defined (from your original file), even though the loan type UI now uses chips.
   You can remove it later if you prefer, but I'm not trimming anything now. */
function Radio({ label, checked, onChange }) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={onChange}
      className={`${styles.radio} ${checked ? styles.radioActive : ""}`}
    >
      <span className={`${styles.radioDot} ${checked ? styles.radioDotOn : ""}`} />
      <span>{label}</span>
    </button>
  );
}