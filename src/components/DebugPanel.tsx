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
  const [isExpanded, setIsExpanded] = useState(false);
  const initDataUser = useSignal(initData.user);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  if (!isExpanded) {
    return (
      <button
        onClick={toggleExpanded}
        className="fixed bottom-4 left-4 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-2 text-sm font-medium shadow-lg transition-colors duration-200"
      >
        Debug
      </button>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
      <div className="container mx-auto px-4 py-3 max-w-md">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Debug Panel</h3>
          <button
            onClick={toggleExpanded}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            {isExpanded ? 'Свернуть' : 'Развернуть'}
          </button>
        </div>
        
        {isExpanded && (
          <div className="space-y-3 text-xs">
            {/* Database User */}
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-2">Database User</h4>
              <div className="space-y-1 text-gray-600">
                <div>ID: {user?.id || 'N/A'}</div>
                <div>Username: {user?.username || 'N/A'}</div>
                <div>Created: {user?.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'}</div>
              </div>
            </div>

            {/* Init Data */}
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-2">Init Data</h4>
              <div className="space-y-1 text-gray-600">
                <div>User ID: {initDataUser?.id || 'N/A'}</div>
                <div>Username: {initDataUser?.username || 'N/A'}</div>
                <div>First Name: {initDataUser?.first_name || 'N/A'}</div>
                <div>Last Name: {initDataUser?.last_name || 'N/A'}</div>
              </div>
            </div>

            {/* Raw Init Data */}
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-2">Raw Init Data</h4>
              <div className="text-gray-600 break-all">
                {retrieveRawInitData() || 'N/A'}
              </div>
            </div>

            {/* Window Info */}
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-2">Window Info</h4>
              <div className="space-y-1 text-gray-600">
                <div>Location: {typeof window !== 'undefined' ? window.location.href : 'N/A'}</div>
                <div>User Agent: {typeof window !== 'undefined' ? window.navigator.userAgent : 'N/A'}</div>
              </div>
            </div>

            {/* Log to Console Button */}
            <button
              onClick={() => {
                console.log('=== Debug Info ===');
                console.log('Database User:', user);
                console.log('Init Data User:', initDataUser);
                console.log('Raw Init Data:', retrieveRawInitData());
                console.log('Window Location:', window.location.href);
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200"
            >
              Log to Console
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
