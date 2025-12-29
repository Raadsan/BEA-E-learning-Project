"use client";

import { useGetAnnouncementsQuery } from "@/redux/api/announcementApi";
import { useDarkMode } from "@/context/ThemeContext";

export default function ClassUpdatesPage() {
  const { isDark } = useDarkMode();
  const { data: updates, isLoading, error } = useGetAnnouncementsQuery();

  const loadingSkeleton = (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className={`h-48 rounded-2xl animate-pulse ${isDark ? "bg-gray-800" : "bg-gray-200"}`} />
      ))}
    </div>
  );

  return (
    <div className={`min-h-screen pb-12 transition-colors ${isDark ? "bg-[#0f172a]" : "bg-gray-50"}`}>
      {/* Header Banner */}
      <div className={`h-48 relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700`}>
        <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px] pattern-grid-lg"></div>
        {/* Decorative Orbs */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-black/10 rounded-full blur-3xl"></div>

        <div className="relative h-full max-w-7xl mx-auto px-6 flex flex-col justify-center">
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Class Updates</h1>
          <p className="text-blue-100 text-lg max-w-2xl">
            Stay informed with the latest announcements, schedule changes, and important notices from your instructors.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-10 relative z-10">

        {isLoading ? loadingSkeleton : error ? (
          <div className={`p-8 rounded-2xl text-center border ${isDark ? "bg-slate-800 border-red-900/50" : "bg-white border-red-100"}`}>
            <span className="text-red-500 font-medium">Failed to load updates. Please try again later.</span>
          </div>
        ) : (!updates || updates.length === 0) ? (
          <div className={`p-12 rounded-2xl text-center shadow-lg border backdrop-blur-sm ${isDark ? "bg-slate-800/80 border-slate-700" : "bg-white/90 border-white/50"
            }`}>
            <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${isDark ? "bg-slate-700 text-slate-400" : "bg-gray-100 text-gray-400"
              }`}>
              <BellOffIcon className="w-10 h-10" />
            </div>
            <h3 className={`text-xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>All caught up!</h3>
            <p className={isDark ? "text-slate-400" : "text-gray-500"}>
              There are no new class updates or announcements at the moment.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {updates.map((update) => (
              <AnnouncementCard key={update.id} update={update} isDark={isDark} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AnnouncementCard({ update, isDark }) {
  // Determine gradient based on type (optional logic can be added)
  const typeColor = update.type === 'Alert' ? 'text-red-500 bg-red-50 dark:bg-red-900/20' : 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';

  return (
    <div className={`group rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border overflow-hidden ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-100"
      }`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? "bg-blue-900/30 text-blue-400" : "bg-blue-50 text-blue-600"
              }`}>
              <MegaphoneIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-xl font-bold ${isDark ? "text-white group-hover:text-blue-400" : "text-gray-900 group-hover:text-blue-600"} transition-colors`}>
                {update.title}
              </h3>
              <p className={`text-xs font-medium ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                Posted on {new Date(update.created_at || Date.now()).toLocaleDateString(undefined, {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                })}
              </p>
            </div>
          </div>

          {/* Badge (Optional Type) */}
          {update.type && (
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${typeColor}`}>
              {update.type}
            </span>
          )}
        </div>

        {/* Content */}
        <div className={`prose prose-sm max-w-none mb-6 ${isDark ? "text-slate-300" : "text-gray-600"}`}>
          <p className="whitespace-pre-wrap leading-relaxed">{update.content || update.description}</p>
        </div>

        {/* Footer / Attachments */}
        <div className={`pt-4 border-t flex items-center justify-between ${isDark ? "border-slate-700" : "border-gray-50"}`}>
          <div className="flex -space-x-2">
            {/* Optional: Avatars of who posted if available, or just standard footer info */}
            <span className={`text-xs font-medium ${isDark ? "text-slate-500" : "text-gray-400"}`}>
              Posted by Administration
            </span>
          </div>

          {/* Action Link Example */}
          {update.link && (
            <a href={update.link} target="_blank" rel="noopener noreferrer"
              className={`flex items-center gap-1 text-sm font-semibold transition-colors ${isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"
                }`}>
              View Attachment <ArrowRightIcon className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Icons ---

const BellOffIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13.73 21a2 2 0 0 1-3.46 0" /><path d="M18.63 13A17.89 17.89 0 0 1 18 8" /><path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14" /><path d="M18 8a6 6 0 0 0-9.33-5" /><line x1="1" x2="23" y1="1" y2="23" /></svg>
);

const MegaphoneIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 11 18-5v12L3 14v-3z" /><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" /></svg>
);

const ArrowRightIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
);
