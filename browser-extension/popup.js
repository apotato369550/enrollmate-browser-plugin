// Simple popup app without React (for compatibility)
// This will be the basic implementation that can later be refactored to use React

class PopupApp {
  constructor() {
    this.state = {
      step: 'idle', // idle, extracting, preview, auth, selectSemester, saving, success, error
      courses: [],
      email: '',
      password: '',
      selectedSemesterId: null,
      semesters: [],
      error: '',
      loading: false,
      courseCount: 0
    };
    this.rootElement = document.getElementById('popup-root');
    this.init();
  }

  async init() {
    // Load stored data
    const stored = await this.getStoredData();
    if (stored.email && stored.token) {
      this.state.email = stored.email;
      this.state.step = 'selectSemester';
      await this.loadSemesters(stored.userId, stored.token);
    }
    this.render();
  }

  getStoredData() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['email', 'token', 'userId', 'semesters'], (result) => {
        resolve(result);
      });
    });
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.render();
  }

  async handleExtractCourses() {
    this.setState({ step: 'extracting', loading: true });

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'SCRAPE_COURSES'
      });

      if (response.success) {
        this.setState({
          courses: response.courses,
          courseCount: response.courses.length,
          step: 'preview',
          loading: false
        });
      } else {
        this.setState({
          error: `Failed to extract: ${response.error}`,
          step: 'error',
          loading: false
        });
      }
    } catch (err) {
      this.setState({
        error: `Error: ${err.message}`,
        step: 'error',
        loading: false
      });
    }
  }

  async handleAuthenticate(e) {
    e.preventDefault();
    this.setState({ loading: true, error: '' });

    try {
      const result = await chrome.runtime.sendMessage({
        action: 'AUTHENTICATE',
        email: this.state.email,
        password: this.state.password
      });

      if (result.success) {
        await chrome.storage.local.set({
          email: this.state.email,
          token: result.token,
          userId: result.userId
        });

        this.setState({
          step: 'selectSemester',
          loading: false
        });

        await this.loadSemesters(result.userId, result.token);
      } else {
        this.setState({
          error: result.error || 'Authentication failed',
          loading: false
        });
      }
    } catch (err) {
      this.setState({
        error: `Error: ${err.message}`,
        loading: false
      });
    }
  }

  async loadSemesters(userId, token) {
    try {
      const result = await chrome.runtime.sendMessage({
        action: 'GET_SEMESTERS',
        userId,
        token
      });

      if (result.success) {
        this.setState({ semesters: result.semesters });
      }
    } catch (err) {
      console.error('Failed to load semesters:', err);
    }
  }

  async handleSelectSemester(semesterId) {
    this.setState({ selectedSemesterId: semesterId, step: 'saving', loading: true });

    try {
      const stored = await this.getStoredData();
      const result = await chrome.runtime.sendMessage({
        action: 'SEND_COURSES',
        courses: this.state.courses,
        semesterId,
        token: stored.token
      });

      if (result.success) {
        this.setState({ step: 'success', loading: false });
        setTimeout(() => {
          window.close();
        }, 2000);
      } else {
        this.setState({
          error: result.error || 'Failed to save courses',
          step: 'error',
          loading: false
        });
      }
    } catch (err) {
      this.setState({
        error: `Error: ${err.message}`,
        step: 'error',
        loading: false
      });
    }
  }

  handleLogout() {
    chrome.storage.local.clear();
    this.setState({
      step: 'idle',
      email: '',
      password: '',
      semesters: []
    });
  }

  render() {
    const html = this.getStepHTML();
    this.rootElement.innerHTML = html;
    this.attachEventListeners();
  }

  attachEventListeners() {
    const { step } = this.state;

    if (step === 'idle') {
      const extractBtn = this.rootElement.querySelector('.extract-btn');
      if (extractBtn) {
        extractBtn.addEventListener('click', () => this.handleExtractCourses());
      }
    } else if (step === 'preview') {
      const extractAgainBtn = this.rootElement.querySelector('.extract-again-btn');
      const continueBtn = this.rootElement.querySelector('.continue-btn');
      if (extractAgainBtn) {
        extractAgainBtn.addEventListener('click', () => {
          this.setState({ step: 'idle', courses: [], courseCount: 0 });
        });
      }
      if (continueBtn) {
        continueBtn.addEventListener('click', () => {
          this.setState({ step: 'auth' });
        });
      }
    } else if (step === 'auth') {
      const form = this.rootElement.querySelector('.auth-form');
      const emailInput = this.rootElement.querySelector('.email-input');
      const passwordInput = this.rootElement.querySelector('.password-input');

      if (emailInput) {
        emailInput.addEventListener('input', (e) => {
          this.state.email = e.target.value;
        });
      }
      if (passwordInput) {
        passwordInput.addEventListener('input', (e) => {
          this.state.password = e.target.value;
        });
      }
      if (form) {
        form.addEventListener('submit', (e) => this.handleAuthenticate(e));
      }
    } else if (step === 'selectSemester') {
      const semesterBtns = this.rootElement.querySelectorAll('.semester-option');
      semesterBtns.forEach((btn, idx) => {
        if (idx < this.state.semesters.length) {
          const semesterId = this.state.semesters[idx].id;
          btn.addEventListener('click', () => this.handleSelectSemester(semesterId));
        }
      });

      const createNewBtn = this.rootElement.querySelector('.semester-new');
      if (createNewBtn) {
        createNewBtn.addEventListener('click', () => {
          this.setState({ step: 'createSemester' });
        });
      }

      const logoutBtn = this.rootElement.querySelector('.logout-btn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', () => this.handleLogout());
      }
    } else if (step === 'error') {
      const tryAgainBtn = this.rootElement.querySelector('.try-again-btn');
      if (tryAgainBtn) {
        tryAgainBtn.addEventListener('click', () => {
          this.setState({ step: 'idle', error: '', courses: [], courseCount: 0 });
        });
      }
    }
  }

  getStepHTML() {
    const { step, courses, courseCount, email, password, error, loading, semesters } = this.state;

    if (step === 'idle') {
      return `
        <div class="popup-container">
          <div class="popup-section">
            <h2 class="popup-title">📚 EnrollMate</h2>
            <p class="popup-subtitle">Extract Courses from Your University</p>
            <button class="btn-primary extract-btn" ${loading ? 'disabled' : ''}>
              ${loading ? '⏳ Extracting...' : '🚀 Extract Courses'}
            </button>
            <p class="popup-hint">Click to scrape all courses from this page</p>
          </div>
        </div>
      `;
    } else if (step === 'extracting') {
      return `
        <div class="popup-container">
          <div class="popup-section">
            <h2 class="popup-title">⏳ Extracting Courses...</h2>
            <p class="popup-subtitle">This should only take a moment</p>
            <div class="spinner"></div>
          </div>
        </div>
      `;
    } else if (step === 'preview') {
      return `
        <div class="popup-container">
          <div class="popup-section">
            <h2 class="popup-title">✅ Courses Extracted</h2>
            <p class="popup-count">${courseCount} courses found</p>
            <div class="course-list-preview">
              ${courses.slice(0, 3).map((course, idx) => `
                <div class="course-preview-item">
                  <strong>${course.courseCode}</strong>
                  <span class="course-schedule">${course.schedule || 'TBA'}</span>
                </div>
              `).join('')}
              ${courseCount > 3 ? `<p class="more-courses">+${courseCount - 3} more...</p>` : ''}
            </div>
            <button class="btn-secondary extract-again-btn">← Extract Again</button>
            <button class="btn-primary continue-btn">Continue to EnrollMate →</button>
          </div>
        </div>
      `;
    } else if (step === 'auth') {
      return `
        <div class="popup-container">
          <div class="popup-section">
            <h2 class="popup-title">🔐 Login to EnrollMate</h2>
            <form class="auth-form">
              <input
                type="email"
                placeholder="Email"
                value="${email}"
                class="input-field email-input"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value="${password}"
                class="input-field password-input"
                required
              />
              ${error ? `<p class="error-message">${error}</p>` : ''}
              <button
                type="submit"
                class="btn-primary"
                ${loading ? 'disabled' : ''}
              >
                ${loading ? '⏳ Logging in...' : 'Login'}
              </button>
            </form>
            <p class="popup-hint">Your credentials are only used for authentication</p>
          </div>
        </div>
      `;
    } else if (step === 'selectSemester') {
      return `
        <div class="popup-container">
          <div class="popup-section">
            <h2 class="popup-title">📅 Select Semester</h2>
            <p class="popup-subtitle">Where should we import these ${courseCount} courses?</p>
            <div class="semester-list">
              ${semesters.map(sem => `
                <button class="semester-option">
                  ${sem.name} (${sem.year})
                </button>
              `).join('')}
              <button class="btn-secondary semester-option semester-new">
                ➕ Create New Semester
              </button>
            </div>
            <button class="btn-secondary-small logout-btn">Logout</button>
          </div>
        </div>
      `;
    } else if (step === 'saving') {
      return `
        <div class="popup-container">
          <div class="popup-section">
            <h2 class="popup-title">⏳ Saving Courses...</h2>
            <p class="popup-subtitle">This should only take a moment</p>
            <div class="spinner"></div>
          </div>
        </div>
      `;
    } else if (step === 'success') {
      return `
        <div class="popup-container">
          <div class="popup-section success">
            <h2 class="popup-title">✨ Success!</h2>
            <p class="popup-subtitle">${courseCount} courses imported successfully</p>
            <p class="popup-hint">Head to EnrollMate to start building your schedule!</p>
          </div>
        </div>
      `;
    } else if (step === 'error') {
      return `
        <div class="popup-container">
          <div class="popup-section error">
            <h2 class="popup-title">❌ Error</h2>
            <p class="error-message">${error}</p>
            <button class="btn-primary try-again-btn">← Try Again</button>
          </div>
        </div>
      `;
    } else if (step === 'createSemester') {
      return `
        <div class="popup-container">
          <div class="popup-section">
            <h2 class="popup-title">➕ Create New Semester</h2>
            <p class="popup-subtitle">Set up a new semester for your courses</p>
            <p class="popup-hint">This feature will be available in Phase 3</p>
            <button class="btn-primary" onclick="window.history.back()">← Go Back</button>
          </div>
        </div>
      `;
    }

    return '<div class="popup-container"><p>Unknown state</p></div>';
  }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new PopupApp();
});
