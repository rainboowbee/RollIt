'use client';

import { useState } from 'react';
import { initData, useSignal, retrieveRawInitData } from '@telegram-apps/sdk-react';
import { Section, Cell, Button } from '@telegram-apps/telegram-ui';

interface User {
  id: number;
  telegramId: string;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  photoUrl?: string | null;
  balance: number;
  createdAt: string;
}

interface DebugPanelProps {
  user?: User | null;
}

export default function DebugPanel({ user }: DebugPanelProps) {
  const [isVisible, setIsVisible] = useState(false);
  const initDataUser = useSignal(initData.user);

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
      
      <Section header="Database User">
        <Cell subtitle="User ID">
          {user?.id || 'Not loaded'}
        </Cell>
        <Cell subtitle="Telegram ID">
          {user?.telegramId || 'Not loaded'}
        </Cell>
        <Cell subtitle="Username">
          {user?.username || 'Not set'}
        </Cell>
        <Cell subtitle="Registration Date">
          {user?.createdAt ? new Date(user.createdAt).toLocaleString('ru-RU') : 'Not loaded'}
        </Cell>
        <Cell subtitle="Balance">
          {user?.balance || 'Not loaded'} coins
        </Cell>
      </Section>

      <Section header="Init Data">
        <Cell subtitle="User data from initData">
          {initDataUser ? JSON.stringify(initDataUser, null, 2) : 'undefined'}
        </Cell>
      </Section>

      <Section header="Raw Init Data">
        <Cell subtitle="Raw init data string">
          {retrieveRawInitData() || 'Not available'}
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
          console.log('Database User:', user);
          console.log('Init Data User:', initDataUser);
          console.log('Raw Init Data:', retrieveRawInitData());
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
