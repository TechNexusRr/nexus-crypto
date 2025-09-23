'use client';

import { useEffect } from 'react';
import { registerSW } from '../src/sw-register';

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator
    ) {
      registerSW();
    }
  }, []);

  return null;
}