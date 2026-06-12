import {
  GameController,
  SKILL_INFO,
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
    if (controller && controller.canRevive()) {
      setTimeout(() => showModal('revive'), 300);
    } else {
      setTimeout(() => showResult(false), 300);
    }
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

  // 技能按钮区域（底部平铺）
  renderSkillButtons();

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
  state.slots.forEach((card) => {
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

/** 渲染技能按钮区域 */
function renderSkillButtons() {
  if (!controller) return;
  
  const skillBtnsEl = $('#skill-buttons');
  if (!skillBtnsEl) return;
  
  skillBtnsEl.innerHTML = '';
  const state = controller.game.getState();
  
  // 只显示可用的技能：打乱、撤销、透视
  const skills = [
    { type: 'shuffle', icon: '🔀', name: '打乱', desc: '重新分配' },
    { type: 'undo', icon: '↩️', name: '撤销', desc: '回退一步' },
    { type: 'peek', icon: '👁️', name: '透视', desc: '查看下两张' },
  ];
  
  skills.forEach(skill => {
    const check = controller.canUseSkill(skill.type);
    // 计算剩余可用次数（所有技能默认1次）
    const used = state.skillUses[skill.type] || 0;
    const limit = 1;
    const remaining = limit - used;
    
    // 禁用条件：无剩余次数 且 没有每日免费机会 且 没有广告获取机会
    const hasDailyFree = check.reason === 'daily_free';
    const hasAdGrant = check.reason === 'ad_grant';
    const disabled = remaining <= 0 && !hasDailyFree && !hasAdGrant;
    
    // 显示逻辑：有剩余次数显示数字，否则显示+
    const displayCount = remaining > 0 ? remaining : '+';
    
    const btn = document.createElement('button');
    btn.className = `skill-btn ${disabled ? 'disabled' : ''}`;
    btn.innerHTML = `
      <span class="skill-icon">${skill.icon}</span>
      <span class="skill-name">${skill.name}</span>
      <span class="skill-badge">${displayCount}</span>
    `;
    
    btn.onclick = async () => {
      await handleSkillClick(skill.type);
      renderGame();
    };
    
    skillBtnsEl.appendChild(btn);
  });
}

/** 处理技能按钮点击 */
async function handleSkillClick(skillType) {
  const check = controller.canUseSkill(skillType);
  
  if (!check.canUse) {
    // 技能已耗尽
    return;
  }
  
  if (check.reason === 'daily_free') {
    // 每日免费技能，直接使用
    controller.applySkill(skillType);
    return;
  }
  
  if (check.reason === 'ad_grant') {
    // 需要看广告获取技能
    const granted = await controller.showAdForSkill(skillType);
    if (granted) {
      // 广告获取成功，使用技能
      controller.applySkill(skillType);
    }
    return;
  }
  
  // 正常情况，还有剩余次数
  controller.applySkill(skillType);
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

/** 打开技能选择弹窗 */
function openSkillModal(slotIndex) {
  const skillList = $('#skill-list');
  skillList.innerHTML = '';
  
  const state = controller.game.getState();
  
  // 遍历所有技能
  Object.values(SKILL_INFO).forEach((skill) => {
    const uses = state.skillUses[skill.type] || 0;
    const limit = 99; // 使用次数限制
    
    const item = document.createElement('div');
    item.className = 'skill-item';
    item.innerHTML = `
      <div class="skill-icon">${skill.icon}</div>
      <div class="skill-name">${skill.name}</div>
      <div class="skill-desc">${skill.description}</div>
      <div class="skill-usage">${uses}/${limit}</div>
    `;
    
    item.onclick = () => {
      // 使用技能
      const ok = controller.applySkill(skill.type, slotIndex);
      if (ok) {
        hideModal('skill');
        renderGame();
      }
    };
    
    skillList.appendChild(item);
  });
  
  // 取消按钮
  const btnCancel = $('#btn-skill-cancel');
  if (btnCancel) {
    btnCancel.onclick = () => {
      hideModal('skill');
    };
  }
  
  showModal('skill');
}

initMenu();
initEvents();
