"use client";

import { useState, useMemo } from "react";
import { useDarkMode } from "@/context/ThemeContext";
import { useGetCurrentUserQuery } from "@/redux/api/authApi";
import { useGetCertificatesQuery, useGetMyIssuedCertificatesQuery } from "@/redux/api/certificateApi";
import { useGetProgramsQuery } from "@/redux/api/programApi";
import { useGetSubprogramsByProgramIdQuery } from "@/redux/api/subprogramApi";
import { useToast } from "@/components/Toast";
import Modal from "@/components/Modal";

export default function MyCertificationPage() {
  const { isDark } = useDarkMode();
  const { showToast } = useToast();
  const [selectedCert, setSelectedCert] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isFindModalOpen, setIsFindModalOpen] = useState(false);
  const [searchForm, setSearchForm] = useState({ programId: "", subprogramId: "" });
  const [certificatePreview, setCertificatePreview] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: user } = useGetCurrentUserQuery();
  const { data: programs = [] } = useGetProgramsQuery();

  // Find student's program ID with more robust matching
  const studentProgramId = useMemo(() => {
    if (!user || !programs.length) return null;
    const pId = String(user.chosen_program || "").toLowerCase().trim();
    if (!pId) return null;

    const program = programs.find(p =>
      String(p.id) === pId ||
      String(p.title || "").toLowerCase().trim() === pId ||
      String(p.program_name || "").toLowerCase().trim() === pId ||
      String(p.title || "").toLowerCase().includes(pId) ||
      pId.includes(String(p.title || "").toLowerCase())
    );
    return program?.id || null;
  }, [user, programs]);

  const { data: subprogramsData = [], isLoading: subprogramsLoading } = useGetSubprogramsByProgramIdQuery(
    searchForm.programId || studentProgramId, // Priority to search form
    { skip: !searchForm.programId && !studentProgramId }
  );

  const { data: allConfigs = [], isLoading: loadingConfigs } = useGetCertificatesQuery();
  const { data: myHistory = [], isLoading: loadingHistory, refetch: refetchHistory } = useGetMyIssuedCertificatesQuery();

  const bg = isDark ? "bg-gray-900" : "bg-gray-50";
  const card = isDark ? "bg-gray-800 text-white" : "bg-white text-gray-700";
  const border = isDark ? "border-gray-700" : "border-gray-200";

  // Identify certificates for courses (subprograms/programs) the student has completed
  const availableCertificates = useMemo(() => {
    if (!user || !subprogramsData.length || !allConfigs.length) return [];

    const currentSubId = String(user.chosen_subprogram || "").toLowerCase().trim();

    // Parse completed subprograms from user data (comma-separated string or array)
    const completedSubprograms = user.completed_subprograms
      ? (typeof user.completed_subprograms === 'string'
        ? user.completed_subprograms.split(',').map(s => s.trim().toLowerCase())
        : Array.isArray(user.completed_subprograms)
          ? user.completed_subprograms.map(s => String(s).trim().toLowerCase())
          : [])
      : [];

    // Find where the student is currently
    const activeIndex = subprogramsData.findIndex(s => {
      const sId = String(s.id);
      const sName = String(s.subprogram_name || s.name || "").toLowerCase().trim();
      return sId === currentSubId || (currentSubId && sName === currentSubId);
    });

    return allConfigs.map(config => {
      // Enriched config with actual subprogram name if missing
      let enrichedName = config.target_name;
      let subIndex = -1;

      if (config.target_type === 'subprogram') {
        subIndex = subprogramsData.findIndex(s => {
          const sId = String(s.id);
          const sName = String(s.subprogram_name || s.name || "").toLowerCase().trim();
          const targetId = String(config.target_id);
          const targetName = String(config.target_name || "").toLowerCase().trim();

          const idMatch = sId === targetId;
          const nameMatch = targetName && sName === targetName;

          if (idMatch || nameMatch) {
            if (!enrichedName) enrichedName = s.subprogram_name || s.name;
            return true;
          }
          return false;
        });
      }

      return { ...config, subIndex, enrichedName };
    }).filter(config => {
      // Logic for Subprograms: Check completed_subprograms field
      if (config.target_type === 'subprogram') {
        const targetId = String(config.target_id).toLowerCase();
        const targetName = String(config.enrichedName || config.target_name || "").toLowerCase().trim();

        // Debug logging
        console.log('🔍 Certificate check:', {
          targetId,
          targetName,
          completedList: completedSubprograms,
          configName: config.target_name
        });

        // Check if this subprogram is in the completed list (by ID or name)
        const isInCompletedList = completedSubprograms.some(completed => {
          const match = completed === targetId || completed === targetName;
          console.log(`  Comparing '${completed}' with '${targetId}' or '${targetName}': ${match}`);
          return match;
        });

        // Also check if student has moved past this level (legacy logic)
        const hasMovedPast = config.subIndex !== -1 && (activeIndex === -1 || config.subIndex < activeIndex);

        console.log('✅ Result:', { isInCompletedList, hasMovedPast });
        const isCompleted = isInCompletedList || hasMovedPast;

        const alreadyClaimed = myHistory.some(h =>
          String(h.target_id) === String(config.target_id) ||
          (config.enrichedName && String(h.target_name || "").toLowerCase().trim() === String(config.enrichedName).toLowerCase().trim())
        );
        return isCompleted && !alreadyClaimed;
      }

      // Logic for Programs: Graduation check
      if (config.target_type === 'program') {
        const pId = String(studentProgramId);
        const targetPId = String(config.target_id);
        const targetPName = String(config.target_name || "").toLowerCase().trim();
        const userPName = String(user.chosen_program || "").toLowerCase().trim();

        const isMyProgram = pId === targetPId || (targetPName && userPName.includes(targetPName));
        const allLevelsFinished = activeIndex === -1; // If they are not in the list anymore

        const alreadyClaimed = myHistory.some(h =>
          h.target_type === 'program' && (
            String(h.target_id) === targetPId ||
            (targetPName && String(h.target_name || "").toLowerCase().trim() === targetPName)
          )
        );
        return isMyProgram && allLevelsFinished && !alreadyClaimed;
      }

      return false;
    }).map(c => ({ ...c, target_name: c.enrichedName || c.target_name }));
  }, [user, subprogramsData, allConfigs, myHistory, studentProgramId]);

  const handleGenerateCertificate = async (cert) => {
    setIsGenerating(true);
    try {
      const response = await fetch(`${API_URL}/certificates/download/${cert.target_type}/${cert.target_id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error("Could not generate certificate");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setCertificatePreview(url);
      showToast("Certificate generated successfully!", "success");

      // Refresh the history list so the new certificate appears on the main page
      refetchHistory();
    } catch (error) {
      showToast(error.message, "error");
      setIsGenerating(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (cert, isReDownload = false) => {
    try {
      // If it's a re-download from history, we fetch it first
      if (isReDownload) {
        const response = await fetch(`${API_URL}/certificates/download/${cert.target_type}/${cert.target_id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) throw new Error("Could not generate certificate");

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        showToast("Opening certificate in new tab...", "success");
        return;
      }

      // If we are in the preview modal
      if (certificatePreview) {
        window.open(certificatePreview, '_blank');
        showToast("Opening certificate...", "success");
        handleCloseModal();
        return;
      }
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  const handleCloseModal = () => {
    setSelectedCert(null);
    setCertificatePreview(null);
    setIsGenerating(false);
  };

  const handleCheckCertificates = () => {
    const { subprogramId } = searchForm;
    if (!subprogramId) {
      showToast("Please select a subprogram first.", "error");
      return;
    }

    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);

      // Search in all configurations, not just unclaimed ones
      const found = allConfigs.find(c =>
        String(c.target_id) === String(subprogramId) &&
        c.target_type === 'subprogram'
      );

      if (found) {
        // Enrich the found config with names if needed
        const sub = subprogramsData.find(s => String(s.id) === String(subprogramId));
        const enrichedFound = { ...found, target_name: sub?.subprogram_name || found.target_name };

        setSelectedCert(enrichedFound);
        setIsFindModalOpen(false);
        showToast("Certificate found!", "success");
      } else {
        showToast("No certificate found for this subprogram. Make sure you have completed it.", "error");
      }
    }, 500);
  };

  if (loadingConfigs || loadingHistory || subprogramsLoading) {
    return <div className={`min-h-screen ${bg} p-10 text-center text-gray-500`}>Loading certifications...</div>;
  }

  return (
    <div className={`min-h-screen transition-colors pt-12 w-full px-6 sm:px-10 pb-20 ${bg}`}>
      <div className="w-full">
        {/* Simple Header */}
        <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className={`text-4xl font-bold tracking-tight mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
              Certificates
            </h1>
            <p className={`text-lg font-medium opacity-60 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              Access and manage your earned certificates from Blueprint English Academy.
            </p>
          </div>
          <button
            onClick={() => {
              setIsFindModalOpen(true);
              // Auto-select student's program when opening
              setSearchForm({ programId: studentProgramId || "", subprogramId: "" });
            }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#010080] text-white hover:bg-blue-800 rounded-xl font-medium transition-all shadow-lg active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Find my Certificates
          </button>
        </div>

        {/* Section: Your History (Claimed Certificates) */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-6 bg-green-500 rounded-full"></div>
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Claimed Certificates</h2>
          </div>

          {myHistory.length === 0 ? (
            <div className={`p-12 rounded-2xl ${card} border ${border} text-center shadow-sm`}>
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium italic">You haven't claimed any certificates yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myHistory.map((item) => (
                <div key={item.id} className={`p-6 rounded-2xl border ${border} ${card} shadow-md hover:shadow-lg transition-all border-l-4 border-l-green-500`}>
                  <div className="flex flex-col h-full space-y-4">
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          Issued {new Date(item.issued_at).toLocaleDateString()}
                        </span>
                        <div className="bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-widest border border-green-200 dark:border-green-800">
                          Verified
                        </div>
                      </div>
                      <h3 className={`text-lg font-bold leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {item.target_name}
                      </h3>
                    </div>
                    <button
                      onClick={() => handleDownload(item, true)}
                      className="inline-flex items-center gap-2 text-[#010080] dark:text-blue-400 font-bold text-sm hover:translate-x-1 transition-transform"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View Certificate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Find Certificate Search Modal */}
      {isFindModalOpen && (
        <Modal
          isOpen={isFindModalOpen}
          onClose={() => setIsFindModalOpen(false)}
          title="Find my Certificates"
        >
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              {/* Select Program */}
              <div>
                <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  1. Select Program
                </label>
                <select
                  value={searchForm.programId}
                  disabled={true} // Restrict to student's program
                  className={`w-full p-4 rounded-xl border transition-all outline-none focus:ring-2 focus:ring-blue-500/20 opacity-80 cursor-not-allowed ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-100 border-gray-200 text-gray-900'}`}
                >
                  <option value={studentProgramId}>{user?.chosen_program || "Your Program"}</option>
                </select>
              </div>

              {/* Select Subprogram */}
              <div>
                <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  2. Select Completed Course/Level
                </label>
                <select
                  disabled={!searchForm.programId || subprogramsLoading}
                  value={searchForm.subprogramId}
                  onChange={(e) => setSearchForm(prev => ({ ...prev, subprogramId: e.target.value }))}
                  className={`w-full p-4 rounded-xl border transition-all outline-none focus:ring-2 focus:ring-blue-500/20 ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} ${(!searchForm.programId || subprogramsLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <option value="">-- Choose Ended Level --</option>
                  {subprogramsData
                    .filter(s => {
                      // Filter for "ends" subprograms (completed)
                      const completedList = user?.completed_subprograms ?
                        (typeof user.completed_subprograms === 'string' ? user.completed_subprograms.split(',') : user.completed_subprograms) : [];
                      const sId = String(s.id);
                      const sName = String(s.subprogram_name || "").toLowerCase().trim();

                      return completedList.some(c => String(c).trim().toLowerCase() === sId || String(c).trim().toLowerCase() === sName);
                    })
                    .map(s => (
                      <option key={s.id} value={s.id}>{s.subprogram_name}</option>
                    ))
                  }
                </select>
                {searchForm.programId && subprogramsData.filter(s => {
                  const completedList = user?.completed_subprograms ?
                    (typeof user.completed_subprograms === 'string' ? user.completed_subprograms.split(',') : user.completed_subprograms) : [];
                  const sId = String(s.id);
                  const sName = String(s.subprogram_name || "").toLowerCase().trim();
                  return completedList.some(c => String(c).trim().toLowerCase() === sId || String(c).trim().toLowerCase() === sName);
                }).length === 0 && (
                    <p className="mt-2 text-[10px] text-orange-500 font-medium italic">You haven't completed any levels in this program yet.</p>
                  )}
              </div>
            </div>

            <button
              onClick={handleCheckCertificates}
              disabled={isSearching || !searchForm.subprogramId}
              className={`w-full py-4 bg-[#010080] text-white rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-3 ${isSearching || !searchForm.subprogramId ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-800 active:scale-95 shadow-blue-500/20'}`}
            >
              {isSearching ? (
                <>
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  Searching Database...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Get Certificate
                </>
              )}
            </button>
          </div>
        </Modal>
      )}

      {/* Certificate Claim Modal (Congratulations) */}
      {selectedCert && (
        <Modal
          isOpen={!!selectedCert}
          onClose={handleCloseModal}
          title={certificatePreview ? "Your Certificate" : "Certificate Request"}
        >
          <div className="p-4 space-y-4">
            {/* Congratulations Header */}
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl border border-green-200 dark:border-green-800">
              <div className="p-3 bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-800 dark:to-blue-800 rounded-full">
                <svg className="w-8 h-8 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1 overflow-hidden">
                <h4 className="font-semibold text-lg text-gray-800 dark:text-white">🎉 Congratulations!</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  You completed <span className="font-medium text-[#010080] dark:text-blue-400">{selectedCert.target_name}</span>
                </p>
              </div>
            </div>

            {/* Certificate Preview or Generate Button */}
            {!certificatePreview ? (
              <>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed text-center py-4">
                  Click the button below to generate your official certificate. You'll be able to preview it before downloading.
                </p>

                <div className="flex justify-center pt-2">
                  <button
                    onClick={() => handleGenerateCertificate(selectedCert)}
                    disabled={isGenerating}
                    className={`px-8 py-3 text-sm font-medium text-white bg-gradient-to-r from-[#010080] to-blue-700 rounded-xl transition-all shadow-lg flex items-center gap-3 ${isGenerating ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl active:scale-95'
                      }`}
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Generating Certificate...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Generate Certificate
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* PDF Preview */}
                <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-900 shadow-inner">
                  <iframe
                    src={`${certificatePreview}#toolbar=0&view=FitH`}
                    className="w-full h-[480px]"
                    title="Certificate Preview"
                  />
                </div>

                {/* Download Button */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={handleCloseModal}
                    className="px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => handleDownload(selectedCert)}
                    className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#010080] to-blue-700 rounded-lg hover:shadow-lg transition-all shadow-md active:scale-95 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Full View / Download
                  </button>
                </div>
              </>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
