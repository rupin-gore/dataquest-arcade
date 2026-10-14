// UI Controller: Updates Top Nav, Quest Map, Modals, and Toasts
import { state, RANKS, BADGES } from './state.js';
import { sound } from './audio.js';
import { CONTENT_DATABASE } from './content-data.js';

export const MODULE_DEFINITIONS = [
  // Track 1: Data Analyst
  { id: 'cleaning', track: 'analyst', num: 'Lab 01', title: 'Data Cleaning', icon: '🧹', badgeId: 'cleaner' },
  { id: 'sql_arena', track: 'analyst', num: 'Lab 02', title: 'SQL Arena', icon: '⚡', badgeId: 'sql_master' },
  { id: 'eda_stats', track: 'analyst', num: 'Lab 03', title: 'EDA & Stats', icon: '📈', badgeId: 'eda_detective' },
  { id: 'bi_dashboard', track: 'analyst', num: 'Lab 04', title: 'BI & Funnels', icon: '💎', badgeId: 'bi_architect' },
  { id: 'ab_testing', track: 'analyst', num: 'Lab 05', title: 'A/B Testing', icon: '🎯', badgeId: 'ab_tester' },

  // Track 2: Data Scientist
  { id: 'feature_eng', track: 'scientist', num: 'Lab 06', title: 'Feature Forge', icon: '🔮', badgeId: 'feature_forge' },
  { id: 'regression', track: 'scientist', num: 'Lab 07', title: 'Regression & GD', icon: '⛷️', badgeId: 'gradient_surfer' },
  { id: 'classification', track: 'scientist', num: 'Lab 08', title: 'Trees & Forest', icon: '🌲', badgeId: 'tree_splitter' },
  { id: 'clustering', track: 'scientist', num: 'Lab 09', title: 'K-Means & PCA', icon: '🪐', badgeId: 'cluster_king' },
  { id: 'confusion_matrix', track: 'scientist', num: 'Lab 10', title: 'Confusion Matrix', icon: '⚖️', badgeId: 'matrix_optimizer' },
  { id: 'neural_net', track: 'scientist', num: 'Lab 11', title: 'Neural Playground', icon: '🧠', badgeId: 'neural_tamer' },
  { id: 'time_series', track: 'scientist', num: 'Lab 12', title: 'Time Series & Anom', icon: '⏳', badgeId: 'time_forecaster' }
];

export class UIController {
  constructor(onModuleSelect) {
    this.onModuleSelect = onModuleSelect;
    this.initEventListeners();
  }

