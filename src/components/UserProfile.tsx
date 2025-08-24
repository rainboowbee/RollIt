'use client';

import { Avatar } from '@telegram-apps/telegram-ui';

interface User {
  id: number;
  telegramId: string;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  photoUrl?: string | null;
  balance: number;
}

interface UserProfileProps {
  user: User;
}

export default function UserProfile({ user }: UserProfileProps) {
  const displayName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Пользователь';
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
      <div className="flex items-center space-x-4">
        {/* Аватар с красивой рамкой */}
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 p-0.5">
            <Avatar
              size={40}
              src={user.photoUrl || undefined}
              className="w-full h-full rounded-full"
            />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </div>

        {/* Информация о пользователе */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
            {displayName}
          </h3>
          {user.username && (
            <p className="text-blue-600 dark:text-blue-400 text-sm font-medium mb-2">
              @{user.username}
            </p>
          )}
          
          {/* Баланс с красивым дизайном */}
          <div className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-full">
            <span className="text-green-600 dark:text-green-400 font-bold text-lg">
              {user.balance.toLocaleString()}
            </span>
            <span className="text-green-500 dark:text-green-400 text-sm ml-1">
              монет
            </span>
          </div>
        </div>
      </div>

      {/* Дополнительная информация */}
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400">Telegram ID</p>
            <p className="font-mono text-gray-700 dark:text-gray-300">{user.telegramId}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400">ID в системе</p>
            <p className="font-mono text-gray-700 dark:text-gray-300">#{user.id}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
