// Comprehensive Content Knowledge Base for Data Analyst & Data Scientist Curriculum
export const CONTENT_DATABASE = {
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
import pandas as pd
import numpy as np

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
import pandas as pd
import scipy.stats as stats

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
import pandas as pd

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
import torch
import torch.nn as nn

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
import statsmodels.api as sm
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
