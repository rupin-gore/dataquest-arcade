// Module 3: Exploratory Data Analysis (EDA) & Descriptive Stats Lab
import { state } from '../state.js';
import { sound } from '../audio.js';

export function renderEdaStats(container) {
  // Initial points for Tug of War
  let prices = [220, 240, 270, 310, 340, 390, 420];
  let outlier = 1200; // Draggable outlier

  // Distribution settings
  let skew = 0; // -1 to 1
  let stdDev = 30;

  // Correlation settings
  let correlation = 0.85;

  container.innerHTML = `
    <div class="lab-header">
      <div class="lab-title-group">
        <span class="lab-badge">Track 1: Data Analyst</span>
        <h2>EDA, Distribution Morphing & Descriptive Stats</h2>
        <p class="lab-desc">Exploratory Data Analysis is detective work. See how statistical measures react in real-time when data twists, skews, or gets infected by extreme outliers.</p>
      </div>
      <div class="lab-objective">
        <div class="objective-badge">Target Objective</div>
        <div class="objective-text">Demonstrate why <strong>Median resists outliers</strong> by dragging the outlier past $1,500k, then set correlation to <strong>r &gt; 0.90</strong> to prove strong linear relationship!</div>
      </div>
    </div>

    <!-- Tug of War: Mean vs Median -->
    <div class="interactive-section">
      <div class="section-title">
        <span class="icon">⚖️</span> Part 1: The Mean vs. Median Tug-of-War
      </div>
      <p class="section-subtitle">Drag the extreme high-value outlier and watch the Mean needle get dragged while the Median stays firmly anchored!</p>
      
      <div class="tug-controls">
        <label for="outlier-slider">Outlier House Price: <strong id="outlier-val">$1,200k</strong></label>
        <input type="range" id="outlier-slider" min="400" max="2500" step="50" value="1200" class="range-slider" />
      </div>

      <div class="stat-meters-grid">
        <div class="stat-card stat-mean">
          <div class="stat-title">Arithmetic Mean (Average)</div>
          <div class="stat-value" id="mean-display">$456k</div>
          <div class="stat-note">⚠️ Extremely sensitive to outliers</div>
        </div>
        <div class="stat-card stat-median">
          <div class="stat-title">Median (50th Percentile)</div>
          <div class="stat-value" id="median-display">$310k</div>
          <div class="stat-note">🛡️ Robust metric representing typical case</div>
        </div>
        <div class="stat-card stat-diff">
          <div class="stat-title">Skewness Distortion</div>
          <div class="stat-value" id="distortion-display">+47%</div>
          <div class="stat-note">Mean is dragged above Median</div>
        </div>
      </div>

      <div class="visual-number-line">
        <svg viewBox="0 0 600 90" class="number-line-svg" id="number-line-svg">
          <!-- Dynamic number line rendered here -->
        </svg>
      </div>
    </div>

    <!-- Interactive Correlation Explorer -->
    <div class="interactive-section">
      <div class="section-title">
        <span class="icon">📈</span> Part 2: Pearson Correlation & Scatter Morphing
      </div>
      <p class="section-subtitle">Adjust the Pearson correlation coefficient r and watch how the scatter points align with the trend line.</p>
      
      <div class="corr-controls-bar">
        <label for="corr-slider">Correlation Coefficient (r): <strong id="corr-val">+0.85</strong></label>
        <input type="range" id="corr-slider" min="-1" max="1" step="0.05" value="0.85" class="range-slider" />
        <span id="corr-interpretation" class="badge badge-success">Strong Positive Correlation</span>
      </div>

      <div class="scatter-container">
        <svg viewBox="0 0 500 260" class="scatter-svg" id="scatter-svg">
          <!-- Live scatter points rendered here -->
        </svg>
      </div>
    </div>

    <div class="lab-footer">
      <button id="btn-verify-eda" class="btn btn-success btn-lg">
        ${state.isChallengeCompleted('eda_stats') ? '✓ Challenge Completed (+100 XP Earned)' : 'Verify Insights & Claim XP'}
      </button>
      <div id="eda-feedback" class="feedback-msg"></div>
    </div>
  `;

  // Update Tug of War
  function updateTugOfWar() {
    const all = [...prices, outlier];
    const mean = Math.round(all.reduce((a, b) => a + b, 0) / all.length);
    const sorted = [...all].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 !== 0 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
    const distortion = Math.round(((mean - median) / median) * 100);

    container.querySelector('#mean-display').textContent = `$${mean}k`;
    container.querySelector('#median-display').textContent = `$${median}k`;
    container.querySelector('#distortion-display').textContent = `+${distortion}%`;
    container.querySelector('#outlier-val').textContent = `$${outlier}k`;

    // Render SVG number line
    const svg = container.querySelector('#number-line-svg');
    const minVal = 100;
    const maxVal = 2600;
    const toX = val => 40 + ((val - minVal) / (maxVal - minVal)) * 520;

    let svgHtml = `
      <line x1="40" y1="50" x2="560" y2="50" stroke="#334155" stroke-width="3" stroke-linecap="round"/>
      <text x="40" y="75" fill="#64748b" font-size="11">$100k</text>
      <text x="300" y="75" fill="#64748b" font-size="11">$1,350k</text>
      <text x="540" y="75" fill="#64748b" font-size="11">$2.6M</text>
    `;

    // Standard points
    prices.forEach(p => {
      svgHtml += `<circle cx="${toX(p)}" cy="50" r="6" fill="#38bdf8" opacity="0.85" />`;
    });

    // Outlier point
    svgHtml += `
      <circle cx="${toX(outlier)}" cy="50" r="10" fill="#f43f5e" class="pulse-point" />
      <text x="${toX(outlier)}" y="25" fill="#f43f5e" font-size="11" font-weight="bold" text-anchor="middle">Outlier ($${outlier}k)</text>
    `;

    // Mean needle
    svgHtml += `
      <line x1="${toX(mean)}" y1="35" x2="${toX(mean)}" y2="65" stroke="#f59e0b" stroke-width="3" />
      <text x="${toX(mean)}" y="25" fill="#f59e0b" font-size="11" font-weight="bold" text-anchor="middle">Mean ($${mean}k)</text>
    `;

    // Median needle
    svgHtml += `
      <line x1="${toX(median)}" y1="35" x2="${toX(median)}" y2="65" stroke="#10b981" stroke-width="3" stroke-dasharray="3,3" />
      <text x="${toX(median)}" y="85" fill="#10b981" font-size="11" font-weight="bold" text-anchor="middle">Median ($${median}k)</text>
    `;

    svg.innerHTML = svgHtml;
  }

  // Update Scatter Plot with r
  function updateScatter() {
    const r = parseFloat(correlation);
    container.querySelector('#corr-val').textContent = (r >= 0 ? '+' : '') + r.toFixed(2);
    
    const interp = container.querySelector('#corr-interpretation');
    if (Math.abs(r) > 0.8) {
      interp.textContent = r > 0 ? 'Strong Positive Linear Relationship' : 'Strong Negative Linear Relationship';
      interp.className = 'badge badge-success';
    } else if (Math.abs(r) > 0.4) {
      interp.textContent = r > 0 ? 'Moderate Positive Relationship' : 'Moderate Negative Relationship';
      interp.className = 'badge badge-warning';
    } else {
      interp.textContent = 'Weak / No Linear Relationship (Uncorrelated Noise)';
      interp.className = 'badge badge-secondary';
    }

    // Generate deterministic 40 pseudo-random points based on r
    const svg = container.querySelector('#scatter-svg');
    let pts = [];
    const n = 40;
    
    // Seeded random points
    for (let i = 0; i < n; i++) {
      const u1 = (Math.sin(i * 12.9898) + 1) / 2;
      const u2 = (Math.cos(i * 78.233) + 1) / 2;
      const xNorm = (u1 - 0.5) * 2; // -1 to 1
      const noise = (u2 - 0.5) * 2;
      const yNorm = r * xNorm + Math.sqrt(1 - r * r) * noise * 0.75;
      
      const px = 50 + ((xNorm + 1) / 2) * 400;
      const py = 210 - ((yNorm + 1) / 2) * 160;
      pts.push({ x: px, y: py });
    }

    let svgHtml = `
      <!-- Axes -->
      <line x1="50" y1="210" x2="450" y2="210" stroke="#334155" stroke-width="2" />
      <line x1="50" y1="50" x2="50" y2="210" stroke="#334155" stroke-width="2" />
      <text x="250" y="240" fill="#64748b" font-size="11" text-anchor="middle">Feature X (e.g. Ad Spend)</text>
      <text x="25" y="130" fill="#64748b" font-size="11" transform="rotate(-90 25 130)" text-anchor="middle">Feature Y (e.g. Revenue)</text>
    `;

    // Trend line
    const xStart = 50;
    const yStart = 130 - (r * 70);
    const xEnd = 450;
    const yEnd = 130 + (r * 70);
    svgHtml += `<line x1="${xStart}" y1="${yStart}" x2="${xEnd}" y2="${yEnd}" stroke="#818cf8" stroke-width="3" stroke-dasharray="4,4" />`;

    // Points
    pts.forEach(p => {
      svgHtml += `<circle cx="${p.x}" cy="${p.y}" r="4.5" fill="#38bdf8" opacity="0.8" />`;
    });

    svg.innerHTML = svgHtml;
  }

  // Event listeners
  container.querySelector('#outlier-slider').addEventListener('input', e => {
    outlier = parseInt(e.target.value);
    updateTugOfWar();
  });

  container.querySelector('#corr-slider').addEventListener('input', e => {
    correlation = parseFloat(e.target.value);
    updateScatter();
  });

  container.querySelector('#btn-verify-eda').addEventListener('click', () => {
    const feedback = container.querySelector('#eda-feedback');
    if (outlier >= 1500 && correlation >= 0.90) {
      const awarded = state.completeChallenge('eda_stats', 'eda_detective', 100);
      feedback.className = 'feedback-msg success';
      feedback.innerHTML = `<strong>Phenomenal Insight!</strong> You pushed the outlier to $${outlier}k showing the massive skew on Mean while Median held stable, and dialed r to ${correlation.toFixed(2)} for high predictive strength! Unlocked 'Variance Slayer' Badge (+100 XP).`;
      if (awarded) {
        container.querySelector('#btn-verify-eda').textContent = '✓ Challenge Completed (+100 XP Earned)';
      }
    } else {
      sound.playError();
      feedback.className = 'feedback-msg error';
      feedback.innerHTML = `<strong>Almost there!</strong> Drag the outlier slider to at least <strong>$1,500k</strong> and push the correlation slider to <strong>r &ge; 0.90</strong> to prove both principles.`;
    }
  });

  updateTugOfWar();
  updateScatter();
}
