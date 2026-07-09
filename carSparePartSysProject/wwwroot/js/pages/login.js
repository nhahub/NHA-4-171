/* ============================================================
   CarSparePartSys — Login Page Logic
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Redirect if already logged in
  Auth.redirectIfLoggedIn();

  // Inject logo icon
  const logo = document.getElementById('auth-logo');
  if (logo) logo.innerHTML = `<span style="width:32px;height:32px;color:var(--accent)">${UI.Icons.gear}</span> Auto<span style="color:var(--accent)">Parts</span>`;

  // Handle form submission
  const form = document.getElementById('login-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('login-btn');

      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;

      if (!email || !password) {
        UI.showToast('Please fill in all fields.', 'warning');
        return;
      }

      btn.classList.add('is-loading');

      try {
        const response = await API.Auth.login({ emailOrUsername: email, password });
        Auth.handleLoginSuccess(response);
      } catch (err) {
        btn.classList.remove('is-loading');
        if (err.status === 401) {
          UI.showToast('Invalid email or password.', 'error');
        } else {
          UI.handleApiError(err);
        }
      }
    });
  }
});
