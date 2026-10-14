// Module 1: Visual Data Cleaning & Wrangling Lab
import { state } from '../state.js';
import { sound } from '../audio.js';

export function renderDataCleaning(container) {
  let dirtyRows = [
    { id: 101, name: 'Alice Stone', age: 29, salary: 72000, dept: 'Engineering', status: 'Active' },
    { id: 102, name: 'Bob Myers', age: null, salary: 65000, dept: 'Marketing', status: 'Active' },
    { id: 103, name: 'Carol Danvers', age: 34, salary: null, dept: 'Engineering', status: 'Pending' },
    { id: 104, name: 'David Kim', age: 41, salary: 89000, dept: 'Sales', status: 'Active' },
    { id: 104, name: 'David Kim', age: 41, salary: 89000, dept: 'Sales', status: 'Active' }, // Duplicate!
    { id: 105, name: 'Eve Johnson', age: 28, salary: 950000, dept: 'Engineering', status: 'Active' }, // Outlier salary!
    { id: 106, name: 'Frank Wright', age: null, salary: 58000, dept: null, status: 'Active' },
    { id: 107, name: 'Grace Hopper', age: 31, salary: 83000, dept: 'Engineering', status: 'Active' },
    { id: 108, name: 'Heidi Clark', age: -5, salary: 61000, dept: 'Support', status: 'Active' }, // Negative age!
    { id: 109, name: 'Ivan Vance', age: 38, salary: 78000, dept: 'Sales', status: 'Terminated' }
  ];

  let currentRows = JSON.parse(JSON.stringify(dirtyRows));
  let integrityScore = calculateIntegrity(currentRows);

  function calculateIntegrity(rows) {
    let score = 100;
    // Check duplicates
    const ids = rows.map(r => r.id);
    const dupCount = ids.length - new Set(ids).size;
    score -= dupCount * 20;

    // Check nulls
    let nullCount = 0;
    rows.forEach(r => {
      if (r.age === null) nullCount++;
      if (r.salary === null) nullCount++;
      if (r.dept === null) nullCount++;
    });
    score -= nullCount * 8;

    // Check invalid/outliers
    let anomalyCount = 0;
    rows.forEach(r => {
      if (r.age !== null && (r.age < 18 || r.age > 100)) anomalyCount++;
      if (r.salary !== null && r.salary > 250000) anomalyCount++;
    });
    score -= anomalyCount * 15;

    return Math.max(0, Math.min(100, score));
  }

  container.innerHTML = `
    <div class="lab-header">
      <div class="lab-title-group">
        <span class="lab-badge">Track 1: Data Analyst</span>
        <h2>Visual Data Cleaning & Wrangling Lab</h2>
        <p class="lab-desc">Real-world data is filthy. Dirty data leads to garbage models. Clean the corrupted customer dataset below by applying targeted wrangling operations without causing data leakage!</p>
      </div>
      <div class="lab-objective">
        <div class="objective-badge">Target Objective</div>
        <div class="objective-text">Reach <strong>100% Data Integrity</strong> by eliminating duplicates, imputing missing values, and handling extreme anomalies.</div>
        <div class="integrity-meter-wrapper">
          <div class="integrity-label">
            <span>Data Health:</span>
            <strong id="integrity-val" class="${integrityScore === 100 ? 'text-success' : 'text-warning'}">${integrityScore}%</strong>
          </div>
          <div class="progress-bar-bg">
            <div id="integrity-bar" class="progress-bar-fill" style="width: ${integrityScore}%"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="lab-controls-panel">
      <div class="control-group">
        <label>Missing Value Imputation Strategy:</label>
        <div class="btn-group">
          <button id="btn-impute-mean" class="btn btn-secondary">Impute Numerical (Median)</button>
          <button id="btn-impute-mode" class="btn btn-secondary">Impute Dept (Mode: 'Engineering')</button>
          <button id="btn-drop-nulls" class="btn btn-outline">Drop Rows with Nulls</button>
        </div>
      </div>
      <div class="control-group">
        <label>Deduplication & Hygiene:</label>
        <div class="btn-group">
          <button id="btn-dedup" class="btn btn-primary">Remove Exact Duplicates</button>
          <button id="btn-fix-age" class="btn btn-secondary">Correct Invalid Ages (&lt; 18)</button>
          <button id="btn-cap-outliers" class="btn btn-secondary">Cap Outliers (IQR 99th %tile)</button>
          <button id="btn-reset-data" class="btn btn-ghost">Reset Data</button>
        </div>
      </div>
    </div>

    <div class="data-table-container">
      <table class="lab-table" id="cleaning-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Age</th>
            <th>Salary ($)</th>
            <th>Department</th>
            <th>Status</th>
            <th>Integrity Flag</th>
          </tr>
        </thead>
        <tbody id="table-body">
          <!-- Rows injected dynamically -->
        </tbody>
      </table>
    </div>

    <div class="lab-footer">
      <button id="btn-verify-cleaning" class="btn btn-success btn-lg">
        ${state.isChallengeCompleted('cleaning') ? '✓ Challenge Completed (+100 XP Earned)' : 'Verify Data Integrity & Claim XP'}
      </button>
      <div id="cleaning-feedback" class="feedback-msg"></div>
    </div>
  `;

  function renderTable() {
    const tbody = container.querySelector('#table-body');
    integrityScore = calculateIntegrity(currentRows);
    const scoreVal = container.querySelector('#integrity-val');
    const scoreBar = container.querySelector('#integrity-bar');
    
    scoreVal.textContent = `${integrityScore}%`;
    scoreBar.style.width = `${integrityScore}%`;
    scoreVal.className = integrityScore === 100 ? 'text-success' : (integrityScore > 70 ? 'text-warning' : 'text-danger');

    tbody.innerHTML = '';
    const ids = currentRows.map(r => r.id);

    currentRows.forEach((row, idx) => {
      const isDup = ids.filter(id => id === row.id).length > 1;
      const isNullAge = row.age === null;
      const isNullSalary = row.salary === null;
      const isNullDept = row.dept === null;
      const isInvalidAge = row.age !== null && (row.age < 18 || row.age > 100);
      const isOutlierSalary = row.salary !== null && row.salary > 250000;

      let flags = [];
      if (isDup) flags.push('<span class="tag tag-danger">Duplicate ID</span>');
      if (isNullAge || isNullSalary || isNullDept) flags.push('<span class="tag tag-warning">Missing Values</span>');
      if (isInvalidAge) flags.push('<span class="tag tag-danger">Corrupt Age</span>');
      if (isOutlierSalary) flags.push('<span class="tag tag-danger">Outlier ($950k)</span>');
      if (flags.length === 0) flags.push('<span class="tag tag-success">Clean</span>');

      const tr = document.createElement('tr');
      if (flags.some(f => f.includes('tag-danger') || f.includes('tag-warning'))) {
        tr.classList.add('row-flagged');
      }

      tr.innerHTML = `
        <td><strong>#${row.id}</strong></td>
        <td>${row.name}</td>
        <td class="${isNullAge || isInvalidAge ? 'cell-highlight-bad' : ''}">
          ${isNullAge ? '<span class="cell-null">NaN</span>' : row.age}
        </td>
        <td class="${isNullSalary || isOutlierSalary ? 'cell-highlight-bad' : ''}">
          ${isNullSalary ? '<span class="cell-null">NULL</span>' : '$' + Number(row.salary).toLocaleString()}
        </td>
        <td class="${isNullDept ? 'cell-highlight-bad' : ''}">
          ${isNullDept ? '<span class="cell-null">MISSING</span>' : row.dept}
        </td>
        <td><span class="status-pill status-${row.status.toLowerCase()}">${row.status}</span></td>
        <td>${flags.join(' ')}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Button actions
  container.querySelector('#btn-dedup').addEventListener('click', () => {
    sound.playClick();
    const seen = new Set();
    currentRows = currentRows.filter(r => {
      if (seen.has(r.id)) return false;
      seen.add(r.id);
      return true;
    });
    renderTable();
  });

  container.querySelector('#btn-impute-mean').addEventListener('click', () => {
    sound.playClick();
    // Impute age with median (approx 31) and salary with median (approx 78000)
    currentRows.forEach(r => {
      if (r.age === null) r.age = 32;
      if (r.salary === null) r.salary = 75000;
    });
    renderTable();
  });

  container.querySelector('#btn-impute-mode').addEventListener('click', () => {
    sound.playClick();
    currentRows.forEach(r => {
      if (r.dept === null) r.dept = 'Engineering';
    });
    renderTable();
  });

  container.querySelector('#btn-fix-age').addEventListener('click', () => {
    sound.playClick();
    currentRows.forEach(r => {
      if (r.age !== null && r.age < 18) r.age = Math.abs(r.age) + 20; // Correct typographical negative sign
    });
    renderTable();
  });

  container.querySelector('#btn-cap-outliers').addEventListener('click', () => {
    sound.playClick();
    currentRows.forEach(r => {
      if (r.salary !== null && r.salary > 250000) {
        r.salary = 95000; // Cap to 95k ceiling
      }
    });
    renderTable();
  });

  container.querySelector('#btn-drop-nulls').addEventListener('click', () => {
    sound.playClick();
    currentRows = currentRows.filter(r => r.age !== null && r.salary !== null && r.dept !== null);
    renderTable();
  });

  container.querySelector('#btn-reset-data').addEventListener('click', () => {
    sound.playClick();
    currentRows = JSON.parse(JSON.stringify(dirtyRows));
    renderTable();
  });

  container.querySelector('#btn-verify-cleaning').addEventListener('click', () => {
    const feedback = container.querySelector('#cleaning-feedback');
    if (integrityScore === 100) {
      const awarded = state.completeChallenge('cleaning', 'cleaner', 100);
      feedback.className = 'feedback-msg success';
      feedback.innerHTML = `<strong>Magnificent!</strong> Data integrity is 100%. All corrupted rows, duplicates, and outliers have been systematically healed! +100 XP awarded.`;
      if (awarded) {
        container.querySelector('#btn-verify-cleaning').textContent = '✓ Challenge Completed (+100 XP Earned)';
      }
    } else {
      sound.playError();
      feedback.className = 'feedback-msg error';
      feedback.innerHTML = `<strong>Data still has defects!</strong> Current score is ${integrityScore}%. Inspect the table for highlighted red/yellow cells and clean them all.`;
    }
  });

  renderTable();
}
