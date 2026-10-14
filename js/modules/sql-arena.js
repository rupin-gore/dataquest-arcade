// Module 2: The SQL Arena & Visual Join Engine
import { state } from '../state.js';
import { sound } from '../audio.js';

export function renderSqlArena(container) {
  const customers = [
    { customer_id: 1, name: 'Ava Chen', country: 'USA', tier: 'Gold' },
    { customer_id: 2, name: 'Liam Ross', country: 'UK', tier: 'Silver' },
    { customer_id: 3, name: 'Sofia Garcia', country: 'USA', tier: 'Gold' },
    { customer_id: 4, name: 'Marcus Bell', country: 'Germany', tier: 'Bronze' },
    { customer_id: 5, name: 'Elena Popova', country: 'UK', tier: 'Gold' }
  ];

  const orders = [
    { order_id: 501, customer_id: 1, product: 'Cloud GPU Pod', amount: 850, order_year: 2026 },
    { order_id: 502, customer_id: 1, product: 'Neural API Pass', amount: 350, order_year: 2026 },
    { order_id: 503, customer_id: 2, product: 'Data Warehouse Pro', amount: 450, order_year: 2025 },
    { order_id: 504, customer_id: 3, product: 'Vector DB Cluster', amount: 1200, order_year: 2026 },
    { order_id: 505, customer_id: 3, product: 'Cloud GPU Pod', amount: 900, order_year: 2026 },
    { order_id: 506, customer_id: 6, product: 'Standalone License', amount: 200, order_year: 2026 } // Unmatched customer 6!
  ];

  let selectedJoin = 'INNER';
  let customSql = `SELECT c.country, SUM(o.amount) AS total_revenue\nFROM customers c\nJOIN orders o ON c.customer_id = o.customer_id\nWHERE c.tier = 'Gold'\nGROUP BY c.country\nORDER BY total_revenue DESC;`;

  container.innerHTML = `
    <div class="lab-header">
      <div class="lab-title-group">
        <span class="lab-badge">Track 1: Data Analyst</span>
        <h2>The SQL Arena & Visual Relational Engine</h2>
        <p class="lab-desc">SQL is the lingua franca of data analytics. Understand relational joins visually through dynamic Venn diagrams, then run live queries on real tables.</p>
      </div>
      <div class="lab-objective">
        <div class="objective-badge">Target Objective</div>
        <div class="objective-text">Execute a query that finds <strong>total revenue by country</strong> for <strong>'Gold' tier</strong> customers in <strong>2026</strong>!</div>
      </div>
    </div>

    <!-- Visual JOIN Interactive Playground -->
    <div class="interactive-section">
      <div class="section-title">
        <span class="icon">🔄</span> Part 1: Interactive Visual JOIN Explorer
      </div>
      <p class="section-subtitle">Click the join types to see how the Venn diagram lights up and which rows are included.</p>
      
      <div class="join-controls">
        <button class="btn btn-join active" data-join="INNER">INNER JOIN</button>
        <button class="btn btn-join" data-join="LEFT">LEFT JOIN</button>
        <button class="btn btn-join" data-join="RIGHT">RIGHT JOIN</button>
        <button class="btn btn-join" data-join="FULL">FULL OUTER JOIN</button>
      </div>

      <div class="venn-display-container">
        <div class="venn-diagram-svg">
          <svg viewBox="0 0 400 220" class="venn-svg">
            <defs>
              <clipPath id="left-circle-clip">
                <circle cx="160" cy="110" r="85" />
              </clipPath>
            </defs>
            <!-- Left circle (Customers) -->
            <circle id="venn-left" cx="160" cy="110" r="85" class="venn-circle venn-left" />
            <!-- Right circle (Orders) -->
            <circle id="venn-right" cx="240" cy="110" r="85" class="venn-circle venn-right" />
            <!-- Overlap intersection -->
            <circle id="venn-intersect" cx="240" cy="110" r="85" clip-path="url(#left-circle-clip)" class="venn-circle venn-intersection" />

            <text x="110" y="115" class="venn-label">Customers (A)</text>
            <text x="290" y="115" class="venn-label">Orders (B)</text>
            <text x="200" y="115" class="venn-label-center">Matches</text>
          </svg>
        </div>
        <div class="venn-explanation" id="venn-expl">
          <strong>INNER JOIN</strong>: Returns only rows where there is a matching <code>customer_id</code> in both Customers and Orders. Rows without matches are excluded.
        </div>
      </div>
    </div>

    <!-- Live SQL Query Console -->
    <div class="interactive-section">
      <div class="section-title">
        <span class="icon">💻</span> Part 2: Live SQL Console & Query Runner
      </div>
      <div class="sql-arena-grid">
        <div class="sql-editor-pane">
          <div class="pane-header">
            <span>SQL Query Editor</span>
            <button id="btn-quick-fill" class="btn btn-xs btn-outline">Load Challenge Template</button>
          </div>
          <textarea id="sql-input" class="sql-textarea" rows="7" spellcheck="false">${customSql}</textarea>
          <div class="pane-actions">
            <button id="btn-run-sql" class="btn btn-primary">▶ Run SQL Query</button>
            <button id="btn-verify-sql" class="btn btn-success">
              ${state.isChallengeCompleted('sql_arena') ? '✓ SQL Mastered (+100 XP)' : 'Verify Challenge & Claim XP'}
            </button>
          </div>
        </div>

        <div class="sql-schema-pane">
          <div class="pane-header">Live Database Schema</div>
          <div class="schema-table-card">
            <div class="schema-tbl-name">📊 customers (5 rows)</div>
            <div class="schema-cols">customer_id [PK], name, country, tier</div>
          </div>
          <div class="schema-table-card">
            <div class="schema-tbl-name">🛒 orders (6 rows)</div>
            <div class="schema-cols">order_id [PK], customer_id [FK], product, amount, order_year</div>
          </div>
        </div>
      </div>

      <div class="query-results-pane">
        <div class="pane-header">Query Results Output <span id="row-count-badge" class="badge">0 rows</span></div>
        <div id="sql-results-table" class="data-table-container">
          <!-- Live result table -->
        </div>
        <div id="sql-feedback" class="feedback-msg"></div>
      </div>
    </div>
  `;

  // Venn Join Updates
  const joinBtns = container.querySelectorAll('.btn-join');
  const vennLeft = container.querySelector('#venn-left');
  const vennRight = container.querySelector('#venn-right');
  const vennIntersect = container.querySelector('#venn-intersect');
  const vennExpl = container.querySelector('#venn-expl');

  function updateVenn(type) {
    selectedJoin = type;
    joinBtns.forEach(b => b.classList.toggle('active', b.dataset.join === type));

    vennLeft.classList.remove('venn-active');
    vennRight.classList.remove('venn-active');
    vennIntersect.classList.remove('venn-active');

    if (type === 'INNER') {
      vennIntersect.classList.add('venn-active');
      vennExpl.innerHTML = `<strong>INNER JOIN</strong>: Returns only rows where there is an exact key match in BOTH tables (Customers with Orders). Unmatched customers and orphan orders are excluded.`;
    } else if (type === 'LEFT') {
      vennLeft.classList.add('venn-active');
      vennIntersect.classList.add('venn-active');
      vennExpl.innerHTML = `<strong>LEFT JOIN</strong>: Returns ALL customers, matching them with orders where available. If a customer placed no orders, order fields are <code>NULL</code>.`;
    } else if (type === 'RIGHT') {
      vennRight.classList.add('venn-active');
      vennIntersect.classList.add('venn-active');
      vennExpl.innerHTML = `<strong>RIGHT JOIN</strong>: Returns ALL orders, plus customer information when available. Orphan orders (customer_id not in customers) receive <code>NULL</code> customer fields.`;
    } else if (type === 'FULL') {
      vennLeft.classList.add('venn-active');
      vennRight.classList.add('venn-active');
      vennIntersect.classList.add('venn-active');
      vennExpl.innerHTML = `<strong>FULL OUTER JOIN</strong>: Returns all customers AND all orders. Unmatched records on either side are filled with <code>NULL</code>.`;
    }
  }

  joinBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sound.playClick();
      updateVenn(btn.dataset.join);
    });
  });
  updateVenn('INNER');

  // Simple In-Browser SQL Executor for Customers & Orders
  function executeQuery(sql) {
    const cleanSql = sql.trim().replace(/;/g, '');
    const isGold = /tier\s*=\s*['"]Gold['"]/i.test(cleanSql);
    const hasGroupByCountry = /GROUP\s+BY\s+.*country/i.test(cleanSql);
    const hasSum = /SUM\s*\(\s*.*amount\s*\)/i.test(cleanSql);

    // Filter and compute
    let matchedRows = [];
    orders.forEach(o => {
      const c = customers.find(cust => cust.customer_id === o.customer_id);
      if (c) {
        matchedRows.push({ ...c, ...o });
      }
    });

    if (isGold) {
      matchedRows = matchedRows.filter(r => r.tier.toLowerCase() === 'gold');
    }

    if (hasGroupByCountry) {
      const grouped = {};
      matchedRows.forEach(r => {
        if (!grouped[r.country]) grouped[r.country] = { country: r.country, total_revenue: 0, order_count: 0 };
        grouped[r.country].total_revenue += r.amount;
        grouped[r.country].order_count += 1;
      });
      let result = Object.values(grouped);
      result.sort((a, b) => b.total_revenue - a.total_revenue);
      return result;
    }

    // Default return top matches
    return matchedRows.map(r => ({
      customer_id: r.customer_id,
      name: r.name,
      country: r.country,
      tier: r.tier,
      product: r.product,
      amount: '$' + r.amount,
      order_year: r.order_year
    }));
  }

  function renderSqlResults(results) {
    const tableDiv = container.querySelector('#sql-results-table');
    const badge = container.querySelector('#row-count-badge');
    badge.textContent = `${results.length} rows returned`;

    if (results.length === 0) {
      tableDiv.innerHTML = `<div class="empty-state">No matching rows found for query criteria.</div>`;
      return;
    }

    const headers = Object.keys(results[0]);
    let html = `<table class="lab-table"><thead><tr>`;
    headers.forEach(h => html += `<th>${h}</th>`);
    html += `</tr></thead><tbody>`;

    results.forEach(row => {
      html += `<tr>`;
      headers.forEach(h => {
        const val = row[h];
        const isNum = typeof val === 'number' || (typeof val === 'string' && val.startsWith('$'));
        html += `<td class="${isNum ? 'cell-numeric' : ''}">${typeof val === 'number' && h.includes('revenue') ? '$' + val.toLocaleString() : val}</td>`;
      });
      html += `</tr>`;
    });
    html += `</tbody></table>`;
    tableDiv.innerHTML = html;
  }

  container.querySelector('#btn-run-sql').addEventListener('click', () => {
    sound.playClick();
    const query = container.querySelector('#sql-input').value;
    try {
      const results = executeQuery(query);
      renderSqlResults(results);
    } catch (e) {
      sound.playError();
      container.querySelector('#sql-results-table').innerHTML = `<div class="feedback-msg error">SQL Parse Error: ${e.message}</div>`;
    }
  });

  container.querySelector('#btn-quick-fill').addEventListener('click', () => {
    sound.playClick();
    container.querySelector('#sql-input').value = customSql;
    const results = executeQuery(customSql);
    renderSqlResults(results);
  });

  container.querySelector('#btn-verify-sql').addEventListener('click', () => {
    const query = container.querySelector('#sql-input').value;
    const isGold = /tier\s*=\s*['"]Gold['"]/i.test(query);
    const hasGroupByCountry = /GROUP\s+BY\s+.*country/i.test(query);
    const hasSum = /SUM\s*\(\s*.*amount\s*\)/i.test(query);
    const feedback = container.querySelector('#sql-feedback');

    if (isGold && hasGroupByCountry && hasSum) {
      const awarded = state.completeChallenge('sql_arena', 'sql_master', 100);
      feedback.className = 'feedback-msg success';
      feedback.innerHTML = `<strong>Query Approved!</strong> Top country is USA with $3,300 in Gold tier revenue, followed by UK with $0 or correct sum. Unlocked 'Join Master' Badge! (+100 XP)`;
      if (awarded) {
        container.querySelector('#btn-verify-sql').textContent = '✓ SQL Mastered (+100 XP)';
      }
    } else {
      sound.playError();
      feedback.className = 'feedback-msg error';
      feedback.innerHTML = `<strong>Query criteria not fully met.</strong> Ensure you filter for <code>tier = 'Gold'</code>, aggregate with <code>SUM(amount)</code>, and group by <code>country</code>.`;
    }
  });

  // Initial execution
  const initial = executeQuery(customSql);
  renderSqlResults(initial);
}
