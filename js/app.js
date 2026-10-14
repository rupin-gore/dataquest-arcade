// Main Application Orchestrator
import { state } from './state.js';
import { sound } from './audio.js';
import { UIController, MODULE_DEFINITIONS } from './ui.js';

// Import All 12 Interactive Modules
import { renderDataCleaning } from './modules/data-cleaning.js';
import { renderSqlArena } from './modules/sql-arena.js';
import { renderEdaStats } from './modules/eda-stats.js';
import { renderBiDashboard } from './modules/bi-dashboard.js';
import { renderAbTesting } from './modules/ab-testing.js';
import { renderFeatureEngineering } from './modules/feature-engineering.js';
import { renderRegression } from './modules/regression.js';
import { renderClassification } from './modules/classification.js';
import { renderClusteringPca } from './modules/clustering-pca.js';
import { renderConfusionMatrix } from './modules/confusion-matrix.js';
import { renderNeuralNet } from './modules/neural-net.js';
import { renderTimeSeries } from './modules/time-series.js';

import { wrapModuleWithTabs } from './lab-wrapper.js';

class DataQuestApp {
  constructor() {
    this.workbenchCard = document.getElementById('workbench-card');
    this.ui = new UIController(moduleId => this.loadModule(moduleId));
  }

  init() {
    // Subscribe UI to state updates
    state.subscribe(() => {
      this.ui.update();
    });

    // Load active module
    const activeId = state.data.activeModuleId || 'cleaning';
    this.loadModule(activeId);

    // Initial click audio activator (browsers require user interaction before Web Audio plays)
    const unlockAudio = () => {
      sound.init();
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    };
    document.addEventListener('click', unlockAudio);
    document.addEventListener('keydown', unlockAudio);
  }

  loadModule(moduleId) {
    if (!this.workbenchCard) return;

    // Smooth transition
    this.workbenchCard.style.opacity = '0';
    this.workbenchCard.style.transform = 'translateY(8px)';
    this.workbenchCard.style.transition = 'all 0.2s ease';

    setTimeout(() => {
      this.workbenchCard.innerHTML = '';

      switch (moduleId) {
        // Track 1: Data Analyst
        case 'cleaning':
          wrapModuleWithTabs('cleaning', this.workbenchCard, renderDataCleaning);
          break;
        case 'sql_arena':
          wrapModuleWithTabs('sql_arena', this.workbenchCard, renderSqlArena);
          break;
        case 'eda_stats':
          wrapModuleWithTabs('eda_stats', this.workbenchCard, renderEdaStats);
          break;
        case 'bi_dashboard':
          wrapModuleWithTabs('bi_dashboard', this.workbenchCard, renderBiDashboard);
          break;
        case 'ab_testing':
          wrapModuleWithTabs('ab_testing', this.workbenchCard, renderAbTesting);
          break;

        // Track 2: Data Scientist
        case 'feature_eng':
          wrapModuleWithTabs('feature_eng', this.workbenchCard, renderFeatureEngineering);
          break;
        case 'regression':
          wrapModuleWithTabs('regression', this.workbenchCard, renderRegression);
          break;
        case 'classification':
          wrapModuleWithTabs('classification', this.workbenchCard, renderClassification);
          break;
        case 'clustering':
          wrapModuleWithTabs('clustering', this.workbenchCard, renderClusteringPca);
          break;
        case 'confusion_matrix':
          wrapModuleWithTabs('confusion_matrix', this.workbenchCard, renderConfusionMatrix);
          break;
        case 'neural_net':
          wrapModuleWithTabs('neural_net', this.workbenchCard, renderNeuralNet);
          break;
        case 'time_series':
          wrapModuleWithTabs('time_series', this.workbenchCard, renderTimeSeries);
          break;

        default:
          wrapModuleWithTabs('cleaning', this.workbenchCard, renderDataCleaning);
          break;
      }

      this.workbenchCard.style.opacity = '1';
      this.workbenchCard.style.transform = 'translateY(0)';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 150);
  }
}

// Bootstrap on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new DataQuestApp();
  app.init();
});
