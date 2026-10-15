/**
 * DataQuest Arcade - Standalone Unified Bundle
 * Zero-dependency, offline-ready, runs locally via file:/// or HTTP without CORS errors.
 */
(function() {
  'use strict';

  // ==================== Audio Engine ====================
  // Web Audio API Sound Effects Synthesizer - 100% offline & procedural
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.initAudio = this.initAudio.bind(this);
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  initAudio() {
    this.init();
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.15) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn("Audio error", e);
    }
  }

  // Click UI sound
  playClick() {
    this.playTone(800, 'triangle', 0.05, 0.08);
  }

  // XP Gain Sound (Pleasant rising high chime)
  playXpGain() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'sine', 0.15, 0.12);
      }, idx * 60);
    });
  }

  // Challenge Completed Fanfare
  playSuccess() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const notes = [
      { f: 440.00, t: 0.1 },  // A4
      { f: 554.37, t: 0.1 },  // C#5
      { f: 659.25, t: 0.12 }, // E5
      { f: 880.00, t: 0.35 }  // A5
    ];
    let time = 0;
    notes.forEach(n => {
      setTimeout(() => {
        this.playTone(n.f, 'triangle', n.t, 0.2);
      }, time * 1000);
      time += 0.09;
    });
  }

  // Level Up Major Fanfare
  playLevelUp() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const chord = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    chord.forEach((f, i) => {
      setTimeout(() => {
        this.playTone(f, 'sine', 0.4, 0.15);
      }, i * 70);
    });
  }

  // Error / Warning Buzz
  playError() {
    this.playTone(180, 'sawtooth', 0.18, 0.15);
  }
}
const sound = new SoundEngine();


  // ==================== Game State & Persistence ====================
  // State management, gamification logic, and persistence
const RANKS = [
  { level: 1, title: 'Data Novice', minXp: 0, maxXp: 150, icon: '🌱' },
  { level: 2, title: 'SQL & Data Sleuth', minXp: 150, maxXp: 400, icon: '🔍' },
  { level: 3, title: 'Insight Analyst', minXp: 400, maxXp: 800, icon: '📊' },
  { level: 4, title: 'Feature Alchemist', minXp: 800, maxXp: 1300, icon: '⚡' },
  { level: 5, title: 'Machine Learning Engineer', minXp: 1300, maxXp: 2000, icon: '🤖' },
  { level: 6, title: 'Neural Architect', minXp: 2000, maxXp: 2800, icon: '🧠' },
  { level: 7, title: 'Grand Data Scientist', minXp: 2800, maxXp: 99999, icon: '👑' }
];
const BADGES = [
  { id: 'cleaner', title: 'Null Terminator', desc: 'Repaired 100% data integrity with zero data leakage', icon: '🧹', track: 'analyst' },
  { id: 'sql_master', title: 'Join Master', desc: 'Executed multi-table relational join & aggregation puzzle', icon: '⚡', track: 'analyst' },
  { id: 'eda_detective', title: 'Variance Slayer', desc: 'Hunted extreme outliers and explained skewness visually', icon: '📈', track: 'analyst' },
  { id: 'bi_architect', title: 'Funnel Optimizer', desc: 'Plugged revenue leak in executive KPI dashboard', icon: '💎', track: 'analyst' },
  { id: 'ab_tester', title: 'P-Value Champion', desc: 'Achieved p < 0.05 and 80%+ power in live A/B experiment', icon: '🎯', track: 'analyst' },
  { id: 'feature_forge', title: 'Dimension Lifter', desc: 'Engineered polynomial features to make circles linearly separable', icon: '🔮', track: 'scientist' },
  { id: 'gradient_surfer', title: 'Cost Surface Surfer', desc: 'Guided gradient descent ball to local minimum without exploding', icon: '⛷️', track: 'scientist' },
  { id: 'tree_splitter', title: 'Gini Chopper', desc: 'Split 2D plane with decision trees achieving 95%+ accuracy', icon: '🌲', track: 'scientist' },
  { id: 'cluster_king', title: 'Voronoi Master', desc: 'Converged K-Means centroids on complex multi-cluster personas', icon: '🪐', track: 'scientist' },
  { id: 'matrix_optimizer', title: 'Fraud Hunter', desc: 'Tuned probability threshold to balance Precision & Recall at 90%+', icon: '⚖️', track: 'scientist' },
  { id: 'neural_tamer', title: 'XOR Conqueror', desc: 'Trained neural network hidden layers to separate non-linear data', icon: '🧠', track: 'scientist' },
  { id: 'time_forecaster', title: 'Future Shaper', desc: 'Decomposed trend, seasonality & flagged anomaly spikes', icon: '⏳', track: 'scientist' }
];

class GameState {
  constructor() {
    this.storageKey = 'dataquest_game_state_v1';
    this.data = this.load();
    this.listeners = [];
  }

  load() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('LocalStorage error', e);
    }
    return {
      xp: 0,
      activeTrack: 'analyst', // 'analyst' or 'scientist'
      activeModuleId: 'cleaning',
      completedChallenges: {},
      unlockedBadges: [],
      soundMuted: false
    };
  }

  save() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    } catch (e) {
      console.warn('LocalStorage save error', e);
    }
    this.notify();
  }

  subscribe(callback) {
    this.listeners.push(callback);
    callback(this.data);
  }

  notify() {
    for (const cb of this.listeners) {
      cb(this.data);
    }
  }

  getRank() {
    for (let i = RANKS.length - 1; i >= 0; i--) {
      if (this.data.xp >= RANKS[i].minXp) {
        return RANKS[i];
      }
    }
    return RANKS[0];
  }

  getNextRank() {
    const current = this.getRank();
    const nextIdx = RANKS.findIndex(r => r.level === current.level + 1);
    return nextIdx !== -1 ? RANKS[nextIdx] : null;
  }

  addXp(amount, reason = '') {
    const prevRank = this.getRank();
    this.data.xp += amount;
    const newRank = this.getRank();

    if (newRank.level > prevRank.level) {
      sound.playLevelUp();
      this.triggerEvent('levelup', { rank: newRank });
    } else {
      sound.playXpGain();
    }

    this.save();
    this.triggerEvent('xpgain', { amount, reason });
  }

  completeChallenge(moduleId, badgeId, xpReward = 100) {
    if (!this.data.completedChallenges[moduleId]) {
      this.data.completedChallenges[moduleId] = { completedAt: Date.now() };
      this.addXp(xpReward, `Completed ${moduleId} Lab`);

      if (badgeId && !this.data.unlockedBadges.includes(badgeId)) {
        this.data.unlockedBadges.push(badgeId);
        sound.playSuccess();
        this.triggerEvent('badge_unlocked', { badgeId });
      } else {
        sound.playSuccess();
      }

      this.save();
      return true;
    }
    return false;
  }

  isChallengeCompleted(moduleId) {
    return !!this.data.completedChallenges[moduleId];
  }

  hasBadge(badgeId) {
    return this.data.unlockedBadges.includes(badgeId);
  }

  setActiveTrack(track) {
    this.data.activeTrack = track;
    this.save();
  }

  setActiveModule(moduleId) {
    this.data.activeModuleId = moduleId;
    this.save();
  }

  resetProgress() {
    this.data = {
      xp: 0,
      activeTrack: 'analyst',
      activeModuleId: 'cleaning',
      completedChallenges: {},
      unlockedBadges: [],
      soundMuted: false
    };
    this.save();
    sound.playClick();
  }

  triggerEvent(eventName, detail) {
    window.dispatchEvent(new CustomEvent(`dataquest:${eventName}`, { detail }));
  }
}
const state = new GameState();


  // ==================== Curriculum Content Knowledge Base ====================
  // Comprehensive Content Knowledge Base for Data Analyst & Data Scientist Curriculum
