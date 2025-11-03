"use client";

export default function LeadTrigger({ className, title = "Check Loan Eligibility", children }) {
  return (
    <button
      type="button"
      className={className}
      onClick={() =>
        window.dispatchEvent(new CustomEvent("open-lead-modal", { detail: { title } }))
      }
    >
      {children}
    </button>
  );
}