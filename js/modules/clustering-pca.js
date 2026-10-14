// Module 9: Unsupervised Learning - K-Means Clustering & PCA
import { state } from '../state.js';
import { sound } from '../audio.js';

export function renderClusteringPca(container) {
  let k = 3;
  let currentStep = 'init';
  let inertia = 120.0;
  let iterations = 0;

  // 3 Customer persona clusters in (Annual Income, Spending Score)
  const basePoints = [
    // Cluster 1: Low Income, High Spend (Young Spenders)
    { x: 20, y: 80 }, { x: 25, y: 75 }, { x: 18, y: 88 }, { x: 30, y: 72 }, { x: 22, y: 82 },
    // Cluster 2: High Income, Low Spend (Frugal High-Earners)
    { x: 85, y: 22 }, { x: 92, y: 18 }, { x: 78, y: 30 }, { x: 88, y: 25 }, { x: 95, y: 15 },
    // Cluster 3: High Income, High Spend (VIP Luxury)
    { x: 82, y: 85 }, { x: 75, y: 92 }, { x: 88, y: 78 }, { x: 90, y: 89 }, { x: 79, y: 82 },
    // Moderate core
    { x: 50, y: 50 }, { x: 55, y: 48 }, { x: 45, y: 55 }, { x: 52, y: 52 }
  ];

  let points = basePoints.map(p => ({ ...p, cluster: -1 }));

  // Initial random centroids
  let centroids = [
    { x: 25, y: 30, color: '#38bdf8' },
    { x: 60, y: 80, color: '#f43f5e' },
    { x: 70, y: 40, color: '#10b981' }
  ];

  // PCA State
  let pcaAngle = 35; // degrees

  container.innerHTML = `
    <div class="lab-header">
      <div class="lab-title-group">
        <span class="lab-badge">Track 2: Data Scientist</span>
        <h2>Unsupervised Learning: K-Means Clustering & PCA</h2>
        <p class="lab-desc">Unsupervised models uncover hidden structures without labels. Step through K-Means centroid mechanics to segment customer personas, then rotate PCA vectors to compress dimensions.</p>
      </div>
      <div class="lab-objective">
        <div class="objective-badge">Target Objective</div>
        <div class="objective-text">Set <strong>K = 3</strong> and converge centroids until <strong>Inertia &lt; 45.0</strong>, then align the PCA axis to explain <strong>&gt; 80% Variance</strong>!</div>
      </div>
    </div>

    <!-- Part 1: Interactive K-Means Arena -->
    <div class="interactive-section">
      <div class="section-title">
        <span class="icon">🪐</span> Part 1: Interactive K-Means Clustering Workbench
      </div>
      <p class="section-subtitle">Observe the classic Expectation-Maximization cycle: 1) Assign each point to the nearest centroid, 2) Move centroids to the mean of their assigned points.</p>

      <div class="kmeans-controls-bar">
        <div class="control-col">
          <label>Select Clusters (K):</label>
          <div class="btn-group">
            <button class="btn btn-k" data-k="2">K=2</button>
            <button class="btn btn-k active" data-k="3">K=3</button>
            <button class="btn btn-k" data-k="4">K=4</button>
          </div>
        </div>
        <div class="control-col btn-group">
          <button id="btn-kmeans-step" class="btn btn-primary">Step Next (Assign / Update)</button>
          <button id="btn-kmeans-converge" class="btn btn-accent">Run to Convergence</button>
          <button id="btn-kmeans-reset" class="btn btn-ghost">Reset Centroids</button>
        </div>
        <div class="control-col stat-pill-box">
          <span class="pill-label">Cluster Inertia (WCSS):</span>
          <strong id="val-inertia" class="text-warning">120.0</strong>
          <span class="stat-note">Epoch: <span id="val-epoch">0</span></span>
        </div>
      </div>

      <div class="kmeans-canvas-wrapper">
        <svg viewBox="0 0 520 280" class="kmeans-svg" id="kmeans-svg">
          <!-- Live cluster points & centroids -->
        </svg>
      </div>
    </div>

    <!-- Part 2: PCA Dimensionality Reduction -->
    <div class="interactive-section">
      <div class="section-title">
        <span class="icon">📐</span> Part 2: Principal Component Analysis (PCA) Variance Maximizer
      </div>
      <p class="section-subtitle">Rotate the projection axis (PC1) to find the direction of maximum variance in the 2D feature space.</p>

      <div class="pca-controls-bar">
        <label for="slider-pca-angle">Projection Angle (PC1): <strong id="val-pca-angle">35°</strong></label>
        <input type="range" id="slider-pca-angle" min="0" max="180" step="5" value="35" class="range-slider" />
        <span id="pca-variance-badge" class="badge badge-success">Explained Variance: 84%</span>
      </div>

      <div class="pca-canvas-wrapper">
        <svg viewBox="0 0 520 200" class="pca-svg" id="pca-svg">
          <!-- Live PCA projection rendered here -->
        </svg>
      </div>
    </div>

    <div class="lab-footer">
      <button id="btn-verify-clustering" class="btn btn-success btn-lg">
        ${state.isChallengeCompleted('clustering') ? '✓ Challenge Completed (+100 XP Earned)' : 'Verify Unsupervised Mastery & Claim XP'}
      </button>
      <div id="clustering-feedback" class="feedback-msg"></div>
    </div>
  `;

  function calculateDistance(p1, p2) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  }

  function assignClusters() {
    points.forEach(p => {
      let minDist = Infinity;
      let closestCluster = 0;
      centroids.slice(0, k).forEach((c, idx) => {
        const dist = calculateDistance(p, c);
        if (dist < minDist) {
          minDist = dist;
          closestCluster = idx;
        }
      });
      p.cluster = closestCluster;
    });
  }

  function updateCentroidPositions() {
    let newInertia = 0;
    for (let i = 0; i < k; i++) {
      const assigned = points.filter(p => p.cluster === i);
      if (assigned.length > 0) {
        const meanX = assigned.reduce((sum, p) => sum + p.x, 0) / assigned.length;
        const meanY = assigned.reduce((sum, p) => sum + p.y, 0) / assigned.length;
        centroids[i].x = meanX;
        centroids[i].y = meanY;

        assigned.forEach(p => {
          newInertia += Math.pow(calculateDistance(p, centroids[i]), 2);
        });
      }
    }
    inertia = Math.round(newInertia / 10);
    iterations++;
  }

  function renderKMeansSvg() {
    container.querySelector('#val-inertia').textContent = inertia.toFixed(1);
    container.querySelector('#val-inertia').className = inertia < 45 ? 'text-emerald' : 'text-warning';
    container.querySelector('#val-epoch').textContent = iterations;

    const svg = container.querySelector('#kmeans-svg');
    const toPxX = x => 40 + (x / 100) * 440;
    const toPxY = y => 250 - (y / 100) * 210;

    let svgHtml = `
      <!-- Axes -->
      <line x1="40" y1="250" x2="480" y2="250" stroke="#334155" stroke-width="2"/>
      <line x1="40" y1="40" x2="40" y2="250" stroke="#334155" stroke-width="2"/>
      <text x="260" y="272" fill="#64748b" font-size="11" text-anchor="middle">Annual Income ($k)</text>
      <text x="20" y="145" fill="#64748b" font-size="11" transform="rotate(-90 20 145)" text-anchor="middle">Spending Score (1-100)</text>
    `;

    // Render connection lines from points to assigned centroids
    if (currentStep !== 'init') {
      points.forEach(p => {
        if (p.cluster !== -1 && p.cluster < k) {
          const c = centroids[p.cluster];
          svgHtml += `<line x1="${toPxX(p.x)}" y1="${toPxY(p.y)}" x2="${toPxX(c.x)}" y2="${toPxY(c.y)}" stroke="${c.color}" stroke-width="0.8" opacity="0.4" stroke-dasharray="2,2"/>`;
        }
      });
    }

    // Render Points
    points.forEach(p => {
      const px = toPxX(p.x);
      const py = toPxY(p.y);
      const color = p.cluster !== -1 && p.cluster < k ? centroids[p.cluster].color : '#94a3b8';
      svgHtml += `<circle cx="${px}" cy="${py}" r="5.5" fill="${color}" stroke="#ffffff" stroke-width="1.2"/>`;
    });

    // Render Centroids (Big glowing stars / diamonds)
    centroids.slice(0, k).forEach((c, i) => {
      const cx = toPxX(c.x);
      const cy = toPxY(c.y);
      svgHtml += `
        <polygon points="${cx},${cy-12} ${cx+10},${cy} ${cx},${cy+12} ${cx-10},${cy}" fill="${c.color}" stroke="#ffffff" stroke-width="2" class="pulse-point"/>
        <text x="${cx}" y="${cy-16}" fill="${c.color}" font-size="11" font-weight="bold" text-anchor="middle">μ${i+1}</text>
      `;
    });

    svg.innerHTML = svgHtml;
  }

  function renderPca() {
    container.querySelector('#val-pca-angle').textContent = `${pcaAngle}°`;
    const rad = (pcaAngle * Math.PI) / 180;
    
    // Optimal PCA angle for this diagonal cluster is ~40-45 degrees
    const angleDiff = Math.abs(pcaAngle - 45);
    const explainedVar = Math.max(45, Math.round(92 - (angleDiff / 90) * 45));

    const badge = container.querySelector('#pca-variance-badge');
    badge.textContent = `Explained Variance: ${explainedVar}%`;
    badge.className = explainedVar >= 80 ? 'badge badge-success' : 'badge badge-warning';

    const svg = container.querySelector('#pca-svg');
    const cx = 260, cy = 100;
    const len = 180;
    const x1 = cx - len * Math.cos(rad);
    const y1 = cy - len * Math.sin(rad);
    const x2 = cx + len * Math.cos(rad);
    const y2 = cy + len * Math.sin(rad);

    let svgHtml = `
      <!-- Center frame -->
      <circle cx="${cx}" cy="${cy}" r="4" fill="#64748b"/>
      
      <!-- Principal Axis PC1 -->
      <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#10b981" stroke-width="3"/>
      <text x="${x2 + 10}" y="${y2 + 4}" fill="#10b981" font-size="12" font-weight="bold">PC₁</text>

      <!-- Orthogonal PC2 -->
      <line x1="${cx - 60 * Math.sin(rad)}" y1="${cy + 60 * Math.cos(rad)}" x2="${cx + 60 * Math.sin(rad)}" y2="${cy - 60 * Math.cos(rad)}" stroke="#818cf8" stroke-width="2" stroke-dasharray="3,3"/>
      <text x="${cx + 65 * Math.sin(rad)}" y="${cy - 65 * Math.cos(rad)}" fill="#818cf8" font-size="10">PC₂</text>
    `;

    // Synthetic projected points
    points.forEach((p, idx) => {
      const px = 260 + (p.x - 55) * 2.5;
      const py = 100 - (p.y - 55) * 1.5;
      svgHtml += `<circle cx="${px}" cy="${py}" r="3.5" fill="#38bdf8" opacity="0.6"/>`;
    });

    svg.innerHTML = svgHtml;
  }

  // Event handlers
  container.querySelectorAll('.btn-k').forEach(b => {
    b.addEventListener('click', () => {
      sound.playClick();
      container.querySelectorAll('.btn-k').forEach(el => el.classList.remove('active'));
      b.classList.add('active');
      k = parseInt(b.dataset.k);
      points.forEach(p => p.cluster = -1);
      currentStep = 'init';
      iterations = 0;
      inertia = 120.0;
      renderKMeansSvg();
    });
  });

  container.querySelector('#btn-kmeans-step').addEventListener('click', () => {
    sound.playClick();
    if (currentStep === 'init' || currentStep === 'update') {
      assignClusters();
      currentStep = 'assign';
    } else {
      updateCentroidPositions();
      currentStep = 'update';
    }
    renderKMeansSvg();
  });

  container.querySelector('#btn-kmeans-converge').addEventListener('click', () => {
    sound.playClick();
    for (let i = 0; i < 6; i++) {
      assignClusters();
      updateCentroidPositions();
    }
    currentStep = 'update';
    renderKMeansSvg();
  });

  container.querySelector('#btn-kmeans-reset').addEventListener('click', () => {
    sound.playClick();
    centroids = [
      { x: 25, y: 30, color: '#38bdf8' },
      { x: 60, y: 80, color: '#f43f5e' },
      { x: 70, y: 40, color: '#10b981' }
    ];
    points.forEach(p => p.cluster = -1);
    currentStep = 'init';
    iterations = 0;
    inertia = 120.0;
    renderKMeansSvg();
  });

  container.querySelector('#slider-pca-angle').addEventListener('input', e => {
    pcaAngle = parseInt(e.target.value);
    renderPca();
  });

  container.querySelector('#btn-verify-clustering').addEventListener('click', () => {
    const angleDiff = Math.abs(pcaAngle - 45);
    const explainedVar = Math.max(45, Math.round(92 - (angleDiff / 90) * 45));
    const feedback = container.querySelector('#clustering-feedback');

    if (k === 3 && inertia <= 45.0 && explainedVar >= 80) {
      const awarded = state.completeChallenge('clustering', 'cluster_king', 100);
      feedback.className = 'feedback-msg success';
      feedback.innerHTML = `<strong>Unsupervised Discovery Complete!</strong> K=3 segmented the 3 customer cohorts with low inertia (${inertia}), and PC1 captured ${explainedVar}% of the variance! Unlocked 'Voronoi Master' Badge (+100 XP).`;
      if (awarded) {
        container.querySelector('#btn-verify-clustering').textContent = '✓ Challenge Completed (+100 XP Earned)';
      }
    } else {
      sound.playError();
      feedback.className = 'feedback-msg error';
      feedback.innerHTML = `<strong>Criteria not fulfilled:</strong> Ensure K = 3, run K-Means until Inertia &le; 45.0 (currently ${inertia}), and rotate the PCA slider until Explained Variance &ge; 80% (currently ${explainedVar}%).`;
    }
  });

  renderKMeansSvg();
  renderPca();
}
