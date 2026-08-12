import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { SearchFilters } from "@/lib/search";

interface FilterContextValue {
  filters: SearchFilters;
  setFilters: (next: SearchFilters | ((prev: SearchFilters) => SearchFilters)) => void;
  selectedState: string | null;
  setSelectedState: (state: string | null) => void;
}

const FilterContext = createContext<FilterContextValue | null>(null);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<SearchFilters>({ sort: "cjr" });
  const [selectedState, setSelectedState] = useState<string | null>(null);

  const value = useMemo(
    () => ({ filters, setFilters, selectedState, setSelectedState }),
    [filters, selectedState],
  );

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}

export function useFilters() {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error("useFilters must be used within FilterProvider");
  return ctx;
}
