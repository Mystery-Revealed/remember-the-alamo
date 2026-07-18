// games/index.js — registry of playable games. GameManager looks games up here,
// keeping the engine reusable across Texas History units.

import rememberTheAlamo from './rememberTheAlamo.js';

export const GAMES = {
  [rememberTheAlamo.id]: rememberTheAlamo,
};

export function getGame(id) {
  return GAMES[id] || null;
}
