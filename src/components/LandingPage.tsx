'use client';

import { motion } from 'framer-motion';
import { Gamepad2, Users, Zap, Star } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="inline-block mb-6"
          >
            <Gamepad2 className="w-20 h-20 text-blue-600 dark:text-blue-400 mx-auto" />
          </motion.div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Скоро открытие
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              🎉
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Увлекательная мини-игра в рулетку прямо в Telegram! Делайте ставки, 
            соревнуйтесь с друзьями и выигрывайте призы.
          </p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid md:grid-cols-3 gap-8 mb-16"
        >
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Мультиплеер
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Играйте с друзьями и другими пользователями в реальном времени
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Быстрые игры
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Каждая игра длится всего несколько минут, идеально для коротких перерывов
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Справедливые шансы
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Чем больше ставка, тем выше шанс на победу. Система работает на блокчейне
            </p>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700 max-w-md mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Готовы начать?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Откройте приложение в Telegram и начните играть прямо сейчас!
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Бесплатная регистрация</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>1000 монет в подарок</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Мгновенный старт</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-16 text-gray-500 dark:text-gray-400"
        >
          <p>&copy; 2024 RollIt. Все права защищены.</p>
        </motion.div>
      </div>
    </div>
  );
}
