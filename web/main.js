import {
  GameController,
  SkillType,
  SUIT_COUNT,
  SUIT_EMOJIS,
  SUIT_NAMES,
  SKILL_INFO,
  formatDailyDate,
  getEndlessBestLevel,
} from './dist/index.js';

/** @typedef {import('./dist/core/types.js').Suit} Suit */

let controller = null;
let pendingMode = 'daily';
/** @type {number|null} */
let selectedSuit = null;
/** @type {number|null} */
let wildSlotForSkill = null;
/** @type {number[]} */
let takeSelectedIndices = [];
let timerInterval = null;

/** 扑克式层叠：上层压住下层 3/4，仅露出 1/4 */
const CARD_HEIGHT = 58;
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
    pendingMode = 'daily';
    renderSuitPicker();
    showScreen('lucky');
  };

  $('#btn-endless').onclick = () => {
    pendingMode = 'endless';
    renderSuitPicker();
    showScreen('lucky');
  };
}

function renderSuitPicker() {
  const picker = $('#suit-picker');
  picker.innerHTML = '';
  selectedSuit = null;
  $('#btn-start').disabled = true;
  $('.hint').textContent = '请选择幸运花色（该花色的牌可手动激活为万能牌）';

  for (let s = 0; s < SUIT_COUNT; s++) {
    const btn = document.createElement('button');
    btn.className = 'suit-option' + (selectedSuit === s ? ' selected' : '');
    btn.innerHTML = `${SUIT_EMOJIS[s]}<span>${SUIT_NAMES[s]}</span>`;
    btn.onclick = () => {
      selectedSuit = s;
      $$('.suit-option').forEach((el, i) => {
        el.classList.toggle('selected', i === s);
      });
      $('#btn-start').disabled = false;
    };
    picker.appendChild(btn);
  }
}

function startGame() {
  if (selectedSuit === null) return;

  controller =
    pendingMode === 'daily'
      ? GameController.createDaily(selectedSuit)
      : GameController.createEndless(1, selectedSuit);

  $('#game-mode-label').textContent =
    pendingMode === 'daily' ? '📅 每日挑战' : `♾️ 无尽 第${controller.level}关`;

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

      const el = createCardEl(
        card,
        showFace,
        extraClass,
        isTop && card.isWild && !card.skillConsumed,
        isTop && controller.isLuckyCard(card),
      );

      if (!showFace) el.classList.add('back');

      el.style.bottom = `${layer * CARD_STEP}px`;
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
    const isLucky = controller.isLuckyCard(card);
    const el = createCardEl(card, true, '', card.isWild && !card.skillConsumed, isLucky);
    if (isLucky) {
      el.classList.add('clickable');
      el.onclick = () => openLuckyModal(idx);
    }
    slotsEl.appendChild(el);
  });

  for (let i = state.slots.length; i < maxSlots; i++) {
    const empty = document.createElement('div');
    empty.className = 'card';
    empty.style.opacity = '0.15';
    slotsEl.appendChild(empty);
  }
}

function createCardEl(card, showFace, extraClass = '', isWild = false, isLucky = false) {
  const el = document.createElement('div');
  el.className = `card ${extraClass} ${isWild ? 'wild' : ''} ${isLucky ? 'lucky' : ''}`.trim();
  el.textContent = showFace ? SUIT_EMOJIS[card.suit] : '';
  return el;
}

