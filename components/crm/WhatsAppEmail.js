// components/crm/WhatsAppEmail.js
'use client';

function onlyDigits(s = '') {
  return String(s).replace(/\D+/g, '');
}

export default function WhatsAppEmail({ phone, email, name, message }) {
  const digits = onlyDigits(phone);
  const text = encodeURIComponent(
    message ||
      `Hi${name ? ` ${name}` : ''}, this is StudySahara regarding your education loan inquiry.`
  );

  const waHref = digits ? `https://wa.me/${digits}?text=${text}` : null;
  const mailHref = email ? `mailto:${email}?subject=StudySahara%20Education%20Loan&body=${text}` : null;

  return (
    <div className="flex gap-2">
      <a
        href={waHref || '#'}
        target="_blank"
        rel="noopener noreferrer"
        className={`px-2.5 py-1.5 text-xs rounded-md border ${
          waHref ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'
        }`}
        onClick={(e) => { if (!waHref) e.preventDefault(); }}
        title={waHref ? 'WhatsApp' : 'No phone number'}
      >
        WhatsApp
      </a>
      <a
        href={mailHref || '#'}
        className={`px-2.5 py-1.5 text-xs rounded-md border ${
          mailHref ? 'bg-white hover:bg-gray-50' : 'bg-gray-200 text-gray-500 cursor-not-allowed'
        }`}
        onClick={(e) => { if (!mailHref) e.preventDefault(); }}
        title={mailHref ? 'Email' : 'No email'}
      >
        Email
      </a>
    </div>
  );
}