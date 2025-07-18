'use client';
import Link from 'next/link';
import { useState, useRef } from 'react';
import ReferModal from './ReferModal';

export default function Navbar() {
  const [openMenu, setOpenMenu] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileLoanOpen, setMobileLoanOpen] = useState(false);
  const [mobileLenderOpen, setMobileLenderOpen] = useState(false);
  const [isReferOpen, setIsReferOpen] = useState(false);
  const timeoutRef = useRef();

  const lenders = [
    ["SBI", "/sbi"], ["Credila", "/credila"], ["Union Bank", "/union-bank"], ["PNB", "/punjab-national-bank"],
    ["ICICI Bank", "/icici-bank"], ["Avanse", "/avanse-financial-services"], ["IDFC", "/idfc-first-bank"],
    ["Axis Bank", "/axis-bank"], ["Yes Bank", "/yes-bank"], ["InCred", "/incred"], ["Tata Capital", "/tata-capital"],
    ["Poonawalla Fincorp", "/poonawalla-fincorp"], ["Prodigy Finance", "/prodigy-finance"],
    ["MPOWER Financing", "/mpower-financing"], ["Earnest", "/earnest"], ["Sallie Mae", "/sallie-mae"], ["Ascent", "/ascent"]
  ];

  const handleMouseEnter = (menu) => {
    clearTimeout(timeoutRef.current);
    setOpenMenu(menu);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setOpenMenu(null), 150);
  };

  return (
    <nav className="bg-white shadow sticky top-0 z-50">
      <ReferModal isOpen={isReferOpen} onClose={() => setIsReferOpen(false)} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <img src="/images/logo.png" alt="StudySahara" className="h-8 w-auto" />
              <span className="text-lg font-bold text-indigo-600">StudySahara</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-gray-700 relative z-50">
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter('loan')}
              onMouseLeave={handleMouseLeave}
            >
              <div className="flex items-center cursor-pointer px-2 py-1 hover:text-indigo-600">
                <span>Loan Options</span>
                <svg className="ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.25 8.27a.75.75 0 01-.02-1.06z" clipRule="evenodd"/>
                </svg>
              </div>
              {openMenu === 'loan' && (
                <div className="absolute top-full left-0 mt-0 w-72 bg-white border rounded shadow-md flex flex-col z-50">
                  <Link href="/no-coapplicant-nocollateral" className="px-4 py-2 hover:bg-gray-100">No Co-applicant & No Collateral</Link>
                  <Link href="/coapplicant-nocollateral" className="px-4 py-2 hover:bg-gray-100">Co-applicant & No Collateral</Link>
                  <Link href="/coapplicant-collateral" className="px-4 py-2 hover:bg-gray-100">Co-applicant & Collateral</Link>
                  <Link href="/us-coapplicant" className="px-4 py-2 hover:bg-gray-100">US Co-applicant</Link>
                </div>
              )}
            </div>

            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter('lender')}
              onMouseLeave={handleMouseLeave}
            >
              <div className="flex items-center cursor-pointer px-2 py-1 hover:text-indigo-600">
                <span>Lending Partners</span>
                <svg className="ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.25 8.27a.75.75 0 01-.02-1.06z" clipRule="evenodd"/>
                </svg>
              </div>
              {openMenu === 'lender' && (
                <div className="absolute top-full left-0 mt-0 w-72 bg-white border rounded shadow-md flex flex-col max-h-96 overflow-y-auto z-50">
                  {lenders.map(([name, path]) => (
                    <Link key={name} href={path} className="px-4 py-2 hover:bg-gray-100">{name}</Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/check-loan-eligibility" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition">
              Check Loan Eligibility
            </Link>

            <button
              onClick={() => setIsReferOpen(true)}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
            >
              Refer & Earn
            </button>
          </div>

          {/* Mobile menu icon */}
          <div className="md:hidden">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-indigo-600 focus:outline-none">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2"
                viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
åå