"use client";

import { useDarkMode } from "@/context/ThemeContext";
import { useState } from "react";

export default function PoliciesPage() {
  const { isDark } = useDarkMode();

  const bg = isDark ? "bg-[#03002e]" : "bg-gray-50";
  const card = isDark ? "bg-[#050040] text-white border-gray-700" : "bg-white text-gray-900 border-gray-100";
  const headerText = isDark ? "text-white" : "text-gray-900";
  const subText = isDark ? "text-gray-400" : "text-gray-500";

  const policySections = [
    {
      id: 1,
      title: "1. What is BEA Data Policy?",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      content: "The BEA Data Policy is a formal document outlining how we collect, manage, protect, and dispose of all personal and institutional data. It ensures ethical handling, protects privacy, and maintains transparency.",
      highlights: [
        "Ethical and secure data handling",
        "Protection of learner and staff privacy",
        "Responsible data governance",
        "Transparency in information management"
      ]
    },
    {
      id: 2,
      title: "2. Data Management",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      content: "We categorize data (Public, Internal, Confidential, Highly Sensitive) and strictly control access on a need-to-know basis, monitored by our IT & Security team.",
      highlights: [
        "Strict access controls",
        "Data categorization",
        "Role-based awareness",
        "Continuous monitoring"
      ]
    },
    {
      id: 3,
      title: "3. Data Acquisition",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
        </svg>
      ),
      content: "We collect only necessary information for educational and administrative purposes, including personal details, academic progress, and Identifcation documents (when required).",
      highlights: [
        "Minimal data collection",
        "Academic records tracking",
        "Secure registration forms",
        "Explicit user consent"
      ]
    },
    {
      id: 4,
      title: "4. Data Use",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      content: "Collected data remains internal and is never sold. It's used for enrollment, certificates, academic communication, and curriculum improvements.",
      highlights: [
        "Internal-use only policy",
        "No third-party data trading",
        "Educational service delivery",
        "Legal obligation compliance"
      ]
    },
    {
      id: 5,
      title: "5. Data Disposal",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
      content: "Data is retained only as long as necessary. We use permanent deletion, shredding, and encryption methods to dispose of data securely when no longer needed.",
      highlights: [
        "Secure archival periods",
        "Permanent digital deletion",
        "Paper record shredding",
        "Exit-process access revocation"
      ]
    },
    {
      id: 6,
      title: "6. User Rights",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      content: "You have the right to access your data, request corrections, and understand how your information is being used by the BEA Academy.",
      highlights: [
        "Right to access records",
        "Correction of inaccuracies",
        "Transparency of use",
        "Support and assistance"
      ]
    }
  ];

  return (
    <div className={`min-h-screen transition-colors pt-12 w-full px-6 sm:px-10 pb-20 ${bg}`}>
      <div className="w-full">

        {/* Header Section */}
        <div className={`mb-10 p-8 rounded-2xl shadow-sm border ${card}`}>
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-xl ${isDark ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Policies & Data Protection</h1>
              <p className={`mt-1 font-medium ${subText}`}>
                Official guidelines for Bea Blueprint English Academy Students.
              </p>
            </div>
          </div>
          <div className={`h-px w-full my-6 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}></div>
          <p className={`text-base leading-relaxed max-w-4xl ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Welcome to the BEA Policy Center. We are committed to protecting your privacy and providing a secure learning environment. This document outlines our data standards and procedural requirements that apply to all learners and staff.
          </p>
        </div>

        {/* Policies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {policySections.map((section) => (
            <div
              key={section.id}
              className={`flex flex-col p-6 rounded-2xl shadow-sm border hover:shadow-md transition-all group ${card}`}
            >
              <div className="flex items-center gap-4 mb-5">
                <div className={`p-2.5 rounded-lg transition-colors ${isDark ? 'bg-gray-800 text-blue-400 group-hover:bg-blue-600/20' : 'bg-gray-50 text-blue-600 group-hover:bg-blue-50'}`}>
                  {section.icon}
                </div>
                <h3 className="text-lg font-bold leading-tight">{section.title}</h3>
              </div>

              <p className={`text-sm leading-relaxed mb-6 flex-grow ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {section.content}
              </p>

              <div className="space-y-2">
                {section.highlights.map((highlight, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span className={`text-[11px] font-semibold uppercase tracking-wider ${subText}`}>
                      {highlight}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Info */}

      </div>
    </div>
  );
}
