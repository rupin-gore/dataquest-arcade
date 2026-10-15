// Lab Tab Wrapper: Enhances every lab with Guided Lesson, Simulator, Code, and Quiz
import { CONTENT_DATABASE } from './content-data.js';
import { state } from './state.js';
import { sound } from './audio.js';

export function wrapModuleWithTabs(moduleId, container, originalRenderer) {
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
