// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Hook: useDebounce
// Debounce search/filter inputs (300ms default)
// NEXUS-OMEGA M5 Sprint 9 — Performance
// ═══════════════════════════════════════════════

import { useState, useEffect } from "react";

/**
 * Debounce a value — useful for search inputs.
 * Returns the debounced value after `delay` ms of inactivity.
 *
 * Usage:
 *   const [search, setSearch] = useState("");
 *   const debounced = useDebounce(search, 300);
 *   const results = useQuery(api.search.exec, { q: debounced });
 */
export function useDebounce<T>(value: T, delay = 300): T {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debounced;
}
