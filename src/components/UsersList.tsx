'use client';

import { useState, useEffect } from 'react';
import { Section, Cell, Button, Avatar } from '@telegram-apps/telegram-ui';

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

interface UsersListProps {
  onBack: () => void;
}

export default function UsersList({ onBack }: UsersListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');
        if (!response.ok) {
          throw new Error('Не удалось загрузить пользователей');
        }
        const data = await response.json();
        setUsers(data.users);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600 dark:text-gray-400">Загрузка пользователей...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 text-4xl mb-2">⚠️</div>
        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
        <Button onClick={onBack} size="s">
          ← Назад
        </Button>
      </div>
    );
  }

  return (
    <div>
      <Section header="Список пользователей">
        <Button onClick={onBack} className="mb-4" size="s">
          ← Назад
        </Button>
      </Section>

      <Section header={`Всего пользователей: ${users.length}`}>
        {users.map((user) => (
          <Cell
            key={user.id}
            before={
              <Avatar
                size={40}
                src={user.photoUrl || undefined}
                fallbackName={user.firstName || user.username || 'U'}
              />
            }
            subtitle={
              <div className="flex flex-col gap-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  ID: {user.telegramId}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Баланс: {user.balance} монет
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-500">
                  Регистрация: {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                </span>
              </div>
            }
          >
            <div className="flex flex-col">
              <span className="font-medium">
                {user.firstName} {user.lastName}
              </span>
              {user.username && (
                <span className="text-sm text-blue-600 dark:text-blue-400">
                  @{user.username}
                </span>
              )}
            </div>
          </Cell>
        ))}
      </Section>
    </div>
  );
}
