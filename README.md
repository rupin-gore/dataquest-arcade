# ⚡ DataQuest Arcade
> **Master Data Analysis & Data Science Visually — 100% Hands-On, 0% Boring Theory.**

DataQuest Arcade is a modern, gamified learning platform that replaces passive textbook theory with interactive visual simulations, direct parameter tuning, drag-and-drop mechanics, and live code sandboxes.

---

## 🎮 Gamified Experience & Content Architecture
- **In-Lab Tabs**: Every lab features 4 synchronized perspectives:
  1. `🎮 Hands-on Simulator & Challenge`: Interactive visual workbench with sliders, canvas, and instant target verification.
  2. `📖 Concept Deep-Dive & Industry Playbook`: Core intuition, mathematical principles without academic jargon, and real-world production case studies (Uber, Netflix, Amazon, Spotify, Stripe, Airbnb).
  3. `💻 Production Code (Python & SQL)`: Copy-pasteable production implementations using Pandas, Scikit-Learn, PyTorch, and SQL window functions.
  4. `❓ Knowledge Mastery Quiz`: Interactive 2-3 question conceptual check for +25 bonus XP.
- **Master Knowledge Codex**: Full-text searchable encyclopedia accessible from the top navigation to search concepts (e.g. *p-value*, *Gini*, *outliers*, *gradient descent*) and jump directly to relevant labs.
- **Rank Titles**: Level 1 (Data Novice) ➔ Level 2 (SQL & Data Sleuth) ➔ Level 3 (Insight Analyst) ➔ Level 4 (Feature Alchemist) ➔ Level 5 (ML Engineer) ➔ Level 6 (Neural Architect) ➔ Level 7 (Grand Data Scientist).
- **12 Mastery Badges**: Unlock trophies for data cleaning, multi-table SQL joins, Gini tree splitting, Voronoi clustering, ROC threshold tuning, and neural network convergence.
- **Persistent Progress**: Saved automatically to `localStorage`.

---

## 🗺️ Interactive Curriculum & Labs

### 📊 Track 1: The Data Analyst Quest
1. **Visual Data Cleaning & Wrangling Lab (`Lab 01`)**
   - Live corrupted customer dataset with missing values, duplicate IDs, outlier salaries, and negative ages.
   - Interactive tools: Median imputation, mode imputation, deduplication, IQR capping.
   - *Target*: Achieve 100% Data Integrity without data leakage!

2. **The SQL Arena & Visual Relational Engine (`Lab 02`)**
   - Interactive Venn diagram for `INNER JOIN`, `LEFT JOIN`, `RIGHT JOIN`, and `FULL OUTER JOIN`.
   - In-browser SQL query runner over `customers` and `orders` tables.
   - *Target*: Calculate total revenue by country for Gold tier customers in 2026.

3. **EDA, Distribution Morphing & Descriptive Stats (`Lab 03`)**
   - Mean vs. Median Tug-of-War: Drag an extreme outlier to see Mean get dragged while Median stays robust.
   - Pearson correlation scatter morpher ($r = -1.0 \to +1.0$) with live regression line.
   - *Target*: Demonstrate outlier resistance ($> \$1,500\text{k}$) and calibrate $r \ge 0.90$.

4. **Business Intelligence & Conversion Funnel Optimization (`Lab 04`)**
   - E-Commerce conversion funnel with live revenue leak detector at the checkout step.
   - Cohort retention matrix heatmap with lifecycle onboarding intervention.
   - *Target*: Plug the funnel friction to surpass \$45,000/month in revenue.

5. **A/B Testing & Statistical Significance Arcade (`Lab 05`)**
   - Live visitor traffic splitter comparing Control (Variant A) vs. Neon Green CTA (Variant B).
   - Dynamic Gaussian sampling curves, $z$-score, and two-tailed $p$-value meter.
   - *Target*: Collect sufficient traffic to achieve $p < 0.05$ with $> 80\%$ power.

---

### 🤖 Track 2: The Data Scientist Odyssey
6. **Feature Engineering, Scaling & Polynomial Transformations (`Lab 06`)**
   - One-Hot vs. Label Encoding visual binary matrix transformer.
   - Feature Scaling simulator: Compare Raw vs. Min-Max $[0, 1]$ vs. StandardScaler ($\mu=0, \sigma=1$).
   - Dimensionality Lift: Project non-separable 2D concentric rings into 3D space ($z = x_1^2 + x_2^2$).
   - *Target*: Enable polynomial features to achieve 100% linear separability.

7. **Linear Regression & Gradient Descent Mechanics (`Lab 07`)**
   - "Fit the Line" Game: Drag slope ($w$) and intercept ($b$) with live residual error bars.
   - Gradient Descent 2D loss bowl: Roll the optimization ball with learning rate ($\alpha$).
   - *Target*: Minimize Mean Squared Error (MSE) below $0.015$ and converge to the minimum bowl.

8. **Classification, Decision Trees & Random Forests (`Lab 08`)**
   - Interactive 2D Decision Tree plane cutter with live Gini Impurity calculator.
   - Random Forest ensemble voting toggle smoothing out single-tree overfitting.
   - *Target*: Achieve $\ge 95\%$ accuracy with pure leaf nodes.

9. **Unsupervised Learning: K-Means Clustering & PCA (`Lab 09`)**
   - Interactive K-Means canvas: Step through centroid assignment and mean recalculation.
   - Principal Component Analysis (PCA) variance maximizer: Rotate the $PC_1$ axis.
   - *Target*: Set $K = 3$, converge inertia $\le 45.0$, and capture $\ge 80\%$ variance.

10. **Model Evaluation, Confusion Matrix & ROC/AUC (`Lab 10`)**
    - Probability threshold slider on 100 fraud vs. legitimate transactions.
    - Live Confusion Matrix ($TP, FP, TN, FN$) and reactive Precision, Recall, and F1 dials.
    - Operating point tracing dynamically across the ROC curve ($AUC = 0.91$).
    - *Target*: Balance threshold to catch $\ge 85\%$ fraud with $\ge 75\%$ precision.

11. **Deep Learning: Neural Network Playground (`Lab 11`)**
    - Interactive Multi-Layer Perceptron (MLP) with animated weights, ReLU/Sigmoid activations.
    - Live decision surface heatmap warping around the non-linear XOR problem.
    - *Target*: Configure hidden neurons and train until accuracy reaches $\ge 95\%$.

12. **Time Series Decomposition & Anomaly Detection (`Lab 12`)**
    - Classical additive decomposition into Trend, 7-day Seasonality, and Residual noise.
    - Rolling window Moving Average filter.
    - $3\sigma$ anomaly detector flagging sudden DDoS spikes and flash crashes.
    - *Target*: Flag all 3 true anomalies with 0 false alarms.

---

## 🚀 How to Run the Website

### Option 1: Instant Local Server (Recommended)
Open a terminal in this directory and run:
```bash
node server.js
```
Then visit: **`http://localhost:3000`** in any web browser!

### Option 2: Direct File Open
You can also directly open **`index.html`** in any modern web browser (Chrome, Edge, Firefox, Safari).

---

## 🛠️ Tech Stack & Philosophy
- **Zero Heavy Dependencies**: 100% vanilla ES6+ modules, HTML5, CSS3, SVG, and Canvas 2D.
- **Zero Third-Party Downloads**: All audio synthesized via the Web Audio API.
- **Instant Latency-Free Feedback**: Real-time reactive mathematical updates on every slider drag and button click.
