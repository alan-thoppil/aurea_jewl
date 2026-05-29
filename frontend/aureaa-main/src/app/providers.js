"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { StateProvider } from "@/context/StateContext";

export default function Providers({ children }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <StateProvider>
        {children}
      </StateProvider>
    </QueryClientProvider>
  );
}
