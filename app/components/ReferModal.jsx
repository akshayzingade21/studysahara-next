'use client';
import { useState, useRef, useEffect } from 'react';

export default function ReferModal({ isOpen, onClose }) {
  const [form, setForm] = useState({
    name: '',
    contact: '',
    email: '',
    refereeName: '',
    refereeContact: '',
    refereeEmail: ''
  });

  const modalRef = useRef();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Referral submitted:', form);
    onClose();
  };

  // Close modal if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div ref={modalRef} className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-600 hover:text-gray-800 text-xl"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold text-indigo-700 mb-2 text-center">Refer & Earn with StudySahara</h2>
        <p className="text-center text-gray-600 mb-4">Help a friend achieve their study abroad dreams and earn rewards!</p>

        <div className="bg-indigo-50 rounded p-4 mb-6">
          <h3 className="text-lg font-semibold text-center mb-2 text-indigo-800">Why Refer a Friend?</h3>
          <p className="text-sm text-gray-700 text-center">
            Your friend gets access to StudySahara's expert guidance for their global education journey.<br />
            They’ll find the best loan options tailored to their needs from our extensive network of trusted lenders.<br />
            <strong>Both you and your friend earn <span className="text-green-600 font-bold">₹5000</span></strong> each upon successful loan disbursement!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-800">
          <div className="flex flex-col">
            <label htmlFor="name" className="mb-1 font-medium">Your Name (Referrer)</label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="border rounded px-3 py-2 text-gray-900"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="contact" className="mb-1 font-medium">Your Contact Number</label>
            <input
              id="contact"
              name="contact"
              value={form.contact}
              onChange={handleChange}
              required
              className="border rounded px-3 py-2 text-gray-900"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="email" className="mb-1 font-medium">Your Email ID</label>
            <input
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="border rounded px-3 py-2 text-gray-900"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="refereeName" className="mb-1 font-medium">Referee's Name</label>
            <input
              id="refereeName"
              name="refereeName"
              value={form.refereeName}
              onChange={handleChange}
              required
              className="border rounded px-3 py-2 text-gray-900"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="refereeContact" className="mb-1 font-medium">Referee's Contact Number</label>
            <input
              id="refereeContact"
              name="refereeContact"
              value={form.refereeContact}
              onChange={handleChange}
              required
              className="border rounded px-3 py-2 text-gray-900"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="refereeEmail" className="mb-1 font-medium">Referee's Email ID (Optional)</label>
            <input
              id="refereeEmail"
              name="refereeEmail"
              value={form.refereeEmail}
              onChange={handleChange}
              className="border rounded px-3 py-2 text-gray-900"
            />
          </div>
          <div className="col-span-1 sm:col-span-2 text-center mt-2">
            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition w-full sm:w-auto"
            >
              Submit Referral
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
