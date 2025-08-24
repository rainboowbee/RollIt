import { useState, useEffect, useCallback, useRef } from 'react';
import { Game } from '@/lib/types';

interface GameUpdate {
  type: 'connected' | 'game_update' | 'error';
  gameId?: string;
  game?: Game;
  message?: string;
  timestamp: number;
}

interface UseGameUpdatesOptions {
  gameId: number;
  onUpdate?: (update: GameUpdate) => void;
  onError?: (error: string) => void;
  enabled?: boolean;
}

export function useGameUpdates({ 
  gameId, 
  onUpdate, 
  onError, 
  enabled = true 
}: UseGameUpdatesOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<GameUpdate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const connect = useCallback(() => {
    if (!enabled || !gameId) return;

    try {
      // Закрываем предыдущее соединение если есть
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      // Создаем новое SSE соединение
      const eventSource = new EventSource(`/api/game/updates?gameId=${gameId}`);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('SSE connection opened');
        setIsConnected(true);
        setError(null);
      };

      eventSource.onmessage = (event) => {
        try {
          const data: GameUpdate = JSON.parse(event.data);
          console.log('Game update received:', data);
          
          setLastUpdate(data);
          onUpdate?.(data);
        } catch (parseError) {
          console.error('Error parsing SSE data:', parseError);
          setError('Failed to parse update data');
        }
      };

      eventSource.onerror = (event) => {
        console.error('SSE connection error:', event);
        setIsConnected(false);
        setError('Connection error');
        onError?.('Connection error');
      };

      eventSource.addEventListener('error', (event) => {
        console.error('SSE error event:', event);
        setError('SSE error');
        onError?.('SSE error');
      });

    } catch (err) {
      console.error('Failed to create SSE connection:', err);
      setError('Failed to connect');
      onError?.('Failed to connect');
    }
  }, [gameId, enabled, onUpdate, onError]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsConnected(false);
    }
  }, []);

  // Автоматическое подключение при изменении gameId или enabled
  useEffect(() => {
    if (enabled && gameId) {
      connect();
    } else {
      disconnect();
    }

    // Очистка при размонтировании
    return () => {
      disconnect();
    };
  }, [gameId, enabled, connect, disconnect]);

  // Переподключение при ошибке
  useEffect(() => {
    if (error && enabled) {
      const timer = setTimeout(() => {
        console.log('Attempting to reconnect...');
        connect();
      }, 5000); // Переподключение через 5 секунд

      return () => clearTimeout(timer);
    }
  }, [error, enabled, connect]);

  return {
    isConnected,
    lastUpdate,
    error,
    connect,
    disconnect,
    // Удобные геттеры для данных игры
    game: lastUpdate?.type === 'game_update' ? lastUpdate.game : null,
    gameStatus: lastUpdate?.type === 'game_update' ? lastUpdate.game?.status : null,
    totalPool: lastUpdate?.type === 'game_update' ? lastUpdate.game?.totalPool : 0,
    bets: lastUpdate?.type === 'game_update' ? lastUpdate.game?.bets : [],
    timeUntilStart: lastUpdate?.type === 'game_update' ? lastUpdate.game?.timeUntilStart : 0,
  };
}
