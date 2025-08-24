'use client';

import { useState, useEffect } from 'react';
import { initData, useSignal, useLaunchParams } from '@telegram-apps/sdk-react';
import { Section, Cell, Button } from '@telegram-apps/telegram-ui';

export default function DebugPanel() {
  const [isVisible, setIsVisible] = useState(false);
  const initDataUser = useSignal(initData.user);
  const launchParams = useLaunchParams();

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  if (!isVisible) {
    return (
      <Button
        onClick={toggleVisibility}
        className="fixed bottom-4 left-4 z-50"
        size="s"
      >
        🔍 Debug
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-black bg-opacity-90 text-white p-4 rounded-lg max-w-md max-h-96 overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold">Debug Panel</h3>
        <Button onClick={toggleVisibility} size="s">✕</Button>
      </div>
      
      <Section header="Init Data">
        <Cell subtitle="User data from initData">
          {initDataUser ? JSON.stringify(initDataUser, null, 2) : 'undefined'}
        </Cell>
      </Section>

      <Section header="Launch Params">
        <Cell subtitle="tgWebAppData">
          {launchParams.tgWebAppData ? 'Available' : 'Not available'}
        </Cell>
        <Cell subtitle="tgWebAppVersion">
          {launchParams.tgWebAppVersion || 'N/A'}
        </Cell>
        <Cell subtitle="tgWebAppPlatform">
          {launchParams.tgWebAppPlatform || 'N/A'}
        </Cell>
      </Section>

      <Section header="Window Info">
        <Cell subtitle="Location">
          {typeof window !== 'undefined' ? window.location.href : 'N/A'}
        </Cell>
        <Cell subtitle="User Agent">
          {typeof window !== 'undefined' ? navigator.userAgent : 'N/A'}
        </Cell>
      </Section>

      <Button
        onClick={() => {
          console.log('=== Debug Info ===');
          console.log('Init Data User:', initDataUser);
          console.log('Launch Params:', launchParams);
          console.log('Window Location:', window.location.href);
        }}
        className="w-full mt-2"
        size="s"
      >
        Log to Console
      </Button>
    </div>
  );
}
