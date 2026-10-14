// Module 4: Business Intelligence, Metrics & Funnel Optimization
import { state } from '../state.js';
import { sound } from '../audio.js';

export function renderBiDashboard(container) {
  // Funnel settings
  let impressions = 100000;
  let viewRate = 0.40; // 40,000
  let cartRate = 0.25; // 10,000
  let checkoutRate = 0.20; // 2,000 (Bottleneck!)
  let purchaseRate = 0.70; // 1,400
  let aov = 95; // Average Order Value

  // Retention state
  let hasIntervention = false;

  container.innerHTML = `
    <div class="lab-header">
      <div class="lab-title-group">
        <span class="lab-badge">Track 1: Data Analyst</span>
        <h2>Business Intelligence & Conversion Funnel Optimization</h2>
        <p class="lab-desc">BI isn't just making pretty charts; it's identifying revenue leaks, analyzing cohort retention, and telling executive stories with undeniable business ROI.</p>
      </div>
      <div class="lab-objective">
        <div class="objective-badge">Target Objective</div>
        <div class="objective-text">Detect and plug the checkout bottleneck to surpass <strong>$45,000 in monthly revenue</strong>, and activate the cohort retention intervention!</div>
      </div>
    </div>

    <!-- Live Executive KPI Cards -->
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-title">Gross Monthly Revenue</div>
        <div class="kpi-value text-emerald" id="kpi-revenue">$0</div>
        <div class="kpi-subtext" id="kpi-revenue-target">Target: &gt; $45,000</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-title">Paying Customers</div>
        <div class="kpi-value" id="kpi-customers">0</div>
        <div class="kpi-subtext">Completed Transactions</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-title">End-to-End Conversion Rate</div>
        <div class="kpi-value" id="kpi-conv">0.0%</div>
        <div class="kpi-subtext">Visitors to Buyers</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-title">LTV : CAC Ratio</div>
        <div class="kpi-value" id="kpi-ltv-cac">2.1x</div>
        <div class="kpi-subtext">Healthy SaaS Benchmark: &gt; 3.0x</div>
      </div>
    </div>

    <!-- Funnel Leak Playground -->
    <div class="interactive-section">
      <div class="section-title">
        <span class="icon">🔽</span> Part 1: Interactive E-Commerce Conversion Funnel
      </div>
      <p class="section-subtitle">Notice the massive drop-off at Checkout. Tweak the checkout friction and 1-click buy toggle to restore flow!</p>

      <div class="funnel-controls-bar">
        <div class="control-col">
          <label for="slider-checkout">Checkout Step Completion Rate: <strong id="val-checkout">20%</strong> (High Friction)</label>
          <input type="range" id="slider-checkout" min="15" max="85" step="5" value="20" class="range-slider" />
        </div>
        <div class="control-col">
          <label for="slider-aov">Average Order Value (AOV): <strong id="val-aov">$95</strong></label>
          <input type="range" id="slider-aov" min="50" max="180" step="5" value="95" class="range-slider" />
        </div>
      </div>

      <div class="funnel-visual-bars" id="funnel-bars-container">
        <!-- Live Funnel Bars -->
      </div>
    </div>

    <!-- Cohort Retention Heatmap -->
    <div class="interactive-section">
      <div class="section-title">
        <span class="icon">📅</span> Part 2: Cohort Retention Matrix
      </div>
      <p class="section-subtitle">Track how user engagement decays month over month. Click the Lifecycle Intervention button to simulate product improvements.</p>
      
      <div class="cohort-actions">
        <button id="btn-cohort-intervene" class="btn btn-primary">
          ${hasIntervention ? '✓ Onboarding Re-Engagement Active' : '🚀 Apply Onboarding & Email Re-Engagement'}
        </button>
      </div>

      <div class="cohort-table-wrapper" id="cohort-table-container">
        <!-- Cohort heatmap table rendered here -->
      </div>
    </div>

    <div class="lab-footer">
      <button id="btn-verify-bi" class="btn btn-success btn-lg">
        ${state.isChallengeCompleted('bi_dashboard') ? '✓ Challenge Completed (+100 XP Earned)' : 'Verify Business ROI & Claim XP'}
      </button>
      <div id="bi-feedback" class="feedback-msg"></div>
    </div>
  `;

  function updateFunnel() {
    const views = Math.round(impressions * viewRate);
    const carts = Math.round(views * cartRate);
    const checkouts = Math.round(carts * checkoutRate);
    const buyers = Math.round(checkouts * purchaseRate);
    const revenue = buyers * aov;
    const overallConv = ((buyers / impressions) * 100).toFixed(2);
    const ltvCac = (2.1 * (checkoutRate / 0.20)).toFixed(1);

    container.querySelector('#kpi-revenue').textContent = '$' + revenue.toLocaleString();
    container.querySelector('#kpi-customers').textContent = buyers.toLocaleString();
    container.querySelector('#kpi-conv').textContent = `${overallConv}%`;
    container.querySelector('#kpi-ltv-cac').textContent = `${ltvCac}x`;

    const funnelDiv = container.querySelector('#funnel-bars-container');
    const stages = [
      { name: '1. Ad Impressions', count: impressions, pct: 100, color: '#38bdf8' },
      { name: '2. Product Views', count: views, pct: Math.round((views / impressions) * 100), color: '#60a5fa' },
      { name: '3. Added to Cart', count: carts, pct: Math.round((carts / impressions) * 100), color: '#818cf8' },
      { name: '4. Checkout Started', count: checkouts, pct: Math.round((checkouts / impressions) * 100), color: checkoutRate < 0.35 ? '#f43f5e' : '#a855f7' },
      { name: '5. Completed Purchase', count: buyers, pct: Math.round((buyers / impressions) * 100), color: '#10b981' }
    ];

    let html = '';
    stages.forEach(st => {
      const widthPct = Math.max(12, Math.round((st.count / impressions) * 100));
      html += `
        <div class="funnel-row">
          <div class="funnel-label">${st.name}</div>
          <div class="funnel-bar-wrapper">
            <div class="funnel-bar" style="width: ${widthPct}%; background-color: ${st.color}">
              <span class="funnel-count">${st.count.toLocaleString()} (${st.pct}%)</span>
            </div>
          </div>
        </div>
      `;
    });
    funnelDiv.innerHTML = html;
  }

  function renderCohortTable() {
    const tableDiv = container.querySelector('#cohort-table-container');
    const cohorts = [
      { cohort: 'Jan 2026', size: 1200, m0: 100, m1: hasIntervention ? 62 : 45, m2: hasIntervention ? 52 : 32, m3: hasIntervention ? 46 : 24, m4: hasIntervention ? 41 : 18, m5: hasIntervention ? 38 : 14 },
      { cohort: 'Feb 2026', size: 1450, m0: 100, m1: hasIntervention ? 65 : 48, m2: hasIntervention ? 54 : 34, m3: hasIntervention ? 48 : 26, m4: hasIntervention ? 43 : 20, m5: null },
      { cohort: 'Mar 2026', size: 1600, m0: 100, m1: hasIntervention ? 68 : 50, m2: hasIntervention ? 57 : 37, m3: hasIntervention ? 51 : 28, m4: null, m5: null },
      { cohort: 'Apr 2026', size: 1900, m0: 100, m1: hasIntervention ? 72 : 53, m2: hasIntervention ? 60 : 39, m3: null, m4: null, m5: null }
    ];

    function getCellColor(pct) {
      if (pct === null) return 'background: transparent; color: #64748b;';
      if (pct >= 80) return 'background: rgba(16, 185, 129, 0.6); color: #fff;';
      if (pct >= 55) return 'background: rgba(16, 185, 129, 0.35); color: #e2e8f0;';
      if (pct >= 35) return 'background: rgba(56, 189, 248, 0.25); color: #e2e8f0;';
      if (pct >= 20) return 'background: rgba(245, 158, 11, 0.25); color: #fbbf24;';
      return 'background: rgba(244, 63, 94, 0.25); color: #fda4af;';
    }

    let html = `
      <table class="lab-table cohort-table">
        <thead>
          <tr>
            <th>Cohort</th>
            <th>Users</th>
            <th>M0</th>
            <th>M1</th>
            <th>M2</th>
            <th>M3</th>
            <th>M4</th>
            <th>M5</th>
          </tr>
        </thead>
        <tbody>
    `;

    cohorts.forEach(c => {
      html += `
        <tr>
          <td><strong>${c.cohort}</strong></td>
          <td>${c.size.toLocaleString()}</td>
          <td style="${getCellColor(c.m0)}">${c.m0}%</td>
          <td style="${getCellColor(c.m1)}">${c.m1 !== null ? c.m1 + '%' : '-'}</td>
          <td style="${getCellColor(c.m2)}">${c.m2 !== null ? c.m2 + '%' : '-'}</td>
          <td style="${getCellColor(c.m3)}">${c.m3 !== null ? c.m3 + '%' : '-'}</td>
          <td style="${getCellColor(c.m4)}">${c.m4 !== null ? c.m4 + '%' : '-'}</td>
          <td style="${getCellColor(c.m5)}">${c.m5 !== null ? c.m5 + '%' : '-'}</td>
        </tr>
      `;
    });

    html += `</tbody></table>`;
    tableDiv.innerHTML = html;
  }

  // Event Listeners
  container.querySelector('#slider-checkout').addEventListener('input', e => {
    checkoutRate = parseInt(e.target.value) / 100;
    container.querySelector('#val-checkout').textContent = `${Math.round(checkoutRate * 100)}%`;
    updateFunnel();
  });

  container.querySelector('#slider-aov').addEventListener('input', e => {
    aov = parseInt(e.target.value);
    container.querySelector('#val-aov').textContent = `$${aov}`;
    updateFunnel();
  });

  container.querySelector('#btn-cohort-intervene').addEventListener('click', () => {
    sound.playClick();
    hasIntervention = !hasIntervention;
    const btn = container.querySelector('#btn-cohort-intervene');
    btn.textContent = hasIntervention ? '✓ Onboarding Re-Engagement Active' : '🚀 Apply Onboarding & Email Re-Engagement';
    renderCohortTable();
  });

  container.querySelector('#btn-verify-bi').addEventListener('click', () => {
    const buyers = Math.round(impressions * viewRate * cartRate * checkoutRate * purchaseRate);
    const revenue = buyers * aov;
    const feedback = container.querySelector('#bi-feedback');

    if (revenue >= 45000 && hasIntervention) {
      const awarded = state.completeChallenge('bi_dashboard', 'bi_architect', 100);
      feedback.className = 'feedback-msg success';
      feedback.innerHTML = `<strong>Boardroom Approved!</strong> Monthly revenue reached <strong>$${revenue.toLocaleString()}</strong> and cohort retention lifted across all active quarters! Unlocked 'Funnel Optimizer' Badge (+100 XP).`;
      if (awarded) {
        container.querySelector('#btn-verify-bi').textContent = '✓ Challenge Completed (+100 XP Earned)';
      }
    } else {
      sound.playError();
      feedback.className = 'feedback-msg error';
      feedback.innerHTML = `<strong>Goals not met yet.</strong> Current revenue is $${revenue.toLocaleString()} (Target: &ge; $45,000) and ensure the Cohort Retention intervention is toggled ON!`;
    }
  });

  updateFunnel();
  renderCohortTable();
}
