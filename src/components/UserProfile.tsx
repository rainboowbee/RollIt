'use client';

import Image from 'next/image';
import { User, Coins } from 'lucide-react';
import { formatBalance, getDisplayName } from '@/lib/utils';

interface UserProfileProps {
  user: {
    id: number;
    username?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    photoUrl?: string | null;
    balance: number;
  };
}

export default function UserProfile({ user }: UserProfileProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-4">
        <div className="relative">
          {user.photoUrl ? (
            <Image
              src={user.photoUrl}
              alt="Profile"
              width={64}
              height={64}
              className="rounded-full"
            />
          ) : (
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-gray-500 dark:text-gray-400" />
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {getDisplayName(user)}
          </h2>
          <div className="flex items-center space-x-2 mt-2">
            <Coins className="w-5 h-5 text-yellow-500" />
            <span className="text-lg font-medium text-gray-900 dark:text-white">
              {formatBalance(user.balance)} монет
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
