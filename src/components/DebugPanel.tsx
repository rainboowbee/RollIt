'use client';

import { useState } from 'react';
import { initData, useSignal, retrieveRawInitData } from '@telegram-apps/sdk-react';
import { Button } from '@telegram-apps/telegram-ui';

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
    <div className="fixed bottom-4 left-4 z-50 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-md max-h-96 overflow-auto">
      <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-t-2xl">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg">🔍 Debug Panel</h3>
          <Button onClick={toggleVisibility} size="s" className="bg-white/20 hover:bg-white/30">
            ✕
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Database User */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-100 dark:border-green-800">
          <h4 className="font-semibold text-green-800 dark:text-green-200 mb-3 flex items-center">
            <span className="mr-2">👤</span>
            Database User
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">User ID:</span>
              <span className="font-mono font-medium">{user?.id || 'Not loaded'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Telegram ID:</span>
              <span className="font-mono font-medium">{user?.telegramId || 'Not loaded'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Username:</span>
              <span className="font-medium">{user?.username || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Registration:</span>
              <span className="font-medium">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('ru-RU') : 'Not loaded'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Balance:</span>
              <span className="font-bold text-green-600 dark:text-green-400">
                {user?.balance || 'Not loaded'} coins
              </span>
            </div>
          </div>
        </div>

        {/* Init Data */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
          <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3 flex items-center">
            <span className="mr-2">📱</span>
            Init Data
          </h4>
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 text-xs font-mono overflow-x-auto">
            {initDataUser ? JSON.stringify(initDataUser, null, 2) : 'undefined'}
          </div>
        </div>

        {/* Raw Init Data */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-purple-100 dark:border-purple-800">
          <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-3 flex items-center">
            <span className="mr-2">🔧</span>
            Raw Init Data
          </h4>
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 text-xs font-mono break-all">
            {retrieveRawInitData() || 'Not available'}
          </div>
        </div>

        {/* Window Info */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
          <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center">
            <span className="mr-2">🌐</span>
            Window Info
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Location:</span>
              <span className="font-mono text-xs max-w-32 truncate">
                {typeof window !== 'undefined' ? window.location.href : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">User Agent:</span>
              <span className="font-mono text-xs max-w-32 truncate">
                {typeof window !== 'undefined' ? navigator.userAgent : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Log Button */}
        <Button
          onClick={() => {
            console.log('=== Debug Info ===');
            console.log('Database User:', user);
            console.log('Init Data User:', initDataUser);
            console.log('Raw Init Data:', retrieveRawInitData());
            console.log('Window Location:', window.location.href);
          }}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
          size="s"
        >
          📝 Log to Console
        </Button>
      </div>
    </div>
  );
}
