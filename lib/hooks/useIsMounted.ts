'use client';

import { useState, useEffect } from 'react';

/**
 * Hook to check if the component has been mounted on the client.
 * This is useful for avoiding hydration mismatches with Framer Motion
 * and other client-side libraries.
 */
export function useIsMounted(): boolean {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    return isMounted;
}

export default useIsMounted;
