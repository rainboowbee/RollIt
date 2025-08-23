'use client';

import { useState, useEffect } from 'react';

interface DebugInfoType {
  userAgent: string;
  hasTelegram: boolean;
  hasWebApp: boolean;
  hasInitData: boolean;
  initData: string | null;
  initDataUnsafe: unknown;
  url: string | null;
  searchParams: Record<string, string> | null;
}

export default function DebugInfo() {
  const [debugInfo, setDebugInfo] = useState<DebugInfoType>({
    userAgent: '',
    hasTelegram: false,
    hasWebApp: false,
    hasInitData: false,
    initData: null,
    initDataUnsafe: null,
    url: null,
    searchParams: null,
  });

  useEffect(() => {
    const info: DebugInfoType = {
      userAgent: navigator.userAgent,
      hasTelegram: typeof window !== 'undefined' && !!window.Telegram,
      hasWebApp: typeof window !== 'undefined' && !!window.Telegram?.WebApp,
      hasInitData: typeof window !== 'undefined' && !!window.Telegram?.WebApp?.initData,
      initData: typeof window !== 'undefined' ? window.Telegram?.WebApp?.initData : null,
      initDataUnsafe: typeof window !== 'undefined' ? window.Telegram?.WebApp?.initDataUnsafe : null,
      url: typeof window !== 'undefined' ? window.location.href : null,
      searchParams: typeof window !== 'undefined' ? Object.fromEntries(new URLSearchParams(window.location.search)) : null,
    };
    
    setDebugInfo(info);
    console.log('Debug Info:', info);
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg text-xs max-w-xs z-50">
      <h3 className="font-bold mb-2">Debug Info</h3>
      <div className="space-y-1">
        <div><strong>Has Telegram:</strong> {debugInfo.hasTelegram ? '✅' : '❌'}</div>
        <div><strong>Has WebApp:</strong> {debugInfo.hasWebApp ? '✅' : '❌'}</div>
        <div><strong>Has InitData:</strong> {debugInfo.hasInitData ? '✅' : '❌'}</div>
        <div><strong>User Agent:</strong> {debugInfo.userAgent?.includes('Telegram') ? '✅' : '❌'}</div>
      </div>
      <button 
        onClick={() => console.log('Full Debug Info:', debugInfo)}
        className="mt-2 px-2 py-1 bg-blue-600 text-white rounded text-xs"
      >
        Log to Console
      </button>
    </div>
  );
}
