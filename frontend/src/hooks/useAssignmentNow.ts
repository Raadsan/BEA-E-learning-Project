import { useEffect, useState } from "react";

/** Live clock for assignment window status (pending / active / complete). */
export function useAssignmentNow() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return now;
}
