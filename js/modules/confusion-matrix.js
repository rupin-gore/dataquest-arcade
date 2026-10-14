// Module 10: Confusion Matrix, Precision-Recall & ROC Curve Arcade
import { state } from '../state.js';
import { sound } from '../audio.js';

export function renderConfusionMatrix(container) {
  let threshold = 0.50;

  // 100 synthetic banking transactions (15 Fraud, 85 Normal)
  const transactions = [];
  // 85 normal transactions (mostly low probability)
  for (let i = 0; i < 85; i++) {
    // Beta/skewed distribution around 0.15
    const prob = Math.min(0.85, Math.max(0.02, Math.pow(Math.sin((i + 1) * 31.7) * 0.5 + 0.5, 2.5) * 0.65));
    transactions.push({ id: `TX-${1000 + i}`, isFraud: false, score: prob });
  }
  // 15 actual fraud transactions (mostly high probability)
  for (let i = 0; i < 15; i++) {
    const prob = Math.min(0.98, Math.max(0.25, 0.45 + Math.pow(Math.cos((i + 1) * 19.3) * 0.5 + 0.5, 1.2) * 0.52));
    transactions.push({ id: `TX-F${500 + i}`, isFraud: true, score: prob });
  }

  container.innerHTML = `
    <div class="lab-header">
      <div class="lab-title-group">
        <span class="lab-badge">Track 2: Data Scientist</span>
        <h2>Model Evaluation, Confusion Matrix & ROC/AUC Curves</h2>
        <p class="lab-desc">Accuracy is a deadly trap in imbalanced domains like fraud detection. Master the fundamental trade-off between Precision (false alarms) and Recall (missed catastrophes) by adjusting the decision threshold.</p>
      </div>
      <div class="lab-objective">
        <div class="objective-badge">Target Objective</div>
        <div class="objective-text">Tune the classification threshold so <strong>Recall &ge; 85%</strong> (catching &ge; 13/15 frauds) while preserving <strong>Precision &ge; 75%</strong>!</div>
      </div>
    </div>

    <!-- Threshold Slider & Tradeoff Display -->
    <div class="interactive-section">
      <div class="section-title">
        <span class="icon">🎚️</span> Part 1: Interactive Classification Probability Threshold
      </div>
      <p class="section-subtitle">Slide the decision threshold to define which probability triggers a fraud alarm. Notice how the metrics move inversely!</p>

      <div class="threshold-controls-bar">
        <label for="slider-threshold">Decision Threshold: <strong id="val-threshold">0.50</strong></label>
        <input type="range" id="slider-threshold" min="0.10" max="0.90" step="0.02" value="0.50" class="range-slider" />
      </div>

      <!-- Probability Distribution Strip with Threshold Divider -->
      <div class="prob-strip-wrapper">
        <div class="strip-header">
          <span>0.0 (Legit Predicted)</span>
          <span class="center-threshold-marker" id="marker-label">Threshold: 0.50</span>
          <span>1.0 (Fraud Predicted)</span>
        </div>
        <svg viewBox="0 0 540 80" class="prob-svg" id="prob-svg">
          <!-- Live transaction points and threshold dividing line -->
        </svg>
      </div>
    </div>

    <!-- Live Confusion Matrix & Metrics Grid -->
    <div class="matrix-cockpit-grid">
      <!-- 2x2 Confusion Matrix -->
      <div class="matrix-box">
        <div class="matrix-grid-title">Confusion Matrix (100 Transactions)</div>
        <div class="matrix-quadrants">
          <div class="matrix-cell cell-tp">
            <div class="quad-label">True Positive (TP)</div>
            <div class="quad-value" id="val-tp">0</div>
            <div class="quad-desc">Caught Fraudsters ✓</div>
          </div>
          <div class="matrix-cell cell-fp">
            <div class="quad-label">False Positive (FP)</div>
            <div class="quad-value" id="val-fp">0</div>
            <div class="quad-desc">False Alarms (Angry Users) ⚠️</div>
          </div>
          <div class="matrix-cell cell-fn">
            <div class="quad-label">False Negative (FN)</div>
            <div class="quad-value" id="val-fn">0</div>
            <div class="quad-desc">Missed Fraud (Financial Loss!) 🚨</div>
          </div>
          <div class="matrix-cell cell-tn">
            <div class="quad-label">True Negative (TN)</div>
            <div class="quad-value" id="val-tn">0</div>
            <div class="quad-desc">Correct Legit Approvals ✓</div>
          </div>
        </div>
      </div>

      <!-- Live Dials / Metrics -->
      <div class="dials-box">
        <div class="dial-card">
          <div class="dial-name">Recall (Sensitivity)</div>
          <div class="dial-num text-emerald" id="dial-recall">0%</div>
          <div class="dial-sub">TP / (TP + FN) &bull; % of total frauds caught</div>
        </div>
        <div class="dial-card">
          <div class="dial-name">Precision</div>
          <div class="dial-num text-cyan" id="dial-precision">0%</div>
          <div class="dial-sub">TP / (TP + FP) &bull; Trustworthiness of alarms</div>
        </div>
        <div class="dial-card">
          <div class="dial-name">F1-Score</div>
          <div class="dial-num" id="dial-f1">0.00</div>
          <div class="dial-sub">Harmonic mean of Precision &amp; Recall</div>
        </div>
        <div class="dial-card">
          <div class="dial-name">Accuracy</div>
          <div class="dial-num text-muted" id="dial-accuracy">0%</div>
          <div class="dial-sub">Misleading in imbalanced data</div>
        </div>
      </div>
    </div>

    <!-- ROC Curve with Live Operating Point -->
    <div class="interactive-section">
      <div class="section-title">
        <span class="icon">📈</span> Part 2: Receiver Operating Characteristic (ROC) & AUC Curve
      </div>
      <p class="section-subtitle">The glowing point traces your model's current trade-off operating point along the ROC curve. The area underneath (AUC = 0.91) indicates excellent discriminative power.</p>

      <div class="roc-canvas-wrapper">
        <svg viewBox="0 0 500 240" class="roc-svg" id="roc-svg">
          <!-- Dynamic ROC curve and moving operating point -->
        </svg>
      </div>
    </div>

    <div class="lab-footer">
      <button id="btn-verify-cm" class="btn btn-success btn-lg">
        ${state.isChallengeCompleted('confusion_matrix') ? '✓ Challenge Completed (+100 XP Earned)' : 'Verify Balanced Threshold & Claim XP'}
      </button>
      <div id="cm-feedback" class="feedback-msg"></div>
    </div>
  `;

  function updateMetrics() {
    container.querySelector('#val-threshold').textContent = threshold.toFixed(2);
    container.querySelector('#marker-label').textContent = `Threshold: ${threshold.toFixed(2)}`;

    let tp = 0, fp = 0, tn = 0, fn = 0;

    transactions.forEach(t => {
      const predPositive = t.score >= threshold;
      if (predPositive && t.isFraud) tp++;
      else if (predPositive && !t.isFraud) fp++;
      else if (!predPositive && !t.isFraud) tn++;
      else if (!predPositive && t.isFraud) fn++;
    });

    const precision = tp + fp > 0 ? (tp / (tp + fp)) * 100 : 100;
    const recall = (tp / 15) * 100;
    const f1 = precision + recall > 0 ? (2 * (precision * recall) / (precision + recall)) / 100 : 0;
    const accuracy = ((tp + tn) / 100) * 100;

    container.querySelector('#val-tp').textContent = tp;
    container.querySelector('#val-fp').textContent = fp;
    container.querySelector('#val-fn').textContent = fn;
    container.querySelector('#val-tn').textContent = tn;

    container.querySelector('#dial-recall').textContent = `${Math.round(recall)}%`;
    container.querySelector('#dial-precision').textContent = `${Math.round(precision)}%`;
    container.querySelector('#dial-f1').textContent = f1.toFixed(2);
    container.querySelector('#dial-accuracy').textContent = `${Math.round(accuracy)}%`;

    renderProbStrip(threshold);
    renderRocCurve(tp, fp, tn, fn);
  }

  function renderProbStrip(t) {
    const svg = container.querySelector('#prob-svg');
    const toPxX = s => 30 + s * 480;
    const tPxX = toPxX(t);

    let svgHtml = `
      <rect x="30" y="20" width="480" height="40" fill="#0f172a" rx="6" stroke="#334155" stroke-width="1.5"/>
      <rect x="30" y="20" width="${tPxX - 30}" height="40" fill="rgba(56, 189, 248, 0.1)"/>
      <rect x="${tPxX}" y="20" width="${510 - tPxX}" height="40" fill="rgba(244, 63, 94, 0.15)"/>
      
      <!-- Threshold vertical line -->
      <line x1="${tPxX}" y1="10" x2="${tPxX}" y2="70" stroke="#facc15" stroke-width="3" stroke-dasharray="3,2" />
    `;

    // Render dots
    transactions.forEach(tx => {
      const px = toPxX(tx.score);
      const py = tx.isFraud ? 32 : 48;
      const color = tx.isFraud ? '#f43f5e' : '#38bdf8';
      svgHtml += `<circle cx="${px}" cy="${py}" r="3.8" fill="${color}" opacity="0.8"/>`;
    });

    svg.innerHTML = svgHtml;
  }

  function renderRocCurve(tp, fp, tn, fn) {
    const svg = container.querySelector('#roc-svg');
    const fpr = fp / (fp + tn); // False Positive Rate
    const tpr = tp / (tp + fn); // True Positive Rate (Recall)

    const toPxX = r => 60 + r * 380;
    const toPxY = r => 200 - r * 160;

    // Fixed ROC path for this distribution
    const rocPath = "M 60 200 L 75 125 L 110 80 L 150 55 L 230 45 L 350 42 L 440 40";

    let svgHtml = `
      <!-- Axes -->
      <line x1="60" y1="200" x2="440" y2="200" stroke="#334155" stroke-width="2"/>
      <line x1="60" y1="40" x2="60" y2="200" stroke="#334155" stroke-width="2"/>
      
      <!-- Diagonal random guess line -->
      <line x1="60" y1="200" x2="440" y2="40" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4,4"/>
      <text x="320" y="160" fill="#64748b" font-size="10" transform="rotate(-23 320 160)">Random Guess (AUC = 0.50)</text>

      <text x="250" y="225" fill="#64748b" font-size="11" text-anchor="middle">False Positive Rate (1 - Specificity)</text>
      <text x="25" y="120" fill="#64748b" font-size="11" transform="rotate(-90 25 120)" text-anchor="middle">True Positive Rate (Recall)</text>

      <!-- ROC Curve -->
      <path d="${rocPath}" fill="none" stroke="#a855f7" stroke-width="3"/>
      <text x="240" y="32" fill="#a855f7" font-size="11" font-weight="bold">Model ROC Curve (AUC = 0.91)</text>

      <!-- Active Operating Point -->
      <circle cx="${toPxX(fpr)}" cy="${toPxY(tpr)}" r="7.5" fill="#facc15" stroke="#ffffff" stroke-width="2" class="pulse-point" />
      <text x="${toPxX(fpr) + 12}" y="${toPxY(tpr) + 4}" fill="#facc15" font-size="11" font-weight="bold">Operating Point</text>
    `;

    svg.innerHTML = svgHtml;
  }

  // Event handlers
  container.querySelector('#slider-threshold').addEventListener('input', e => {
    threshold = parseFloat(e.target.value);
    updateMetrics();
  });

  container.querySelector('#btn-verify-cm').addEventListener('click', () => {
    let tp = 0, fp = 0, fn = 0;
    transactions.forEach(t => {
      const pred = t.score >= threshold;
      if (pred && t.isFraud) tp++;
      else if (pred && !t.isFraud) fp++;
      else if (!pred && t.isFraud) fn++;
    });

    const precision = tp + fp > 0 ? (tp / (tp + fp)) * 100 : 0;
    const recall = (tp / 15) * 100;
    const feedback = container.querySelector('#cm-feedback');

    if (recall >= 85 && precision >= 75) {
      const awarded = state.completeChallenge('confusion_matrix', 'matrix_optimizer', 100);
      feedback.className = 'feedback-msg success';
      feedback.innerHTML = `<strong>Production Ready Trade-off!</strong> Threshold ${threshold.toFixed(2)} catches ${Math.round(recall)}% of fraud with ${Math.round(precision)}% precision, protecting user trust and stopping losses! Unlocked 'Fraud Hunter' Badge (+100 XP).`;
      if (awarded) {
        container.querySelector('#btn-verify-cm').textContent = '✓ Challenge Completed (+100 XP Earned)';
      }
    } else {
      sound.playError();
      feedback.className = 'feedback-msg error';
      feedback.innerHTML = `<strong>Balance not achieved yet.</strong> Current Recall: ${Math.round(recall)}% (Need &ge; 85%), Current Precision: ${Math.round(precision)}% (Need &ge; 75%). Adjust threshold towards ~0.42 - 0.48.`;
    }
  });

  updateMetrics();
}
