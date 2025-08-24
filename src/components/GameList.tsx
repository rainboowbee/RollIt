'use client';

import { Section, Cell, Button } from '@telegram-apps/telegram-ui';

interface GameListProps {
  onGameSelect: (gameId: string) => void;
  onShowUsers: () => void;
}

export default function GameList({ onGameSelect, onShowUsers }: GameListProps) {
  const games = [
    {
      id: 'roulette',
      name: '🎰 Рулетка',
      description: 'Делайте ставки и выигрывайте призы!',
      icon: '🎰'
    }
  ];

  return (
    <>
      <Section header="Доступные игры">
        {games.map((game) => (
          <Cell
            key={game.id}
            before={game.icon}
            subtitle={game.description}
            after={
              <Button
                onClick={() => onGameSelect(game.id)}
                size="s"
              >
                Играть
              </Button>
            }
          >
            {game.name}
          </Cell>
        ))}
      </Section>

      <Section header="Дополнительно">
        <Cell
          before="👥"
          subtitle="Посмотреть всех участников"
          after={
            <Button
              onClick={onShowUsers}
              size="s"
            >
              Открыть
            </Button>
          }
        >
          Список пользователей
        </Cell>
      </Section>
    </>
  );
}
