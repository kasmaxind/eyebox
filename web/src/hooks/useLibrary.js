import { useEffect, useState } from "react";
import { getLibrary } from "../lib/library.js";

export function useLibrary() {
  const [lib, setLib] = useState(getLibrary);

  useEffect(() => {
    const refresh = () => setLib(getLibrary());
    window.addEventListener("eyebox-library-change", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("eyebox-library-change", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return lib;
}