const CONTENT_DATABASE = {
  cleaning: {
    id: 'cleaning',
    title: 'Data Cleaning, Wrangling & Data Quality Engineering',
    track: 'analyst',
    badge: 'Null Terminator',
    industryExample: {
      company: 'Uber & Airbnb',
      scenario: 'GPS Sensor Jitter & Duplicate Bookings',
      details: 'Uber filters corrupted GPS pings where driver location jumps 50 miles in 2 seconds (sensor glitches). Airbnb deduplicates identical listing clicks within 500ms to avoid double-charging hosts.'
    },
    coreConcepts: [
      {
        heading: '1. The 3 Types of Missing Data',
        content: `
          <ul>
            <li><strong>MCAR (Missing Completely at Random):</strong> The probability of missingness is unrelated to any variable (e.g., a lab technician drops a test tube). Safe to drop if small (&lt; 5%).</li>
            <li><strong>MAR (Missing at Random):</strong> Missingness depends on observed data, not the missing value itself (e.g., younger users are less likely to report income, but age is recorded). Impute using conditional models like KNN or regression.</li>
            <li><strong>MNAR (Missing Not at Random):</strong> Missingness depends on the unobserved value itself (e.g., people with extremely high or low salaries refuse to answer). Dropping these causes severe survivorship bias!</li>
          </ul>
        `
      },
      {
        heading: '2. Imputation Strategies: Mean vs. Median vs. Mode vs. MICE',
        content: `
          <p><strong>Mean Imputation:</strong> Fast, but pulls the distribution toward the center, artificially shrinking variance and destroying standard errors. Never use on skewed data!</p>
          <p><strong>Median Imputation:</strong> Far superior for skewed numerical distributions (salaries, prices, wait times) because it is immune to extreme outliers.</p>
          <p><strong>Mode Imputation:</strong> Essential for categorical variables (e.g., defaulting missing department to most frequent class).</p>
          <p><strong>MICE (Multivariate Imputation by Chained Equations):</strong> Production gold standard. Models each feature with missing values as a function of all other features iteratively.</p>
        `
      },
      {
        heading: '3. Outlier Detection: Tukey’s 1.5×IQR Rule vs. Z-Score',
        content: `
          <p><strong>Interquartile Range (IQR):</strong> $\\text{IQR} = Q_3 - Q_1$. Outliers lie below $Q_1 - 1.5 \\times \\text{IQR}$ or above $Q_3 + 1.5 \\times \\text{IQR}$. Extreme outliers use $3.0 \\times \\text{IQR}$. Unlike Z-score, IQR does not assume a normal Gaussian distribution!</p>
          <p><strong>Z-Score Rule:</strong> $z = \\frac{x - \\mu}{\\sigma}$. Values with $|z| > 3.0$ represent the top 0.3% of a normal distribution. Warning: Outliers skew $\\mu$ and inflate $\\sigma$, masking other outliers!</p>
        `
      }
    ],
    codeSnippets: {
      python: `# Python / Pandas Data Cleaning Workflow


# 1. Deduplicate based on primary key
df = df.drop_duplicates(subset=['customer_id'], keep='first')

# 2. Impute numerical columns with Median (Robust against outliers)
median_salary = df['salary'].median()
df['salary'] = df['salary'].fillna(median_salary)

# 3. Categorical mode imputation
mode_dept = df['department'].mode()[0]
df['department'] = df['department'].fillna(mode_dept)

# 4. Outlier Capping via IQR (Winsorization)
q1 = df['salary'].quantile(0.25)
q3 = df['salary'].quantile(0.75)
iqr = q3 - q1
lower_bound = q1 - 1.5 * iqr
upper_bound = q3 + 1.5 * iqr
df['salary'] = df['salary'].clip(lower=lower_bound, upper=upper_bound)`,
      sql: `-- SQL Data Cleaning & Coalesce
SELECT 
  customer_id,
  COALESCE(department, 'General Support') AS department,
  COALESCE(salary, MEDIAN(salary) OVER(PARTITION BY department)) AS imputed_salary,
  CASE 
    WHEN age < 18 THEN NULL -- Flag or cleanse corrupt inputs
    ELSE age 
  END AS valid_age
FROM raw_customers;`
    },
    interviewTraps: [
      {
        q: 'Why shouldn’t you impute missing values before splitting your dataset into Train and Test sets?',
        a: 'Data Leakage! If you compute the mean or median over the entire dataset, information from the test set leaks into the training pipeline, yielding overly optimistic evaluation metrics.'
      },
      {
        q: 'When is it appropriate to keep outliers instead of deleting them?',
        a: 'In fraud detection, cybersecurity intrusions, and hardware failure prediction, outliers ARE the signal of interest! Deleting them deletes the very events your model needs to catch.'
      }
    ],
    quiz: [
      {
        question: 'Which metric is most robust for imputing missing values in heavily skewed income data?',
        options: ['Arithmetic Mean', 'Median', 'Standard Deviation', 'Zero'],
        correct: 1,
        explanation: 'Median is the 50th percentile and is completely unaffected by extreme multi-million dollar outliers.'
      },
      {
        question: 'What is the standard multiplier for identifying moderate outliers using Tukey’s IQR method?',
        options: ['0.5× IQR', '1.0× IQR', '1.5× IQR', '5.0× IQR'],
        correct: 2,
        explanation: '1.5× IQR below Q1 or above Q3 is the universally accepted standard for outlier fencing.'
      }
    ]
  },

  sql_arena: {
    id: 'sql_arena',
    title: 'Advanced SQL, Relational Algebra & Window Functions',
    track: 'analyst',
    badge: 'Join Master',
    industryExample: {
      company: 'Amazon & Spotify',
      scenario: 'Customer Lifetime Spend & Running Totals',
      details: 'Amazon data analysts use window functions like `SUM(amount) OVER (PARTITION BY user_id ORDER BY order_date)` to calculate cumulative customer spend and detect retention inflection points.'
    },
    coreConcepts: [
      {
        heading: '1. The 4 Essential Joins Decoded Visually',
        content: `
          <ul>
            <li><strong>INNER JOIN:</strong> The strict intersection ($A \\cap B$). Only records with matching keys in BOTH tables are preserved.</li>
            <li><strong>LEFT JOIN:</strong> Keeps 100% of rows from Table A, attaching columns from Table B where matches exist. Missing matches become <code>NULL</code>.</li>
            <li><strong>RIGHT JOIN:</strong> Keeps 100% of rows from Table B. (Pro Tip: Most data engineers rewrite RIGHT JOINs as LEFT JOINs for consistent left-to-right reading order).</li>
            <li><strong>FULL OUTER JOIN:</strong> Union of all records from both tables ($A \\cup B$). Perfect for reconciling two independent data pipelines to find orphaned records.</li>
            <li><strong>ANTI-JOIN (LEFT JOIN WHERE B.id IS NULL):</strong> Isolates records in A that NEVER occurred in B (e.g., users who registered but never placed an order).</li>
          </ul>
        `
      },
      {
        heading: '2. SQL Logical Execution Order (How the Database Actually Thinks)',
        content: `
          <p>SQL is NOT executed in the order it is written! The SQL engine runs in this strict sequence:</p>
          <ol>
            <li><strong>FROM / JOIN:</strong> Identify and assemble table sources and cartesian combinations.</li>
            <li><strong>WHERE:</strong> Row-level filter applied BEFORE any aggregations occur.</li>
            <li><strong>GROUP BY:</strong> Collapse rows into aggregated buckets.</li>
            <li><strong>HAVING:</strong> Filter applied to the aggregated metric values (e.g., <code>HAVING COUNT(*) &gt; 5</code>).</li>
            <li><strong>SELECT:</strong> Select expressions, aliases, and compute window functions.</li>
            <li><strong>DISTINCT:</strong> Deduplicate result rows.</li>
            <li><strong>ORDER BY:</strong> Sort results (can use SELECT aliases).</li>
            <li><strong>LIMIT / OFFSET:</strong> Slice final output rows.</li>
          </ol>
          <p><em>Rookie Mistake:</em> Trying to use a column alias created in <code>SELECT</code> inside a <code>WHERE</code> clause fails because WHERE executes long before SELECT!</p>
        `
      },
      {
        heading: '3. Window Functions: The Analyst Superpower',
        content: `
          <p>Unlike <code>GROUP BY</code> (which collapses rows), Window Functions perform calculations across related rows while <strong>preserving individual row identities</strong>!</p>
          <ul>
            <li><code>ROW_NUMBER()</code>: Assigns a unique sequential integer (1, 2, 3...) with no ties. Essential for deduplication via <code>WHERE rn = 1</code>.</li>
            <li><code>RANK()</code>: Leaves gaps on ties (1, 2, 2, 4).</li>
            <li><code>DENSE_RANK()</code>: No gaps on ties (1, 2, 2, 3). Ideal for "Find the 2nd highest salary".</li>
            <li><code>LAG(col, 1)</code> / <code>LEAD(col, 1)</code>: Inspect previous or next row values to compute Day-over-Day growth or session duration.</li>
          </ul>
        `
      }
    ],
    codeSnippets: {
      python: `# Python equivalent with Pandas
# Window function running total
df['cumulative_revenue'] = df.groupby('customer_id')['amount'].cumsum()

# Rank within group
df['order_rank'] = df.groupby('customer_id')['amount'].rank(method='dense', ascending=False)`,
      sql: `-- Finding 2nd Highest Purchase Per User with DENSE_RANK & CTE
WITH RankedOrders AS (
  SELECT 
    customer_id,
    order_id,
    amount,
    DENSE_RANK() OVER(
      PARTITION BY customer_id 
      ORDER BY amount DESC
    ) AS rank_num
  FROM orders
)
SELECT customer_id, order_id, amount
FROM RankedOrders
WHERE rank_num = 2;`
    },
    interviewTraps: [
      {
        q: 'What is the difference between WHERE and HAVING in SQL?',
        a: 'WHERE filters rows BEFORE grouping occurs and cannot evaluate aggregate functions like SUM() or AVG(). HAVING filters AFTER GROUP BY has collapsed rows and operates on aggregated values.'
      },
      {
        q: 'What happens when you do a LEFT JOIN and there are duplicate join keys in Table B?',
        a: 'Cartesian Fan-Out! Each row in Table A will duplicate for every matching row in Table B, artificially multiplying row counts and distorting SUM() calculations!'
      }
    ],
    quiz: [
      {
        question: 'Which SQL clause executes FIRST according to the database execution lifecycle?',
        options: ['SELECT', 'WHERE', 'FROM / JOIN', 'GROUP BY'],
        correct: 2,
        explanation: 'FROM / JOIN is always executed first to determine the working dataset before any filtering or aggregation.'
      },
      {
        question: 'Which window function produces sequential integers without gaps, even when duplicate ties occur?',
        options: ['RANK()', 'DENSE_RANK()', 'ROW_NUMBER()', 'NTILE()'],
        correct: 1,
        explanation: 'DENSE_RANK() numbers ties identically without skipping subsequent ranks (e.g., 1, 2, 2, 3).'
      }
    ]
  },

  eda_stats: {
    id: 'eda_stats',
    title: 'Exploratory Data Analysis, Distribution Anatomy & Probability',
    track: 'analyst',
    badge: 'Variance Slayer',
    industryExample: {
      company: 'Zillow & Glassdoor',
      scenario: 'Housing Prices & Tech Compensation Reports',
      details: 'Zillow always reports Median Home Sale Price rather than Mean. A single $80,000,000 penthouse in Manhattan would artificially inflate the average neighborhood price by $400,000, misleading home buyers.'
    },
    coreConcepts: [
      {
        heading: '1. Measures of Central Tendency & Dispersion',
        content: `
          <p><strong>Mean ($\\mu$):</strong> Arithmetic center $\\frac{1}{N}\\sum x_i$. Highly sensitive to extreme values.</p>
          <p><strong>Median:</strong> The true 50th percentile. 50% of values lie above, 50% lie below. Invariant to values beyond the median.</p>
          <p><strong>Standard Deviation ($\\sigma$):</strong> $\\sqrt{\\frac{\\sum (x_i - \\mu)^2}{N-1}}$. Measures the average spread from the mean in original units.</p>
          <p><strong>The Empirical Rule (68-95-99.7):</strong> For normal distributions:
            <ul>
              <li>68.2% of data falls within $\\mu \\pm 1\\sigma$</li>
              <li>95.4% of data falls within $\\mu \\pm 2\\sigma$</li>
              <li>99.7% of data falls within $\\mu \\pm 3\\sigma$</li>
            </ul>
          </p>
        `
      },
      {
        heading: '2. Skewness & Kurtosis Visualized',
        content: `
          <ul>
            <li><strong>Right Skewed (Positive Skew):</strong> Long tail to the right (e.g., income, house prices). Order of measures: $\\text{Mode} < \\text{Median} < \\text{Mean}$.</li>
            <li><strong>Left Skewed (Negative Skew):</strong> Long tail to the left (e.g., age at death in developed countries). Order: $\\text{Mean} < \\text{Median} < \\text{Mode}$.</li>
            <li><strong>Kurtosis:</strong> Measures tail fatness and outlier risk. Leptokurtic (high kurtosis) means heavy tails and frequent extreme "black swan" shocks.</li>
          </ul>
        `
      },
      {
        heading: '3. Correlation vs. Causation & Simpson’s Paradox',
        content: `
          <p><strong>Pearson Correlation ($r$):</strong> Measures linear relationship between $-1.0$ and $+1.0$. Zero correlation does NOT mean zero relationship (e.g., a perfect quadratic $y = x^2$ has $r \\approx 0$!).</p>
          <p><strong>Simpson’s Paradox:</strong> A trend appears in different groups of data but disappears or reverses when the groups are combined! (Classic example: UC Berkeley 1973 admissions appeared gender-biased overall, but when split by department, women were admitted at equal or higher rates—they simply applied to more competitive departments).</p>
        `
      }
    ],
    codeSnippets: {
      python: `# Python / Scipy EDA Diagnostics


# Comprehensive descriptive statistics
summary = df['revenue'].describe(percentiles=[0.05, 0.25, 0.50, 0.75, 0.95])

# Calculate skewness & kurtosis
skew_val = stats.skew(df['revenue'].dropna())
kurt_val = stats.kurtosis(df['revenue'].dropna())

# Pearson vs Spearman rank correlation
pearson_r, _ = stats.pearsonr(df['ad_spend'], df['revenue'])
spearman_rho, _ = stats.spearmanr(df['ad_spend'], df['revenue'])`,
      sql: `-- SQL Percentile Calculation (Postgres / Snowflake / BigQuery)
SELECT 
  AVG(price) AS mean_price,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY price) AS median_price,
  STDDEV(price) AS std_dev,
  PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY price) - 
  PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY price) AS iqr
FROM real_estate_listings;`
    },
    interviewTraps: [
      {
        q: 'If variable X and variable Y have a Pearson correlation of 0, does that mean they are independent?',
        a: 'No! Pearson only measures LINEAR association. If Y = X², they are 100% deterministically dependent, yet their Pearson correlation coefficient r is 0.'
      },
      {
        q: 'In a right-skewed salary distribution, which is larger: the mean or the median?',
        a: 'The Mean is larger. The extreme high salaries pull the arithmetic mean to the right, while the median remains fixed at the 50th percentile.'
      }
    ],
    quiz: [
      {
        question: 'In a heavily right-skewed distribution, what is the correct ordering of central measures?',
        options: ['Mean < Median < Mode', 'Mode < Median < Mean', 'Median < Mean < Mode', 'All are equal'],
        correct: 1,
        explanation: 'In right-skewed data, Mode is at the peak, Median is in the middle, and Mean is pulled highest by the long tail.'
      },
      {
        question: 'Approximately what percentage of data falls within 2 standard deviations in a normal distribution?',
        options: ['50%', '68%', '95%', '99.7%'],
        correct: 2,
        explanation: 'According to the Empirical 68-95-99.7 rule, ~95.4% of observations lie within ±2 standard deviations.'
      }
    ]
  },

  bi_dashboard: {
    id: 'bi_dashboard',
    title: 'Business Intelligence, SaaS Unit Economics & Funnel Analytics',
    track: 'analyst',
    badge: 'Funnel Optimizer',
    industryExample: {
      company: 'Stripe & Shopify',
      scenario: 'Checkout Abandonment & SaaS Unit Economics',
      details: 'Shopify engineers discovered that adding Apple Pay / Google Pay 1-click checkout reduced checkout friction by 32%, directly injecting $1.2B in annualized Gross Merchandise Value.'
    },
    coreConcepts: [
      {
        heading: '1. The Golden SaaS Unit Economics Matrix',
        content: `
          <ul>
            <li><strong>MRR / ARR:</strong> Monthly Recurring Revenue ($MRR = \\text{Active Subscribers} \\times \\text{ARPU}$) and Annualized ($ARR = MRR \\times 12$).</li>
            <li><strong>Customer Acquisition Cost (CAC):</strong> $\\text{CAC} = \\frac{\\text{Total Sales & Marketing Spend}}{\\text{New Customers Acquired}}$.</li>
            <li><strong>Customer Lifetime Value (LTV):</strong> $\\text{LTV} = \\frac{\\text{ARPU} \\times \\text{Gross Margin %}}{\\text{Customer Churn Rate}}$.</li>
            <li><strong>LTV : CAC Ratio:</strong> The universal startup benchmark:
              <ul>
                <li>&lt; 1.0x: Burning cash, dying business.</li>
                <li>3.0x: Healthy, sustainable high-growth sweet spot.</li>
                <li>&gt; 5.0x: Under-investing in marketing! Should spend aggressively to acquire market share.</li>
              </ul>
            </li>
          </ul>
        `
      },
      {
        heading: '2. E-Commerce Conversion Funnel Mechanics',
        content: `
          <p>Every digital product is a leaking pipe. Funnels measure stage-to-stage transition conversion rates:</p>
          <ol>
            <li><strong>Top of Funnel (TOFU):</strong> Impressions ➔ Product Landing Page View.</li>
            <li><strong>Middle of Funnel (MOFU):</strong> Product View ➔ Add to Cart.</li>
            <li><strong>Bottom of Funnel (BOFU):</strong> Add to Cart ➔ Checkout Initiated ➔ Payment Completed.</li>
          </ol>
          <p><em>The Bottleneck Rule:</em> A 5% conversion improvement at the bottom of the funnel (payment) delivers dramatically higher revenue than a 5% traffic boost at the top!</p>
        `
      },
      {
        heading: '3. Cohort Retention Heatmap Analysis',
        content: `
          <p>A cohort groups users by their acquisition month (e.g., "Jan 2026 cohort"). Tracking them across Month 0, 1, 2, 3 reveals:</p>
          <ul>
            <li><strong>Retention Decay Curve:</strong> Where do users churn? A steep drop between M0 and M1 indicates defective onboarding.</li>
            <li><strong>Retention Smiles:</strong> When older cohorts start increasing engagement in M6 or M12, indicating strong organic product network effects.</li>
          </ul>
        `
      }
    ],
    codeSnippets: {
      python: `# Python Cohort Retention Matrix with Pandas

# Group by Acquisition Month and Order Month
cohorts = df.groupby(['cohort_month', 'order_month'])['user_id'].nunique().reset_index()
cohorts['period_number'] = (cohorts['order_month'] - cohorts['cohort_month']).apply(lambda x: x.n)

# Pivot into retention table
retention_matrix = cohorts.pivot(index='cohort_month', columns='period_number', values='user_id')
cohort_sizes = retention_matrix.iloc[:, 0]
retention_pct = retention_matrix.divide(cohort_sizes, axis=0) * 100`,
      sql: `-- SQL Funnel Conversion Drop-off Rates
WITH FunnelStages AS (
  SELECT
    COUNT(DISTINCT visitor_id) AS visitors,
    COUNT(DISTINCT CASE WHEN viewed_product = 1 THEN visitor_id END) AS viewers,
    COUNT(DISTINCT CASE WHEN added_to_cart = 1 THEN visitor_id END) AS cart_adders,
    COUNT(DISTINCT CASE WHEN completed_purchase = 1 THEN visitor_id END) AS buyers
  FROM web_analytics_sessions
)
SELECT
  visitors,
  viewers,
  ROUND(viewers * 100.0 / visitors, 2) AS visit_to_view_pct,
  ROUND(cart_adders * 100.0 / viewers, 2) AS view_to_cart_pct,
  ROUND(buyers * 100.0 / cart_adders, 2) AS cart_to_purchase_pct
FROM FunnelStages;`
    },
    interviewTraps: [
      {
        q: 'If your LTV:CAC ratio is 7:1, is that always good news for the business?',
        a: 'Not necessarily! An LTV:CAC of 7:1 usually means you are severely under-spending on sales and marketing, leaving the market wide open for faster-spending competitors to capture market share.'
      },
      {
        q: 'Why is Net Revenue Retention (NRR) often considered more important than Logo Churn?',
        a: 'NRR accounts for expansion revenue (upsells, cross-sells, usage growth). If NRR is 120%, the business grows 20% annually even if it acquires zero new customers!'
      }
    ],
    quiz: [
      {
        question: 'What is the universally accepted target benchmark for a healthy SaaS LTV:CAC ratio?',
        options: ['0.5x', '1.0x', '3.0x', '20.0x'],
        correct: 2,
        explanation: '3.0x is considered the gold standard benchmark for sustainable, scalable SaaS growth.'
      },
      {
        question: 'What does a steep retention drop-off between Month 0 and Month 1 typically signify?',
        options: ['Pricing is too cheap', 'Onboarding or initial product experience friction', 'Server latency', 'High CAC'],
        correct: 1,
        explanation: 'Losing users immediately in month 1 points directly to onboarding confusion or lack of immediate value realization.'
      }
    ]
  },

  ab_testing: {
    id: 'ab_testing',
    title: 'A/B Testing, Experimentation & Statistical Hypothesis Testing',
    track: 'analyst',
    badge: 'P-Value Champion',
    industryExample: {
      company: 'Netflix & Booking.com',
      scenario: 'Thumbnail Recommendation & Checkout Friction',
      details: 'Netflix runs over 5,000 A/B tests annually. Every personalized movie artwork thumbnail is rigorously tested against control groups with strict sample sizes before rolling out to 250M subscribers.'
    },
    coreConcepts: [
      {
        heading: '1. The Hypothesis Testing Framework',
        content: `
          <ul>
            <li><strong>Null Hypothesis ($H_0$):</strong> There is NO real difference between Variant A and Variant B (any observed lift is pure random noise).</li>
            <li><strong>Alternative Hypothesis ($H_1$):</strong> Variant B creates a genuine, non-random lift in conversion rate.</li>
            <li><strong>P-Value:</strong> The probability of observing an effect at least as extreme as what was measured, assuming $H_0$ is true. A $p < 0.05$ threshold means there is less than a 5% chance the result was a fluke.</li>
          </ul>
        `
      },
      {
        heading: '2. The Error Matrix: Type I vs. Type II Errors',
        content: `
          <table class="lab-table">
            <thead>
              <tr><th>Reality</th><th>Reject $H_0$ (Launch Variant B)</th><th>Fail to Reject $H_0$ (Keep Control)</th></tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>$H_0$ True (No Effect)</strong></td>
                <td><span class="tag tag-danger">Type I Error ($\\alpha$) - False Positive</span><br>Shipped a useless or harmful feature!</td>
                <td><span class="tag tag-success">Correct Decision</span><br>Avoided false alarm.</td>
              </tr>
              <tr>
                <td><strong>$H_1$ True (Real Lift)</strong></td>
                <td><span class="tag tag-success">Correct Decision</span><br>Captured revenue lift!</td>
                <td><span class="tag tag-warning">Type II Error ($\\beta$) - False Negative</span><br>Killed a winning feature due to low power!</td>
              </tr>
            </tbody>
          </table>
          <p><strong>Statistical Power ($1 - \\beta$):</strong> The probability of detecting a real effect when one actually exists (standard target: $80\%$).</p>
        `
      },
      {
        heading: '3. The "Peeking Problem" & Sample Size Rigor',
        content: `
          <p><strong>The Peeking Problem:</strong> Checking results daily and stopping the test the moment $p < 0.05$ inflates your false positive rate from 5% to over 30%! You must pre-calculate sample size based on <strong>MDE (Minimum Detectable Effect)</strong> and run the test to completion.</p>
        `
      }
    ],
    codeSnippets: {
      python: `# Python / Scipy Two-Proportion Z-Test
from statsmodels.stats.proportion import proportions_ztest

# Successes (conversions) and trials (visitors)
count = [120, 165]   # Variant A vs Variant B
nobs = [2000, 2000]

# Two-sided hypothesis test
z_stat, p_value = proportions_ztest(count, nobs)
print(f"Z-Score: {z_stat:.3f}, P-Value: {p_value:.5f}")
if p_value < 0.05:
    print("Statistically Significant! Reject Null Hypothesis.")`,
      sql: `-- SQL Z-Score Calculation Template
WITH Stats AS (
  SELECT
    SUM(CASE WHEN variant = 'A' THEN converted ELSE 0 END) AS conv_a,
    COUNT(CASE WHEN variant = 'A' THEN 1 END) AS n_a,
    SUM(CASE WHEN variant = 'B' THEN converted ELSE 0 END) AS conv_b,
    COUNT(CASE WHEN variant = 'B' THEN 1 END) AS n_b
  FROM ab_experiment_logs
)
SELECT
  conv_a * 1.0 / n_a AS rate_a,
  conv_b * 1.0 / n_b AS rate_b,
  (conv_b * 1.0 / n_b - conv_a * 1.0 / n_a) / 
    SQRT(
      ((conv_a + conv_b) * 1.0 / (n_a + n_b)) * 
      (1 - ((conv_a + conv_b) * 1.0 / (n_a + n_b))) * 
      (1.0 / n_a + 1.0 / n_b)
    ) AS z_score
FROM Stats;`
    },
    interviewTraps: [
      {
        q: 'What does a p-value of 0.03 actually tell you?',
        a: 'It does NOT mean there is a 97% chance Variant B is better! It means: IF the null hypothesis were true (no real difference), there is only a 3% probability of observing data this extreme due to random chance.'
      },
      {
        q: 'Why can’t you stop an A/B test early as soon as it reaches p < 0.05?',
        a: 'Because p-values fluctuate randomly throughout an experiment. Early stopping selectively captures random upward variance spikes, creating rampant Type I errors (False Positives).'
      }
    ],
    quiz: [
      {
        question: 'What is a Type I error in statistical hypothesis testing?',
        options: ['False Negative (missing a real effect)', 'False Positive (claiming an effect when none exists)', 'Calculation error', 'Data loss'],
        correct: 1,
        explanation: 'Type I error (alpha) occurs when you reject a true null hypothesis, declaring a winner when it was just noise.'
      },
      {
        question: 'What is the industry standard target for Statistical Power (1 - beta)?',
        options: ['10%', '50%', '80%', '100%'],
        correct: 2,
        explanation: '80% power (beta = 0.20) is the standard trade-off between sample collection cost and false negative risk.'
      }
    ]
  },

  feature_eng: {
    id: 'feature_eng',
    title: 'Feature Engineering, Normalization & Dimensional Transformations',
    track: 'scientist',
    badge: 'Dimension Lifter',
    industryExample: {
      company: 'Google & Meta',
      scenario: 'Ad Click-Through Prediction & High Cardinality',
      details: 'Google ads models process billions of category combinations (e.g., Device_Type x User_Country x Query_Category) using feature crosses and hashing tricks to make non-linear interactions linearly learnable.'
    },
    coreConcepts: [
      {
        heading: '1. Categorical Encoding: When to use What',
        content: `
          <ul>
            <li><strong>One-Hot Encoding:</strong> Creates binary $0/1$ indicator columns. Best for nominal data with low cardinality (&lt; 15 categories like Device: Mobile, Desktop, Tablet). Warning: Explodes dimensionality if used on Zip Codes!</li>
            <li><strong>Label Encoding:</strong> Maps values to integers ($0, 1, 2, 3$). Only safe for ordinal features with inherent hierarchy (e.g., T-shirt size: S &lt; M &lt; L &lt; XL). Applying this to non-ordinal data (Tokyo=0, London=1) causes linear algorithms to assume London &gt; Tokyo!</li>
            <li><strong>Target Encoding (Mean Encoding):</strong> Replaces categorical levels with the average target value for that level. High risk of overfitting; requires K-Fold out-of-fold smoothing!</li>
          </ul>
        `
      },
      {
        heading: '2. Normalization vs. Standardization (Scaling)',
        content: `
          <ul>
            <li><strong>Min-Max Normalization:</strong> $X_{\\text{norm}} = \\frac{X - X_{\\min}}{X_{\\max} - X_{\\min}} \\in [0, 1]$. Crucial for neural networks and image processing, but compressed into tiny intervals if extreme outliers exist!</li>
            <li><strong>Standardization (Z-Score):</strong> $X_{\\text{std}} = \\frac{X - \\mu}{\\sigma}$. Centers around $\\mu = 0$ with variance $\\sigma^2 = 1$. Essential for linear regression, logistic regression, SVMs, and PCA.</li>
            <li><strong>RobustScaler:</strong> Uses median and IQR ($X_{\\text{rob}} = \\frac{X - Q_2}{Q_3 - Q_1}$). The ultimate scaler when data contains extreme unremovable outliers.</li>
          </ul>
        `
      },
      {
        heading: '3. The Polynomial Lift & The Kernel Trick Intuition',
        content: `
          <p>When data cannot be separated by a straight line in 2D (like concentric circles or XOR patterns), we can create interaction terms like $x_1 \\times x_2$ or polynomial features like $x_1^2 + x_2^2$. This projects the points into a higher-dimensional space where a simple linear hyperplane cleanly slices them!</p>
        `
      }
    ],
    codeSnippets: {
      python: `# Python / Scikit-Learn Feature Engineering Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler, PolynomialFeatures
from sklearn.compose import ColumnTransformer

numeric_features = ['age', 'salary']
categorical_features = ['city', 'tier']

preprocessor = ColumnTransformer(
    transformers=[
        ('num', StandardScaler(), numeric_features),
        ('cat', OneHotEncoder(drop='first', sparse_output=False), categorical_features)
    ]
)

# Polynomial Feature expansion
poly = PolynomialFeatures(degree=2, include_bias=False)
X_poly = poly.fit_transform(X_numeric)`,
      sql: `-- SQL One-Hot Encoding via CASE WHEN
SELECT
  user_id,
  CASE WHEN device = 'Mobile' THEN 1 ELSE 0 END AS is_mobile,
  CASE WHEN device = 'Desktop' THEN 1 ELSE 0 END AS is_desktop,
  CASE WHEN device = 'Tablet' THEN 1 ELSE 0 END AS is_tablet
FROM raw_user_sessions;`
    },
    interviewTraps: [
      {
        q: 'Why do Tree-based models (Random Forest, XGBoost) NOT require feature scaling?',
        a: 'Trees make monotonic split decisions based on order rankings (is X > threshold?), completely ignoring absolute numeric scale. Scaling age or salary changes the threshold number, but does not alter the partition split.'
      },
      {
        q: 'What is the Dummy Variable Trap in One-Hot Encoding?',
        a: 'Multicollinearity! If a category has K classes and you create K binary columns, the sum of those columns equals 1, creating a perfect linear dependency with the intercept. You must drop one column (K - 1 columns).'
      }
    ],
    quiz: [
      {
        question: 'Which scaler is most resilient when features contain extreme, unremovable outliers?',
        options: ['MinMaxScaler', 'StandardScaler', 'RobustScaler', 'MaxAbsScaler'],
        correct: 2,
        explanation: 'RobustScaler uses median and IQR, preventing extreme values from distorting the scaling parameters.'
      },
      {
        question: 'Why does Label Encoding fail on nominal features like Country in linear models?',
        options: ['It creates too many columns', 'It introduces false mathematical order (e.g. Country 3 > Country 1)', 'It removes nulls', 'It requires GPU'],
        correct: 1,
        explanation: 'Linear models treat integers as continuous quantities, creating an artificial mathematical relationship between arbitrary category IDs.'
      }
    ]
  },

  regression: {
    id: 'regression',
    title: 'Linear Regression, Cost Surfaces & Gradient Descent Mechanics',
    track: 'scientist',
    badge: 'Cost Surface Surfer',
    industryExample: {
      company: 'Uber & Tesla',
      scenario: 'Dynamic Surge Pricing & Battery Range Estimation',
      details: 'Uber predicts ride pricing using regularized regressions factoring in distance, historical demand, driver supply, and weather conditions, balancing weights through gradient descent.'
    },
    coreConcepts: [
      {
        heading: '1. Ordinary Least Squares (OLS) & Loss Functions',
        content: `
          <p>The linear model equation: $\\hat{y} = w^T x + b$.</p>
          <p><strong>Mean Squared Error (MSE):</strong> $J(w, b) = \\frac{1}{N} \\sum_{i=1}^N (y_i - \\hat{y}_i)^2$. Squaring errors penalizes large mistakes heavily.</p>
          <p><strong>Mean Absolute Error (MAE):</strong> $\\frac{1}{N} \\sum |y_i - \\hat{y}_i|$. Linear penalty; robust to outliers but non-differentiable at zero.</p>
          <p><strong>Huber Loss:</strong> Combines the best of both: quadratic for small errors and linear for large outliers!</p>
        `
      },
      {
        heading: '2. Gradient Descent: Step-by-Step Optimization',
        content: `
          <p>Gradient descent updates weights iteratively in the opposite direction of the loss gradient:</p>
          <p>$$w_{t+1} = w_t - \\alpha \\frac{\\partial J}{\\partial w}$$</p>
          <ul>
            <li><strong>Learning Rate ($\\alpha$):</strong>
              <ul>
                <li>Too Small ($\alpha = 0.0001$): Takes forever to train; risks getting stuck in local plateaus.</li>
                <li>Optimal ($\alpha = 0.05$): Smooth convergence down the bowl to the global minimum.</li>
                <li>Too Large ($\alpha = 1.5$): Overshoots the minimum, oscillates wildly, and explodes to infinity!</li>
              </ul>
            </li>
          </ul>
        `
      },
      {
        heading: '3. Regularization: Ridge (L2) vs. Lasso (L1) vs. ElasticNet',
        content: `
          <ul>
            <li><strong>Ridge Regression (L2 Penalty $\\lambda \\sum w_i^2$):</strong> Shrinks weights toward zero smoothly. Solves multicollinearity. Never sets weights completely to zero.</li>
            <li><strong>Lasso Regression (L1 Penalty $\\lambda \\sum |w_i|$):</strong> Sharp diamond constraint forces non-important weights exactly to ZERO. Built-in feature selection!</li>
            <li><strong>ElasticNet:</strong> Weighted combination of L1 and L2 penalties for high-dimensional datasets with correlated features.</li>
          </ul>
        `
      }
    ],
    codeSnippets: {
      python: `# Python / Scikit-Learn Regularized Regression
from sklearn.linear_model import Ridge, Lasso, ElasticNet
from sklearn.metrics import mean_squared_error, r2_score

# Ridge Regression (L2) to prevent overfitting
model = Ridge(alpha=1.0)
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
mse = mean_squared_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)
print(f"MSE: {mse:.4f}, R²: {r2:.4f}")`,
      sql: `-- Computing Simple Linear Regression Slope & Intercept in SQL
WITH Stats AS (
  SELECT
    AVG(x) AS avg_x,
    AVG(y) AS avg_y,
    VAR_POP(x) AS var_x,
    COVAR_POP(x, y) AS cov_xy
  FROM regression_dataset
)
SELECT
  cov_xy / var_x AS slope_w,
  avg_y - (cov_xy / var_x) * avg_x AS intercept_b
FROM Stats;`
    },
    interviewTraps: [
      {
        q: 'What is the fundamental difference between L1 (Lasso) and L2 (Ridge) regularization?',
        a: 'Lasso (L1) drives coefficients completely to zero, producing sparse models and acting as feature selection. Ridge (L2) shrinks coefficients asymptotically toward zero but never zeroes them out completely.'
      },
      {
        q: 'What happens to Gradient Descent if you forget to scale your features?',
        a: 'The cost surface becomes a steep, elongated, pathological canyon. The optimization ball bounces back and forth across the steep walls instead of rolling smoothly down the valley floor.'
      }
    ],
    quiz: [
      {
        question: 'Which regularization technique can drive feature coefficients exactly to zero?',
        options: ['Ridge (L2)', 'Lasso (L1)', 'Dropout', 'Batch Normalization'],
        correct: 1,
        explanation: 'Lasso uses the L1 norm whose diamond constraint geometry allows solutions to hit axes directly at zero.'
      },
      {
        question: 'What occurs when the Gradient Descent learning rate is set excessively high?',
        options: ['Model trains instantly', 'Gradient explodes and loss diverges to infinity', 'Loss reaches zero', 'Features are dropped'],
        correct: 1,
        explanation: 'A learning rate that is too high causes weight updates to overshoot the valley and explode outward.'
      }
    ]
  },

  classification: {
    id: 'classification',
    title: 'Classification, Logistic Regression, Decision Trees & Ensembles',
    track: 'scientist',
    badge: 'Gini Chopper',
    industryExample: {
      company: 'Amazon & Netflix',
      scenario: 'Churn Prediction & Fraud Detection',
      details: 'Ensemble Gradient Boosted Trees (XGBoost / LightGBM) power the majority of competitive tabular classification tasks in industry due to unmatched accuracy on non-linear tabular data.'
    },
    coreConcepts: [
      {
        heading: '1. Logistic Regression & Log-Odds',
        content: `
          <p>Logistic regression maps linear equations to probabilities using the <strong>Sigmoid function</strong>:</p>
          <p>$$\\sigma(z) = \\frac{1}{1 + e^{-z}}, \\quad \\text{where } z = w^T x + b$$</p>
          <p>The model predicts log-odds: $\\ln\\left(\\frac{p}{1-p}\\right) = w^T x + b$. Each unit increase in $x_i$ multiplies odds of the positive outcome by $e^{w_i}$.</p>
        `
      },
      {
        heading: '2. Decision Tree Mathematics: Gini Impurity vs. Entropy',
        content: `
          <p>Trees recursively partition feature space into homogeneous rectangles using impurity metrics:</p>
          <p><strong>Gini Impurity:</strong> $I_G = 1 - \\sum_{i=1}^C p_i^2$. Measures the probability that a randomly chosen element is incorrectly labeled. A pure leaf has Gini = 0.00.</p>
          <p><strong>Entropy:</strong> $H = -\\sum p_i \\log_2(p_i)$. Information Gain measures the drop in entropy after making a split.</p>
        `
      },
      {
        heading: '3. Bagging (Random Forest) vs. Boosting (XGBoost / LightGBM)',
        content: `
          <ul>
            <li><strong>Bagging (Random Forest):</strong> Trains hundreds of deep, high-variance trees in parallel on bootstrap subsets of data and features. Aggregating their predictions dramatically <strong>reduces variance</strong> without increasing bias.</li>
            <li><strong>Boosting:</strong> Trains shallow, high-bias trees sequentially. Each new tree specifically trains on the residual errors of the previous trees, dramatically <strong>reducing bias</strong>.</li>
          </ul>
        `
      }
    ],
    codeSnippets: {
      python: `# Python / Random Forest & XGBoost Classifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report

rf = RandomForestClassifier(
    n_estimators=100,
    max_depth=6,
    min_samples_split=5,
    random_state=42
)
rf.fit(X_train, y_train)

# Feature importance ranking
importances = rf.feature_importances_
print(classification_report(y_test, rf.predict(X_test)))`,
      sql: `-- SQL Implementation of Simple Decision Rules
SELECT
  customer_id,
  CASE
    WHEN tenure_months > 12 AND monthly_charges < 50 THEN 'Low Churn Risk'
    WHEN support_tickets_30d > 4 THEN 'Immediate Churn Risk'
    ELSE 'Moderate Churn Risk'
  END AS predicted_churn_bucket
FROM customer_features;`
    },
    interviewTraps: [
      {
        q: 'Why does an unconstrained Decision Tree overfit easily?',
        a: 'Because an unconstrained tree will keep splitting until every single training sample occupies its own pure leaf node, essentially memorizing the training noise rather than generalizing.'
      },
      {
        q: 'How does Random Forest ensure the individual trees are decorrelated?',
        a: 'By using Bootstrap Aggregation (bagging samples) AND Random Feature Subsets at every split! Forcing trees to consider only √P features at each cut prevents a dominant feature from making all trees identical.'
      }
    ],
    quiz: [
      {
        question: 'What is the Gini Impurity of a completely pure leaf node containing 100% positive samples?',
        options: ['1.00', '0.50', '0.00', '-1.00'],
        correct: 2,
        explanation: 'A completely pure node has Gini Impurity of 0 (1 - 1² = 0).'
      },
      {
        question: 'What is the primary error reduction mechanism of Random Forest?',
        options: ['Reducing bias', 'Reducing variance by averaging decorrelated trees', 'Reducing training time', 'Eliminating features'],
        correct: 1,
        explanation: 'Random Forest trains deep high-variance trees and averages them, which slashes model variance.'
      }
    ]
  },

  clustering: {
    id: 'clustering',
    title: 'Unsupervised Learning, K-Means Clustering & Dimensionality Reduction (PCA)',
    track: 'scientist',
    badge: 'Voronoi Master',
    industryExample: {
      company: 'Spotify & Airbnb',
      scenario: 'Music Taste Personas & Neighborhood Clustering',
      details: 'Spotify clusters millions of users into listening taste profiles using latent acoustic embeddings and K-Means, driving personalized Discover Weekly playlist algorithms.'
    },
    coreConcepts: [
      {
        heading: '1. K-Means Algorithm Mechanics (Lloyd’s Algorithm)',
        content: `
          <p>K-Means partitions $N$ points into $K$ clusters by iterating through two steps:</p>
          <ol>
            <li><strong>Assignment Step:</strong> Assign each data point $x_i$ to its closest centroid $\\mu_k$ based on Euclidean distance $||x_i - \\mu_k||^2$.</li>
            <li><strong>Update Step:</strong> Recompute each centroid $\\mu_k$ as the mathematical mean of all points assigned to it.</li>
          </ol>
          <p><strong>Inertia (WCSS):</strong> Within-Cluster Sum of Squares $\\sum_{k=1}^K \\sum_{x \\in C_k} ||x - \\mu_k||^2$. As $K$ approaches $N$, inertia drops to 0. Find the optimal $K$ using the <strong>Elbow Method</strong> or <strong>Silhouette Score</strong>.</p>
        `
      },
      {
        heading: '2. Principal Component Analysis (PCA) Explained Intuitively',
        content: `
          <p>PCA compresses high-dimensional data into orthogonal axes that capture maximal variance:</p>
          <ul>
            <li>$PC_1$: The line passing through the data that maximizes the variance of the projected points.</li>
            <li>$PC_2$: The line completely perpendicular (orthogonal) to $PC_1$ that captures the next largest amount of remaining variance.</li>
          </ul>
          <p>PCA mathematically computes the <strong>Eigenvectors</strong> (directions of variance) and <strong>Eigenvalues</strong> (magnitudes of variance) of the feature Covariance Matrix!</p>
        `
      }
    ],
    codeSnippets: {
      python: `# Python / K-Means & PCA Pipeline
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.metrics import silhouette_score

# 1. K-Means Clustering
kmeans = KMeans(n_clusters=3, init='k-means++', random_state=42)
labels = kmeans.fit_predict(X_scaled)
sil_score = silhouette_score(X_scaled, labels)

# 2. PCA Compression (2D Projection)
pca = PCA(n_components=2)
X_pca = pca.fit_transform(X_scaled)
print(f"Explained Variance Ratio: {pca.explained_variance_ratio_}")`,
      sql: `-- K-Means Clustering inside BigQuery ML
CREATE OR REPLACE MODEL \`analytics.customer_segments\`
OPTIONS(model_type='kmeans', num_clusters=3) AS
SELECT annual_income, spending_score, loyalty_years
FROM \`analytics.customers\`;`
    },
    interviewTraps: [
      {
        q: 'Why MUST you scale features before running K-Means or PCA?',
        a: 'Both rely directly on Euclidean distance calculations. If Salary is $100,000 and Age is 30, Salary will completely dominate the distance metric, making Age effectively irrelevant.'
      },
      {
        q: 'What is a key limitation of K-Means clustering?',
        a: 'K-Means assumes clusters are spherical, isotropic, and similarly sized. It completely fails on non-convex shapes (like concentric rings or crescent moons).'
      }
    ],
    quiz: [
      {
        question: 'Which method is used to determine the optimal number of clusters K in K-Means?',
        options: ['Gradient Descent', 'Elbow Method & Silhouette Score', 'P-value test', 'Confusion Matrix'],
        correct: 1,
        explanation: 'Plotting inertia across K values reveals an elbow inflection point, complemented by the silhouette width metric.'
      },
      {
        question: 'In PCA, what do the eigenvectors of the covariance matrix represent?',
        options: ['The principal directions of maximum variance', 'The cluster centers', 'The prediction errors', 'The learning rates'],
        correct: 0,
        explanation: 'Eigenvectors define the orthogonal directions of spread (principal components), and eigenvalues give the variance along each.'
      }
    ]
  },

  confusion_matrix: {
    id: 'confusion_matrix',
    title: 'Model Evaluation, Precision-Recall & ROC/AUC Curves',
    track: 'scientist',
    badge: 'Fraud Hunter',
    industryExample: {
      company: 'Mastercard & Hospital Systems',
      scenario: 'Credit Card Fraud & Cancer Screening',
      details: 'In cancer screening or fraud detection, missing a positive case (False Negative) is catastrophic. Systems tune their threshold down to 0.15 to achieve 98% Recall, willingly accepting more False Positives.'
    },
    coreConcepts: [
      {
        heading: '1. The Four Quadrants of the Confusion Matrix',
        content: `
          <ul>
            <li><strong>True Positive (TP):</strong> Frauds correctly flagged as Fraud.</li>
            <li><strong>False Positive (FP):</strong> Legitimate transactions incorrectly flagged as Fraud (Type I Error / False Alarm).</li>
            <li><strong>True Negative (TN):</strong> Legitimate transactions correctly approved.</li>
            <li><strong>False Negative (FN):</strong> Frauds missed by the model (Type II Error / Catastrophic miss!).</li>
          </ul>
        `
      },
      {
        heading: '2. Precision vs. Recall vs. F1-Score',
        content: `
          <p><strong>Precision ($\\frac{TP}{TP + FP}$):</strong> Out of all transactions we flagged as fraud, how many actually were fraud? Critical when false alarms carry high cost (e.g., spam filters blocking legitimate executive emails).</p>
          <p><strong>Recall (Sensitivity $\\frac{TP}{TP + FN}$):</strong> Out of all actual fraud in the real world, how many did we catch? Critical when missing a case is fatal (cancer detection, fraud, security breach).</p>
          <p><strong>F1-Score ($2 \\times \\frac{\\text{Precision} \\times \\text{Recall}}{\\text{Precision} + \\text{Recall}}$):</strong> The harmonic mean balancing both metrics.</p>
        `
      },
      {
        heading: '3. ROC Curve vs. Precision-Recall (PR) Curve',
        content: `
          <p><strong>ROC Curve:</strong> Plots True Positive Rate (Recall) vs False Positive Rate ($\\frac{FP}{FP + TN}$) across all possible probability thresholds ($0.0 \\to 1.0$). AUC = 0.5 is a random coin flip; AUC &gt; 0.9 is excellent.</p>
          <p><em>Crucial Insight:</em> On heavily imbalanced datasets (e.g. 99.9% normal, 0.1% fraud), ROC-AUC can be deceptively optimistic because the huge number of True Negatives suppresses FPR. Always use <strong>Precision-Recall AUC (PR-AUC)</strong> for rare event models!</p>
        `
      }
    ],
    codeSnippets: {
      python: `# Python / Scikit-Learn Model Evaluation
from sklearn.metrics import classification_report, roc_auc_score, roc_curve

# Predict probabilities instead of hard labels
y_probs = model.predict_proba(X_test)[:, 1]

# Compute ROC-AUC
auc_score = roc_auc_score(y_test, y_probs)
fpr, tpr, thresholds = roc_curve(y_test, y_probs)

# Choose custom threshold for High-Recall requirement
custom_thresh = 0.35
y_custom_pred = (y_probs >= custom_thresh).astype(int)
print(classification_report(y_test, y_custom_pred))`,
      sql: `-- SQL Confusion Matrix Aggregator
SELECT
  SUM(CASE WHEN actual = 1 AND predicted = 1 THEN 1 ELSE 0 END) AS true_positives,
  SUM(CASE WHEN actual = 0 AND predicted = 1 THEN 1 ELSE 0 END) AS false_positives,
  SUM(CASE WHEN actual = 0 AND predicted = 0 THEN 1 ELSE 0 END) AS true_negatives,
  SUM(CASE WHEN actual = 1 AND predicted = 0 THEN 1 ELSE 0 END) AS false_negatives
FROM model_predictions;`
    },
    interviewTraps: [
      {
        q: 'A cancer detection model has 99.5% accuracy. Why is it potentially useless?',
        a: 'If only 0.5% of patients have cancer, a naive model that predicts "Healthy" for every single patient achieves 99.5% accuracy while having a Recall of 0% and killing every patient with cancer!'
      },
      {
        q: 'When should you use the Precision-Recall curve instead of the ROC curve?',
        a: 'On highly imbalanced datasets. ROC curves are artificially inflated by huge True Negative counts, whereas PR curves focus strictly on the minority positive class.'
      }
    ],
    quiz: [
      {
        question: 'Which metric measures the fraction of actual positive events that the model successfully caught?',
        options: ['Precision', 'Recall (Sensitivity)', 'Specificity', 'Accuracy'],
        correct: 1,
        explanation: 'Recall = TP / (TP + FN) measures the proportion of true positives identified out of all positive cases.'
      },
      {
        question: 'Why is Accuracy dangerous for evaluating fraud detection models?',
        options: ['It is slow to compute', 'It assumes equal class distribution and ignores minority fraud events', 'It requires continuous data', 'It cannot be used with Python'],
        correct: 1,
        explanation: 'When 99.9% of transactions are legitimate, predicting all negative gives 99.9% accuracy while catching zero fraud.'
      }
    ]
  },

  neural_net: {
    id: 'neural_net',
    title: 'Deep Learning, Activation Functions & Backpropagation',
    track: 'scientist',
    badge: 'XOR Conqueror',
    industryExample: {
      company: 'OpenAI, DeepMind & Waymo',
      scenario: 'Self-Driving Computer Vision & Transformer Attention',
      details: 'Waymo self-driving vehicles process camera video and LiDAR point clouds using multi-layer deep neural networks trained with Adam optimizers and backpropagation across petabytes of autonomous driving data.'
    },
    coreConcepts: [
      {
        heading: '1. Why Hidden Layers & Non-Linearity Matter',
        content: `
          <p>A neural network without activation functions is simply a linear regression, no matter how many layers you stack ($W_2(W_1 x + b_1) + b_2 = W_{combined} x + b_{combined}$).</p>
          <p>Activation functions inject the non-linearity needed to approximate ANY continuous function (Universal Approximation Theorem):</p>
          <ul>
            <li><strong>ReLU (Rectified Linear Unit):</strong> $f(z) = \\max(0, z)$. Fast, non-saturating; the modern default for hidden layers. Avoids vanishing gradients.</li>
            <li><strong>Sigmoid:</strong> $\\frac{1}{1 + e^{-z}}$. Used for binary output probability heads. Suffers from vanishing gradients in deep layers.</li>
            <li><strong>Softmax:</strong> Normalizes logits into a multi-class probability distribution summing to 1.0.</li>
          </ul>
        `
      },
      {
        heading: '2. Backpropagation & The Chain Rule',
        content: `
          <p>Backpropagation computes how much each synaptic weight contributed to the final prediction error via recursive application of the Calculus Chain Rule:</p>
          <p>$$\\frac{\\partial L}{\\partial w_1} = \\frac{\\partial L}{\\partial \\hat{y}} \\times \\frac{\\partial \\hat{y}}{\\partial h} \\times \\frac{\\partial h}{\\partial w_1}$$</p>
          <p>Gradients propagate backward from output to input, updating each parameter with an optimizer like <strong>Adam</strong> (Adaptive Moment Estimation).</p>
        `
      }
    ],
    codeSnippets: {
      python: `# PyTorch Multi-Layer Perceptron (MLP) for Non-Linear XOR


class MLP(nn.Module):
    def __init__(self):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(2, 8),    # Input to Hidden
            nn.ReLU(),          # Non-linear activation
            nn.Linear(8, 1),    # Hidden to Output
            nn.Sigmoid()        # Probability output
        )
        
    def forward(self, x):
        return self.net(x)

model = MLP()
criterion = nn.BCELoss()
optimizer = torch.optim.Adam(model.parameters(), lr=0.01)`,
      sql: `-- Modern Cloud Data Warehouses (BigQuery / Snowflake) now support DNNs directly
CREATE OR REPLACE MODEL \`analytics.dnn_classifier\`
OPTIONS(model_type='dnn_classifier', hidden_units=[64, 32], activation_fn='relu') AS
SELECT feature_1, feature_2, label
FROM \`analytics.training_data\`;`
    },
    interviewTraps: [
      {
        q: 'What causes the Vanishing Gradient problem and how did ReLU solve it?',
        a: 'Sigmoid and Tanh activations saturate at extreme values, causing their derivatives to approach zero. In deep networks, multiplying these small fractions repeatedly via chain rule causes gradients to vanish to zero before reaching early layers. ReLU has a constant derivative of 1.0 for all positive inputs, eliminating saturation.'
      },
      {
        q: 'What is the role of Dropout in neural networks?',
        a: 'Dropout randomly zeroes out a fraction (e.g. 20-50%) of neuron activations during each training step. This prevents co-adaptation where neurons become dependent on specific neighbors, acting as a powerful ensemble regularizer.'
      }
    ],
    quiz: [
      {
        question: 'What happens if you remove all activation functions from a 50-layer deep neural network?',
        options: ['It trains faster', 'It collapses mathematically into a single linear regression', 'It achieves 100% accuracy', 'Weights explode'],
        correct: 1,
        explanation: 'Composing linear transformations repeatedly yields just another linear transformation (W₂ · W₁ · x = W · x).'
      },
      {
        question: 'Which activation function is most widely used in hidden layers of modern deep architectures to avoid vanishing gradients?',
        options: ['Sigmoid', 'ReLU', 'Step function', 'Linear'],
        correct: 1,
        explanation: 'ReLU (max(0, x)) maintains a constant derivative of 1 for positive inputs, preventing vanishing gradients.'
      }
    ]
  },

  time_series: {
    id: 'time_series',
    title: 'Time Series Forecasting, Additive Decomposition & Anomaly Detection',
    track: 'scientist',
    badge: 'Future Shaper',
    industryExample: {
      company: 'Amazon Web Services & Cloudflare',
      scenario: 'Cloud Capacity Planning & DDoS Attack Detection',
      details: 'Cloudflare continuously decomposes inbound web traffic into baseline seasonality and monitors high-frequency residuals. A sudden 4σ residual spike triggers automated DDoS traffic scrubbing within milliseconds.'
    },
    coreConcepts: [
      {
        heading: '1. Classical Time Series Decomposition',
        content: `
          <p>Any temporal signal can be decomposed additively or multiplicatively:</p>
          <p>$$Y_t = \\text{Trend}_t + \\text{Seasonality}_t + \\text{Residual}_t$$</p>
          <ul>
            <li><strong>Trend ($T_t$):</strong> Long-term directional drift (e.g., company revenue growing 15% year-over-year).</li>
            <li><strong>Seasonality ($S_t$):</strong> Fixed, periodic cyclical patterns (e.g., weekend restaurant surges, Q4 holiday shopping).</li>
            <li><strong>Residual / Noise ($R_t$):</strong> Irregular random variation and external shocks (weather storms, server crashes).</li>
          </ul>
        `
      },
      {
        heading: '2. Stationarity & Autoregressive Models (ARIMA)',
        content: `
          <p><strong>Stationarity:</strong> A time series is stationary if its Mean, Variance, and Autocorrelation are constant over time. Most statistical forecasting models (ARIMA) require stationarity!</p>
          <p>Transform non-stationary data into stationary via <strong>Differencing</strong>: $\\Delta Y_t = Y_t - Y_{t-1}$. Verify with the <strong>Augmented Dickey-Fuller (ADF) Test</strong>.</p>
        `
      },
      {
        heading: '3. Anomaly Detection Mechanics (Rolling 3σ Rule)',
        content: `
          <p>A static threshold fails on time series because a traffic spike on Saturday night might be normal while the same volume at 4 AM Tuesday is a massive anomaly! Compute a <strong>Rolling Moving Average (MA)</strong> and detect anomalies where residual $|Y_t - \\text{MA}_t| > 3\\sigma_{\\text{rolling}}$.</p>
        `
      }
    ],
    codeSnippets: {
      python: `# Python / Statsmodels Time Series Decomposition & ARIMA

from statsmodels.tsa.seasonal import seasonal_decompose
from statsmodels.tsa.stattools import adfuller

# 1. Classical Decomposition
decomp = seasonal_decompose(df['traffic'], model='additive', period=7)
decomp.plot()

# 2. Augmented Dickey-Fuller Test for Stationarity
adf_res = adfuller(df['traffic'])
print(f"ADF Statistic: {adf_res[0]:.3f}, p-value: {adf_res[1]:.4f}")

# 3. ARIMA Forecasting
model = sm.tsa.ARIMA(df['traffic'], order=(1, 1, 1), seasonal_order=(1, 1, 0, 7))
results = model.fit()`,
      sql: `-- SQL Rolling 7-Day Moving Average & Standard Deviation
SELECT
  date,
  traffic_qps,
  AVG(traffic_qps) OVER(
    ORDER BY date 
    ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
  ) AS rolling_7d_mean,
  STDDEV(traffic_qps) OVER(
    ORDER BY date 
    ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
  ) AS rolling_7d_std
FROM server_metrics;`
    },
    interviewTraps: [
      {
        q: 'Why can’t you use standard K-Fold Cross Validation on time series data?',
        a: 'Temporal Leakage! Standard K-Fold randomly shuffles data, allowing future points to predict the past. You must use TimeSeriesSplit (Walk-Forward Validation / Rolling Origin) where training data only precedes test data.'
      },
      {
        q: 'When should you choose a Multiplicative decomposition over an Additive one?',
        a: 'When the seasonal fluctuations grow larger as the trend increases (e.g. holiday sales spikes are proportional to total business scale). Additive assumes constant seasonal amplitude.'
      }
    ],
    quiz: [
      {
        question: 'What mathematical property does a stationary time series exhibit?',
        options: ['Mean and variance remain constant over time', 'Trend increases exponentially', 'No seasonality exists', 'Values are always positive'],
        correct: 0,
        explanation: 'Stationarity requires that statistical properties (mean, variance, autocorrelation) do not vary with time.'
      },
      {
        question: 'Why is random K-Fold cross validation forbidden in time series modeling?',
        options: ['It crashes Python', 'It leaks future information into past predictions (look-ahead bias)', 'It requires GPUs', 'It deletes rows'],
        correct: 1,
        explanation: 'Random shuffling destroys chronological order and lets future test samples train past predictions.'
      }
    ]
  }
};


  // ==================== 12 Interactive Modules ====================
  
