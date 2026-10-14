// Module 6: Feature Engineering Forge
import { state } from '../state.js';
import { sound } from '../audio.js';

export function renderFeatureEngineering(container) {
  let encodingType = 'onehot';
  let scalingType = 'raw';
  let polynomialLift = false;

  const rawCities = ['Tokyo', 'New York', 'London', 'Paris', 'Tokyo', 'London'];
  const rawData = [
    { age: 22, salary: 45000 },
    { age: 28, salary: 62000 },
    { age: 35, salary: 89000 },
    { age: 48, salary: 145000 },
    { age: 54, salary: 175000 }
  ];

  container.innerHTML = `
    <div class="lab-header">
      <div class="lab-title-group">
        <span class="lab-badge">Track 2: Data Scientist</span>
        <h2>Feature Engineering, Scaling & Polynomial Transformations</h2>
        <p class="lab-desc">Raw features rarely fit machine learning algorithms directly. Transform categories into bitmasks, balance feature scales, and lift non-linear data into higher dimensional space.</p>
      </div>
      <div class="lab-objective">
        <div class="objective-badge">Target Objective</div>
        <div class="objective-text">Select <strong>One-Hot Encoding</strong> to eliminate false ordinal hierarchy, apply <strong>Standard Scaling</strong>, and enable <strong>Polynomial Feature Lift (x₁² + x₂²)</strong> to cleanly separate concentric circles!</div>
      </div>
    </div>

    <!-- Part 1: Encoding Visual Matrix -->
    <div class="interactive-section">
      <div class="section-title">
        <span class="icon">🏷️</span> Part 1: One-Hot vs. Label Encoding Matrix
      </div>
      <p class="section-subtitle">Toggle between Label and One-Hot encoding to observe how categorical strings translate for mathematical models.</p>
      
      <div class="btn-group mb-3">
        <button id="btn-enc-label" class="btn btn-secondary">Label Encoding (0, 1, 2, 3)</button>
        <button id="btn-enc-onehot" class="btn btn-primary active">One-Hot Encoding (Binary Vectors)</button>
      </div>

      <div class="matrix-display" id="encoding-matrix-display">
        <!-- Matrix table rendered here -->
      </div>
      <div id="encoding-warning" class="stat-note mt-2"></div>
    </div>

    <!-- Part 2: Feature Scaling -->
    <div class="interactive-section">
      <div class="section-title">
        <span class="icon">📏</span> Part 2: Feature Scaling (Min-Max vs. StandardScaler)
      </div>
      <p class="section-subtitle">When Salary is 100,000 and Age is 30, Euclidean distance is hijacked by Salary. Scale them to level the playing field!</p>
      
      <div class="btn-group mb-3">
        <button id="btn-scale-raw" class="btn btn-secondary active">Raw Unscaled</button>
        <button id="btn-scale-minmax" class="btn btn-secondary">Min-Max Scaler [0, 1]</button>
        <button id="btn-scale-standard" class="btn btn-primary">StandardScaler (μ=0, σ=1)</button>
      </div>

      <div class="data-table-container">
        <table class="lab-table" id="scaling-table">
          <!-- Dynamic scaled rows -->
        </table>
      </div>
    </div>

    <!-- Part 3: Polynomial Feature Lift (Non-linear separation) -->
    <div class="interactive-section">
      <div class="section-title">
        <span class="icon">🌀</span> Part 3: Polynomial Feature Dimensional Lift
      </div>
      <p class="section-subtitle">In 2D (x₁, x₂), the inner blue circle is trapped inside the red outer ring. A straight linear boundary CANNOT separate them. Lift into 3D by adding z = x₁² + x₂²!</p>

      <div class="poly-controls mb-3">
        <button id="btn-toggle-poly" class="btn btn-accent">
          ${polynomialLift ? '✓ Polynomial Dimension Active (z = x₁² + x₂²)' : '✨ Add Non-Linear Feature: z = x₁² + x₂²'}
        </button>
      </div>

      <div class="poly-canvas-container">
        <svg viewBox="0 0 500 240" class="poly-svg" id="poly-svg">
          <!-- Dynamic 2D / 3D lift rendered here -->
        </svg>
      </div>
      <div id="poly-status" class="stat-note mt-2"></div>
    </div>

    <div class="lab-footer">
      <button id="btn-verify-fe" class="btn btn-success btn-lg">
        ${state.isChallengeCompleted('feature_eng') ? '✓ Challenge Completed (+100 XP Earned)' : 'Verify Transformations & Claim XP'}
      </button>
      <div id="fe-feedback" class="feedback-msg"></div>
    </div>
  `;

  function renderEncoding() {
    const disp = container.querySelector('#encoding-matrix-display');
    const warn = container.querySelector('#encoding-warning');

    if (encodingType === 'label') {
      const map = { 'Tokyo': 0, 'New York': 1, 'London': 2, 'Paris': 3 };
      let html = `<table class="lab-table"><thead><tr><th>Raw City</th><th>Label Encoded (Integer)</th></tr></thead><tbody>`;
      rawCities.forEach(c => {
        html += `<tr><td><strong>${c}</strong></td><td><span class="tag tag-warning">${map[c]}</span></td></tr>`;
      });
      html += `</tbody></table>`;
      disp.innerHTML = html;
      warn.innerHTML = `⚠️ <strong>Danger:</strong> Label encoding introduces false math: London (2) &gt; Tokyo (0), misleading linear models into assuming an artificial numerical order!`;
    } else {
      let html = `<table class="lab-table"><thead><tr><th>Raw City</th><th>is_Tokyo</th><th>is_NewYork</th><th>is_London</th><th>is_Paris</th></tr></thead><tbody>`;
      rawCities.forEach(c => {
        html += `
          <tr>
            <td><strong>${c}</strong></td>
            <td><span class="${c === 'Tokyo' ? 'tag tag-success' : 'tag'}">${c === 'Tokyo' ? '1' : '0'}</span></td>
            <td><span class="${c === 'New York' ? 'tag tag-success' : 'tag'}">${c === 'New York' ? '1' : '0'}</span></td>
            <td><span class="${c === 'London' ? 'tag tag-success' : 'tag'}">${c === 'London' ? '1' : '0'}</span></td>
            <td><span class="${c === 'Paris' ? 'tag tag-success' : 'tag'}">${c === 'Paris' ? '1' : '0'}</span></td>
          </tr>
        `;
      });
      html += `</tbody></table>`;
      disp.innerHTML = html;
      warn.innerHTML = `✓ <strong>Optimal:</strong> One-Hot Encoding creates orthogonal binary dimensions with zero spurious mathematical hierarchy.`;
    }
  }

  function renderScaling() {
    const tbl = container.querySelector('#scaling-table');
    let html = `<thead><tr><th>Subject</th><th>Age</th><th>Salary ($)</th><th>Interpretation</th></tr></thead><tbody>`;

    const ages = rawData.map(d => d.age);
    const salaries = rawData.map(d => d.salary);
    const minAge = Math.min(...ages), maxAge = Math.max(...ages);
    const minSal = Math.min(...salaries), maxSal = Math.max(...salaries);

    const meanAge = ages.reduce((a, b) => a + b) / ages.length;
    const stdAge = Math.sqrt(ages.map(x => Math.pow(x - meanAge, 2)).reduce((a, b) => a + b) / ages.length);

    const meanSal = salaries.reduce((a, b) => a + b) / salaries.length;
    const stdSal = Math.sqrt(salaries.map(x => Math.pow(x - meanSal, 2)).reduce((a, b) => a + b) / salaries.length);

    rawData.forEach((row, idx) => {
      let dispAge, dispSal, note;
      if (scalingType === 'raw') {
        dispAge = `${row.age}`;
        dispSal = `$${row.salary.toLocaleString()}`;
        note = `<span class="text-danger">Salary dominates distance by factor of 3,000x</span>`;
      } else if (scalingType === 'minmax') {
        dispAge = ((row.age - minAge) / (maxAge - minAge)).toFixed(3);
        dispSal = ((row.salary - minSal) / (maxSal - minSal)).toFixed(3);
        note = `<span class="text-warning">Both bounded strictly in [0.00, 1.00]</span>`;
      } else {
        dispAge = ((row.age - meanAge) / stdAge).toFixed(2);
        dispSal = ((row.salary - meanSal) / stdSal).toFixed(2);
        note = `<span class="text-success">Zero Mean (μ=0), Unit Variance (σ=1)</span>`;
      }

      html += `
        <tr>
          <td><strong>Candidate #${idx + 1}</strong></td>
          <td class="cell-numeric">${dispAge}</td>
          <td class="cell-numeric">${dispSal}</td>
          <td>${note}</td>
        </tr>
      `;
    });
    html += `</tbody>`;
    tbl.innerHTML = html;
  }

  function renderPolyLift() {
    const svg = container.querySelector('#poly-svg');
    const status = container.querySelector('#poly-status');

    if (!polynomialLift) {
      // 2D concentric view
      let svgHtml = `
        <!-- 2D Axes -->
        <line x1="50" y1="120" x2="450" y2="120" stroke="#334155" stroke-width="1.5" stroke-dasharray="2,2"/>
        <line x1="250" y1="20" x2="250" y2="220" stroke="#334155" stroke-width="1.5" stroke-dasharray="2,2"/>
        <text x="440" y="140" fill="#64748b" font-size="11">Feature x₁</text>
        <text x="260" y="30" fill="#64748b" font-size="11">Feature x₂</text>

        <!-- Attempted linear boundary (fails) -->
        <line x1="80" y1="20" x2="420" y2="220" stroke="#f43f5e" stroke-width="2" stroke-dasharray="4,4" />
        <text x="350" y="210" fill="#f43f5e" font-size="11">Linear cut fails in 2D (50% Error)</text>
      `;

      // Inner Blue dots (Radius ~ 30)
      for (let i = 0; i < 14; i++) {
        const theta = (i / 14) * 2 * Math.PI;
        const r = 25 + Math.sin(i * 3) * 5;
        const x = 250 + r * Math.cos(theta);
        const y = 120 + r * Math.sin(theta);
        svgHtml += `<circle cx="${x}" cy="${y}" r="4" fill="#38bdf8" />`;
      }

      // Outer Red dots (Radius ~ 75)
      for (let i = 0; i < 22; i++) {
        const theta = (i / 22) * 2 * Math.PI;
        const r = 70 + Math.cos(i * 4) * 6;
        const x = 250 + r * Math.cos(theta);
        const y = 120 + r * Math.sin(theta);
        svgHtml += `<circle cx="${x}" cy="${y}" r="4" fill="#f43f5e" />`;
      }

      svg.innerHTML = svgHtml;
      status.innerHTML = `⚠️ <strong>Non-Linearly Separable in 2D:</strong> No straight line can segregate the blue core from the red shell.`;
    } else {
      // 3D Paraboloid lift view (z = x1^2 + x2^2)
      let svgHtml = `
        <!-- Transformed 2.5D elevation -->
        <line x1="60" y1="200" x2="440" y2="200" stroke="#334155" stroke-width="1.5"/>
        <line x1="250" y1="30" x2="250" y2="200" stroke="#818cf8" stroke-width="2"/>
        <text x="260" y="45" fill="#818cf8" font-size="11">Lifted Dimension z = x₁² + x₂²</text>

        <!-- Hyperplane separator -->
        <rect x="80" y="115" width="340" height="6" fill="rgba(16, 185, 129, 0.4)" rx="3"/>
        <line x1="70" y1="118" x2="430" y2="118" stroke="#10b981" stroke-width="2.5" />
        <text x="435" y="122" fill="#10b981" font-size="11" font-weight="bold">Linear Slicing Plane (100% Accuracy!)</text>
      `;

      // Inner Blue dots now low in z (z = 25^2 = low, y = ~160)
      for (let i = 0; i < 14; i++) {
        const px = 180 + (i / 14) * 140;
        const py = 160 + Math.sin(i * 2) * 8;
        svgHtml += `<circle cx="${px}" cy="${py}" r="4.5" fill="#38bdf8" />`;
      }

      // Outer Red dots now high in z (z = 70^2 = high, y = ~75)
      for (let i = 0; i < 22; i++) {
        const px = 100 + (i / 22) * 300;
        const py = 75 + Math.cos(i * 3) * 10;
        svgHtml += `<circle cx="${px}" cy="${py}" r="4.5" fill="#f43f5e" />`;
      }

      svg.innerHTML = svgHtml;
      status.innerHTML = `✓ <strong>Kernel Trick Magic:</strong> In the elevated 3D space, the points sit at different heights. A flat horizontal hyperplane cleanly separates them with 100% accuracy!`;
    }
  }

  // Event handlers
  container.querySelector('#btn-enc-label').addEventListener('click', () => {
    sound.playClick();
    encodingType = 'label';
    container.querySelector('#btn-enc-label').className = 'btn btn-secondary active';
    container.querySelector('#btn-enc-onehot').className = 'btn btn-primary';
    renderEncoding();
  });

  container.querySelector('#btn-enc-onehot').addEventListener('click', () => {
    sound.playClick();
    encodingType = 'onehot';
    container.querySelector('#btn-enc-onehot').className = 'btn btn-primary active';
    container.querySelector('#btn-enc-label').className = 'btn btn-secondary';
    renderEncoding();
  });

  container.querySelector('#btn-scale-raw').addEventListener('click', () => {
    sound.playClick();
    scalingType = 'raw';
    container.querySelector('#btn-scale-raw').className = 'btn btn-secondary active';
    container.querySelector('#btn-scale-minmax').className = 'btn btn-secondary';
    container.querySelector('#btn-scale-standard').className = 'btn btn-primary';
    renderScaling();
  });

  container.querySelector('#btn-scale-minmax').addEventListener('click', () => {
    sound.playClick();
    scalingType = 'minmax';
    container.querySelector('#btn-scale-minmax').className = 'btn btn-secondary active';
    container.querySelector('#btn-scale-raw').className = 'btn btn-secondary';
    container.querySelector('#btn-scale-standard').className = 'btn btn-primary';
    renderScaling();
  });

  container.querySelector('#btn-scale-standard').addEventListener('click', () => {
    sound.playClick();
    scalingType = 'standard';
    container.querySelector('#btn-scale-standard').className = 'btn btn-primary active';
    container.querySelector('#btn-scale-raw').className = 'btn btn-secondary';
    container.querySelector('#btn-scale-minmax').className = 'btn btn-secondary';
    renderScaling();
  });

  container.querySelector('#btn-toggle-poly').addEventListener('click', () => {
    sound.playClick();
    polynomialLift = !polynomialLift;
    const btn = container.querySelector('#btn-toggle-poly');
    btn.textContent = polynomialLift ? '✓ Polynomial Dimension Active (z = x₁² + x₂²)' : '✨ Add Non-Linear Feature: z = x₁² + x₂²';
    renderPolyLift();
  });

  container.querySelector('#btn-verify-fe').addEventListener('click', () => {
    const feedback = container.querySelector('#fe-feedback');
    if (encodingType === 'onehot' && scalingType === 'standard' && polynomialLift) {
      const awarded = state.completeChallenge('feature_eng', 'feature_forge', 100);
      feedback.className = 'feedback-msg success';
      feedback.innerHTML = `<strong>Feature Engineering Mastery!</strong> One-Hot Encoding prevented ordinal bias, StandardScaler equalized dimensions, and the polynomial lift cracked the non-linear separation! Unlocked 'Dimension Lifter' Badge (+100 XP).`;
      if (awarded) {
        container.querySelector('#btn-verify-fe').textContent = '✓ Challenge Completed (+100 XP Earned)';
      }
    } else {
      sound.playError();
      feedback.className = 'feedback-msg error';
      feedback.innerHTML = `<strong>Incomplete setup:</strong> Ensure you choose <strong>One-Hot Encoding</strong>, apply <strong>StandardScaler</strong>, and activate <strong>Polynomial Lift</strong>.`;
    }
  });

  renderEncoding();
  renderScaling();
  renderPolyLift();
}
