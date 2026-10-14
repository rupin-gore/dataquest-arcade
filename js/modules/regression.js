// Module 7: Supervised Learning - Regression & Gradient Descent
import { state } from '../state.js';
import { sound } from '../audio.js';

export function renderRegression(container) {
  // Scatter points (Hours Studied -> Exam Score / 100)
  const dataPoints = [
    { x: 1.0, y: 0.20 },
    { x: 1.5, y: 0.32 },
    { x: 2.2, y: 0.38 },
    { x: 3.0, y: 0.52 },
    { x: 3.8, y: 0.58 },
    { x: 4.5, y: 0.72 },
    { x: 5.2, y: 0.79 },
    { x: 6.0, y: 0.88 },
    { x: 7.0, y: 0.95 }
  ];

  // Current line parameters
  let slope = 0.06; // Optimal is approx 0.125
  let intercept = 0.10; // Optimal is approx 0.10
  let currentMse = 1.0;

  // Gradient Descent State
  let gdPosition = 3.5; // Starts high on the bowl
  let learningRate = 0.20;
  let gdHistory = [3.5];

  container.innerHTML = `
    <div class="lab-header">
      <div class="lab-title-group">
        <span class="lab-badge">Track 2: Data Scientist</span>
        <h2>Linear Regression & Gradient Descent Mechanics</h2>
        <p class="lab-desc">Linear regression isn't magic; it's minimizing squared residuals. Experience loss optimization hands-on: physically adjust the regression line, then watch Gradient Descent roll down the cost bowl.</p>
      </div>
      <div class="lab-objective">
        <div class="objective-badge">Target Objective</div>
        <div class="objective-text">Adjust Slope &amp; Intercept to bring <strong>MSE &lt; 0.015</strong>, then step Gradient Descent into the optimal loss basin!</div>
      </div>
    </div>

    <!-- Part 1: Fit the Line Game -->
    <div class="interactive-section">
      <div class="section-title">
        <span class="icon">📐</span> Part 1: "Fit the Line" & Mean Squared Error (MSE) Minimizer
      </div>
      <p class="section-subtitle">Tweak the slope (m) and intercept (b). Watch the red residual error bars shrink as you approach the true best-fit line.</p>

      <div class="fit-controls-bar">
        <div class="control-col">
          <label for="slider-slope">Slope (Weight w): <strong id="val-slope">0.06</strong></label>
          <input type="range" id="slider-slope" min="-0.10" max="0.25" step="0.005" value="0.06" class="range-slider" />
        </div>
        <div class="control-col">
          <label for="slider-intercept">Intercept (Bias b): <strong id="val-intercept">0.10</strong></label>
          <input type="range" id="slider-intercept" min="-0.20" max="0.60" step="0.01" value="0.10" class="range-slider" />
        </div>
        <div class="control-col mse-box">
          <span class="mse-label">Mean Squared Error (MSE):</span>
          <strong id="val-mse" class="mse-display text-warning">0.0000</strong>
          <span class="stat-note">Target: &lt; 0.015</span>
        </div>
      </div>

      <div class="regression-canvas-wrapper">
        <svg viewBox="0 0 540 260" class="regression-svg" id="regression-svg">
          <!-- Live scatter, regression line, and error residuals -->
        </svg>
      </div>
    </div>

    <!-- Part 2: Gradient Descent Cost Surface -->
    <div class="interactive-section">
      <div class="section-title">
        <span class="icon">⛷️</span> Part 2: Gradient Descent Cost Bowl (Loss Landscape)
      </div>
      <p class="section-subtitle">Gradient Descent computes the derivative dJ/dw to roll down the slope: w_new = w - α * (dJ/dw). If α is too high, it explodes; if too low, it crawls!</p>

      <div class="gd-controls-bar">
        <div class="control-col">
          <label for="slider-lr">Learning Rate (α): <strong id="val-lr">0.20</strong></label>
          <input type="range" id="slider-lr" min="0.02" max="1.10" step="0.02" value="0.20" class="range-slider" />
        </div>
        <div class="control-col btn-group">
          <button id="btn-gd-step" class="btn btn-primary">Take 1 Gradient Step</button>
          <button id="btn-gd-run" class="btn btn-accent">Run 10 Epochs</button>
          <button id="btn-gd-reset" class="btn btn-ghost">Reset Ball</button>
        </div>
      </div>

      <div class="gd-canvas-wrapper">
        <svg viewBox="0 0 540 220" class="gd-svg" id="gd-svg">
          <!-- Dynamic Loss Bowl rendered here -->
        </svg>
      </div>
      <div id="gd-feedback-note" class="stat-note mt-2"></div>
    </div>

    <div class="lab-footer">
      <button id="btn-verify-reg" class="btn btn-success btn-lg">
        ${state.isChallengeCompleted('regression') ? '✓ Challenge Completed (+100 XP Earned)' : 'Verify Convergence & Claim XP'}
      </button>
      <div id="reg-feedback" class="feedback-msg"></div>
    </div>
  `;

  function updateRegression() {
    container.querySelector('#val-slope').textContent = slope.toFixed(3);
    container.querySelector('#val-intercept').textContent = intercept.toFixed(2);

    // Calculate MSE
    let totalSqError = 0;
    dataPoints.forEach(p => {
      const predY = slope * p.x + intercept;
      totalSqError += Math.pow(p.y - predY, 2);
    });
    currentMse = totalSqError / dataPoints.length;

    const mseDisplay = container.querySelector('#val-mse');
    mseDisplay.textContent = currentMse.toFixed(4);
    mseDisplay.className = currentMse < 0.015 ? 'mse-display text-emerald' : 'mse-display text-warning';

    // Render SVG
    const svg = container.querySelector('#regression-svg');
    const minX = 0, maxX = 8;
    const minY = 0, maxY = 1.1;

    const toPxX = x => 50 + (x / maxX) * 440;
    const toPxY = y => 220 - (y / maxY) * 180;

    let svgHtml = `
      <!-- Axes -->
      <line x1="50" y1="220" x2="490" y2="220" stroke="#334155" stroke-width="2"/>
      <line x1="50" y1="40" x2="50" y2="220" stroke="#334155" stroke-width="2"/>
      <text x="270" y="245" fill="#64748b" font-size="11" text-anchor="middle">Study Hours (Feature X)</text>
      <text x="20" y="130" fill="#64748b" font-size="11" transform="rotate(-90 20 130)" text-anchor="middle">Score (Target Y)</text>
    `;

    // Regression Line
    const x0 = 0, y0 = slope * x0 + intercept;
    const x1 = 8, y1 = slope * x1 + intercept;
    svgHtml += `
      <line x1="${toPxX(x0)}" y1="${toPxY(y0)}" x2="${toPxX(x1)}" y2="${toPxY(y1)}" stroke="#38bdf8" stroke-width="3"/>
    `;

    // Data points & residual bars
    dataPoints.forEach(p => {
      const predY = slope * p.x + intercept;
      const px = toPxX(p.x);
      const pyActual = toPxY(p.y);
      const pyPred = toPxY(predY);

      // Red residual line (error)
      svgHtml += `<line x1="${px}" y1="${pyActual}" x2="${px}" y2="${pyPred}" stroke="#f43f5e" stroke-width="2" stroke-dasharray="3,2" opacity="0.8"/>`;
      // Data point
      svgHtml += `<circle cx="${px}" cy="${pyActual}" r="5" fill="#facc15" />`;
    });

    svg.innerHTML = svgHtml;
  }

  function updateGradientDescent() {
    container.querySelector('#val-lr').textContent = learningRate.toFixed(2);
    const svg = container.querySelector('#gd-svg');
    const note = container.querySelector('#gd-feedback-note');

    // Cost Bowl: J(w) = 0.5 * (w - 0)^2 (Minimum at w = 0)
    // Loss derivative: dJ/dw = w
    const minW = -4, maxW = 4;
    const toSvgX = w => 70 + ((w - minW) / (maxW - minW)) * 400;
    const toSvgY = loss => 180 - Math.min(150, loss * 18);

    // Draw parabola path
    let bowlPath = '';
    for (let w = -3.8; w <= 3.8; w += 0.2) {
      const loss = 0.5 * w * w;
      const sx = toSvgX(w);
      const sy = toSvgY(loss);
      bowlPath += (bowlPath === '' ? 'M' : 'L') + ` ${sx.toFixed(1)} ${sy.toFixed(1)}`;
    }

    let svgHtml = `
      <!-- Bowl line -->
      <path d="${bowlPath}" fill="none" stroke="#6366f1" stroke-width="3" />
      <line x1="70" y1="185" x2="470" y2="185" stroke="#334155" stroke-width="1.5" />
      <text x="${toSvgX(0)}" y="205" fill="#10b981" font-size="11" text-anchor="middle">Global Minimum (w* = 0, Loss = 0)</text>
    `;

    // Draw trail
    for (let i = 0; i < gdHistory.length - 1; i++) {
      const w1 = gdHistory[i];
      const w2 = gdHistory[i + 1];
      const l1 = 0.5 * w1 * w1;
      const l2 = 0.5 * w2 * w2;
      svgHtml += `<line x1="${toSvgX(w1)}" y1="${toSvgY(l1)}" x2="${toSvgX(w2)}" y2="${toSvgY(l2)}" stroke="#f43f5e" stroke-width="1.5" stroke-dasharray="2,2"/>`;
    }

    // Current Ball position
    const currentLoss = 0.5 * gdPosition * gdPosition;
    const ballX = toSvgX(Math.max(-4, Math.min(4, gdPosition)));
    const ballY = toSvgY(currentLoss);

    svgHtml += `
      <circle cx="${ballX}" cy="${ballY}" r="9" fill="#10b981" stroke="#ffffff" stroke-width="2" class="pulse-point" />
      <text x="${ballX}" y="${ballY - 14}" fill="#10b981" font-size="11" font-weight="bold" text-anchor="middle">Loss: ${currentLoss.toFixed(3)}</text>
    `;

    svg.innerHTML = svgHtml;

    if (Math.abs(gdPosition) < 0.15) {
      note.innerHTML = `✓ <strong>Converged!</strong> The ball has arrived at the global loss minimum with gradient ≈ 0.`;
    } else if (Math.abs(gdPosition) > 3.8) {
      note.innerHTML = `⚠️ <strong>Divergence Alert!</strong> High learning rate caused the weight update to overshoot and explode outside the bowl. Lower α!`;
    } else {
      note.innerHTML = `Rolling down... Current parameter w = ${gdPosition.toFixed(2)}, Loss = ${currentLoss.toFixed(3)}.`;
    }
  }

  function stepGd() {
    sound.playClick();
    const grad = gdPosition; // dJ/dw
    gdPosition = gdPosition - learningRate * grad;
    gdHistory.push(gdPosition);
    updateGradientDescent();
  }

  // Event handlers
  container.querySelector('#slider-slope').addEventListener('input', e => {
    slope = parseFloat(e.target.value);
    updateRegression();
  });

  container.querySelector('#slider-intercept').addEventListener('input', e => {
    intercept = parseFloat(e.target.value);
    updateRegression();
  });

  container.querySelector('#slider-lr').addEventListener('input', e => {
    learningRate = parseFloat(e.target.value);
    updateGradientDescent();
  });

  container.querySelector('#btn-gd-step').addEventListener('click', stepGd);

  container.querySelector('#btn-gd-run').addEventListener('click', () => {
    sound.playClick();
    for (let i = 0; i < 10; i++) {
      const grad = gdPosition;
      gdPosition = gdPosition - learningRate * grad;
      gdHistory.push(gdPosition);
    }
    updateGradientDescent();
  });

  container.querySelector('#btn-gd-reset').addEventListener('click', () => {
    sound.playClick();
    gdPosition = 3.5;
    gdHistory = [3.5];
    updateGradientDescent();
  });

  container.querySelector('#btn-verify-reg').addEventListener('click', () => {
    const feedback = container.querySelector('#reg-feedback');
    if (currentMse < 0.015 && Math.abs(gdPosition) < 0.20) {
      const awarded = state.completeChallenge('regression', 'gradient_surfer', 100);
      feedback.className = 'feedback-msg success';
      feedback.innerHTML = `<strong>Master of the Loss Landscape!</strong> Line fit achieved MSE = ${currentMse.toFixed(4)} (&lt; 0.015) and Gradient Descent settled into the minimum bowl! Unlocked 'Cost Surface Surfer' Badge (+100 XP).`;
      if (awarded) {
        container.querySelector('#btn-verify-reg').textContent = '✓ Challenge Completed (+100 XP Earned)';
      }
    } else {
      sound.playError();
      feedback.className = 'feedback-msg error';
      feedback.innerHTML = `<strong>Not quite there!</strong> Ensure your regression line hits <strong>MSE &lt; 0.015</strong> (current: ${currentMse.toFixed(4)}) and step the Gradient Descent ball into the center bowl (|w| &lt; 0.20).`;
    }
  });

  updateRegression();
  updateGradientDescent();
}
