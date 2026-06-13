import {
  GameController,
  SUIT_COUNT,
  formatDailyDate,
  getEndlessBestLevel,
} from './dist/index.js';
import {
  ASSETS,
  SUIT_COLORS,
  SUIT_EMOJIS as MANIFEST_EMOJIS,
  getCardImage,
  resolveAsset,
  resolveIcon,
} from './assets/manifest.js';

let controller = null;
let timerInterval = null;

const CARD_HEIGHT = 70;
const CARD_OVERLAP = 0.75;
const CARD_STEP = Math.round(CARD_HEIGHT * (1 - CARD_OVERLAP));

const $ = (sel) => document.querySelector(sel);

function showScreen(id) {
  document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
  $(`#screen-${id}`)?.classList.add('active');
}

function showModal(id) {
  $(`#modal-${id}`)?.classList.remove('hidden');
}

function hideModal(id) {
  $(`#modal-${id}`)?.classList.add('hidden');
}

async function applyBackgrounds() {
  const menuBg = await resolveAsset(ASSETS.bg.menu);
  const gameBg = await resolveAsset(ASSETS.bg.game);
  if (menuBg) {
    document.documentElement.style.setProperty('--menu-bg', `url('${menuBg}')`);
    document.body.classList.add('has-bg-menu');
  }
  if (gameBg) {
    document.documentElement.style.setProperty('--game-bg', `url('${gameBg}')`);
    document.body.classList.add('has-bg-game');
  }
}

async function applyIcons() {
  const mapping = [
    ['btn-settings', 'settings'],
    ['btn-rules', 'rules'],
    ['btn-pause', 'pause'],
  ];
  for (const [id, key] of mapping) {
    const path = await resolveIcon(key);
    if (!path) continue;
    const btn = $(`#${id}`);
    if (!btn) continue;
    btn.innerHTML = `<img src="${path}" alt="" />`;
  }
}

function initMenu() {
  const stats = $('#menu-stats');
  const dailyDate = formatDailyDate();
  const best = getEndlessBestLevel();
  stats.innerHTML = `
    <div>📅 今日挑战：${dailyDate}</div>
    <div>♾️ 无尽最高关：${best}</div>
  `;

  const pets = ['🐱', '🐶', '🐰', '🐻', '🦊'];
  const hero = $('#hero-pet');
  if (hero) {
    let i = 0;
    setInterval(() => {
      i = (i + 1) % pets.length;
      hero.textContent = pets[i];
    }, 2800);
  }

  $('#btn-start')?.addEventListener('click', () => {
    $('#mode-picker')?.classList.remove('hidden');
  });

  $('#btn-daily')?.addEventListener('click', () => {
    $('#mode-picker')?.classList.add('hidden');
    startGame('daily');
  });

  $('#btn-endless')?.addEventListener('click', () => {
    $('#mode-picker')?.classList.add('hidden');
    startGame('endless');
  });

  $('#btn-rules')?.addEventListener('click', () => showModal('rules'));
  $('#btn-rules-close')?.addEventListener('click', () => hideModal('rules'));

  $('#btn-settings')?.addEventListener('click', () => {
    alert('设置功能开发中（音效/音乐）');
  });

  $('#btn-rank')?.addEventListener('click', () => {
    alert('排行榜功能开发中');
  });

  $('#btn-collection')?.addEventListener('click', () => {
    alert('收集册功能开发中');
  });

  $('#mode-picker')?.addEventListener('click', (e) => {
    if (e.target.id === 'mode-picker') {
      $('#mode-picker').classList.add('hidden');
    }
  });
}

function startGame(mode) {
  const defaultSuit = Math.floor(Math.random() * SUIT_COUNT);
  controller =
    mode === 'daily'
      ? GameController.createDaily(defaultSuit)
      : GameController.createEndless(1, defaultSuit);

  controller.game.on(handleGameEvent);
  showScreen('game');
  renderGame();
  startTimer();
}

