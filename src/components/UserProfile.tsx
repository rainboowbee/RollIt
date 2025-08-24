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
      {/* Header с профилем */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-cyan-400/30 shadow-lg shadow-cyan-400/20">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-white mb-2">
            {displayName}
          </h3>
          {user.username && (
            <p className="text-cyan-300 text-lg font-medium">
              @{user.username}
            </p>
          )}
        </div>
      </div>

      {/* Балансы */}
      <div className="grid grid-cols-2 gap-4">
        {/* Баланс звезд */}
        <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-md rounded-2xl p-6 border border-cyan-400/50 shadow-lg shadow-cyan-400/20">
          <div className="text-center">
            <div className="text-4xl mb-3">⭐</div>
            <h4 className="text-lg font-semibold text-cyan-200 mb-2">Баланс</h4>
            <div className="text-3xl font-bold text-white mb-1">
              {user.balance.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Roll Point */}
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-md rounded-2xl p-6 border border-purple-400/50 shadow-lg shadow-purple-400/20">
          <div className="text-center">
            <div className="text-4xl mb-3">🎯</div>
            <h4 className="text-lg font-semibold text-purple-200 mb-2">RollPoint</h4>
            <div className="text-3xl font-bold text-white mb-1">
              {(user.balance * 1.254).toFixed(0)}
            </div>
          </div>
        </div>
      </div>

      {/* Дополнительная информация */}
      <div className="bg-gradient-to-r from-slate-600/20 to-slate-700/20 backdrop-blur-md rounded-2xl p-6 border border-slate-400/30">
        <div className="grid grid-cols-2 gap-6 text-center">
          <div>
            <p className="text-slate-400 text-sm mb-1">Telegram ID</p>
            <p className="font-mono text-slate-200 font-medium">{user.telegramId}</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm mb-1">ID в системе</p>
            <p className="font-mono text-slate-200 font-medium">#{user.id}</p>
          </div>
        </div>
      </div>

      {/* Кнопка главное меню */}
      <button
        onClick={onBack}
        className="w-full bg-gradient-to-r from-slate-600/50 to-slate-700/50 hover:from-slate-500/50 hover:to-slate-600/50 backdrop-blur-md rounded-2xl p-4 border border-slate-400/30 text-white font-semibold text-lg transition-all duration-200 hover:shadow-lg hover:shadow-slate-400/20 hover:scale-105"
      >
        Главное меню
      </button>
    </div>
  );
}
