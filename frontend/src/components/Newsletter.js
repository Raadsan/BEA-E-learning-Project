"use client";

import { useState } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log("Subscribed:", email);
    setEmail("");
  };

  return (
    <section className="bg-red-600 py-12 sm:py-16 lg:py-20 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-pink-300/20 rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-40 h-40 bg-pink-300/20 rounded-full translate-x-1/2 translate-y-1/2" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-white text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-8">
            Subscribe to our newsletter
          </h2>
          
          <form onSubmit={handleSubmit} className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="flex-1 px-4 py-3 rounded-lg bg-pink-100 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-red-600"
            required
          />
          <button
            type="submit"
            className="bg-blue-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-900 transition-colors whitespace-nowrap"
          >
            SUBSCRIBE
          </button>
        </form>
        </div>
      </div>
    </section>
  );
}

