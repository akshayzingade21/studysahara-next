"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./noCoappNoCollateral.module.css";

/**
 * Singleton modal provider.
 * Open from anywhere:
 *   window.dispatchEvent(new CustomEvent("open-lead-modal", {
 *     detail: { title: "Check Loan Eligibility", pageKey: "no-coapp-no-collateral" }
 *   }));
 * - title is optional (defaults below)
 * - pageKey is optional; if omitted, we derive from pathname
 */
export default function LeadModalProvider() {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [title, setTitle] = useState("Check Loan Eligibility");
  const [pageKey, setPageKey] = useState(""); // recorded per submission
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    intakeMonth: "",
    intakeYear: "",
  });

  const firstFieldRef = useRef(null);

  // Listen for global open event
  useEffect(() => {
    const handler = (e) => {
      const t = e?.detail?.title || "Check Loan Eligibility";
      const keyFromEvent = e?.detail?.pageKey;
      const keyFromPath =
        typeof window !== "undefined"
          ? window.location.pathname.replace(/^\/+|\/+$/g, "").replaceAll("/", "-") || "home"
          : "unknown";

      setTitle(t);
      setPageKey(keyFromEvent || keyFromPath);
      setDone(false);
      setError("");
      setOpen(true);

      // autofocus after paint
      setTimeout(() => firstFieldRef.current?.focus(), 0);
    };
    window.addEventListener("open-lead-modal", handler);
    return () => window.removeEventListener("open-lead-modal", handler);
  }, []);

  // Lock scroll while modal is open
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      root.style.overflow = prev || "";
    };
  }, [open]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    const { name, phone, email, intakeMonth, intakeYear } = form;
    if (!name || !phone || !email || !intakeMonth || !intakeYear) {
      setError("Please fill all fields.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name,
        phone,
        email,
        intakeMonth,
        intakeYear,
        pageKey: pageKey || null,
        sourcePath:
          typeof window !== "undefined" ? window.location.pathname : null,
        sourceUrl:
          typeof window !== "undefined" ? window.location.href : null,
        // utm: window.__SS_UTM || undefined, // keep for future if you capture UTM
      };

      const res = await fetch("/api/seo-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json?.ok) {
        console.error("Submit failed:", json);
        setError("Something went wrong. Please try again.");
        return;
      }

      setDone(true);
      // Reset form after success
      setForm({
        name: "",
        phone: "",
        email: "",
        intakeMonth: "",
        intakeYear: "",
      });
    } catch (err) {
      console.error("Network error:", err);
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className={styles.modalOverlay}
      role="dialog"
      aria-modal="true"
      onClick={() => setOpen(false)}
    >
      <div
        className={styles.modalCard}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className={styles.closeBtn}
          onClick={() => setOpen(false)}
          aria-label="Close"
          type="button"
        >
          ×
        </button>

        {!done ? (
          <>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>{title}</h3>
              <p className={styles.modalSub}>
                Share your details and a StudySahara loan expert will connect with you soon.
              </p>
            </div>

            <div className={styles.modalBody}>
              <form onSubmit={submit} className={styles.form} noValidate>
                <label className={styles.label}>
                  Full Name
                  <input
                    ref={firstFieldRef}
                    className={styles.input}
                    type="text"
                    name="name"
                    placeholder="Your name"
                    value={form.name}
                    onChange={onChange}
                    required
                    inputMode="text"
                  />
                </label>

                <label className={styles.label}>
                  Contact Number
                  <input
                    className={styles.input}
                    type="tel"
                    name="phone"
                    placeholder="+91 XXXXX XXXXX"
                    value={form.phone}
                    onChange={onChange}
                    required
                    inputMode="tel"
                  />
                </label>

                <label className={styles.label}>
                  Email ID
                  <input
                    className={styles.input}
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={onChange}
                    required
                    inputMode="email"
                  />
                </label>

                <div className={styles.twoCols}>
                  <label className={styles.label}>
                    Intake Month
                    <select
                      className={styles.input}
                      name="intakeMonth"
                      value={form.intakeMonth}
                      onChange={onChange}
                      required
                    >
                      <option value="">Select month</option>
                      <option>January</option>
                      <option>May</option>
                      <option>September</option>
                    </select>
                  </label>

                  <label className={styles.label}>
                    Intake Year
                    <input
                      className={styles.input}
                      type="number"
                      min="2025"
                      max="2030"
                      name="intakeYear"
                      placeholder="2025"
                      value={form.intakeYear}
                      onChange={onChange}
                      required
                      inputMode="numeric"
                    />
                  </label>
                </div>

                {error ? (
                  <div className={styles.note} style={{ color: "#b91c1c" }}>
                    {error}
                  </div>
                ) : null}

                <button className={styles.primaryCta} type="submit" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Details"}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className={styles.modalBody}>
            <div className={styles.thanks}>
              <h3>Thanks! 🎉</h3>
              <p>Our loan expert will contact you shortly.</p>
              <button
                className={styles.secondaryCta}
                onClick={() => setOpen(false)}
                type="button"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}