function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (!controller) return;
    const ms = controller.game.getElapsedMs();
    const sec = Math.floor(ms / 1000);
    const min = Math.floor(sec / 60);
    $('#game-timer').textContent = `${String(min).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
  }, 1000);
}

function handleGameEvent(event) {
  if (event.type === 'lost') {
    setTimeout(() => showModal('revive'), 300);
  }
  if (event.type === 'won') {
    setTimeout(() => showResult(true), 500);
  }
  renderGame();
}

function renderGame() {
  if (!controller) return;
  const state = controller.game.getState();
  const maxSlots = controller.game.getEffectiveMaxSlots();
  const peekActive = controller.game.isPeekActive();

  $('#slot-count').textContent = `${state.slots.length}/${maxSlots}`;

  const columnsEl = $('#columns');
  columnsEl.innerHTML = '';
  state.columns.forEach((col, colIdx) => {
    const colEl = document.createElement('div');
    colEl.className = 'column';

    if (col.length === 0) {
      columnsEl.appendChild(colEl);
      return;
    }

    const stackHeight = CARD_HEIGHT + (col.length - 1) * CARD_STEP;
    colEl.style.height = `${stackHeight}px`;

    const peekIds = new Set(
      peekActive ? controller.game.getPeekCards(colIdx).map((c) => c.id) : [],
    );

    col.forEach((card, layer) => {
      const isTop = layer === col.length - 1;
      const isPeek = peekIds.has(card.id);
      const showFace = isTop || isPeek;
      const extraClass = isPeek && !isTop ? 'peek-preview' : '';

      const el = createCardEl(card, showFace, extraClass);
      if (!showFace) el.classList.add('back');

      let bottomOffset = layer * CARD_STEP;
      if (isPeek && !isTop) bottomOffset += 15;
      el.style.bottom = `${bottomOffset}px`;
      el.style.zIndex = String(layer);

      if (isTop) {
        el.classList.add('clickable');
        el.onclick = () => {
          controller.pickColumn(colIdx);
          renderGame();
        };
      }

      colEl.appendChild(el);
    });

    columnsEl.appendChild(colEl);
  });

  const holdEl = $('#hold-area');
  holdEl.innerHTML = '';
  state.holdArea.forEach((card, idx) => {
    const el = createCardEl(card, true);
    el.classList.add('clickable');
    el.onclick = () => {
      controller.pickHold(idx);
      renderGame();
    };
    holdEl.appendChild(el);
  });
  for (let i = state.holdArea.length; i < 3; i++) {
    holdEl.appendChild(createEmptySlot());
  }

  const slotsEl = $('#slots');
  slotsEl.innerHTML = '';
  slotsEl.classList.toggle('full', state.slots.length >= maxSlots);
  state.slots.forEach((card) => {
    slotsEl.appendChild(createCardEl(card, true));
  });
  for (let i = state.slots.length; i < maxSlots; i++) {
    slotsEl.appendChild(createEmptySlot());
  }
}

function createEmptySlot() {
  const empty = document.createElement('div');
  empty.className = 'card';
  empty.style.opacity = '0.25';
  empty.style.background = 'rgba(255,255,255,0.3)';
  return empty;
}

function createCardEl(card, showFace, extraClass = '') {
  const el = document.createElement('div');
  el.className = `card ${extraClass}`.trim();

  if (showFace) {
    el.style.background = SUIT_COLORS[card.suit] ?? '#fff';
    const imgPath = getCardImage(card.suit);
    if (imgPath) {
      const img = document.createElement('img');
      img.src = imgPath;
      img.alt = '';
      img.onerror = () => {
        img.remove();
        el.textContent = MANIFEST_EMOJIS[card.suit] ?? '?';
      };
      el.appendChild(img);
    } else {
      el.textContent = MANIFEST_EMOJIS[card.suit] ?? '?';
    }
  }

  return el;
}

function showResult(won) {
  clearInterval(timerInterval);
  const result = controller.finishSession();
  showScreen('result');

  const content = $('#result-content');
  content.innerHTML = `
    <div class="emoji">${won ? '🎉' : '😿'}</div>
    <h2>${won ? '恭喜过关！' : '游戏失败'}</h2>
    <div class="score">${result.score} 分</div>
    <div class="detail">
      步数：${result.moves}<br/>
      用时：${Math.floor(result.timeMs / 1000)} 秒<br/>
      技能：${result.skillUses} 次
    </div>
  `;

  $('#btn-result-retry').classList.toggle('hidden', !won || result.mode !== 'endless');
  $('#btn-result-double').classList.toggle('hidden', result.mode !== 'daily' || !won);

  if (won && result.mode === 'endless') {
    $('#btn-result-retry').onclick = () => {
      controller = controller.nextEndlessLevel();
      controller.game.on(handleGameEvent);
      showScreen('game');
      renderGame();
      startTimer();
    };
  }
}

function initEvents() {
  $('#btn-pause')?.addEventListener('click', () => showModal('pause'));
  $('#btn-resume')?.addEventListener('click', () => hideModal('pause'));
  $('#btn-quit')?.addEventListener('click', () => {
    hideModal('pause');
    controller = null;
    clearInterval(timerInterval);
    showScreen('menu');
    initMenu();
  });

  $('#btn-revive-video')?.addEventListener('click', async () => {
    const ok = await controller.reviveWithVideo();
    if (ok) {
      hideModal('revive');
      renderGame();
    }
  });

  $('#btn-revive-share')?.addEventListener('click', async () => {
    const ok = await controller.reviveWithShare();
    if (ok) {
      hideModal('revive');
      renderGame();
    }
  });

  $('#btn-revive-giveup')?.addEventListener('click', () => {
    hideModal('revive');
    showResult(false);
  });

  $('#btn-result-home')?.addEventListener('click', () => {
    controller = null;
    showScreen('menu');
    initMenu();
  });

  $('#btn-result-double')?.addEventListener('click', () => {
    controller.ads.showRewardedForDoubleScore((success) => {
      if (success) {
        const content = $('#result-content .score');
        const current = parseInt(content.textContent, 10);
        content.textContent = `${current * 2} 分（双倍）`;
        $('#btn-result-double').classList.add('hidden');
      }
    });
  });

  $('#btn-skill-move')?.addEventListener('click', () => {
    alert('移出技能：开发中，请在对局逻辑接入 SkillManager');
  });
  $('#btn-skill-match')?.addEventListener('click', () => {
    alert('凑齐技能：开发中');
  });
  $('#btn-skill-shuffle')?.addEventListener('click', () => {
    if (controller?.skills?.shuffle) {
      controller.skills.shuffle();
      renderGame();
    } else {
      alert('洗牌技能：开发中');
    }
  });
}

async function boot() {
  await applyBackgrounds();
  await applyIcons();
  initMenu();
  initEvents();
}

boot();
