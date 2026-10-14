// Module 5: A/B Testing & Statistical Significance Arcade
import { state } from '../state.js';
import { sound } from '../audio.js';

export function renderAbTesting(container) {
  let sampleA = 0;
  let convA = 0;
  let sampleB = 0;
  let convB = 0;

  const trueRateA = 0.052; // 5.2%
  const trueRateB = 0.076; // 7.6% (True 46% lift)

  container.innerHTML = `
    <div class="lab-header">
      <div class="lab-title-group">
        <span class="lab-badge">Track 1: Data Analyst</span>
        <h2>A/B Testing, Sample Size & Hypothesis Significance</h2>
        <p class="lab-desc">Never deploy features based on gut feelings or random variance. Simulate real user traffic, watch the Gaussian distributions separate, and prove true statistical lift.</p>
      </div>
      <div class="lab-objective">
        <div class="objective-badge">Target Objective</div>
        <div class="objective-text">Collect enough sample traffic to achieve <strong>p-value &lt; 0.05</strong> and verify statistically significant lift for Variant B!</div>
      </div>
    </div>

    <!-- Live Experiment Cockpit -->
    <div class="ab-cockpit-grid">
      <!-- Variant A Card -->
      <div class="variant-card variant-control">
        <div class="variant-badge">Control (Variant A)</div>
        <div class="variant-preview">
          <div class="mock-btn mock-btn-a">Sign Up Now (Navy Blue)</div>
        </div>
        <div class="variant-metrics">
          <div class="metric-row"><span>Visitors (N):</span> <strong id="val-na">0</strong></div>
          <div class="metric-row"><span>Conversions:</span> <strong id="val-ca">0</strong></div>
          <div class="metric-row"><span>Observed Rate:</span> <strong id="val-rate-a" class="rate-num">0.00%</strong></div>
        </div>
      </div>

      <!-- Center VS & Test Stats -->
      <div class="ab-summary-center">
        <div class="vs-circle">VS</div>
        <div class="stat-pill-group">
          <div class="stat-pill">
            <span class="pill-title">Observed Lift</span>
            <span class="pill-value text-emerald" id="stat-lift">0.0%</span>
          </div>
          <div class="stat-pill">
            <span class="pill-title">Z-Score</span>
            <span class="pill-value" id="stat-z">0.00</span>
          </div>
          <div class="stat-pill">
            <span class="pill-title">P-Value</span>
            <span class="pill-value" id="stat-p">1.000</span>
          </div>
        </div>
        <div id="significance-banner" class="significance-indicator sign-inconclusive">
          Sample size too small. Run traffic simulation to detect signal!
        </div>
      </div>

      <!-- Variant B Card -->
      <div class="variant-card variant-test">
        <div class="variant-badge">Test (Variant B)</div>
        <div class="variant-preview">
          <div class="mock-btn mock-btn-b">⚡ Start Free Today (Neon Green)</div>
        </div>
        <div class="variant-metrics">
          <div class="metric-row"><span>Visitors (N):</span> <strong id="val-nb">0</strong></div>
          <div class="metric-row"><span>Conversions:</span> <strong id="val-cb">0</strong></div>
          <div class="metric-row"><span>Observed Rate:</span> <strong id="val-rate-b" class="rate-num">0.00%</strong></div>
        </div>
      </div>
    </div>

    <!-- Simulator Controls -->
    <div class="traffic-controls-bar">
      <div class="btn-group">
        <button id="btn-sim-100" class="btn btn-secondary">Simulate +250 Visitors</button>
        <button id="btn-sim-1000" class="btn btn-primary">Simulate +1,500 Visitors</button>
        <button id="btn-sim-5000" class="btn btn-accent">Simulate +5,000 Visitors</button>
        <button id="btn-reset-ab" class="btn btn-ghost">Reset Traffic</button>
      </div>
    </div>

    <!-- Distribution Gaussian Overlap Visualizer -->
    <div class="interactive-section">
      <div class="section-title">
        <span class="icon">📊</span> Sampling Distribution & Confidence Interval Overlap
      </div>
      <p class="section-subtitle">As sample size grows, the standard error narrows. When the two bell curves decouple, you have proven statistical significance!</p>
      <div class="gaussian-canvas-wrapper">
        <svg viewBox="0 0 600 220" class="gaussian-svg" id="gaussian-svg">
          <!-- Dynamic Gaussian curves rendered here -->
        </svg>
      </div>
    </div>

    <div class="lab-footer">
      <button id="btn-verify-ab" class="btn btn-success btn-lg">
        ${state.isChallengeCompleted('ab_testing') ? '✓ Challenge Completed (+100 XP Earned)' : 'Verify Statistical Significance & Claim XP'}
      </button>
      <div id="ab-feedback" class="feedback-msg"></div>
    </div>
  `;

  function simulateTraffic(n) {
    sound.playClick();
    for (let i = 0; i < n; i++) {
      sampleA++;
      if (Math.random() < trueRateA) convA++;
      sampleB++;
      if (Math.random() < trueRateB) convB++;
    }
    updateDisplay();
  }

  function calculatePValue(pA, pB, nA, nB) {
    if (nA < 10 || nB < 10) return { z: 0, p: 1.0 };
    const pPool = (convA + convB) / (nA + nB);
    const se = Math.sqrt(pPool * (1 - pPool) * (1 / nA + 1 / nB));
    if (se === 0) return { z: 0, p: 1.0 };
    const z = (pB - pA) / se;

    // Approximate two-tailed normal cumulative distribution
    // Standard normal CDF approximation
    const normalCdf = x => {
      const t = 1 / (1 + 0.2316419 * Math.abs(x));
      const d = 0.3989423 * Math.exp(-x * x / 2);
      const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
      return x > 0 ? 1 - prob : prob;
    };

    const p = Math.max(0.0001, (1 - normalCdf(Math.abs(z))) * 2);
    return { z, p };
  }

  function updateDisplay() {
    const rateA = sampleA > 0 ? convA / sampleA : 0;
    const rateB = sampleB > 0 ? convB / sampleB : 0;
    const lift = rateA > 0 ? ((rateB - rateA) / rateA) * 100 : 0;

    container.querySelector('#val-na').textContent = sampleA.toLocaleString();
    container.querySelector('#val-ca').textContent = convA.toLocaleString();
    container.querySelector('#val-rate-a').textContent = (rateA * 100).toFixed(2) + '%';

    container.querySelector('#val-nb').textContent = sampleB.toLocaleString();
    container.querySelector('#val-cb').textContent = convB.toLocaleString();
    container.querySelector('#val-rate-b').textContent = (rateB * 100).toFixed(2) + '%';

    const { z, p } = calculatePValue(rateA, rateB, sampleA, sampleB);

    container.querySelector('#stat-lift').textContent = (lift >= 0 ? '+' : '') + lift.toFixed(1) + '%';
    container.querySelector('#stat-z').textContent = z.toFixed(2);
    container.querySelector('#stat-p').textContent = p.toFixed(4);

    const banner = container.querySelector('#significance-banner');
    if (sampleA < 200) {
      banner.className = 'significance-indicator sign-inconclusive';
      banner.textContent = 'Sample size too small. Run traffic simulation to detect signal!';
    } else if (p < 0.01) {
      banner.className = 'significance-indicator sign-significant';
      banner.textContent = `✓ Highly Significant! (p < 0.01, 99% Confidence). Ready for Production Rollout!`;
    } else if (p < 0.05) {
      banner.className = 'significance-indicator sign-significant';
      banner.textContent = `✓ Statistically Significant! (p = ${p.toFixed(3)} < 0.05). Reject the Null Hypothesis!`;
    } else {
      banner.className = 'significance-indicator sign-warning';
      banner.textContent = `⚠️ Inconclusive (p = ${p.toFixed(3)} > 0.05). High risk of false positive / Type I error!`;
    }

    renderGaussianCurves(rateA, rateB, sampleA, sampleB);
  }

  function renderGaussianCurves(rA, rB, nA, nB) {
    const svg = container.querySelector('#gaussian-svg');
    const width = 600;
    const height = 220;

    if (nA < 20) {
      svg.innerHTML = `
        <text x="300" y="110" fill="#64748b" text-anchor="middle" font-size="14">
          Click buttons above to simulate visitor traffic and draw sampling distributions...
        </text>
      `;
      return;
    }

    const seA = Math.sqrt((rA * (1 - rA)) / nA) || 0.01;
    const seB = Math.sqrt((rB * (1 - rB)) / nB) || 0.01;

    const minX = 0.01;
    const maxX = 0.12;
    const toX = x => 50 + ((x - minX) / (maxX - minX)) * 500;

    function getPoints(mean, se, color) {
      let path = '';
      const steps = 60;
      for (let i = 0; i <= steps; i++) {
        const val = minX + (i / steps) * (maxX - minX);
        const z = (val - mean) / se;
        const y = Math.exp(-0.5 * z * z);
        const px = toX(val);
        const py = 180 - y * 130;
        path += (i === 0 ? 'M' : 'L') + ` ${px.toFixed(1)} ${py.toFixed(1)}`;
      }
      return path;
    }

    const pathA = getPoints(rA, seA);
    const pathB = getPoints(rB, seB);

    svg.innerHTML = `
      <line x1="50" y1="180" x2="550" y2="180" stroke="#334155" stroke-width="2"/>
      <text x="50" y="205" fill="#64748b" font-size="11">1.0%</text>
      <text x="300" y="205" fill="#64748b" font-size="11" text-anchor="middle">Observed Conversion Rate</text>
      <text x="550" y="205" fill="#64748b" font-size="11" text-anchor="end">12.0%</text>

      <!-- Curve A -->
      <path d="${pathA}" fill="none" stroke="#38bdf8" stroke-width="3" />
      <text x="${toX(rA)}" y="40" fill="#38bdf8" font-size="12" font-weight="bold" text-anchor="middle">Variant A (${(rA*100).toFixed(1)}%)</text>

      <!-- Curve B -->
      <path d="${pathB}" fill="none" stroke="#10b981" stroke-width="3" />
      <text x="${toX(rB)}" y="40" fill="#10b981" font-size="12" font-weight="bold" text-anchor="middle">Variant B (${(rB*100).toFixed(1)}%)</text>
    `;
  }

  // Button Listeners
  container.querySelector('#btn-sim-100').addEventListener('click', () => simulateTraffic(250));
  container.querySelector('#btn-sim-1000').addEventListener('click', () => simulateTraffic(1500));
  container.querySelector('#btn-sim-5000').addEventListener('click', () => simulateTraffic(5000));
  container.querySelector('#btn-reset-ab').addEventListener('click', () => {
    sound.playClick();
    sampleA = 0; convA = 0; sampleB = 0; convB = 0;
    updateDisplay();
  });

  container.querySelector('#btn-verify-ab').addEventListener('click', () => {
    const rateA = sampleA > 0 ? convA / sampleA : 0;
    const rateB = sampleB > 0 ? convB / sampleB : 0;
    const { p } = calculatePValue(rateA, rateB, sampleA, sampleB);
    const feedback = container.querySelector('#ab-feedback');

    if (p < 0.05 && sampleA >= 1000 && rateB > rateA) {
      const awarded = state.completeChallenge('ab_testing', 'ab_tester', 100);
      feedback.className = 'feedback-msg success';
      feedback.innerHTML = `<strong>Experiment Validated!</strong> With N = ${sampleA.toLocaleString()} per variant, p-value reached ${p.toFixed(4)} (&lt; 0.05). Variant B delivers undeniable lift! Unlocked 'P-Value Champion' Badge (+100 XP).`;
      if (awarded) {
        container.querySelector('#btn-verify-ab').textContent = '✓ Challenge Completed (+100 XP Earned)';
      }
    } else {
      sound.playError();
      feedback.className = 'feedback-msg error';
      feedback.innerHTML = `<strong>Hypothesis not yet statistically significant!</strong> Collect more traffic (N &ge; 1,000) so p-value drops below 0.05 without ambiguity.`;
    }
  });

  updateDisplay();
}
