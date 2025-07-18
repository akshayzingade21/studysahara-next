"use client";
import { useRef, useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function LendingPartnersSection() {
  const scrollRef = useRef(null);
  const controls = useAnimation();
  const [isHovered, setIsHovered] = useState(false);


  const partners = [
    { name: "sbi", img: "sbi.png" },
    { name: "credila", img: "credila.png" },
    { name: "unionbank", img: "unionbank.png" },
    { name: "pnb", img: "pnb.png" },
    { name: "icici-bank", img: "icicibank.png" },
    { name: "avanse", img: "avanse.png" },
    { name: "idfc", img: "idfc.png" },
    { name: "axisbank", img: "axisbank.png" },
    { name: "yesbank", img: "yesbank.png" },
    { name: "incred", img: "incred.png" },
    { name: "tatacapital", img: "tatacapital.png" },
    { name: "poonawallafincorp", img: "poonawallafincorp.png" },
    { name: "prodigyfinance", img: "prodigyfinance.png" },
    { name: "mpowerfinancing", img: "mpowerfinancing.png" },
    { name: "earnest", img: "earnest.png" },
    { name: "salliemae", img: "salliemae.png" },
    { name: "ascent", img: "ascent.png" },
  ];

  const scrollManually = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft += direction === "left" ? -300 : 300;
    }
  };

  useEffect(() => {
    let interval;
    if (!isHovered) {
      interval = setInterval(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollLeft += 1;
        }
      }, 20);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isHovered]);

  return (
    <section className="relative bg-gray-50 py-10 px-4">
      <h3 className="text-center text-2xl font-bold text-gray-800 mb-6">Our Lending Partners</h3>

      {/* Arrows */}
      <button
        onClick={() => scrollManually("left")}
        className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-white p-2 shadow rounded-full"
      >
        <ChevronLeft size={20} />
      </button>

      <button
        onClick={() => scrollManually("right")}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-white p-2 shadow rounded-full"
      >
        <ChevronRight size={20} />
      </button>

      {/* Scrollable Container */}
      <motion.div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto no-scrollbar py-2 px-10"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {partners.map((partner) => (
          <a key={partner.name} href={`/${partner.name}`} className="flex-shrink-0">
            <img
              src={`/images/${partner.img}`}
              alt={partner.name}
              className="w-38 h-19 object-contain p-1 bg-white rounded shadow hover:scale-110 transition-transform"
            />
          </a>
        ))}
      </motion.div>
    </section>
  );
}