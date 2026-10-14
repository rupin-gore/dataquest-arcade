// State management, gamification logic, and persistence
import { sound } from './audio.js';

export const RANKS = [
  { level: 1, title: 'Data Novice', minXp: 0, maxXp: 150, icon: '🌱' },
  { level: 2, title: 'SQL & Data Sleuth', minXp: 150, maxXp: 400, icon: '🔍' },
  { level: 3, title: 'Insight Analyst', minXp: 400, maxXp: 800, icon: '📊' },
  { level: 4, title: 'Feature Alchemist', minXp: 800, maxXp: 1300, icon: '⚡' },
  { level: 5, title: 'Machine Learning Engineer', minXp: 1300, maxXp: 2000, icon: '🤖' },
  { level: 6, title: 'Neural Architect', minXp: 2000, maxXp: 2800, icon: '🧠' },
  { level: 7, title: 'Grand Data Scientist', minXp: 2800, maxXp: 99999, icon: '👑' }
];

export const BADGES = [
  { id: 'cleaner', title: 'Null Terminator', desc: 'Repaired 100% data integrity with zero data leakage', icon: '🧹', track: 'analyst' },
  { id: 'sql_master', title: 'Join Master', desc: 'Executed multi-table relational join & aggregation puzzle', icon: '⚡', track: 'analyst' },
  { id: 'eda_detective', title: 'Variance Slayer', desc: 'Hunted extreme outliers and explained skewness visually', icon: '📈', track: 'analyst' },
  { id: 'bi_architect', title: 'Funnel Optimizer', desc: 'Plugged revenue leak in executive KPI dashboard', icon: '💎', track: 'analyst' },
  { id: 'ab_tester', title: 'P-Value Champion', desc: 'Achieved p < 0.05 and 80%+ power in live A/B experiment', icon: '🎯', track: 'analyst' },
  { id: 'feature_forge', title: 'Dimension Lifter', desc: 'Engineered polynomial features to make circles linearly separable', icon: '🔮', track: 'scientist' },
  { id: 'gradient_surfer', title: 'Cost Surface Surfer', desc: 'Guided gradient descent ball to local minimum without exploding', icon: '⛷️', track: 'scientist' },
  { id: 'tree_splitter', title: 'Gini Chopper', desc: 'Split 2D plane with decision trees achieving 95%+ accuracy', icon: '🌲', track: 'scientist' },
  { id: 'cluster_king', title: 'Voronoi Master', desc: 'Converged K-Means centroids on complex multi-cluster personas', icon: '🪐', track: 'scientist' },
  { id: 'matrix_optimizer', title: 'Fraud Hunter', desc: 'Tuned probability threshold to balance Precision & Recall at 90%+', icon: '⚖️', track: 'scientist' },
  { id: 'neural_tamer', title: 'XOR Conqueror', desc: 'Trained neural network hidden layers to separate non-linear data', icon: '🧠', track: 'scientist' },
  { id: 'time_forecaster', title: 'Future Shaper', desc: 'Decomposed trend, seasonality & flagged anomaly spikes', icon: '⏳', track: 'scientist' }
];

class GameState {
  constructor() {
    this.storageKey = 'dataquest_game_state_v1';
    this.data = this.load();
    this.listeners = [];
  }

  load() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('LocalStorage error', e);
    }
    return {
      xp: 0,
      activeTrack: 'analyst', // 'analyst' or 'scientist'
      activeModuleId: 'cleaning',
      completedChallenges: {},
      unlockedBadges: [],
      soundMuted: false
    };
  }

  save() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    } catch (e) {
      console.warn('LocalStorage save error', e);
    }
    this.notify();
  }

  subscribe(callback) {
    this.listeners.push(callback);
    callback(this.data);
  }

  notify() {
    for (const cb of this.listeners) {
      cb(this.data);
    }
  }

  getRank() {
    for (let i = RANKS.length - 1; i >= 0; i--) {
      if (this.data.xp >= RANKS[i].minXp) {
        return RANKS[i];
      }
    }
    return RANKS[0];
  }

  getNextRank() {
    const current = this.getRank();
    const nextIdx = RANKS.findIndex(r => r.level === current.level + 1);
    return nextIdx !== -1 ? RANKS[nextIdx] : null;
  }

  addXp(amount, reason = '') {
    const prevRank = this.getRank();
    this.data.xp += amount;
    const newRank = this.getRank();

    if (newRank.level > prevRank.level) {
      sound.playLevelUp();
      this.triggerEvent('levelup', { rank: newRank });
    } else {
      sound.playXpGain();
    }

    this.save();
    this.triggerEvent('xpgain', { amount, reason });
  }

  completeChallenge(moduleId, badgeId, xpReward = 100) {
    if (!this.data.completedChallenges[moduleId]) {
      this.data.completedChallenges[moduleId] = { completedAt: Date.now() };
      this.addXp(xpReward, `Completed ${moduleId} Lab`);

      if (badgeId && !this.data.unlockedBadges.includes(badgeId)) {
        this.data.unlockedBadges.push(badgeId);
        sound.playSuccess();
        this.triggerEvent('badge_unlocked', { badgeId });
      } else {
        sound.playSuccess();
      }

      this.save();
      return true;
    }
    return false;
  }

  isChallengeCompleted(moduleId) {
    return !!this.data.completedChallenges[moduleId];
  }

  hasBadge(badgeId) {
    return this.data.unlockedBadges.includes(badgeId);
  }

  setActiveTrack(track) {
    this.data.activeTrack = track;
    this.save();
  }

  setActiveModule(moduleId) {
    this.data.activeModuleId = moduleId;
    this.save();
  }

  resetProgress() {
    this.data = {
      xp: 0,
      activeTrack: 'analyst',
      activeModuleId: 'cleaning',
      completedChallenges: {},
      unlockedBadges: [],
      soundMuted: false
    };
    this.save();
    sound.playClick();
  }

  triggerEvent(eventName, detail) {
    window.dispatchEvent(new CustomEvent(`dataquest:${eventName}`, { detail }));
  }
}

export const state = new GameState();