  initEventListeners() {
    // Sound Toggle
    const soundBtn = document.getElementById('btn-sound-toggle');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        const enabled = sound.toggle();
        soundBtn.textContent = enabled ? '🔊 Sound On' : '🔇 Muted';
        this.showToast(enabled ? 'Sound FX Enabled' : 'Sound FX Muted', 'info');
      });
    }

    // Badges Modal
    const badgesBtn = document.getElementById('btn-badges-modal');
    const modalOverlay = document.getElementById('modal-badges');
    const closeBtn = document.getElementById('btn-close-modal');

    if (badgesBtn && modalOverlay) {
      badgesBtn.addEventListener('click', () => {
        sound.playClick();
        this.renderBadgesModal();
        modalOverlay.classList.add('active');
      });
    }

    if (closeBtn && modalOverlay) {
      closeBtn.addEventListener('click', () => {
        sound.playClick();
        modalOverlay.classList.remove('active');
      });
    }

    // Codex Modal
    const codexBtn = document.getElementById('btn-codex-modal');
    const codexModal = document.getElementById('modal-codex');
    const closeCodexBtn = document.getElementById('btn-close-codex');
    const codexSearch = document.getElementById('codex-search-input');
    const codexFilterBtns = document.querySelectorAll('.btn-codex-filter');

    if (codexBtn && codexModal) {
      codexBtn.addEventListener('click', () => {
        sound.playClick();
        this.renderCodexModal();
        codexModal.classList.add('active');
      });
    }

    if (closeCodexBtn && codexModal) {
      closeCodexBtn.addEventListener('click', () => {
        sound.playClick();
        codexModal.classList.remove('active');
      });
    }

    if (codexSearch) {
      codexSearch.addEventListener('input', e => {
        this.renderCodexModal(e.target.value.toLowerCase());
      });
    }

    codexFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playClick();
        codexFilterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.codexFilter = btn.dataset.filter;
        this.renderCodexModal(codexSearch ? codexSearch.value.toLowerCase() : '');
      });
    });

    // Reset Progress
    const resetBtn = document.getElementById('btn-reset-progress');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all XP, level, and completed challenges?')) {
          state.resetProgress();
          this.showToast('All progress has been reset', 'info');
          location.reload();
        }
      });
    }

    // Listen for custom game events
    window.addEventListener('dataquest:xpgain', e => {
      this.showToast(`+${e.detail.amount} XP: ${e.detail.reason || 'Objective accomplished!'}`, 'xp');
    });

    window.addEventListener('dataquest:levelup', e => {
      this.showToast(`🎉 LEVEL UP! You reached ${e.detail.rank.title} (Level ${e.detail.rank.level})!`, 'levelup');
    });

    window.addEventListener('dataquest:badge_unlocked', e => {
      const badge = BADGES.find(b => b.id === e.detail.badgeId);
      if (badge) {
        this.showToast(`🏆 BADGE UNLOCKED: ${badge.title} (${badge.desc})`, 'badge');
      }
    });

    // Track Tabs Switcher
    const analystTab = document.getElementById('tab-track-analyst');
    const scientistTab = document.getElementById('tab-track-scientist');

    if (analystTab && scientistTab) {
      analystTab.addEventListener('click', () => {
        sound.playClick();
        state.setActiveTrack('analyst');
        // Switch to first analyst module if current is scientist
        const curr = MODULE_DEFINITIONS.find(m => m.id === state.data.activeModuleId);
        if (curr && curr.track !== 'analyst') {
          state.setActiveModule('cleaning');
          this.onModuleSelect('cleaning');
        }
        this.update();
      });

      scientistTab.addEventListener('click', () => {
        sound.playClick();
        state.setActiveTrack('scientist');
        // Switch to first scientist module if current is analyst
        const curr = MODULE_DEFINITIONS.find(m => m.id === state.data.activeModuleId);
        if (curr && curr.track !== 'scientist') {
          state.setActiveModule('feature_eng');
          this.onModuleSelect('feature_eng');
        }
        this.update();
      });
    }
  }

  update() {
    this.updateStats();
    this.renderQuestStrip();
  }

  updateStats() {
    const rank = state.getRank();
    const nextRank = state.getNextRank();

    document.getElementById('rank-icon').textContent = rank.icon;
    document.getElementById('rank-title').textContent = rank.title;
    document.getElementById('rank-level').textContent = `Level ${rank.level}`;
    document.getElementById('total-xp').textContent = `${state.data.xp} XP`;

    // Badges count
    const unlockedCount = state.data.unlockedBadges.length;
    const badgeCounter = document.getElementById('unlocked-badge-count');
    if (badgeCounter) badgeCounter.textContent = `${unlockedCount}/${BADGES.length}`;

    // XP Progress Bar
    const min = rank.minXp;
    const max = nextRank ? nextRank.minXp : rank.maxXp;
    const currentProgress = state.data.xp - min;
    const totalNeeded = max - min;
    const pct = nextRank ? Math.min(100, Math.round((currentProgress / totalNeeded) * 100)) : 100;

    const fillBar = document.getElementById('nav-xp-fill');
    if (fillBar) fillBar.style.width = `${pct}%`;

    const xpLabel = document.getElementById('xp-label');
    if (xpLabel) {
      xpLabel.textContent = nextRank ? `${state.data.xp} / ${nextRank.minXp} XP` : 'Max Level Reached!';
    }

    // Track tab active classes
    const analystTab = document.getElementById('tab-track-analyst');
    const scientistTab = document.getElementById('tab-track-scientist');
    if (analystTab && scientistTab) {
      analystTab.classList.toggle('active', state.data.activeTrack === 'analyst');
      scientistTab.classList.toggle('active', state.data.activeTrack === 'scientist');
    }
  }

  renderQuestStrip() {
    const strip = document.getElementById('quest-strip');
    if (!strip) return;

    strip.innerHTML = '';
    const currentTrack = state.data.activeTrack;
    const modules = MODULE_DEFINITIONS.filter(m => m.track === currentTrack);

    modules.forEach(m => {
      const isCompleted = state.isChallengeCompleted(m.id);
      const isActive = state.data.activeModuleId === m.id;

      const node = document.createElement('div');
      node.className = `quest-node ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`;
      node.innerHTML = `
        <span class="quest-node-icon">${m.icon}</span>
        <div class="quest-node-details">
          <span class="quest-node-num">${m.num}</span>
          <span class="quest-node-title">${m.title}</span>
        </div>
        ${isCompleted ? '<span class="quest-status-check">✓</span>' : ''}
      `;

      node.addEventListener('click', () => {
        sound.playClick();
        state.setActiveModule(m.id);
        this.onModuleSelect(m.id);
        this.update();
      });

      strip.appendChild(node);
    });
  }

  renderBadgesModal() {
    const grid = document.getElementById('modal-badges-grid');
    if (!grid) return;

    grid.innerHTML = '';
    BADGES.forEach(b => {
      const isUnlocked = state.hasBadge(b.id);
      const card = document.createElement('div');
      card.className = `badge-item ${isUnlocked ? 'unlocked' : ''}`;
      card.innerHTML = `
        <div class="badge-icon">${b.icon}</div>
        <div class="badge-name">${b.title}</div>
        <div class="badge-desc">${b.desc}</div>
        <div class="mt-2">
          <span class="tag ${isUnlocked ? 'tag-success' : 'tag'}">${isUnlocked ? '✓ Unlocked' : 'Locked'}</span>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  renderCodexModal(searchQuery = '') {
    const grid = document.getElementById('modal-codex-grid');
    if (!grid) return;

    grid.innerHTML = '';
    const filter = this.codexFilter || 'all';
    const entries = Object.values(CONTENT_DATABASE);

    const filtered = entries.filter(item => {
      if (filter !== 'all' && item.track !== filter) return false;
      if (!searchQuery) return true;

      const fullText = (
        item.title + ' ' + 
        item.industryExample.company + ' ' + 
        item.industryExample.scenario + ' ' + 
        item.coreConcepts.map(c => c.heading + ' ' + c.content).join(' ')
      ).toLowerCase();

      return fullText.includes(searchQuery);
    });

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1; padding: 2rem; text-align: center;">
          No matching concepts found for "<em>${searchQuery}</em>". Try searching for <strong>p-value</strong>, <strong>imputation</strong>, <strong>gradient</strong>, or <strong>outliers</strong>.
        </div>
      `;
      return;
    }

    filtered.forEach(item => {
      const card = document.createElement('div');
      card.className = 'codex-card';
      card.innerHTML = `
        <div class="codex-card-header">
          <span class="tag ${item.track === 'analyst' ? 'tag-warning' : 'tag-success'}">
            ${item.track === 'analyst' ? 'Data Analyst' : 'Data Scientist'}
          </span>
          <span class="badge-tag">🏆 ${item.badge}</span>
        </div>
        <h4 class="codex-title">${item.title}</h4>
        <div class="codex-usecase">
          <strong>🏢 ${item.industryExample.company}:</strong> ${item.industryExample.scenario}
        </div>
        <p class="codex-desc">${item.industryExample.details}</p>
        <div class="codex-actions mt-3">
          <button class="btn btn-primary btn-xs btn-jump-lab" data-mod="${item.id}">
            🚀 Open Interactive Lab &amp; Guide
          </button>
        </div>
      `;

      card.querySelector('.btn-jump-lab').addEventListener('click', () => {
        sound.playClick();
        document.getElementById('modal-codex').classList.remove('active');
        state.setActiveTrack(item.track);
        state.setActiveModule(item.id);
        this.onModuleSelect(item.id);
        this.update();
      });

      grid.appendChild(card);
    });
  }

  showToast(msg, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <span class="toast-icon">${type === 'xp' ? '⚡' : (type === 'levelup' ? '👑' : (type === 'badge' ? '🏆' : 'ℹ️'))}</span>
      <span class="toast-msg">${msg}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.4s ease';
      setTimeout(() => toast.remove(), 400);
    }, 3500);
  }
}
