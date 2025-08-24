'use client';

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
  onBack: () => void;
}

export default function UserProfile({ user, onBack }: UserProfileProps) {
  const displayName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Пользователь';
  
  return (
    <div className="space-y-6">
      {/* Балансы */}
      <div className="grid grid-cols-2 gap-4">
        {/* Баланс звезд */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="text-center">
            <h4 className="text-sm font-medium text-gray-600 mb-3">Баланс</h4>
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {user.balance.toLocaleString()}
            </div>
            <div className="text-2xl">⭐</div>
          </div>
        </div>

        {/* Roll Point */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="text-center">
            <h4 className="text-sm font-medium text-gray-600 mb-3">RollPoint</h4>
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {(user.balance * 1.254).toFixed(0)}
            </div>
            <div className="text-2xl">🎯</div>
          </div>
        </div>
      </div>

      {/* Кнопка главное меню */}
      <button
        onClick={onBack}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg rounded-xl p-4 transition-colors duration-200"
      >
        Главное меню
      </button>
    </div>
  );
}
