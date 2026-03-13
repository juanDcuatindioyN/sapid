'use client';

import { useApp } from '@/contexts/AppContext';

export default function OfflineBanner() {
  const { isOnline, pendingSyncs } = useApp();

  if (isOnline && pendingSyncs === 0) {
    return null;
  }

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 px-4 py-2 text-center text-white text-sm font-medium ${
        isOnline ? 'bg-yellow-600' : 'bg-red-600'
      }`}
    >
      {!isOnline && '⚠️ Sin conexión - Trabajando en modo offline'}
      {isOnline && pendingSyncs > 0 && (
        <>
          🔄 Sincronizando {pendingSyncs} registro{pendingSyncs > 1 ? 's' : ''}...
        </>
      )}
    </div>
  );
}
