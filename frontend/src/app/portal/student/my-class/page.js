"use client";

import { useEffect, useState } from "react";
import { useGetCurrentUserQuery } from "@/redux/api/authApi";
import { useDarkMode } from "@/context/ThemeContext";

export default function MyClassPage() {
  const { isDark } = useDarkMode();
  const { data: user, isLoading: userLoading } = useGetCurrentUserQuery();
  const [classInfo, setClassInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClass = async () => {
      if (!user?.class_id) {
        setLoading(false);
        return;
      }
      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";
        const res = await fetch(`${baseUrl}/api/classes/${user.class_id}`);
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(json.error || "Failed to load class info");
        }
        setClassInfo(json);
      } catch (err) {
        setError(err.message || "Failed to load class info");
      } finally {
        setLoading(false);
      }
    };

    if (!userLoading) {
      fetchClass();
    }
  }, [user, userLoading]);

  const bg = isDark ? "bg-gray-900" : "bg-gray-100";
  const card = isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900";

  return (
    <div className={`min-h-screen ${bg}`}>
      <div className="max-w-4xl mx-auto p-6">
        <div className={`mb-6 p-6 rounded-xl shadow ${card}`}>
          <h1 className="text-2xl font-bold mb-2">My Class</h1>
          <p className={isDark ? "text-gray-300" : "text-gray-600"}>
            Details of the class you have been assigned to.
          </p>
        </div>

        {userLoading || loading ? (
          <div className={`p-6 rounded-xl shadow ${card}`}>
            <p>Loading class information...</p>
          </div>
        ) : !user?.class_id ? (
          <div className={`p-6 rounded-xl shadow ${card}`}>
            <p>You have not been assigned to any class yet.</p>
          </div>
        ) : error ? (
          <div
            className={`p-6 rounded-xl shadow border border-red-200 ${
              isDark ? "bg-red-900/20" : "bg-red-50"
            }`}
          >
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        ) : (
          <div className={`p-6 rounded-xl shadow ${card}`}>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <Field label="Class Name" value={classInfo?.class_name} />
              <Field
                label="Description"
                value={classInfo?.description || "No description"}
              />
              <Field
                label="Subprogram ID"
                value={classInfo?.subprogram_id}
              />
              <Field label="Course ID" value={classInfo?.course_id} />
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div className="border border-gray-200 rounded-lg p-3 bg-white/70 text-gray-900">
      <div className="text-xs font-semibold text-gray-500 uppercase mb-1">
        {label}
      </div>
      <div className="text-sm">{value ?? "Not set"}</div>
    </div>
  );
}


