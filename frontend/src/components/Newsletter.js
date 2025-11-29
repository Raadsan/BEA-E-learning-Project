"use client";

import { useState } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [ref, isVisible] = useScrollAnimation({ threshold: 0.2 });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log("Subscribed:", email);
    setEmail("");
  };

  return (
    <section ref={ref} className="bg-white py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className={`text-gray-900 text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-center mb-4 transition-all duration-700 ${isVisible ? 'animate-fade-in-up opacity-100' : 'opacity-0'}`}>
            Subscribe to our newsletter
          </h2>
          
          <p className={`text-gray-700 text-base sm:text-lg text-center mb-8 max-w-2xl mx-auto transition-all duration-700 delay-200 ${isVisible ? 'animate-fade-in-up opacity-100' : 'opacity-0'}`}>
            Join 50,000+ students who are already improving their English skills with EnglishMaster. Start your free trial and see results in weeks, not years.
          </p>
          
          <form onSubmit={handleSubmit} className={`max-w-2xl mx-auto flex flex-col sm:flex-row gap-3 transition-all duration-700 delay-300 ${isVisible ? 'animate-fade-in-up opacity-100' : 'opacity-0'}`}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="flex-1 px-4 py-3 rounded-lg bg-gray-100 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-300"
              required
            />
            <button
              type="submit"
              className="bg-blue-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-900 transition-all duration-300 transform hover:scale-105 whitespace-nowrap shadow-md hover:shadow-lg"
            >
              Subscribe Now
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

