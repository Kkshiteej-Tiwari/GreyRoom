/**
 * Mini Games Component
 * 
 * Provides entertainment while waiting for match.
 * Uses open source games that open in popup windows.
 * All games are MIT/Apache/GPL licensed.
 */

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

// Open source browser games with their GitHub repos
const games = [
  {
    id: '2048',
    name: '2048',
    description: 'Slide tiles puzzle',
    icon: '🔢',
    url: 'https://gabrielecirulli.github.io/2048/',
    color: 'bg-amber-500',
    license: 'MIT',
  },
  {
    id: 'hextris',
    name: 'Hextris',
    description: 'Hexagon Tetris',
    icon: '⬡',
    url: 'https://hextris.github.io/hextris/',
    color: 'bg-purple-500',
    license: 'GPL-3.0',
  },
  {
    id: 'dino',
    name: 'T-Rex Run',
    description: 'Chrome Dino game',
    icon: '🦖',
    url: 'https://chromedino.com/',
    color: 'bg-gray-600',
    license: 'Free',
  },
  {
    id: 'flappy',
    name: 'Floppy Bird',
    description: 'Flappy Bird clone',
    icon: '🐦',
    url: 'https://nebezb.com/floppybird/',
    color: 'bg-green-500',
    license: 'Apache-2.0',
  },
  {
    id: 'snake',
    name: 'Snake',
    description: 'Classic snake game',
    icon: '🐍',
    url: 'https://playsnake.org/',
    color: 'bg-yellow-500',
    license: 'Open Source',
  },
  {
    id: 'breakout',
    name: 'Breakout',
    description: 'Brick breaker',
    icon: '🧱',
    url: 'https://breakout.enclavegames.com/lesson10.html',
    color: 'bg-blue-500',
    license: 'Open Source',
  },
];

export default function MiniGames() {
  const gameWindowsRef = useRef([]);

  // Clean up: close all game windows when component unmounts (match found)
  useEffect(() => {
    return () => {
      gameWindowsRef.current.forEach(window => {
        if (window && !window.closed) {
          window.close();
        }
      });
      gameWindowsRef.current = [];
    };
  }, []);

  // Open game in a popup window
  const openGame = (game) => {
    const width = 500;
    const height = 600;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    
    const gameWindow = window.open(
      game.url,
      game.name,
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );

    // Track the opened window
    if (gameWindow) {
      gameWindowsRef.current.push(gameWindow);
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-grey-100">
      <h3 className="text-sm font-semibold text-grey-700 mb-3">🎮 Play while you wait</h3>
      <p className="text-xs text-grey-500 mb-4">Open source games • Opens in new window</p>
      
      {/* Games Grid */}
      <div className="grid grid-cols-3 gap-2">
        {games.map((game) => (
          <motion.button
            key={game.id}
            onClick={() => openGame(game)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center p-3 rounded-xl bg-grey-50 hover:bg-grey-100 transition-colors"
          >
            <div className={`w-10 h-10 ${game.color} rounded-lg flex items-center justify-center text-xl mb-2`}>
              {game.icon}
            </div>
            <span className="text-xs font-medium text-grey-700">{game.name}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
