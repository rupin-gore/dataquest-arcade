// Module 11: Deep Learning & Neural Network Playground
import { state } from '../state.js';
import { sound } from '../audio.js';

export function renderNeuralNet(container) {
  let activation = 'relu'; // 'relu', 'sigmoid', 'tanh'
  let hiddenCount = 3;
  let trainedEpochs = 0;
  let loss = 0.69;
  let accuracy = 55;

  // XOR non-linear dataset
  const dataset = [
    { x1: -0.7, x2: -0.7, label: 0 },
    { x1: -0.5, x2: -0.8, label: 0 },
    { x1: 0.7, x2: 0.7, label: 0 },
    { x1: 0.8, x2: 0.6, label: 0 },
    // Class 1 (Opposing quadrants)
    { x1: -0.7, x2: 0.7, label: 1 },
    { x1: -0.6, x2: 0.8, label: 1 },
    { x1: 0.7, x2: -0.7, label: 1 },
    { x1: 0.8, x2: -0.5, label: 1 }
  ];

  // Weights state: synthetic trained weight levels
  let weightState = 0; // 0 = random initial, 1 = partial, 2 = fully trained

  container.innerHTML = `
    <div class="lab-header">
      <div class="lab-title-group">
        <span class="lab-badge">Track 2: Data Scientist</span>
        <h2>Deep Learning: Neural Network Playground &amp; Backpropagation</h2>
        <p class="lab-desc">Single neurons are just linear regressions. By stacking hidden layers and injecting non-linear activation functions (ReLU / Sigmoid), neural networks learn to bend decision boundaries into complex geometric shapes.</p>
      </div>
      <div class="lab-objective">
        <div class="objective-badge">Target Objective</div>
        <div class="objective-text">Select <strong>ReLU</strong> or <strong>Sigmoid</strong> activation and train the network until <strong>Accuracy &ge; 95%</strong> on the non-linear XOR problem!</div>
      </div>
    </div>

    <!-- Interactive Architecture Controls -->
    <div class="interactive-section">
      <div class="section-title">
        <span class="icon">🧠</span> Part 1: Architecture &amp; Activation Function
      </div>
      
      <div class="nn-controls-bar">
        <div class="control-col">
          <label>Activation Function: <strong id="val-activation">ReLU</strong></label>
          <div class="btn-group">
            <button class="btn btn-act active" data-act="relu">ReLU (max(0, z))</button>
            <button class="btn btn-act" data-act="sigmoid">Sigmoid (σ)</button>
            <button class="btn btn-act" data-act="tanh">Tanh</button>
          </div>
        </div>
        <div class="control-col">
          <label>Hidden Neurons: <strong id="val-neurons">3 Neurons</strong></label>
          <div class="btn-group">
            <button class="btn btn-neu" data-neu="2">2</button>
            <button class="btn btn-neu active" data-neu="3">3</button>
            <button class="btn btn-neu" data-neu="4">4</button>
          </div>
        </div>
        <div class="control-col btn-group">
          <button id="btn-nn-train-step" class="btn btn-primary">Train +25 Epochs</button>
          <button id="btn-nn-full" class="btn btn-accent">⚡ Fast Backprop Train</button>
          <button id="btn-nn-reset" class="btn btn-ghost">Reset Weights</button>
        </div>
      </div>

      <!-- Network Graph + 2D Decision Surface Side by Side -->
      <div class="nn-arena-grid">
        <!-- SVG Network Architecture Graph -->
        <div class="nn-graph-pane">
          <div class="pane-title">Neural Wiring (Weights &amp; Synapses)</div>
          <svg viewBox="0 0 340 240" class="nn-svg" id="nn-svg">
            <!-- Dynamic network diagram -->
          </svg>
        </div>

        <!-- 2D Non-linear Decision Boundary Heatmap -->
        <div class="nn-boundary-pane">
          <div class="pane-title">2D Decision Surface Heatmap (XOR)</div>
          <svg viewBox="0 0 280 240" class="boundary-svg" id="boundary-svg">
            <!-- Dynamic decision surface & points -->
          </svg>
          <div class="nn-score-strip">
            <span>Loss (BCE): <strong id="val-loss" class="text-warning">0.693</strong></span>
            <span>Accuracy: <strong id="val-acc" class="text-warning">50%</strong></span>
          </div>
        </div>
      </div>
    </div>

    <div class="lab-footer">
      <button id="btn-verify-nn" class="btn btn-success btn-lg">
        ${state.isChallengeCompleted('neural_net') ? '✓ Challenge Completed (+100 XP Earned)' : 'Verify XOR Solution & Claim XP'}
      </button>
      <div id="nn-feedback" class="feedback-msg"></div>
    </div>
  `;

  function renderNetworkGraph() {
    const svg = container.querySelector('#nn-svg');
    const inputY = [70, 170];
    const hiddenY = hiddenCount === 2 ? [90, 150] : (hiddenCount === 3 ? [60, 120, 180] : [50, 100, 150, 200]);
    const outputY = [120];

    const inputX = 50;
    const hiddenX = 170;
    const outputX = 290;

    let svgHtml = '';

    // Draw Synapses (Lines) with weight glow
    const strokeColor = weightState === 2 ? '#10b981' : (weightState === 1 ? '#38bdf8' : '#64748b');
    const strokeWidth = weightState === 2 ? '2.5' : '1.5';

    // Inputs to Hidden
    inputY.forEach(iy => {
      hiddenY.forEach(hy => {
        svgHtml += `<line x1="${inputX}" y1="${iy}" x2="${hiddenX}" y2="${hy}" stroke="${strokeColor}" stroke-width="${strokeWidth}" opacity="0.6"/>`;
      });
    });

    // Hidden to Output
    hiddenY.forEach(hy => {
      svgHtml += `<line x1="${hiddenX}" y1="${hy}" x2="${outputX}" y2="${outputY[0]}" stroke="${strokeColor}" stroke-width="${strokeWidth}" opacity="0.8"/>`;
    });

    // Draw Input Nodes
    inputY.forEach((iy, idx) => {
      svgHtml += `
        <circle cx="${inputX}" cy="${iy}" r="14" fill="#1e293b" stroke="#38bdf8" stroke-width="2.5" />
        <text x="${inputX}" y="${iy + 4}" fill="#38bdf8" font-size="11" font-weight="bold" text-anchor="middle">X${idx+1}</text>
      `;
    });

    // Draw Hidden Nodes
    hiddenY.forEach((hy, idx) => {
      svgHtml += `
        <circle cx="${hiddenX}" cy="${hy}" r="14" fill="#1e293b" stroke="#a855f7" stroke-width="2.5" class="${weightState === 2 ? 'pulse-point' : ''}" />
        <text x="${hiddenX}" y="${hy + 4}" fill="#a855f7" font-size="10" font-weight="bold" text-anchor="middle">h${idx+1}</text>
      `;
    });

    // Draw Output Node
    svgHtml += `
      <circle cx="${outputX}" cy="${outputY[0]}" r="16" fill="#1e293b" stroke="#10b981" stroke-width="3" />
      <text x="${outputX}" y="${outputY[0] + 4}" fill="#10b981" font-size="11" font-weight="bold" text-anchor="middle">ŷ</text>
    `;

    svg.innerHTML = svgHtml;
  }

  function renderBoundary() {
    const svg = container.querySelector('#boundary-svg');
    const toPx = v => 140 + v * 100;

    let svgHtml = `
      <rect x="20" y="20" width="240" height="200" fill="#090d16" stroke="#334155" stroke-width="2" rx="4"/>
    `;

    // Dynamic background decision warp based on weightState
    if (weightState === 0) {
      // Random linear line (50% accuracy)
      svgHtml += `
        <line x1="20" y1="180" x2="260" y2="60" stroke="#f43f5e" stroke-width="2" stroke-dasharray="3,3"/>
      `;
    } else if (weightState === 1) {
      // Warping non-linear curve
      svgHtml += `
        <path d="M 20 120 Q 140 70 260 120" stroke="#38bdf8" stroke-width="3" fill="rgba(56, 189, 248, 0.15)"/>
      `;
    } else {
      // Perfect non-linear XOR separation polygons
      svgHtml += `
        <!-- Class 1 regions (Top-Left & Bottom-Right) -->
        <rect x="20" y="20" width="115" height="95" fill="rgba(244, 63, 94, 0.25)" rx="4"/>
        <rect x="145" y="125" width="115" height="95" fill="rgba(244, 63, 94, 0.25)" rx="4"/>
        <!-- Class 0 regions (Bottom-Left & Top-Right) -->
        <rect x="20" y="125" width="115" height="95" fill="rgba(56, 189, 248, 0.25)" rx="4"/>
        <rect x="145" y="20" width="115" height="95" fill="rgba(56, 189, 248, 0.25)" rx="4"/>
      `;
    }

    // Axes
    svgHtml += `
      <line x1="20" y1="120" x2="260" y2="120" stroke="#334155" stroke-width="1.5" stroke-dasharray="2,2"/>
      <line x1="140" y1="20" x2="140" y2="220" stroke="#334155" stroke-width="1.5" stroke-dasharray="2,2"/>
    `;

    // Points
    dataset.forEach(p => {
      const px = toPx(p.x1);
      const py = toPx(-p.x2);
      const color = p.label === 1 ? '#f43f5e' : '#38bdf8';
      svgHtml += `<circle cx="${px}" cy="${py}" r="5" fill="${color}" stroke="#ffffff" stroke-width="1.2"/>`;
    });

    svg.innerHTML = svgHtml;

    // Update numbers
    if (weightState === 0) {
      loss = 0.693; accuracy = 50;
    } else if (weightState === 1) {
      loss = 0.342; accuracy = 75;
    } else {
      loss = 0.048; accuracy = 100;
    }

    const lossEl = container.querySelector('#val-loss');
    const accEl = container.querySelector('#val-acc');
    lossEl.textContent = loss.toFixed(3);
    accEl.textContent = `${accuracy}%`;

    lossEl.className = loss < 0.1 ? 'text-emerald' : 'text-warning';
    accEl.className = accuracy >= 95 ? 'text-emerald' : 'text-warning';
  }

  // Event handlers
  container.querySelectorAll('.btn-act').forEach(b => {
    b.addEventListener('click', () => {
      sound.playClick();
      container.querySelectorAll('.btn-act').forEach(el => el.classList.remove('active'));
      b.classList.add('active');
      activation = b.dataset.act;
      container.querySelector('#val-activation').textContent = b.textContent;
    });
  });

  container.querySelectorAll('.btn-neu').forEach(b => {
    b.addEventListener('click', () => {
      sound.playClick();
      container.querySelectorAll('.btn-neu').forEach(el => el.classList.remove('active'));
      b.classList.add('active');
      hiddenCount = parseInt(b.dataset.neu);
      container.querySelector('#val-neurons').textContent = `${hiddenCount} Neurons`;
      renderNetworkGraph();
    });
  });

  container.querySelector('#btn-nn-train-step').addEventListener('click', () => {
    sound.playClick();
    if (weightState < 2) weightState++;
    trainedEpochs += 25;
    renderNetworkGraph();
    renderBoundary();
  });

  container.querySelector('#btn-nn-full').addEventListener('click', () => {
    sound.playSuccess();
    weightState = 2;
    trainedEpochs += 100;
    renderNetworkGraph();
    renderBoundary();
  });

  container.querySelector('#btn-nn-reset').addEventListener('click', () => {
    sound.playClick();
    weightState = 0;
    trainedEpochs = 0;
    renderNetworkGraph();
    renderBoundary();
  });

  container.querySelector('#btn-verify-nn').addEventListener('click', () => {
    const feedback = container.querySelector('#nn-feedback');
    if (accuracy >= 95 && (activation === 'relu' || activation === 'sigmoid') && hiddenCount >= 2) {
      const awarded = state.completeChallenge('neural_net', 'neural_tamer', 100);
      feedback.className = 'feedback-msg success';
      feedback.innerHTML = `<strong>Neural Convergence Achieved!</strong> The hidden layer assembled non-linear activation planes to solve XOR with ${accuracy}% accuracy and BCE loss = ${loss.toFixed(3)}! Unlocked 'XOR Conqueror' Badge (+100 XP).`;
      if (awarded) {
        container.querySelector('#btn-verify-nn').textContent = '✓ Challenge Completed (+100 XP Earned)';
      }
    } else {
      sound.playError();
      feedback.className = 'feedback-msg error';
      feedback.innerHTML = `<strong>Network needs more training!</strong> Ensure activation is ReLU or Sigmoid with at least 3 hidden neurons, then run Fast Backprop to achieve &ge; 95% accuracy!`;
    }
  });

  renderNetworkGraph();
  renderBoundary();
}
