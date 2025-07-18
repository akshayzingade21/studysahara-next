"use client";

export default function Success() {
  return (
    <div style={{ textAlign: "center", padding: "50px", maxWidth: "600px", margin: "0 auto" }}>
      <h1 style={{ color: "#28a745", fontSize: "32px", fontWeight: "700", marginBottom: "20px" }}>
        Congratulations!
      </h1>
      <p style={{ fontSize: "18px", color: "#333", marginBottom: "30px" }}>
        Your education loan application has been successfully submitted. Our team will review your details and contact you soon. Thank you for choosing StudySahara!
      </p>
      <a href="/" style={{ 
        background: "#007bff", 
        color: "#fff", 
        padding: "12px 25px", 
        borderRadius: "5px", 
        textDecoration: "none", 
        fontSize: "16px", 
        transition: "background 0.3s"
      }}>
        Back to Homepage
      </a>
    </div>
  );
}