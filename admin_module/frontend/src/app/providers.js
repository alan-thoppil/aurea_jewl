"use client";

// Silence noisy console logs in the browser immediately on module loading
if (typeof window !== 'undefined') {
  const noiseKeywords = [
    'THREE.Clock',
    'Clock: This module has been deprecated',
    'PCFSoftShadowMap',
    'WebGLShadowMap',
    'gl_context_webgl.cc',
    'gl_context.cc',
    'Successfully created a WebGL context',
    'GL version:',
    'OpenGL error checking is disabled'
  ];

  const filterMethod = (methodName) => {
    const original = console[methodName];
    if (!original) return;
    console[methodName] = function(...args) {
      if (args[0] && typeof args[0] === 'string') {
        const msg = args[0];
        const isNoise = noiseKeywords.some(keyword => msg.includes(keyword)) ||
          (msg.includes('deprecated') && (msg.includes('THREE') || msg.includes('Clock')));
        if (isNoise) return; // Suppress from console permanently
      }
      original.apply(console, args);
    };
  };

  ['log', 'info', 'warn', 'error'].forEach(filterMethod);
}

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
