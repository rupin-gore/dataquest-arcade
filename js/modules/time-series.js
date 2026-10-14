// Module 12: Time Series, Decomposition & Anomaly Detection
import { state } from '../state.js';
import { sound } from '../audio.js';

export function renderTimeSeries(container) {
  let maWindow = 7;
  let showDecomp = false;
  let anomalyThreshold = 2.8; // Z-score threshold (optimal around 2.8 - 3.1)

  // Generate 45 daily time steps
  const timeSteps = [];
  for (let t = 0; t < 45; t++) {
    const trend = 20 + t * 1.4; // Upward trend
    const seasonality = Math.sin((t % 7) / 7 * 2 * Math.PI) * 12; // 7-day weekly cycle
    const noise = (Math.cos(t * 13.7) * 4) + (Math.sin(t * 29.3) * 3);
    let val = trend + seasonality + noise;

    // Inject 3 specific anomalies
    let isTrueAnomaly = false;
    if (t === 14) { val += 42; isTrueAnomaly = true; } // Spike 1
    if (t === 27) { val -= 38; isTrueAnomaly = true; } // Flash drop 2
    if (t === 39) { val += 48; isTrueAnomaly = true; } // Spike 3

    timeSteps.push({ t, val, trend, seasonality, noise, isTrueAnomaly });
  }

  container.innerHTML = `
    <div class="lab-header">
      <div class="lab-title-group">
        <span class="lab-badge">Track 2: Data Scientist</span>
        <h2>Time Series Decomposition &amp; Anomaly Detection</h2>
        <p class="lab-desc">Time-dependent data possesses temporal order. Decompose signals into Trend, Seasonality, and Residuals, apply rolling window smoothing, and detect sudden flash crashes or DDoS spikes.</p>
      </div>
      <div class="lab-objective">
        <div class="objective-badge">Target Objective</div>
        <div class="objective-text">Toggle <strong>Decomposition Mode</strong> to isolate cyclical seasonality, then calibrate the rolling anomaly threshold to flag all <strong>3 true anomalies</strong> with 0 false alarms!</div>
      </div>
    </div>

    <!-- Interactive Time Series Workbench -->
    <div class="interactive-section">
      <div class="section-title">
        <span class="icon">📈</span> Part 1: Moving Average Smoothing &amp; Anomaly Detector
      </div>
      
      <div class="ts-controls-bar">
        <div class="control-col">
          <label for="slider-ma">Rolling Window (MA): <strong id="val-ma">7 Days</strong></label>
          <input type="range" id="slider-ma" min="3" max="21" step="2" value="7" class="range-slider" />
        </div>
        <div class="control-col">
          <label for="slider-anomaly">Anomaly Z-Threshold (σ): <strong id="val-anomaly">2.8σ</strong></label>
          <input type="range" id="slider-anomaly" min="1.5" max="4.5" step="0.1" value="2.8" class="range-slider" />
        </div>
        <div class="control-col">
          <button id="btn-toggle-decomp" class="btn btn-secondary">
            ${showDecomp ? 'Show Raw Smoothed View' : '🔬 Decompose (Trend + Seasonality + Noise)'}
          </button>
        </div>
      </div>

      <!-- Main Time Series Chart -->
      <div class="ts-canvas-wrapper" id="ts-canvas-box">
        <svg viewBox="0 0 540 240" class="ts-svg" id="ts-svg">
          <!-- Dynamic series rendered here -->
        </svg>
      </div>

      <div class="anomaly-summary-strip mt-2">
        <span>Anomalies Flagged: <strong id="flagged-count" class="text-warning">0 / 3</strong></span>
        <span>False Alarms: <strong id="false-alarm-count" class="text-success">0</strong></span>
      </div>
    </div>

    <div class="lab-footer">
      <button id="btn-verify-ts" class="btn btn-success btn-lg">
        ${state.isChallengeCompleted('time_series') ? '✓ Challenge Completed (+100 XP Earned)' : 'Verify Anomaly Filter & Claim XP'}
      </button>
      <div id="ts-feedback" class="feedback-msg"></div>
    </div>
  `;

  function calculateMovingAverage(data, windowSize) {
    const half = Math.floor(windowSize / 2);
    return data.map((d, i) => {
      let sum = 0, count = 0;
      for (let w = -half; w <= half; w++) {
        const idx = i + w;
        if (idx >= 0 && idx < data.length) {
          sum += data[idx].val;
          count++;
        }
      }
      return sum / count;
    });
  }

  function renderSeries() {
    container.querySelector('#val-ma').textContent = `${maWindow} Days`;
    container.querySelector('#val-anomaly').textContent = `${anomalyThreshold.toFixed(1)}σ`;

    const svg = container.querySelector('#ts-svg');
    const maValues = calculateMovingAverage(timeSteps, maWindow);

    // Compute standard deviation of residuals for anomaly detection
    const residuals = timeSteps.map((d, i) => Math.abs(d.val - maValues[i]));
    const meanRes = residuals.reduce((a, b) => a + b, 0) / residuals.length;
    const stdRes = Math.sqrt(residuals.map(r => Math.pow(r - meanRes, 2)).reduce((a, b) => a + b, 0) / residuals.length);

    let flaggedAnomalies = [];
    let falseAlarms = 0;

    timeSteps.forEach((d, i) => {
      const z = Math.abs(d.val - maValues[i]) / stdRes;
      if (z >= anomalyThreshold) {
        flaggedAnomalies.push(i);
        if (!d.isTrueAnomaly) falseAlarms++;
      }
    });

    const caughtTrue = flaggedAnomalies.filter(idx => timeSteps[idx].isTrueAnomaly).length;
    container.querySelector('#flagged-count').textContent = `${caughtTrue} / 3 True Anomalies Caught`;
    container.querySelector('#false-alarm-count').textContent = `${falseAlarms} False Alarms`;

    container.querySelector('#flagged-count').className = caughtTrue === 3 && falseAlarms === 0 ? 'text-emerald font-bold' : 'text-warning';
    container.querySelector('#false-alarm-count').className = falseAlarms === 0 ? 'text-emerald' : 'text-danger font-bold';

    const toPxX = t => 45 + (t / 44) * 460;
    const toPxY = v => 210 - ((v - 0) / 120) * 170;

    if (!showDecomp) {
      // Standard Series + MA + Anomalies
      let svgHtml = `
        <!-- Axes -->
        <line x1="45" y1="210" x2="510" y2="210" stroke="#334155" stroke-width="2"/>
        <line x1="45" y1="40" x2="45" y2="210" stroke="#334155" stroke-width="2"/>
        <text x="270" y="232" fill="#64748b" font-size="11" text-anchor="middle">Time (Days 1 to 45)</text>
        <text x="20" y="125" fill="#64748b" font-size="11" transform="rotate(-90 20 125)" text-anchor="middle">Server Traffic (QPS)</text>
      `;

      // Draw Raw Line
      let rawPath = '';
      timeSteps.forEach((d, i) => {
        rawPath += (i === 0 ? 'M' : 'L') + ` ${toPxX(d.t).toFixed(1)} ${toPxY(d.val).toFixed(1)}`;
      });
      svgHtml += `<path d="${rawPath}" fill="none" stroke="#64748b" stroke-width="1.8" opacity="0.6"/>`;

      // Draw Moving Average Line
      let maPath = '';
      maValues.forEach((mv, i) => {
        maPath += (i === 0 ? 'M' : 'L') + ` ${toPxX(i).toFixed(1)} ${toPxY(mv).toFixed(1)}`;
      });
      svgHtml += `<path d="${maPath}" fill="none" stroke="#38bdf8" stroke-width="3"/>`;

      // Draw Points
      timeSteps.forEach((d, i) => {
        const px = toPxX(d.t);
        const py = toPxY(d.val);
        const isFlagged = flaggedAnomalies.includes(i);

        if (isFlagged) {
          svgHtml += `
            <circle cx="${px}" cy="${py}" r="7" fill="#f43f5e" stroke="#ffffff" stroke-width="2" class="pulse-point" />
            <text x="${px}" y="${py - 12}" fill="#f43f5e" font-size="10" font-weight="bold" text-anchor="middle">SPIKE!</text>
          `;
        } else {
          svgHtml += `<circle cx="${px}" cy="${py}" r="3" fill="#94a3b8" />`;
        }
      });

      svg.innerHTML = svgHtml;
    } else {
      // 3 Decomposed Subplots (Trend, Seasonality, Residuals)
      let svgHtml = `
        <!-- Trend Subplot -->
        <text x="50" y="32" fill="#10b981" font-size="11" font-weight="bold">1. Trend Component (Long-term Drift)</text>
        <line x1="45" y1="80" x2="510" y2="80" stroke="#334155" stroke-width="1"/>
      `;

      let trendPath = '';
      timeSteps.forEach((d, i) => {
        const px = toPxX(d.t);
        const py = 75 - (d.trend / 80) * 40;
        trendPath += (i === 0 ? 'M' : 'L') + ` ${px.toFixed(1)} ${py.toFixed(1)}`;
      });
      svgHtml += `<path d="${trendPath}" fill="none" stroke="#10b981" stroke-width="2.5"/>`;

      // Seasonality Subplot
      svgHtml += `
        <text x="50" y="105" fill="#a855f7" font-size="11" font-weight="bold">2. Seasonality (7-Day Weekly Wave)</text>
        <line x1="45" y1="150" x2="510" y2="150" stroke="#334155" stroke-width="1"/>
      `;

      let seasPath = '';
      timeSteps.forEach((d, i) => {
        const px = toPxX(d.t);
        const py = 150 - (d.seasonality / 20) * 30;
        seasPath += (i === 0 ? 'M' : 'L') + ` ${px.toFixed(1)} ${py.toFixed(1)}`;
      });
      svgHtml += `<path d="${seasPath}" fill="none" stroke="#a855f7" stroke-width="2.5"/>`;

      // Residuals Subplot
      svgHtml += `
        <text x="50" y="175" fill="#f43f5e" font-size="11" font-weight="bold">3. Residuals &amp; Outliers (White Noise + Shocks)</text>
        <line x1="45" y1="210" x2="510" y2="210" stroke="#334155" stroke-width="1"/>
      `;

      timeSteps.forEach((d, i) => {
        const px = toPxX(d.t);
        const py = 210 - (d.val - d.trend - d.seasonality) * 1.5;
        const isAnom = d.isTrueAnomaly;
        svgHtml += `<circle cx="${px}" cy="${py}" r="${isAnom ? '5' : '2.5'}" fill="${isAnom ? '#f43f5e' : '#64748b'}"/>`;
      });

      svg.innerHTML = svgHtml;
    }
  }

  // Event handlers
  container.querySelector('#slider-ma').addEventListener('input', e => {
    maWindow = parseInt(e.target.value);
    renderSeries();
  });

  container.querySelector('#slider-anomaly').addEventListener('input', e => {
    anomalyThreshold = parseFloat(e.target.value);
    renderSeries();
  });

  container.querySelector('#btn-toggle-decomp').addEventListener('click', () => {
    sound.playClick();
    showDecomp = !showDecomp;
    const btn = container.querySelector('#btn-toggle-decomp');
    btn.textContent = showDecomp ? 'Show Raw Smoothed View' : '🔬 Decompose (Trend + Seasonality + Noise)';
    btn.className = showDecomp ? 'btn btn-primary active' : 'btn btn-secondary';
    renderSeries();
  });

  container.querySelector('#btn-verify-ts').addEventListener('click', () => {
    const maValues = calculateMovingAverage(timeSteps, maWindow);
    const residuals = timeSteps.map((d, i) => Math.abs(d.val - maValues[i]));
    const meanRes = residuals.reduce((a, b) => a + b, 0) / residuals.length;
    const stdRes = Math.sqrt(residuals.map(r => Math.pow(r - meanRes, 2)).reduce((a, b) => a + b, 0) / residuals.length);

    let flaggedAnomalies = [];
    let falseAlarms = 0;

    timeSteps.forEach((d, i) => {
      const z = Math.abs(d.val - maValues[i]) / stdRes;
      if (z >= anomalyThreshold) {
        flaggedAnomalies.push(i);
        if (!d.isTrueAnomaly) falseAlarms++;
      }
    });

    const caughtTrue = flaggedAnomalies.filter(idx => timeSteps[idx].isTrueAnomaly).length;
    const feedback = container.querySelector('#ts-feedback');

    if (caughtTrue === 3 && falseAlarms === 0) {
      const awarded = state.completeChallenge('time_series', 'time_forecaster', 100);
      feedback.className = 'feedback-msg success';
      feedback.innerHTML = `<strong>Temporal Signals Mastered!</strong> You filtered background noise, observed seasonality, and isolated all 3 genuine anomalies with 0 false alarms at threshold ${anomalyThreshold.toFixed(1)}σ! Unlocked 'Future Shaper' Badge (+100 XP).`;
      if (awarded) {
        container.querySelector('#btn-verify-ts').textContent = '✓ Challenge Completed (+100 XP Earned)';
      }
    } else {
      sound.playError();
      feedback.className = 'feedback-msg error';
      feedback.innerHTML = `<strong>Filter tuning needed:</strong> Currently caught ${caughtTrue}/3 true spikes with ${falseAlarms} false alarms. Calibrate threshold around 2.7σ - 3.2σ!`;
    }
  });

  renderSeries();
}
