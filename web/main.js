import {
  GameController,
  SUIT_COUNT,
  SUIT_EMOJIS,
  formatDailyDate,
  getEndlessBestLevel,
} from './dist/index.js';
let controller = null;
let timerInterval = null;

/** 扑克式层叠：上层压住下层 3/4，仅露出 1/4 */
const CARD_HEIGHT = 68;
const CARD_OVERLAP = 0.75;
const CARD_STEP = Math.round(CARD_HEIGHT * (1 - CARD_OVERLAP));

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function showScreen(id) {
  $$('.screen').forEach((s) => s.classList.remove('active'));
  $(`#screen-${id}`)?.classList.add('active');
}

function showModal(id) {
  $(`#modal-${id}`)?.classList.remove('hidden');
}

function hideModal(id) {
  $(`#modal-${id}`)?.classList.add('hidden');
}

function initMenu() {
  const stats = $('#menu-stats');
  const dailyDate = formatDailyDate();
  const best = getEndlessBestLevel();
  stats.innerHTML = `
    <div>📅 今日挑战：${dailyDate}</div>
    <div>♾️ 无尽最高关：${best}</div>
  `;

  $('#btn-daily').onclick = () => {
    startGame('daily');
  };

  $('#btn-endless').onclick = () => {
    startGame('endless');
  };
}

function startGame(mode) {
  // 随机选一个花色作为默认（不再让用户选择）
  const defaultSuit = Math.floor(Math.random() * SUIT_COUNT);

  controller =
    mode === 'daily'
      ? GameController.createDaily(defaultSuit)
      : GameController.createEndless(1, defaultSuit);

  $('#game-mode-label').textContent =
    mode === 'daily' ? '📅 每日挑战' : `♾️ 无尽 第${controller.level}关`;

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
  if (event.type === 'matched') {
    renderGame();
  }
  renderGame();
}

function renderGame() {
  if (!controller) return;
  const state = controller.game.getState();
  const maxSlots = controller.game.getEffectiveMaxSlots();
  const peekActive = controller.game.isPeekActive();

  $('#game-moves').textContent = `步数: ${state.moves}`;
  $('#slot-count').textContent = `${state.slots.length}/${maxSlots}`;

  // 列（扑克式层叠）
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

      // 从上往下拿：顶部牌（index 最后）最先拿，放在视觉最顶层
      // 顶部牌：bottom 值最高，z-index 最高 → 可见且可点击
      const displayDepth = layer;
      const EXTRA_PEEK_GAP = 15; // 透视时额外增加的间隔
      
      // 透视技能：拉大顶部牌和下面两张牌之间的间隔
      let bottomOffset = displayDepth * CARD_STEP;
      if (isPeek && !isTop) {
        // 透视的卡片（第二、三张）增加额外间隔
        bottomOffset += EXTRA_PEEK_GAP;
      }
      el.style.bottom = `${bottomOffset}px`;
      el.style.zIndex = String(displayDepth);

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

  // 待用区
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
    const empty = document.createElement('div');
    empty.className = 'card';
    empty.style.opacity = '0.2';
    holdEl.appendChild(empty);
  }

  // 卡槽
  const slotsEl = $('#slots');
  slotsEl.innerHTML = '';
  slotsEl.classList.toggle('full', state.slots.length >= maxSlots);
  state.slots.forEach((card, idx) => {
    const el = createCardEl(card, true);
    slotsEl.appendChild(el);
  });

  for (let i = state.slots.length; i < maxSlots; i++) {
    const empty = document.createElement('div');
    empty.className = 'card';
    empty.style.opacity = '0.15';
    slotsEl.appendChild(empty);
  }
}

function createCardEl(card, showFace, extraClass = '') {
  const el = document.createElement('div');
  el.className = `card ${extraClass}`.trim();
  el.textContent = showFace ? SUIT_EMOJIS[card.suit] : '';
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
  const backMenu = $('#btn-back-menu');
  if (backMenu) backMenu.onclick = () => showScreen('menu');

  const btnReviveVideo = $('#btn-revive-video');
  if (btnReviveVideo) {
    btnReviveVideo.onclick = async () => {
      const ok = await controller.reviveWithVideo();
      if (ok) {
        hideModal('revive');
        renderGame();
      }
    };
  }

  const btnReviveShare = $('#btn-revive-share');
  if (btnReviveShare) {
    btnReviveShare.onclick = async () => {
      const ok = await controller.reviveWithShare();
      if (ok) {
        hideModal('revive');
        renderGame();
      }
    };
  }

  const btnReviveGiveup = $('#btn-revive-giveup');
  if (btnReviveGiveup) {
    btnReviveGiveup.onclick = () => {
      hideModal('revive');
      showResult(false);
    };
  }

  const btnResultHome = $('#btn-result-home');
  if (btnResultHome) {
    btnResultHome.onclick = () => {
      controller = null;
      showScreen('menu');
      initMenu();
    };
  }

  const btnResultDouble = $('#btn-result-double');
  if (btnResultDouble) {
    btnResultDouble.onclick = () => {
      controller.ads.showRewardedForDoubleScore((success) => {
        if (success) {
          const content = $('#result-content .score');
          const current = parseInt(content.textContent, 10);
          content.textContent = `${current * 2} 分（双倍）`;
          $('#btn-result-double').classList.add('hidden');
        }
      });
    };
  }
}

initMenu();
initEvents();