// ==================== Module: data-cleaning.js ====================
// Module 1: Visual Data Cleaning & Wrangling Lab
function renderDataCleaning(container) {
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


// ==================== Module: sql-arena.js ====================
// Module 2: The SQL Arena & Visual Join Engine
function renderSqlArena(container) {
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


// ==================== Module: eda-stats.js ====================
// Module 3: Exploratory Data Analysis (EDA) & Descriptive Stats Lab
function renderEdaStats(container) {
  // Initial points for Tug of War
  let prices = [220, 240, 270, 310, 340, 390, 420];
  let outlier = 1200; // Draggable outlier

  // Distribution settings
  let skew = 0; // -1 to 1
  let stdDev = 30;

  // Correlation settings
  let correlation = 0.85;

  container.innerHTML = `
    <div class="lab-header">
      <div class="lab-title-group">
        <span class="lab-badge">Track 1: Data Analyst</span>
        <h2>EDA, Distribution Morphing & Descriptive Stats</h2>
        <p class="lab-desc">Exploratory Data Analysis is detective work. See how statistical measures react in real-time when data twists, skews, or gets infected by extreme outliers.</p>
      </div>
      <div class="lab-objective">
        <div class="objective-badge">Target Objective</div>
        <div class="objective-text">Demonstrate why <strong>Median resists outliers</strong> by dragging the outlier past $1,500k, then set correlation to <strong>r &gt; 0.90</strong> to prove strong linear relationship!</div>
      </div>
    </div>

    <!-- Tug of War: Mean vs Median -->
    <div class="interactive-section">
      <div class="section-title">
        <span class="icon">⚖️</span> Part 1: The Mean vs. Median Tug-of-War
      </div>
      <p class="section-subtitle">Drag the extreme high-value outlier and watch the Mean needle get dragged while the Median stays firmly anchored!</p>
      
      <div class="tug-controls">
        <label for="outlier-slider">Outlier House Price: <strong id="outlier-val">$1,200k</strong></label>
        <input type="range" id="outlier-slider" min="400" max="2500" step="50" value="1200" class="range-slider" />
      </div>

      <div class="stat-meters-grid">
        <div class="stat-card stat-mean">
          <div class="stat-title">Arithmetic Mean (Average)</div>
          <div class="stat-value" id="mean-display">$456k</div>
          <div class="stat-note">⚠️ Extremely sensitive to outliers</div>
        </div>
        <div class="stat-card stat-median">
          <div class="stat-title">Median (50th Percentile)</div>
          <div class="stat-value" id="median-display">$310k</div>
          <div class="stat-note">🛡️ Robust metric representing typical case</div>
        </div>
        <div class="stat-card stat-diff">
          <div class="stat-title">Skewness Distortion</div>
          <div class="stat-value" id="distortion-display">+47%</div>
          <div class="stat-note">Mean is dragged above Median</div>
        </div>
      </div>

      <div class="visual-number-line">
        <svg viewBox="0 0 600 90" class="number-line-svg" id="number-line-svg">
          <!-- Dynamic number line rendered here -->
        </svg>
      </div>
    </div>

    <!-- Interactive Correlation Explorer -->
    <div class="interactive-section">
      <div class="section-title">
        <span class="icon">📈</span> Part 2: Pearson Correlation & Scatter Morphing
      </div>
      <p class="section-subtitle">Adjust the Pearson correlation coefficient r and watch how the scatter points align with the trend line.</p>
      
      <div class="corr-controls-bar">
        <label for="corr-slider">Correlation Coefficient (r): <strong id="corr-val">+0.85</strong></label>
        <input type="range" id="corr-slider" min="-1" max="1" step="0.05" value="0.85" class="range-slider" />
        <span id="corr-interpretation" class="badge badge-success">Strong Positive Correlation</span>
      </div>

      <div class="scatter-container">
        <svg viewBox="0 0 500 260" class="scatter-svg" id="scatter-svg">
          <!-- Live scatter points rendered here -->
        </svg>
      </div>
    </div>

    <div class="lab-footer">
      <button id="btn-verify-eda" class="btn btn-success btn-lg">
        ${state.isChallengeCompleted('eda_stats') ? '✓ Challenge Completed (+100 XP Earned)' : 'Verify Insights & Claim XP'}
      </button>
      <div id="eda-feedback" class="feedback-msg"></div>
    </div>
  `;

  // Update Tug of War
  function updateTugOfWar() {
    const all = [...prices, outlier];
    const mean = Math.round(all.reduce((a, b) => a + b, 0) / all.length);
    const sorted = [...all].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 !== 0 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
    const distortion = Math.round(((mean - median) / median) * 100);

    container.querySelector('#mean-display').textContent = `$${mean}k`;
    container.querySelector('#median-display').textContent = `$${median}k`;
    container.querySelector('#distortion-display').textContent = `+${distortion}%`;
    container.querySelector('#outlier-val').textContent = `$${outlier}k`;

    // Render SVG number line
    const svg = container.querySelector('#number-line-svg');
    const minVal = 100;
    const maxVal = 2600;
    const toX = val => 40 + ((val - minVal) / (maxVal - minVal)) * 520;

    let svgHtml = `
      <line x1="40" y1="50" x2="560" y2="50" stroke="#334155" stroke-width="3" stroke-linecap="round"/>
      <text x="40" y="75" fill="#64748b" font-size="11">$100k</text>
      <text x="300" y="75" fill="#64748b" font-size="11">$1,350k</text>
      <text x="540" y="75" fill="#64748b" font-size="11">$2.6M</text>
    `;

    // Standard points
    prices.forEach(p => {
      svgHtml += `<circle cx="${toX(p)}" cy="50" r="6" fill="#38bdf8" opacity="0.85" />`;
    });

    // Outlier point
    svgHtml += `
      <circle cx="${toX(outlier)}" cy="50" r="10" fill="#f43f5e" class="pulse-point" />
      <text x="${toX(outlier)}" y="25" fill="#f43f5e" font-size="11" font-weight="bold" text-anchor="middle">Outlier ($${outlier}k)</text>
    `;

    // Mean needle
    svgHtml += `
      <line x1="${toX(mean)}" y1="35" x2="${toX(mean)}" y2="65" stroke="#f59e0b" stroke-width="3" />
      <text x="${toX(mean)}" y="25" fill="#f59e0b" font-size="11" font-weight="bold" text-anchor="middle">Mean ($${mean}k)</text>
    `;

    // Median needle
    svgHtml += `
      <line x1="${toX(median)}" y1="35" x2="${toX(median)}" y2="65" stroke="#10b981" stroke-width="3" stroke-dasharray="3,3" />
      <text x="${toX(median)}" y="85" fill="#10b981" font-size="11" font-weight="bold" text-anchor="middle">Median ($${median}k)</text>
    `;

    svg.innerHTML = svgHtml;
  }

  // Update Scatter Plot with r
  function updateScatter() {
    const r = parseFloat(correlation);
    container.querySelector('#corr-val').textContent = (r >= 0 ? '+' : '') + r.toFixed(2);
    
    const interp = container.querySelector('#corr-interpretation');
    if (Math.abs(r) > 0.8) {
      interp.textContent = r > 0 ? 'Strong Positive Linear Relationship' : 'Strong Negative Linear Relationship';
      interp.className = 'badge badge-success';
    } else if (Math.abs(r) > 0.4) {
      interp.textContent = r > 0 ? 'Moderate Positive Relationship' : 'Moderate Negative Relationship';
      interp.className = 'badge badge-warning';
    } else {
      interp.textContent = 'Weak / No Linear Relationship (Uncorrelated Noise)';
      interp.className = 'badge badge-secondary';
    }

    // Generate deterministic 40 pseudo-random points based on r
    const svg = container.querySelector('#scatter-svg');
    let pts = [];
    const n = 40;
    
    // Seeded random points
    for (let i = 0; i < n; i++) {
      const u1 = (Math.sin(i * 12.9898) + 1) / 2;
      const u2 = (Math.cos(i * 78.233) + 1) / 2;
      const xNorm = (u1 - 0.5) * 2; // -1 to 1
      const noise = (u2 - 0.5) * 2;
      const yNorm = r * xNorm + Math.sqrt(1 - r * r) * noise * 0.75;
      
      const px = 50 + ((xNorm + 1) / 2) * 400;
      const py = 210 - ((yNorm + 1) / 2) * 160;
      pts.push({ x: px, y: py });
    }

    let svgHtml = `
      <!-- Axes -->
      <line x1="50" y1="210" x2="450" y2="210" stroke="#334155" stroke-width="2" />
      <line x1="50" y1="50" x2="50" y2="210" stroke="#334155" stroke-width="2" />
      <text x="250" y="240" fill="#64748b" font-size="11" text-anchor="middle">Feature X (e.g. Ad Spend)</text>
      <text x="25" y="130" fill="#64748b" font-size="11" transform="rotate(-90 25 130)" text-anchor="middle">Feature Y (e.g. Revenue)</text>
    `;

    // Trend line
    const xStart = 50;
    const yStart = 130 - (r * 70);
    const xEnd = 450;
    const yEnd = 130 + (r * 70);
    svgHtml += `<line x1="${xStart}" y1="${yStart}" x2="${xEnd}" y2="${yEnd}" stroke="#818cf8" stroke-width="3" stroke-dasharray="4,4" />`;

    // Points
    pts.forEach(p => {
      svgHtml += `<circle cx="${p.x}" cy="${p.y}" r="4.5" fill="#38bdf8" opacity="0.8" />`;
    });

    svg.innerHTML = svgHtml;
  }

  // Event listeners
  container.querySelector('#outlier-slider').addEventListener('input', e => {
    outlier = parseInt(e.target.value);
    updateTugOfWar();
  });

  container.querySelector('#corr-slider').addEventListener('input', e => {
    correlation = parseFloat(e.target.value);
    updateScatter();
  });

  container.querySelector('#btn-verify-eda').addEventListener('click', () => {
    const feedback = container.querySelector('#eda-feedback');
    if (outlier >= 1500 && correlation >= 0.90) {
      const awarded = state.completeChallenge('eda_stats', 'eda_detective', 100);
      feedback.className = 'feedback-msg success';
      feedback.innerHTML = `<strong>Phenomenal Insight!</strong> You pushed the outlier to $${outlier}k showing the massive skew on Mean while Median held stable, and dialed r to ${correlation.toFixed(2)} for high predictive strength! Unlocked 'Variance Slayer' Badge (+100 XP).`;
      if (awarded) {
        container.querySelector('#btn-verify-eda').textContent = '✓ Challenge Completed (+100 XP Earned)';
      }
    } else {
      sound.playError();
      feedback.className = 'feedback-msg error';
      feedback.innerHTML = `<strong>Almost there!</strong> Drag the outlier slider to at least <strong>$1,500k</strong> and push the correlation slider to <strong>r &ge; 0.90</strong> to prove both principles.`;
    }
  });

  updateTugOfWar();
  updateScatter();
}


// ==================== Module: bi-dashboard.js ====================
// Module 4: Business Intelligence, Metrics & Funnel Optimization
function renderBiDashboard(container) {
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


// ==================== Module: ab-testing.js ====================
// Module 5: A/B Testing & Statistical Significance Arcade
function renderAbTesting(container) {
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


// ==================== Module: feature-engineering.js ====================
// Module 6: Feature Engineering Forge
function renderFeatureEngineering(container) {
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


// ==================== Module: regression.js ====================
// Module 7: Supervised Learning - Regression & Gradient Descent
function renderRegression(container) {
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


// ==================== Module: classification.js ====================
// Module 8: Classification, Decision Trees & Random Forest Ensemble
function renderClassification(container) {
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


// ==================== Module: clustering-pca.js ====================
// Module 9: Unsupervised Learning - K-Means Clustering & PCA
function renderClusteringPca(container) {
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


// ==================== Module: confusion-matrix.js ====================
// Module 10: Confusion Matrix, Precision-Recall & ROC Curve Arcade
function renderConfusionMatrix(container) {
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


// ==================== Module: neural-net.js ====================
// Module 11: Deep Learning & Neural Network Playground
function renderNeuralNet(container) {
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


// ==================== Module: time-series.js ====================
// Module 12: Time Series, Decomposition & Anomaly Detection
function renderTimeSeries(container) {
  let maWindow = 7;
  let showDecomp = false;
  let anomalyThreshold = 2.8; // Z-score threshold (optimal around 2.8 - 3.1)

  // Generate 45 daily time steps
  const timeSteps = [];
  for (let t = 0; t < 45; t++) {
    const trend = 20 + t * 1.4; // Upward trend
    const seasonality = Math.sin((t % 7) / 7 * 2 * Math.PI) * 12; // 7-day weekly cycle
    const noise = (Math.cos(t * 13.7) * 4) + (Math.sin(t * 29.3) * 3);
    let val = trend + seasonality + noise;

    // Inject 3 specific anomalies
    let isTrueAnomaly = false;
    if (t === 14) { val += 42; isTrueAnomaly = true; } // Spike 1
    if (t === 27) { val -= 38; isTrueAnomaly = true; } // Flash drop 2
    if (t === 39) { val += 48; isTrueAnomaly = true; } // Spike 3

    timeSteps.push({ t, val, trend, seasonality, noise, isTrueAnomaly });
  }

  container.innerHTML = `
    <div class="lab-header">
      <div class="lab-title-group">
        <span class="lab-badge">Track 2: Data Scientist</span>
        <h2>Time Series Decomposition &amp; Anomaly Detection</h2>
        <p class="lab-desc">Time-dependent data possesses temporal order. Decompose signals into Trend, Seasonality, and Residuals, apply rolling window smoothing, and detect sudden flash crashes or DDoS spikes.</p>
      </div>
      <div class="lab-objective">
        <div class="objective-badge">Target Objective</div>
        <div class="objective-text">Toggle <strong>Decomposition Mode</strong> to isolate cyclical seasonality, then calibrate the rolling anomaly threshold to flag all <strong>3 true anomalies</strong> with 0 false alarms!</div>
      </div>
    </div>

    <!-- Interactive Time Series Workbench -->
    <div class="interactive-section">
      <div class="section-title">
        <span class="icon">📈</span> Part 1: Moving Average Smoothing &amp; Anomaly Detector
      </div>
      
      <div class="ts-controls-bar">
        <div class="control-col">
          <label for="slider-ma">Rolling Window (MA): <strong id="val-ma">7 Days</strong></label>
          <input type="range" id="slider-ma" min="3" max="21" step="2" value="7" class="range-slider" />
        </div>
        <div class="control-col">
          <label for="slider-anomaly">Anomaly Z-Threshold (σ): <strong id="val-anomaly">2.8σ</strong></label>
          <input type="range" id="slider-anomaly" min="1.5" max="4.5" step="0.1" value="2.8" class="range-slider" />
        </div>
        <div class="control-col">
          <button id="btn-toggle-decomp" class="btn btn-secondary">
            ${showDecomp ? 'Show Raw Smoothed View' : '🔬 Decompose (Trend + Seasonality + Noise)'}
          </button>
        </div>
      </div>

      <!-- Main Time Series Chart -->
      <div class="ts-canvas-wrapper" id="ts-canvas-box">
        <svg viewBox="0 0 540 240" class="ts-svg" id="ts-svg">
          <!-- Dynamic series rendered here -->
        </svg>
      </div>

      <div class="anomaly-summary-strip mt-2">
        <span>Anomalies Flagged: <strong id="flagged-count" class="text-warning">0 / 3</strong></span>
        <span>False Alarms: <strong id="false-alarm-count" class="text-success">0</strong></span>
      </div>
    </div>

    <div class="lab-footer">
      <button id="btn-verify-ts" class="btn btn-success btn-lg">
        ${state.isChallengeCompleted('time_series') ? '✓ Challenge Completed (+100 XP Earned)' : 'Verify Anomaly Filter & Claim XP'}
      </button>
      <div id="ts-feedback" class="feedback-msg"></div>
    </div>
  `;

  function calculateMovingAverage(data, windowSize) {
    const half = Math.floor(windowSize / 2);
    return data.map((d, i) => {
      let sum = 0, count = 0;
      for (let w = -half; w <= half; w++) {
        const idx = i + w;
        if (idx >= 0 && idx < data.length) {
          sum += data[idx].val;
          count++;
        }
      }
      return sum / count;
    });
  }

  function renderSeries() {
    container.querySelector('#val-ma').textContent = `${maWindow} Days`;
    container.querySelector('#val-anomaly').textContent = `${anomalyThreshold.toFixed(1)}σ`;

    const svg = container.querySelector('#ts-svg');
    const maValues = calculateMovingAverage(timeSteps, maWindow);

    // Compute standard deviation of residuals for anomaly detection
    const residuals = timeSteps.map((d, i) => Math.abs(d.val - maValues[i]));
    const meanRes = residuals.reduce((a, b) => a + b, 0) / residuals.length;
    const stdRes = Math.sqrt(residuals.map(r => Math.pow(r - meanRes, 2)).reduce((a, b) => a + b, 0) / residuals.length);

    let flaggedAnomalies = [];
    let falseAlarms = 0;

    timeSteps.forEach((d, i) => {
      const z = Math.abs(d.val - maValues[i]) / stdRes;
      if (z >= anomalyThreshold) {
        flaggedAnomalies.push(i);
        if (!d.isTrueAnomaly) falseAlarms++;
      }
    });

    const caughtTrue = flaggedAnomalies.filter(idx => timeSteps[idx].isTrueAnomaly).length;
    container.querySelector('#flagged-count').textContent = `${caughtTrue} / 3 True Anomalies Caught`;
    container.querySelector('#false-alarm-count').textContent = `${falseAlarms} False Alarms`;

    container.querySelector('#flagged-count').className = caughtTrue === 3 && falseAlarms === 0 ? 'text-emerald font-bold' : 'text-warning';
    container.querySelector('#false-alarm-count').className = falseAlarms === 0 ? 'text-emerald' : 'text-danger font-bold';

    const toPxX = t => 45 + (t / 44) * 460;
    const toPxY = v => 210 - ((v - 0) / 120) * 170;

    if (!showDecomp) {
      // Standard Series + MA + Anomalies
      let svgHtml = `
        <!-- Axes -->
        <line x1="45" y1="210" x2="510" y2="210" stroke="#334155" stroke-width="2"/>
        <line x1="45" y1="40" x2="45" y2="210" stroke="#334155" stroke-width="2"/>
        <text x="270" y="232" fill="#64748b" font-size="11" text-anchor="middle">Time (Days 1 to 45)</text>
        <text x="20" y="125" fill="#64748b" font-size="11" transform="rotate(-90 20 125)" text-anchor="middle">Server Traffic (QPS)</text>
      `;

      // Draw Raw Line
      let rawPath = '';
      timeSteps.forEach((d, i) => {
        rawPath += (i === 0 ? 'M' : 'L') + ` ${toPxX(d.t).toFixed(1)} ${toPxY(d.val).toFixed(1)}`;
      });
      svgHtml += `<path d="${rawPath}" fill="none" stroke="#64748b" stroke-width="1.8" opacity="0.6"/>`;

      // Draw Moving Average Line
      let maPath = '';
      maValues.forEach((mv, i) => {
        maPath += (i === 0 ? 'M' : 'L') + ` ${toPxX(i).toFixed(1)} ${toPxY(mv).toFixed(1)}`;
      });
      svgHtml += `<path d="${maPath}" fill="none" stroke="#38bdf8" stroke-width="3"/>`;

      // Draw Points
      timeSteps.forEach((d, i) => {
        const px = toPxX(d.t);
        const py = toPxY(d.val);
        const isFlagged = flaggedAnomalies.includes(i);

        if (isFlagged) {
          svgHtml += `
            <circle cx="${px}" cy="${py}" r="7" fill="#f43f5e" stroke="#ffffff" stroke-width="2" class="pulse-point" />
            <text x="${px}" y="${py - 12}" fill="#f43f5e" font-size="10" font-weight="bold" text-anchor="middle">SPIKE!</text>
          `;
        } else {
          svgHtml += `<circle cx="${px}" cy="${py}" r="3" fill="#94a3b8" />`;
        }
      });

      svg.innerHTML = svgHtml;
    } else {
      // 3 Decomposed Subplots (Trend, Seasonality, Residuals)
      let svgHtml = `
        <!-- Trend Subplot -->
        <text x="50" y="32" fill="#10b981" font-size="11" font-weight="bold">1. Trend Component (Long-term Drift)</text>
        <line x1="45" y1="80" x2="510" y2="80" stroke="#334155" stroke-width="1"/>
      `;

      let trendPath = '';
      timeSteps.forEach((d, i) => {
        const px = toPxX(d.t);
        const py = 75 - (d.trend / 80) * 40;
        trendPath += (i === 0 ? 'M' : 'L') + ` ${px.toFixed(1)} ${py.toFixed(1)}`;
      });
      svgHtml += `<path d="${trendPath}" fill="none" stroke="#10b981" stroke-width="2.5"/>`;

      // Seasonality Subplot
      svgHtml += `
        <text x="50" y="105" fill="#a855f7" font-size="11" font-weight="bold">2. Seasonality (7-Day Weekly Wave)</text>
        <line x1="45" y1="150" x2="510" y2="150" stroke="#334155" stroke-width="1"/>
      `;

      let seasPath = '';
      timeSteps.forEach((d, i) => {
        const px = toPxX(d.t);
        const py = 150 - (d.seasonality / 20) * 30;
        seasPath += (i === 0 ? 'M' : 'L') + ` ${px.toFixed(1)} ${py.toFixed(1)}`;
      });
      svgHtml += `<path d="${seasPath}" fill="none" stroke="#a855f7" stroke-width="2.5"/>`;

      // Residuals Subplot
      svgHtml += `
        <text x="50" y="175" fill="#f43f5e" font-size="11" font-weight="bold">3. Residuals &amp; Outliers (White Noise + Shocks)</text>
        <line x1="45" y1="210" x2="510" y2="210" stroke="#334155" stroke-width="1"/>
      `;

      timeSteps.forEach((d, i) => {
        const px = toPxX(d.t);
        const py = 210 - (d.val - d.trend - d.seasonality) * 1.5;
        const isAnom = d.isTrueAnomaly;
        svgHtml += `<circle cx="${px}" cy="${py}" r="${isAnom ? '5' : '2.5'}" fill="${isAnom ? '#f43f5e' : '#64748b'}"/>`;
      });

      svg.innerHTML = svgHtml;
    }
  }

  // Event handlers
  container.querySelector('#slider-ma').addEventListener('input', e => {
    maWindow = parseInt(e.target.value);
    renderSeries();
  });

  container.querySelector('#slider-anomaly').addEventListener('input', e => {
    anomalyThreshold = parseFloat(e.target.value);
    renderSeries();
  });

  container.querySelector('#btn-toggle-decomp').addEventListener('click', () => {
    sound.playClick();
    showDecomp = !showDecomp;
    const btn = container.querySelector('#btn-toggle-decomp');
    btn.textContent = showDecomp ? 'Show Raw Smoothed View' : '🔬 Decompose (Trend + Seasonality + Noise)';
    btn.className = showDecomp ? 'btn btn-primary active' : 'btn btn-secondary';
    renderSeries();
  });

  container.querySelector('#btn-verify-ts').addEventListener('click', () => {
    const maValues = calculateMovingAverage(timeSteps, maWindow);
    const residuals = timeSteps.map((d, i) => Math.abs(d.val - maValues[i]));
    const meanRes = residuals.reduce((a, b) => a + b, 0) / residuals.length;
    const stdRes = Math.sqrt(residuals.map(r => Math.pow(r - meanRes, 2)).reduce((a, b) => a + b, 0) / residuals.length);

    let flaggedAnomalies = [];
    let falseAlarms = 0;

    timeSteps.forEach((d, i) => {
      const z = Math.abs(d.val - maValues[i]) / stdRes;
      if (z >= anomalyThreshold) {
        flaggedAnomalies.push(i);
        if (!d.isTrueAnomaly) falseAlarms++;
      }
    });

    const caughtTrue = flaggedAnomalies.filter(idx => timeSteps[idx].isTrueAnomaly).length;
    const feedback = container.querySelector('#ts-feedback');

    if (caughtTrue === 3 && falseAlarms === 0) {
      const awarded = state.completeChallenge('time_series', 'time_forecaster', 100);
      feedback.className = 'feedback-msg success';
      feedback.innerHTML = `<strong>Temporal Signals Mastered!</strong> You filtered background noise, observed seasonality, and isolated all 3 genuine anomalies with 0 false alarms at threshold ${anomalyThreshold.toFixed(1)}σ! Unlocked 'Future Shaper' Badge (+100 XP).`;
      if (awarded) {
        container.querySelector('#btn-verify-ts').textContent = '✓ Challenge Completed (+100 XP Earned)';
      }
    } else {
      sound.playError();
      feedback.className = 'feedback-msg error';
      feedback.innerHTML = `<strong>Filter tuning needed:</strong> Currently caught ${caughtTrue}/3 true spikes with ${falseAlarms} false alarms. Calibrate threshold around 2.7σ - 3.2σ!`;
    }
  });

  renderSeries();
}



  // ==================== Lab Wrapper & Perspectives ====================
  // Lab Tab Wrapper: Enhances every lab with Guided Lesson, Simulator, Code, and Quiz
function wrapModuleWithTabs(moduleId, container, originalRenderer) {
  const content = CONTENT_DATABASE[moduleId];
  if (!content) {
    originalRenderer(container);
    return;
  }

  container.innerHTML = `
    <!-- Top Learning View Switcher Bar -->
    <div class="lab-subtabs-nav">
      <button class="subtab-btn active" data-tab="guided">
        <span>🌟</span> Guided Chapter (Read &amp; Play)
      </button>
      <button class="subtab-btn" data-tab="interactive">
        <span>🎮</span> Simulator Only
      </button>
      <button class="subtab-btn" data-tab="guide">
        <span>📖</span> Concept Guide Only
      </button>
      <button class="subtab-btn" data-tab="code">
        <span>💻</span> Code Blueprint
      </button>
      <button class="subtab-btn" data-tab="quiz">
        <span>❓</span> Quiz &amp; Mastery
      </button>
    </div>

    <!-- View 1: Guided Chapter (All-in-One Full Lesson) -->
    <div id="subtab-pane-guided" class="subtab-pane active">
      <!-- Section 1: Concept Primer & Mental Model -->
      <section class="lesson-section">
        <div class="lesson-section-header">
          <span class="section-tag">Chapter 1</span>
          <h3 class="section-heading">Core Mental Model &amp; Theory Decoded</h3>
        </div>
        <div class="concept-sections-list">
          ${content.coreConcepts.map(c => `
            <div class="concept-card">
              <h4 class="concept-heading">${c.heading}</h4>
              <div class="concept-body">${c.content}</div>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- Section 2: Real-World Industry Application -->
      <section class="lesson-section mt-3">
        <div class="lesson-section-header">
          <span class="section-tag">Chapter 2</span>
          <h3 class="section-heading">Real-World Industry Application</h3>
        </div>
        <div class="industry-banner">
          <div class="industry-badge">🏢 How Top Tech Companies Use This: ${content.industryExample.company}</div>
          <h4 class="industry-title">${content.industryExample.scenario}</h4>
          <p class="industry-desc">${content.industryExample.details}</p>
        </div>
      </section>

      <!-- Section 3: Interactive Hands-on Workbench & Challenge -->
      <section class="lesson-section mt-3">
        <div class="lesson-section-header">
          <span class="section-tag">Chapter 3</span>
          <h3 class="section-heading">Interactive Workbench &amp; Hands-On Challenge</h3>
        </div>
        <div id="interactive-container-guided" class="interactive-workbench-embed"></div>
      </section>

      <!-- Section 4: Production Code Blueprint -->
      <section class="lesson-section mt-3">
        <div class="lesson-section-header">
          <span class="section-tag">Chapter 4</span>
          <h3 class="section-heading">Production Code Blueprint (Python &amp; SQL)</h3>
        </div>
        <div class="code-snippets-wrapper">
          <div class="code-block-card">
            <div class="code-header">
              <span>🐍 Production Python Implementation</span>
              <button class="btn btn-xs btn-outline btn-copy" data-target="code-python-guided">Copy Code</button>
            </div>
            <pre><code id="code-python-guided" class="code-snippet">${escapeHtml(content.codeSnippets.python)}</code></pre>
          </div>

          ${content.codeSnippets.sql ? `
            <div class="code-block-card mt-3">
              <div class="code-header">
                <span>📊 Production SQL Query</span>
                <button class="btn btn-xs btn-outline btn-copy" data-target="code-sql-guided">Copy Code</button>
              </div>
              <pre><code id="code-sql-guided" class="code-snippet">${escapeHtml(content.codeSnippets.sql)}</code></pre>
            </div>
          ` : ''}
        </div>
      </section>

      <!-- Section 5: Top FAANG Interview Traps -->
      <section class="lesson-section mt-3">
        <div class="lesson-section-header">
          <span class="section-tag">Chapter 5</span>
          <h3 class="section-heading">Top FAANG &amp; Industry Interview Questions</h3>
        </div>
        <div class="interview-traps-card">
          <div class="traps-list">
            ${content.interviewTraps.map(t => `
              <div class="trap-item">
                <div class="trap-q">❓ <strong>Interview Question: ${t.q}</strong></div>
                <div class="trap-a">💡 <strong>Winning Answer:</strong> ${t.a}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- Section 6: Knowledge Mastery Quiz -->
      <section class="lesson-section mt-3">
        <div class="lesson-section-header">
          <span class="section-tag">Chapter 6</span>
          <h3 class="section-heading">Knowledge Mastery Quiz (+25 XP)</h3>
        </div>
        <div class="quiz-wrapper" id="quiz-container-guided"></div>
      </section>
    </div>

    <!-- View 2: Interactive Simulator Only -->
    <div id="subtab-pane-interactive" class="subtab-pane">
      <div id="interactive-container-solo"></div>
    </div>

    <!-- View 3: Concept Guide Only -->
    <div id="subtab-pane-guide" class="subtab-pane">
      <div class="content-guide-wrapper">
        <div class="industry-banner">
          <div class="industry-badge">🏢 Case Study: ${content.industryExample.company}</div>
          <h4 class="industry-title">${content.industryExample.scenario}</h4>
          <p class="industry-desc">${content.industryExample.details}</p>
        </div>

        <div class="concept-sections-list">
          ${content.coreConcepts.map(c => `
            <div class="concept-card">
              <h4 class="concept-heading">${c.heading}</h4>
              <div class="concept-body">${c.content}</div>
            </div>
          `).join('')}
        </div>

        <div class="interview-traps-card">
          <div class="section-title">
            <span>🎯</span> Top FAANG &amp; Tech Interview Questions
          </div>
          <div class="traps-list">
            ${content.interviewTraps.map(t => `
              <div class="trap-item">
                <div class="trap-q">❓ <strong>Q: ${t.q}</strong></div>
                <div class="trap-a">💡 <strong>A:</strong> ${t.a}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>

    <!-- View 4: Production Code Only -->
    <div id="subtab-pane-code" class="subtab-pane">
      <div class="code-snippets-wrapper">
        <div class="code-block-card">
          <div class="code-header">
            <span>🐍 Python (Pandas / Scikit-Learn / PyTorch)</span>
            <button class="btn btn-xs btn-outline btn-copy" data-target="code-python-solo">Copy Code</button>
          </div>
          <pre><code id="code-python-solo" class="code-snippet">${escapeHtml(content.codeSnippets.python)}</code></pre>
        </div>

        ${content.codeSnippets.sql ? `
          <div class="code-block-card mt-3">
            <div class="code-header">
              <span>📊 Production SQL Query</span>
              <button class="btn btn-xs btn-outline btn-copy" data-target="code-sql-solo">Copy Code</button>
            </div>
            <pre><code id="code-sql-solo" class="code-snippet">${escapeHtml(content.codeSnippets.sql)}</code></pre>
          </div>
        ` : ''}
      </div>
    </div>

    <!-- View 5: Quiz Only -->
    <div id="subtab-pane-quiz" class="subtab-pane">
      <div class="quiz-wrapper" id="quiz-container-solo"></div>
    </div>
  `;

  // Render the interactive simulator inside the guided container
  const guidedSimContainer = container.querySelector('#interactive-container-guided');
  originalRenderer(guidedSimContainer);

  // Tab switching logic
  const tabBtns = container.querySelectorAll('.subtab-btn');
  const panes = container.querySelectorAll('.subtab-pane');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sound.playClick();
      const targetTab = btn.dataset.tab;

      tabBtns.forEach(b => b.classList.toggle('active', b.dataset.tab === targetTab));
      panes.forEach(p => p.classList.toggle('active', p.id === `subtab-pane-${targetTab}`));

      // If switching to solo interactive, move or render the simulator
      if (targetTab === 'interactive') {
        const soloSimContainer = container.querySelector('#interactive-container-solo');
        if (soloSimContainer && soloSimContainer.children.length === 0) {
          originalRenderer(soloSimContainer);
        }
      }
    });
  });

  // Copy buttons
  container.querySelectorAll('.btn-copy').forEach(btn => {
    btn.addEventListener('click', () => {
      sound.playClick();
      const targetId = btn.dataset.target;
      const codeEl = container.querySelector(`#${targetId}`);
      if (codeEl) {
        navigator.clipboard.writeText(codeEl.textContent);
        const originalText = btn.textContent;
        btn.textContent = '✓ Copied!';
        setTimeout(() => btn.textContent = originalText, 2000);
      }
    });
  });

  // Render Quiz in both guided and solo containers
  renderQuiz(container.querySelector('#quiz-container-guided'), content, moduleId);
  renderQuiz(container.querySelector('#quiz-container-solo'), content, moduleId);
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderQuiz(quizContainer, content, moduleId) {
  if (!quizContainer) return;
  const quizKey = `quiz_${moduleId}`;
  const isCompleted = state.data.completedChallenges[quizKey];

  quizContainer.innerHTML = `
    <div class="quiz-header">
      <div class="section-title">
        <span>🧠</span> Rapid Knowledge Check: ${content.title}
      </div>
      <p class="section-subtitle">Test your conceptual retention. Score 100% on these questions to claim +25 bonus XP!</p>
    </div>

    <div class="quiz-questions-list">
      ${content.quiz.map((q, qIdx) => `
        <div class="quiz-card" data-qidx="${qIdx}">
          <div class="quiz-q-title"><strong>Question ${qIdx + 1}:</strong> ${q.question}</div>
          <div class="quiz-options">
            ${q.options.map((opt, oIdx) => `
              <button class="quiz-opt-btn" data-oidx="${oIdx}">
                <span class="opt-letter">${String.fromCharCode(65 + oIdx)}</span>
                <span class="opt-text">${opt}</span>
              </button>
            `).join('')}
          </div>
          <div class="quiz-explanation" style="display: none;"></div>
        </div>
      `).join('')}
    </div>

    <div class="quiz-footer mt-3">
      <button class="btn btn-primary btn-lg btn-submit-quiz">
        ${isCompleted ? '✓ Quiz Passed (+25 XP Earned)' : 'Submit Answers & Check Score'}
      </button>
      <div class="quiz-feedback feedback-msg"></div>
    </div>
  `;

  const selectedAnswers = {};

  quizContainer.querySelectorAll('.quiz-card').forEach(card => {
    const qIdx = parseInt(card.dataset.qidx);
    const optBtns = card.querySelectorAll('.quiz-opt-btn');

    optBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playClick();
        const oIdx = parseInt(btn.dataset.oidx);
        selectedAnswers[qIdx] = oIdx;

        optBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      });
    });
  });

  const submitBtn = quizContainer.querySelector('.btn-submit-quiz');
  const feedback = quizContainer.querySelector('.quiz-feedback');

  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      let allCorrect = true;
      let answeredCount = 0;

      content.quiz.forEach((q, qIdx) => {
        const card = quizContainer.querySelector(`.quiz-card[data-qidx="${qIdx}"]`);
        const expl = card.querySelector('.quiz-explanation');
        const chosen = selectedAnswers[qIdx];

        if (chosen !== undefined) {
          answeredCount++;
          const isCorrect = chosen === q.correct;
          expl.style.display = 'block';

          if (isCorrect) {
            expl.className = 'quiz-explanation correct';
            expl.innerHTML = `✓ <strong>Correct!</strong> ${q.explanation}`;
          } else {
            allCorrect = false;
            expl.className = 'quiz-explanation incorrect';
            expl.innerHTML = `✗ <strong>Incorrect.</strong> Correct answer is <strong>${String.fromCharCode(65 + q.correct)}</strong>. ${q.explanation}`;
          }
        } else {
          allCorrect = false;
        }
      });

      if (answeredCount < content.quiz.length) {
        sound.playError();
        feedback.className = 'quiz-feedback feedback-msg error';
        feedback.textContent = 'Please answer all questions before submitting!';
        return;
      }

      if (allCorrect) {
        sound.playSuccess();
        feedback.className = 'quiz-feedback feedback-msg success';
        feedback.innerHTML = `<strong>Outstanding!</strong> 100% Score! You have fully mastered the core concepts of this domain.`;
        
        if (!state.data.completedChallenges[quizKey]) {
          state.data.completedChallenges[quizKey] = { completedAt: Date.now() };
          state.addXp(25, `Passed ${content.title} Quiz`);
          submitBtn.textContent = '✓ Quiz Passed (+25 XP Earned)';
        }
      } else {
        sound.playError();
        feedback.className = 'quiz-feedback feedback-msg error';
        feedback.innerHTML = `Review the explanations above and try again to achieve 100% mastery!`;
      }
    });
  }
}


  // ==================== UI Controller & Codex ====================
  // UI Controller: Updates Top Nav, Quest Map, Modals, and Toasts
const MODULE_DEFINITIONS = [
  // Track 1: Data Analyst
  { id: 'cleaning', track: 'analyst', num: 'Lab 01', title: 'Data Cleaning', icon: '🧹', badgeId: 'cleaner' },
  { id: 'sql_arena', track: 'analyst', num: 'Lab 02', title: 'SQL Arena', icon: '⚡', badgeId: 'sql_master' },
  { id: 'eda_stats', track: 'analyst', num: 'Lab 03', title: 'EDA & Stats', icon: '📈', badgeId: 'eda_detective' },
  { id: 'bi_dashboard', track: 'analyst', num: 'Lab 04', title: 'BI & Funnels', icon: '💎', badgeId: 'bi_architect' },
  { id: 'ab_testing', track: 'analyst', num: 'Lab 05', title: 'A/B Testing', icon: '🎯', badgeId: 'ab_tester' },

  // Track 2: Data Scientist
  { id: 'feature_eng', track: 'scientist', num: 'Lab 06', title: 'Feature Forge', icon: '🔮', badgeId: 'feature_forge' },
  { id: 'regression', track: 'scientist', num: 'Lab 07', title: 'Regression & GD', icon: '⛷️', badgeId: 'gradient_surfer' },
  { id: 'classification', track: 'scientist', num: 'Lab 08', title: 'Trees & Forest', icon: '🌲', badgeId: 'tree_splitter' },
  { id: 'clustering', track: 'scientist', num: 'Lab 09', title: 'K-Means & PCA', icon: '🪐', badgeId: 'cluster_king' },
  { id: 'confusion_matrix', track: 'scientist', num: 'Lab 10', title: 'Confusion Matrix', icon: '⚖️', badgeId: 'matrix_optimizer' },
  { id: 'neural_net', track: 'scientist', num: 'Lab 11', title: 'Neural Playground', icon: '🧠', badgeId: 'neural_tamer' },
  { id: 'time_series', track: 'scientist', num: 'Lab 12', title: 'Time Series & Anom', icon: '⏳', badgeId: 'time_forecaster' }
];
class UIController {
  constructor(onModuleSelect) {
    this.onModuleSelect = onModuleSelect;
    this.initEventListeners();
  }

  initEventListeners() {
    // Sound Toggle
    const soundBtn = document.getElementById('btn-sound-toggle');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        const enabled = sound.toggle();
        soundBtn.textContent = enabled ? '🔊 Sound On' : '🔇 Muted';
        this.showToast(enabled ? 'Sound FX Enabled' : 'Sound FX Muted', 'info');
      });
    }

    // Badges Modal
    const badgesBtn = document.getElementById('btn-badges-modal');
    const modalOverlay = document.getElementById('modal-badges');
    const closeBtn = document.getElementById('btn-close-modal');

    if (badgesBtn && modalOverlay) {
      badgesBtn.addEventListener('click', () => {
        sound.playClick();
        this.renderBadgesModal();
        modalOverlay.classList.add('active');
      });
    }

    if (closeBtn && modalOverlay) {
      closeBtn.addEventListener('click', () => {
        sound.playClick();
        modalOverlay.classList.remove('active');
      });
    }

    // Syllabus Modal
    const syllabusBtn = document.getElementById('btn-syllabus-modal');
    const syllabusModal = document.getElementById('modal-syllabus');
    const closeSyllabusBtn = document.getElementById('btn-close-syllabus');

    if (syllabusBtn && syllabusModal) {
      syllabusBtn.addEventListener('click', () => {
        sound.playClick();
        this.renderSyllabusModal();
        syllabusModal.classList.add('active');
      });
    }

    if (closeSyllabusBtn && syllabusModal) {
      closeSyllabusBtn.addEventListener('click', () => {
        sound.playClick();
        syllabusModal.classList.remove('active');
      });
    }

    // Codex Modal
    const codexBtn = document.getElementById('btn-codex-modal');
    const codexModal = document.getElementById('modal-codex');
    const closeCodexBtn = document.getElementById('btn-close-codex');
    const codexSearch = document.getElementById('codex-search-input');
    const codexFilterBtns = document.querySelectorAll('.btn-codex-filter');

    if (codexBtn && codexModal) {
      codexBtn.addEventListener('click', () => {
        sound.playClick();
        this.renderCodexModal();
        codexModal.classList.add('active');
      });
    }

    if (closeCodexBtn && codexModal) {
      closeCodexBtn.addEventListener('click', () => {
        sound.playClick();
        codexModal.classList.remove('active');
      });
    }

    if (codexSearch) {
      codexSearch.addEventListener('input', e => {
        this.renderCodexModal(e.target.value.toLowerCase());
      });
    }

    codexFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playClick();
        codexFilterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.codexFilter = btn.dataset.filter;
        this.renderCodexModal(codexSearch ? codexSearch.value.toLowerCase() : '');
      });
    });

    // Reset Progress
    const resetBtn = document.getElementById('btn-reset-progress');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all XP, level, and completed challenges?')) {
          state.resetProgress();
          this.showToast('All progress has been reset', 'info');
          location.reload();
        }
      });
    }

    // Listen for custom game events
    window.addEventListener('dataquest:xpgain', e => {
      this.showToast(`+${e.detail.amount} XP: ${e.detail.reason || 'Objective accomplished!'}`, 'xp');
    });

    window.addEventListener('dataquest:levelup', e => {
      this.showToast(`🎉 LEVEL UP! You reached ${e.detail.rank.title} (Level ${e.detail.rank.level})!`, 'levelup');
    });

    window.addEventListener('dataquest:badge_unlocked', e => {
      const badge = BADGES.find(b => b.id === e.detail.badgeId);
      if (badge) {
        this.showToast(`🏆 BADGE UNLOCKED: ${badge.title} (${badge.desc})`, 'badge');
      }
    });

    // Track Tabs Switcher
    const analystTab = document.getElementById('tab-track-analyst');
    const scientistTab = document.getElementById('tab-track-scientist');

    if (analystTab && scientistTab) {
      analystTab.addEventListener('click', () => {
        sound.playClick();
        state.setActiveTrack('analyst');
        // Switch to first analyst module if current is scientist
        const curr = MODULE_DEFINITIONS.find(m => m.id === state.data.activeModuleId);
        if (curr && curr.track !== 'analyst') {
          state.setActiveModule('cleaning');
          this.onModuleSelect('cleaning');
        }
        this.update();
      });

      scientistTab.addEventListener('click', () => {
        sound.playClick();
        state.setActiveTrack('scientist');
        // Switch to first scientist module if current is analyst
        const curr = MODULE_DEFINITIONS.find(m => m.id === state.data.activeModuleId);
        if (curr && curr.track !== 'scientist') {
          state.setActiveModule('feature_eng');
          this.onModuleSelect('feature_eng');
        }
        this.update();
      });
    }
  }

  update() {
    this.updateStats();
    this.renderQuestStrip();
  }

  updateStats() {
    const rank = state.getRank();
    const nextRank = state.getNextRank();

    document.getElementById('rank-icon').textContent = rank.icon;
    document.getElementById('rank-title').textContent = rank.title;
    document.getElementById('rank-level').textContent = `Level ${rank.level}`;
    document.getElementById('total-xp').textContent = `${state.data.xp} XP`;

    // Badges count
    const unlockedCount = state.data.unlockedBadges.length;
    const badgeCounter = document.getElementById('unlocked-badge-count');
    if (badgeCounter) badgeCounter.textContent = `${unlockedCount}/${BADGES.length}`;

    // XP Progress Bar
    const min = rank.minXp;
    const max = nextRank ? nextRank.minXp : rank.maxXp;
    const currentProgress = state.data.xp - min;
    const totalNeeded = max - min;
    const pct = nextRank ? Math.min(100, Math.round((currentProgress / totalNeeded) * 100)) : 100;

    const fillBar = document.getElementById('nav-xp-fill');
    if (fillBar) fillBar.style.width = `${pct}%`;

    const xpLabel = document.getElementById('xp-label');
    if (xpLabel) {
      xpLabel.textContent = nextRank ? `${state.data.xp} / ${nextRank.minXp} XP` : 'Max Level Reached!';
    }

    // Track tab active classes
    const analystTab = document.getElementById('tab-track-analyst');
    const scientistTab = document.getElementById('tab-track-scientist');
    if (analystTab && scientistTab) {
      analystTab.classList.toggle('active', state.data.activeTrack === 'analyst');
      scientistTab.classList.toggle('active', state.data.activeTrack === 'scientist');
    }
  }

  renderQuestStrip() {
    const strip = document.getElementById('quest-strip');
    if (!strip) return;

    strip.innerHTML = '';
    const currentTrack = state.data.activeTrack;
    const modules = MODULE_DEFINITIONS.filter(m => m.track === currentTrack);

    modules.forEach(m => {
      const isCompleted = state.isChallengeCompleted(m.id);
      const isActive = state.data.activeModuleId === m.id;

      const node = document.createElement('div');
      node.className = `quest-node ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`;
      node.innerHTML = `
        <span class="quest-node-icon">${m.icon}</span>
        <div class="quest-node-details">
          <span class="quest-node-num">${m.num}</span>
          <span class="quest-node-title">${m.title}</span>
        </div>
        ${isCompleted ? '<span class="quest-status-check">✓</span>' : ''}
      `;

      node.addEventListener('click', () => {
        sound.playClick();
        state.setActiveModule(m.id);
        this.onModuleSelect(m.id);
        this.update();
      });

      strip.appendChild(node);
    });
  }

  renderBadgesModal() {
    const grid = document.getElementById('modal-badges-grid');
    if (!grid) return;

    grid.innerHTML = '';
    BADGES.forEach(b => {
      const isUnlocked = state.hasBadge(b.id);
      const card = document.createElement('div');
      card.className = `badge-item ${isUnlocked ? 'unlocked' : ''}`;
      card.innerHTML = `
        <div class="badge-icon">${b.icon}</div>
        <div class="badge-name">${b.title}</div>
        <div class="badge-desc">${b.desc}</div>
        <div class="mt-2">
          <span class="tag ${isUnlocked ? 'tag-success' : 'tag'}">${isUnlocked ? '✓ Unlocked' : 'Locked'}</span>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  renderCodexModal(searchQuery = '') {
    const grid = document.getElementById('modal-codex-grid');
    if (!grid) return;

    grid.innerHTML = '';
    const filter = this.codexFilter || 'all';
    const entries = Object.values(CONTENT_DATABASE);

    const filtered = entries.filter(item => {
      if (filter !== 'all' && item.track !== filter) return false;
      if (!searchQuery) return true;

      const fullText = (
        item.title + ' ' + 
        item.industryExample.company + ' ' + 
        item.industryExample.scenario + ' ' + 
        item.coreConcepts.map(c => c.heading + ' ' + c.content).join(' ')
      ).toLowerCase();

      return fullText.includes(searchQuery);
    });

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1; padding: 2rem; text-align: center;">
          No matching concepts found for "<em>${searchQuery}</em>". Try searching for <strong>p-value</strong>, <strong>imputation</strong>, <strong>gradient</strong>, or <strong>outliers</strong>.
        </div>
      `;
      return;
    }

    filtered.forEach(item => {
      const card = document.createElement('div');
      card.className = 'codex-card';
      card.innerHTML = `
        <div class="codex-card-header">
          <span class="tag ${item.track === 'analyst' ? 'tag-warning' : 'tag-success'}">
            ${item.track === 'analyst' ? 'Data Analyst' : 'Data Scientist'}
          </span>
          <span class="badge-tag">🏆 ${item.badge}</span>
        </div>
        <h4 class="codex-title">${item.title}</h4>
        <div class="codex-usecase">
          <strong>🏢 ${item.industryExample.company}:</strong> ${item.industryExample.scenario}
        </div>
        <p class="codex-desc">${item.industryExample.details}</p>
        <div class="codex-actions mt-3">
          <button class="btn btn-primary btn-xs btn-jump-lab" data-mod="${item.id}">
            🚀 Open Interactive Lab &amp; Guide
          </button>
        </div>
      `;

      card.querySelector('.btn-jump-lab').addEventListener('click', () => {
        sound.playClick();
        document.getElementById('modal-codex').classList.remove('active');
        state.setActiveTrack(item.track);
        state.setActiveModule(item.id);
        this.onModuleSelect(item.id);
        this.update();
      });

      grid.appendChild(card);
    });
  }

  renderSyllabusModal() {
    const container = document.getElementById('syllabus-content');
    if (!container) return;

    const analystModules = MODULE_DEFINITIONS.filter(m => m.track === 'analyst');
    const scientistModules = MODULE_DEFINITIONS.filter(m => m.track === 'scientist');

    container.innerHTML = `
      <div class="syllabus-track-block">
        <div class="syllabus-track-header">
          <span class="track-pill track-pill-analyst">Track 1</span>
          <h3>Data Analyst Path: Data Wrangling, SQL, EDA &amp; Experimentation</h3>
        </div>
        <p class="syllabus-track-desc">
          Master the foundational toolkit of commercial data analytics: clean messy production tables, extract insights with complex SQL window functions, perform robust exploratory statistics, track SaaS funnels, and design statistically sound A/B tests.
        </p>
        <div class="syllabus-list">
          ${analystModules.map(m => {
            const data = CONTENT_DATABASE[m.id];
            const isCompleted = state.isChallengeCompleted(m.id);
            return `
              <div class="syllabus-item-card ${isCompleted ? 'completed' : ''}">
                <div class="syllabus-item-icon">${m.icon}</div>
                <div class="syllabus-item-info">
                  <div class="syllabus-item-top">
                    <span class="lab-tag">${m.num}</span>
                    <h4 class="syllabus-item-title">${data ? data.title : m.title}</h4>
                    <span class="status-indicator">${isCompleted ? '✓ Completed' : 'In Progress'}</span>
                  </div>
                  <div class="syllabus-item-meta">
                    <span>🏢 Case Study: ${data ? data.industryExample.company : 'Industry Standard'}</span>
                    <span>🏆 Reward: ${m.title} Badge (+100 XP)</span>
                  </div>
                </div>
                <button class="btn btn-primary btn-xs btn-syllabus-launch" data-mod="${m.id}" data-track="analyst">
                  Launch Chapter
                </button>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <div class="syllabus-track-block mt-3">
        <div class="syllabus-track-header">
          <span class="track-pill track-pill-scientist">Track 2</span>
          <h3>Data Scientist Path: Feature Engineering, ML, Neural Nets &amp; Time Series</h3>
        </div>
        <p class="syllabus-track-desc">
          Build end-to-end predictive machine learning systems: engineer high-dimensional features, minimize convex cost bowls via gradient descent, balance decision tree purity, cluster latent customer spaces, prevent data leakage, and train non-linear neural networks.
        </p>
        <div class="syllabus-list">
          ${scientistModules.map(m => {
            const data = CONTENT_DATABASE[m.id];
            const isCompleted = state.isChallengeCompleted(m.id);
            return `
              <div class="syllabus-item-card ${isCompleted ? 'completed' : ''}">
                <div class="syllabus-item-icon">${m.icon}</div>
                <div class="syllabus-item-info">
                  <div class="syllabus-item-top">
                    <span class="lab-tag">${m.num}</span>
                    <h4 class="syllabus-item-title">${data ? data.title : m.title}</h4>
                    <span class="status-indicator">${isCompleted ? '✓ Completed' : 'In Progress'}</span>
                  </div>
                  <div class="syllabus-item-meta">
                    <span>🏢 Case Study: ${data ? data.industryExample.company : 'Industry Standard'}</span>
                    <span>🏆 Reward: ${m.title} Badge (+100 XP)</span>
                  </div>
                </div>
                <button class="btn btn-primary btn-xs btn-syllabus-launch" data-mod="${m.id}" data-track="scientist">
                  Launch Chapter
                </button>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    container.querySelectorAll('.btn-syllabus-launch').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playClick();
        document.getElementById('modal-syllabus').classList.remove('active');
        const modId = btn.dataset.mod;
        const track = btn.dataset.track;
        state.setActiveTrack(track);
        state.setActiveModule(modId);
        this.onModuleSelect(modId);
        this.update();
      });
    });
  }

  showToast(msg, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <span class="toast-icon">${type === 'xp' ? '⚡' : (type === 'levelup' ? '👑' : (type === 'badge' ? '🏆' : 'ℹ️'))}</span>
      <span class="toast-msg">${msg}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.4s ease';
      setTimeout(() => toast.remove(), 400);
    }, 3500);
  }
}


  // ==================== App Orchestration & Entry ====================
  // Main Application Orchestrator



// Import All 12 Interactive Modules












class DataQuestApp {
  constructor() {
    this.workbenchCard = document.getElementById('workbench-card');
    this.ui = new UIController(moduleId => this.loadModule(moduleId));
  }

  init() {
    // Subscribe UI to state updates
    state.subscribe(() => {
      this.ui.update();
    });

    // Load active module
    const activeId = state.data.activeModuleId || 'cleaning';
    this.loadModule(activeId);

    // Initial click audio activator (browsers require user interaction before Web Audio plays)
    const unlockAudio = () => {
      sound.init();
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    };
    document.addEventListener('click', unlockAudio);
    document.addEventListener('keydown', unlockAudio);
  }

  loadModule(moduleId) {
    if (!this.workbenchCard) return;

    // Smooth transition
    this.workbenchCard.style.opacity = '0';
    this.workbenchCard.style.transform = 'translateY(8px)';
    this.workbenchCard.style.transition = 'all 0.2s ease';

    setTimeout(() => {
      this.workbenchCard.innerHTML = '';

      switch (moduleId) {
        // Track 1: Data Analyst
        case 'cleaning':
          wrapModuleWithTabs('cleaning', this.workbenchCard, renderDataCleaning);
          break;
        case 'sql_arena':
          wrapModuleWithTabs('sql_arena', this.workbenchCard, renderSqlArena);
          break;
        case 'eda_stats':
          wrapModuleWithTabs('eda_stats', this.workbenchCard, renderEdaStats);
          break;
        case 'bi_dashboard':
          wrapModuleWithTabs('bi_dashboard', this.workbenchCard, renderBiDashboard);
          break;
        case 'ab_testing':
          wrapModuleWithTabs('ab_testing', this.workbenchCard, renderAbTesting);
          break;

        // Track 2: Data Scientist
        case 'feature_eng':
          wrapModuleWithTabs('feature_eng', this.workbenchCard, renderFeatureEngineering);
          break;
        case 'regression':
          wrapModuleWithTabs('regression', this.workbenchCard, renderRegression);
          break;
        case 'classification':
          wrapModuleWithTabs('classification', this.workbenchCard, renderClassification);
          break;
        case 'clustering':
          wrapModuleWithTabs('clustering', this.workbenchCard, renderClusteringPca);
          break;
        case 'confusion_matrix':
          wrapModuleWithTabs('confusion_matrix', this.workbenchCard, renderConfusionMatrix);
          break;
        case 'neural_net':
          wrapModuleWithTabs('neural_net', this.workbenchCard, renderNeuralNet);
          break;
        case 'time_series':
          wrapModuleWithTabs('time_series', this.workbenchCard, renderTimeSeries);
          break;

        default:
          wrapModuleWithTabs('cleaning', this.workbenchCard, renderDataCleaning);
          break;
      }

      this.workbenchCard.style.opacity = '1';
      this.workbenchCard.style.transform = 'translateY(0)';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 150);
  }
}

// Bootstrap on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new DataQuestApp();
  app.init();
});


})();
