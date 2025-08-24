'use client';

import { Cell, Avatar } from '@telegram-apps/telegram-ui';

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
  const displayName = user.username || user.firstName || `User ${user.id}`;
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || displayName;

  return (
    <Cell
      before={
        <Avatar
          src={user.photoUrl || undefined}
          size={48}
        />
      }
      subtitle={`Баланс: ${user.balance} монет`}
    >
      {fullName}
    </Cell>
  );
}