function openLuckyModal(slotIndex) {
  wildSlotForSkill = slotIndex;
  const wildList = $('#wild-match-list');
  const skillList = $('#skill-list-lucky');
  wildList.innerHTML = '';
  skillList.innerHTML = '';

  const options = controller.getManualWildOptions(slotIndex);
  if (options.length > 0) {
    const title = document.createElement('p');
    title.className = 'hint';
    title.textContent = '用作万能牌消除：';
    wildList.appendChild(title);

    options.forEach((suit) => {
      const item = document.createElement('div');
      item.className = 'skill-item';
      item.innerHTML = `
        <span class="icon">${SUIT_EMOJIS[suit]}</span>
        <div class="info">
          <div class="name">消除 ${SUIT_NAMES[suit]}</div>
          <div class="desc">手动激活万能牌，凑齐3张${SUIT_NAMES[suit]}</div>
        </div>
      `;
      item.onclick = () => {
        controller.activateManualWild(slotIndex, suit);
        hideModal('lucky');
        renderGame();
      };
      wildList.appendChild(item);
    });
  } else {
    wildList.innerHTML = '<p class="hint">槽内暂无可用万能消除组合（需同花色至少2张）</p>';
  }

  const skillTitle = document.createElement('p');
  skillTitle.className = 'hint';
  skillTitle.textContent = '或释放技能：';
  skillList.appendChild(skillTitle);

  Object.values(SKILL_INFO).forEach((info) => {
    const item = document.createElement('div');
    item.className = 'skill-item';
    item.innerHTML = `
      <span class="icon">${info.icon}</span>
      <div class="info">
        <div class="name">${info.name}</div>
        <div class="desc">${info.description}</div>
      </div>
    `;
    item.onclick = () => {
      if (info.type === SkillType.TakeToHold) {
        hideModal('lucky');
        openTakeModal();
      } else {
        controller.useWildSkill(slotIndex, info.type);
        hideModal('lucky');
        renderGame();
      }
    };
    skillList.appendChild(item);
  });

  showModal('lucky');
}

function openSkillModal(slotIndex) {
  wildSlotForSkill = slotIndex;
  const list = $('#skill-list');
  list.innerHTML = '';

  Object.values(SKILL_INFO).forEach((info) => {
    const item = document.createElement('div');
    item.className = 'skill-item';
    item.innerHTML = `
      <span class="icon">${info.icon}</span>
      <div class="info">
        <div class="name">${info.name}</div>
        <div class="desc">${info.description}</div>
      </div>
    `;
    item.onclick = () => {
      if (info.type === SkillType.TakeToHold) {
        hideModal('skill');
        openTakeModal();
      } else {
        controller.useWildSkill(slotIndex, info.type);
        hideModal('skill');
        renderGame();
      }
    };
    list.appendChild(item);
  });

  showModal('skill');
}

function openTakeModal() {
  takeSelectedIndices = [];
  const picker = $('#take-slot-picker');
  picker.innerHTML = '';
  const state = controller.game.getState();

  state.slots.forEach((card, idx) => {
    const el = createCardEl(card, true);
    el.onclick = () => {
      const i = takeSelectedIndices.indexOf(idx);
      if (i >= 0) {
        takeSelectedIndices.splice(i, 1);
        el.classList.remove('selected-for-take');
      } else if (takeSelectedIndices.length < 3) {
        takeSelectedIndices.push(idx);
        el.classList.add('selected-for-take');
      }
    };
    picker.appendChild(el);
  });

  showModal('take');
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
  $('#btn-start').onclick = startGame;
  $('#btn-back-menu').onclick = () => showScreen('menu');
  $('#btn-lucky-cancel').onclick = () => hideModal('lucky');
  $('#btn-skill-cancel').onclick = () => hideModal('skill');
  $('#btn-take-cancel').onclick = () => hideModal('take');
  $('#btn-take-confirm').onclick = () => {
    if (takeSelectedIndices.length > 0) {
      controller.takeToHold(takeSelectedIndices);
      hideModal('take');
      renderGame();
    }
  };

  $('#btn-revive-video').onclick = async () => {
    const ok = await controller.reviveWithVideo();
    if (ok) {
      hideModal('revive');
      renderGame();
    }
  };

  $('#btn-revive-share').onclick = async () => {
    const ok = await controller.reviveWithShare();
    if (ok) {
      hideModal('revive');
      renderGame();
    }
  };

  $('#btn-revive-giveup').onclick = () => {
    hideModal('revive');
    showResult(false);
  };

  $('#btn-result-home').onclick = () => {
    controller = null;
    showScreen('menu');
    initMenu();
  };

  $('#btn-result-double').onclick = () => {
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

initMenu();
initEvents();
