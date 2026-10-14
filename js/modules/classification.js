// Module 8: Classification, Decision Trees & Random Forest Ensemble
import { state } from '../state.js';
import { sound } from '../audio.js';

export function renderClassification(container) {
  // Decision Tree Split values
  let splitX1 = 4.5;
  let splitY1 = 4.0;
  let showRandomForest = false;

  // 2D Data points (x1, x2, class: 'blue' or 'orange')
  const points = [
    { x: 1.5, y: 1.8, cls: 'blue' },
    { x: 2.2, y: 2.5, cls: 'blue' },
    { x: 3.1, y: 1.5, cls: 'blue' },
    { x: 2.8, y: 3.2, cls: 'blue' },
    { x: 1.8, y: 3.8, cls: 'blue' },
    { x: 3.5, y: 2.8, cls: 'blue' },
    // Orange cluster
    { x: 6.2, y: 6.5, cls: 'orange' },
    { x: 7.1, y: 5.8, cls: 'orange' },
    { x: 5.8, y: 7.2, cls: 'orange' },
    { x: 6.5, y: 8.1, cls: 'orange' },
    { x: 7.8, y: 7.0, cls: 'orange' },
    // Complex quadrant
    { x: 2.0, y: 6.8, cls: 'blue' },
    { x: 2.8, y: 7.5, cls: 'blue' },
    { x: 6.0, y: 2.2, cls: 'orange' },
    { x: 7.2, y: 2.8, cls: 'orange' }
  ];

  container.innerHTML = `
    <div class="lab-header">
      <div class="lab-title-group">
        <span class="lab-badge">Track 2: Data Scientist</span>
        <h2>Classification, Decision Trees & Ensemble Random Forests</h2>
        <p class="lab-desc">Linear lines can't solve all classification problems. Slice the feature plane orthogonally with Decision Trees, measure node purity with Gini Impurity, and harness ensemble wisdom with Random Forests.</p>
      </div>
      <div class="lab-objective">
        <div class="objective-badge">Target Objective</div>
        <div class="objective-text">Tune Split 1 (X₁) and Split 2 (X₂) to achieve <strong>100% Classification Accuracy</strong> with <strong>Gini Impurity = 0.00</strong> in leaf nodes!</div>
      </div>
    </div>

    <!-- Part 1: Interactive 2D Decision Tree Cutter -->
    <div class="interactive-section">
      <div class="section-title">
        <span class="icon">🌲</span> Part 1: Interactive Decision Tree Plane Slicer
      </div>
      <p class="section-subtitle">Move the split sliders to carve the 2D space into pure homogeneous rectangular decision leaves.</p>

      <div class="tree-controls-bar">
        <div class="control-col">
          <label for="slider-split-x">Root Split 1 (Vertical Cut X₁): <strong id="val-split-x">4.5</strong></label>
          <input type="range" id="slider-split-x" min="1.0" max="8.0" step="0.2" value="4.5" class="range-slider" />
        </div>
        <div class="control-col">
          <label for="slider-split-y">Secondary Split 2 (Horizontal Cut X₂): <strong id="val-split-y">4.0</strong></label>
          <input type="range" id="slider-split-y" min="1.0" max="8.0" step="0.2" value="4.0" class="range-slider" />
        </div>
        <div class="control-col">
          <button id="btn-toggle-rf" class="btn btn-secondary">
            ${showRandomForest ? 'Ensemble Forest Mode (5 Trees)' : 'Single Decision Tree'}
          </button>
        </div>
      </div>

      <div class="tree-arena-layout">
        <!-- 2D Feature Space Canvas -->
        <div class="feature-space-box">
          <svg viewBox="0 0 380 320" class="plane-svg" id="plane-svg">
            <!-- Dynamic 2D cuts and points -->
          </svg>
        </div>

        <!-- Visual Hierarchical Tree Diagram -->
        <div class="tree-hierarchy-box" id="tree-hierarchy">
          <!-- Dynamic tree nodes rendered here -->
        </div>
      </div>
    </div>

    <div class="lab-footer">
      <button id="btn-verify-class" class="btn btn-success btn-lg">
        ${state.isChallengeCompleted('classification') ? '✓ Challenge Completed (+100 XP Earned)' : 'Verify Tree Purity & Claim XP'}
      </button>
      <div id="class-feedback" class="feedback-msg"></div>
    </div>
  `;

  function calculateGini(bCount, oCount) {
    const total = bCount + oCount;
    if (total === 0) return 0;
    const pB = bCount / total;
    const pO = oCount / total;
    return 1 - (pB * pB + pO * pO);
  }

  function renderTreeSpace() {
    container.querySelector('#val-split-x').textContent = splitX1.toFixed(1);
    container.querySelector('#val-split-y').textContent = splitY1.toFixed(1);

    const svg = container.querySelector('#plane-svg');
    const toPxX = x => 40 + (x / 9) * 300;
    const toPxY = y => 280 - (y / 9) * 240;

    let svgHtml = `
      <!-- Plane background quadrants -->
      <rect x="40" y="40" width="300" height="240" fill="#0f172a" stroke="#334155" stroke-width="2"/>
    `;

    // Partition rectangles
    const splitPxX = toPxX(splitX1);
    const splitPxY = toPxY(splitY1);

    // Left region (< splitX1)
    svgHtml += `
      <rect x="40" y="40" width="${splitPxX - 40}" height="240" fill="rgba(56, 189, 248, 0.12)"/>
    `;
    // Right Bottom region (> splitX1 and < splitY1)
    svgHtml += `
      <rect x="${splitPxX}" y="${splitPxY}" width="${340 - splitPxX}" height="${280 - splitPxY}" fill="rgba(249, 115, 22, 0.12)"/>
    `;
    // Right Top region (> splitX1 and > splitY1)
    svgHtml += `
      <rect x="${splitPxX}" y="40" width="${340 - splitPxX}" height="${splitPxY - 40}" fill="rgba(249, 115, 22, 0.22)"/>
    `;

    // Split Line 1 (Vertical)
    svgHtml += `
      <line x1="${splitPxX}" y1="40" x2="${splitPxX}" y2="280" stroke="#38bdf8" stroke-width="3" />
      <text x="${splitPxX}" y="32" fill="#38bdf8" font-size="11" font-weight="bold" text-anchor="middle">Split 1 (X₁ = ${splitX1})</text>
    `;

    // Split Line 2 (Horizontal on the right side)
    svgHtml += `
      <line x1="${splitPxX}" y1="${splitPxY}" x2="340" y2="${splitPxY}" stroke="#a855f7" stroke-width="3" stroke-dasharray="3,3"/>
      <text x="345" y="${splitPxY + 4}" fill="#a855f7" font-size="10">X₂ = ${splitY1}</text>
    `;

    // Render Data Points
    points.forEach(p => {
      const px = toPxX(p.x);
      const py = toPxY(p.y);
      const color = p.cls === 'blue' ? '#38bdf8' : '#f97316';
      svgHtml += `<circle cx="${px}" cy="${py}" r="5.5" fill="${color}" stroke="#ffffff" stroke-width="1.2"/>`;
    });

    svg.innerHTML = svgHtml;

    // Render Tree Hierarchy
    const leftPoints = points.filter(p => p.x <= splitX1);
    const rightPoints = points.filter(p => p.x > splitX1);

    const leftBlue = leftPoints.filter(p => p.cls === 'blue').length;
    const leftOrange = leftPoints.filter(p => p.cls === 'orange').length;
    const giniLeft = calculateGini(leftBlue, leftOrange);

    const rightPointsTop = rightPoints.filter(p => p.y > splitY1);
    const rightPointsBottom = rightPoints.filter(p => p.y <= splitY1);

    const rtBlue = rightPointsTop.filter(p => p.cls === 'blue').length;
    const rtOrange = rightPointsTop.filter(p => p.cls === 'orange').length;
    const giniRt = calculateGini(rtBlue, rtOrange);

    const rbBlue = rightPointsBottom.filter(p => p.cls === 'blue').length;
    const rbOrange = rightPointsBottom.filter(p => p.cls === 'orange').length;
    const giniRb = calculateGini(rbBlue, rbOrange);

    const totalErrors = leftOrange + rtBlue + rbBlue;
    const accuracy = Math.round(((points.length - totalErrors) / points.length) * 100);

    const hierBox = container.querySelector('#tree-hierarchy');
    hierBox.innerHTML = `
      <div class="tree-node root-node">
        <div class="node-title">Root: Is X₁ &le; ${splitX1.toFixed(1)}?</div>
        <div class="node-metrics">Samples: ${points.length} | Gini: 0.49</div>
      </div>
      <div class="tree-branches">
        <div class="branch-col">
          <div class="branch-label">True (&le; ${splitX1})</div>
          <div class="tree-node leaf-node ${giniLeft === 0 ? 'node-pure' : 'node-impure'}">
            <div class="node-title">Leaf 1 (Predict: Blue)</div>
            <div class="node-metrics">Blue: ${leftBlue}, Orange: ${leftOrange}</div>
            <div class="node-gini">Gini: ${giniLeft.toFixed(2)} ${giniLeft === 0 ? '✓ Pure' : '⚠️ Impure'}</div>
          </div>
        </div>
        <div class="branch-col">
          <div class="branch-label">False (&gt; ${splitX1})</div>
          <div class="tree-node intermediate-node">
            <div class="node-title">Is X₂ &gt; ${splitY1.toFixed(1)}?</div>
            <div class="node-metrics">Samples: ${rightPoints.length}</div>
          </div>
          <div class="tree-sub-branches">
            <div class="tree-node leaf-node ${giniRt === 0 ? 'node-pure' : 'node-impure'}">
              <div class="node-title">Leaf 2 (Orange)</div>
              <div class="node-gini">Gini: ${giniRt.toFixed(2)}</div>
            </div>
            <div class="tree-node leaf-node ${giniRb === 0 ? 'node-pure' : 'node-impure'}">
              <div class="node-title">Leaf 3 (Orange)</div>
              <div class="node-gini">Gini: ${giniRb.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="tree-accuracy-banner mt-3">
        <span>Overall Tree Accuracy:</span> <strong class="${accuracy >= 95 ? 'text-emerald' : 'text-warning'}">${accuracy}%</strong>
      </div>
    `;
  }

  // Event handlers
  container.querySelector('#slider-split-x').addEventListener('input', e => {
    splitX1 = parseFloat(e.target.value);
    renderTreeSpace();
  });

  container.querySelector('#slider-split-y').addEventListener('input', e => {
    splitY1 = parseFloat(e.target.value);
    renderTreeSpace();
  });

  container.querySelector('#btn-toggle-rf').addEventListener('click', () => {
    sound.playClick();
    showRandomForest = !showRandomForest;
    const btn = container.querySelector('#btn-toggle-rf');
    btn.textContent = showRandomForest ? '✓ Random Forest Ensemble Active' : 'Single Decision Tree';
    btn.className = showRandomForest ? 'btn btn-primary active' : 'btn btn-secondary';
    renderTreeSpace();
  });

  container.querySelector('#btn-verify-class').addEventListener('click', () => {
    // Check if accuracy is 100%
    const leftPoints = points.filter(p => p.x <= splitX1);
    const rightPoints = points.filter(p => p.x > splitX1);
    const leftOrange = leftPoints.filter(p => p.cls === 'orange').length;
    const rtBlue = rightPoints.filter(p => p.y > splitY1 && p.cls === 'blue').length;
    const rbBlue = rightPoints.filter(p => p.y <= splitY1 && p.cls === 'blue').length;
    const accuracy = Math.round(((points.length - (leftOrange + rtBlue + rbBlue)) / points.length) * 100);

    const feedback = container.querySelector('#class-feedback');
    if (accuracy >= 95 && splitX1 >= 4.0 && splitX1 <= 5.2) {
      const awarded = state.completeChallenge('classification', 'tree_splitter', 100);
      feedback.className = 'feedback-msg success';
      feedback.innerHTML = `<strong>Flawless Decision Boundary!</strong> Your orthogonal cuts achieved ${accuracy}% accuracy with near zero leaf impurity! Unlocked 'Gini Chopper' Badge (+100 XP).`;
      if (awarded) {
        container.querySelector('#btn-verify-class').textContent = '✓ Challenge Completed (+100 XP Earned)';
      }
    } else {
      sound.playError();
      feedback.className = 'feedback-msg error';
      feedback.innerHTML = `<strong>Suboptimal split:</strong> Current accuracy is ${accuracy}%. Position Split 1 between the blue and orange clusters (around X₁ = 4.5) to achieve &ge; 95% accuracy!`;
    }
  });

  renderTreeSpace();
}
