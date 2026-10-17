import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** New page → start at the top (React Router keeps the old scroll position otherwise). Links to #sections still jump. */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}
