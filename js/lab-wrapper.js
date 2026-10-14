// Lab Tab Wrapper: Enhances every lab with Hands-on, Concept Deep-Dive, Code, and Quiz
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
    <!-- Sub-Tab Header Bar -->
    <div class="lab-subtabs-nav">
      <button class="subtab-btn active" data-tab="interactive">
        <span>🎮</span> Hands-on Simulator &amp; Challenge
      </button>
      <button class="subtab-btn" data-tab="guide">
        <span>📖</span> Concept Deep-Dive &amp; Industry Playbook
      </button>
      <button class="subtab-btn" data-tab="code">
        <span>💻</span> Production Code (Python &amp; SQL)
      </button>
      <button class="subtab-btn" data-tab="quiz">
        <span>❓</span> Knowledge Mastery Quiz (+25 XP)
      </button>
    </div>

    <!-- Tab 1: Interactive Lab -->
    <div id="subtab-pane-interactive" class="subtab-pane active">
      <div id="interactive-inner-container"></div>
    </div>

    <!-- Tab 2: Concept Deep-Dive -->
    <div id="subtab-pane-guide" class="subtab-pane">
      <div class="content-guide-wrapper">
        <div class="industry-banner">
          <div class="industry-badge">🏢 Real-World Production Case Study: ${content.industryExample.company}</div>
          <h3 class="industry-title">${content.industryExample.scenario}</h3>
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
            <span>🎯</span> Top FAANG &amp; Tech Interview Traps
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

    <!-- Tab 3: Production Code -->
    <div id="subtab-pane-code" class="subtab-pane">
      <div class="code-snippets-wrapper">
        <div class="code-block-card">
          <div class="code-header">
            <span>🐍 Python (Pandas / Scikit-Learn / PyTorch)</span>
            <button class="btn btn-xs btn-outline btn-copy" data-target="code-python">Copy Code</button>
          </div>
          <pre><code id="code-python" class="code-snippet">${escapeHtml(content.codeSnippets.python)}</code></pre>
        </div>

        ${content.codeSnippets.sql ? `
          <div class="code-block-card mt-3">
            <div class="code-header">
              <span>📊 Production SQL Query</span>
              <button class="btn btn-xs btn-outline btn-copy" data-target="code-sql">Copy Code</button>
            </div>
            <pre><code id="code-sql" class="code-snippet">${escapeHtml(content.codeSnippets.sql)}</code></pre>
          </div>
        ` : ''}
      </div>
    </div>

    <!-- Tab 4: Interactive Quiz -->
    <div id="subtab-pane-quiz" class="subtab-pane">
      <div class="quiz-wrapper" id="quiz-container">
        <!-- Rendered dynamically -->
      </div>
    </div>
  `;

  // Render original interactive workbench into #interactive-inner-container
  const innerInteractive = container.querySelector('#interactive-inner-container');
  originalRenderer(innerInteractive);

  // Tab switching logic
  const tabBtns = container.querySelectorAll('.subtab-btn');
  const panes = container.querySelectorAll('.subtab-pane');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sound.playClick();
      const targetTab = btn.dataset.tab;

      tabBtns.forEach(b => b.classList.toggle('active', b.dataset.tab === targetTab));
      panes.forEach(p => p.classList.toggle('active', p.id === `subtab-pane-${targetTab}`));
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

  // Render Quiz
  renderQuiz(container.querySelector('#quiz-container'), content, moduleId);
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
      <button id="btn-submit-quiz" class="btn btn-primary btn-lg">
        ${isCompleted ? '✓ Quiz Passed (+25 XP Earned)' : 'Submit Answers & Check Score'}
      </button>
      <div id="quiz-feedback" class="feedback-msg"></div>
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

  quizContainer.querySelector('#btn-submit-quiz').addEventListener('click', () => {
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

    const feedback = quizContainer.querySelector('#quiz-feedback');
    if (answeredCount < content.quiz.length) {
      sound.playError();
      feedback.className = 'feedback-msg error';
      feedback.textContent = 'Please answer all questions before submitting!';
      return;
    }

    if (allCorrect) {
      sound.playSuccess();
      feedback.className = 'feedback-msg success';
      feedback.innerHTML = `<strong>Outstanding!</strong> 100% Score! You have fully mastered the core concepts of this domain.`;
      
      if (!state.data.completedChallenges[quizKey]) {
        state.data.completedChallenges[quizKey] = { completedAt: Date.now() };
        state.addXp(25, `Passed ${content.title} Quiz`);
        quizContainer.querySelector('#btn-submit-quiz').textContent = '✓ Quiz Passed (+25 XP Earned)';
      }
    } else {
      sound.playError();
      feedback.className = 'feedback-msg error';
      feedback.innerHTML = `Review the explanations above and try again to achieve 100% mastery!`;
    }
  });
}
