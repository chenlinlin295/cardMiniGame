/** 素材路径映射 — 生成后放到 web/assets/ 对应目录 */
export const ASSETS = {
  bg: {
    menu: 'assets/bg/menu.jpg',
    game: 'assets/bg/game.jpg',
  },
  icons: {
    settings: 'assets/icons/icon_settings.png',
    rules: 'assets/icons/icon_rules.png',
    pause: 'assets/icons/icon_pause.png',
    rank: 'assets/icons/icon_rank.png',
    collection: 'assets/icons/icon_collection.png',
    skillMove: 'assets/icons/icon_skill_move.png',
    skillMatch: 'assets/icons/icon_skill_match.png',
    skillShuffle: 'assets/icons/icon_skill_shuffle.png',
  },
  buttons: {
    start: 'assets/buttons/btn_start_game.png',
  },
  cards: {
    back: 'assets/cards/card_back.png',
    cat: 'assets/cards/card_cat.png',
    dog: 'assets/cards/card_dog.png',
    rabbit: 'assets/cards/card_rabbit.png',
    bear: 'assets/cards/card_bear.png',
    fox: 'assets/cards/card_fox.png',
    panda: 'assets/cards/card_panda.png',
    koala: 'assets/cards/card_koala.png',
    pig: 'assets/cards/card_pig.png',
    frog: 'assets/cards/card_frog.png',
    penguin: 'assets/cards/card_penguin.png',
  },
  slots: {
    collect: 'assets/slots/slot_collect.png',
    hold: 'assets/slots/slot_hold.png',
  },
};

/** 与 types.ts Suit 枚举顺序一致 */
export const SUIT_KEYS = [
  'cat', 'dog', 'rabbit', 'bear', 'fox',
  'panda', 'koala', 'pig', 'frog', 'penguin',
];

export const SUIT_COLORS = [
  '#FFE8F0', '#FFE4C8', '#FFD6E8', '#E8D4C0', '#FFD0A8',
  '#E8E8F0', '#D8E4F0', '#FFD0DC', '#C8F0D0', '#C8E8FF',
];

export const SUIT_EMOJIS = ['🐱', '🐶', '🐰', '🐻', '🦊', '🐼', '🐨', '🐷', '🐸', '🐧'];

const cache = new Map();

export function getCardImage(suit) {
  const key = SUIT_KEYS[suit];
  return ASSETS.cards[key] ?? null;
}

export async function resolveAsset(path) {
  if (!path) return null;
  if (cache.has(path)) return cache.get(path);
  const ok = await new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = path;
  });
  const result = ok ? path : null;
  cache.set(path, result);
  return result;
}

export async function resolveIcon(name) {
  return resolveAsset(ASSETS.icons[name]);
}
