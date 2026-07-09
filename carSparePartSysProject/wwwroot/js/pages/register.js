/* ============================================================
   CarSparePartSys — Register Page Logic
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  Auth.redirectIfLoggedIn();

  const logo = document.getElementById('auth-logo');
  if (logo) logo.innerHTML = `<span style="width:32px;height:32px;color:var(--accent)">${UI.Icons.gear}</span> Auto<span style="color:var(--accent)">Parts</span>`;

  const form = document.getElementById('register-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('register-btn');

      const data = {
        firstName: document.getElementById('reg-firstname').value.trim(),
        lastName: document.getElementById('reg-lastname').value.trim(),
        username: document.getElementById('reg-username').value.trim(),
        email: document.getElementById('reg-email').value.trim(),
        phone: document.getElementById('reg-phone').value.trim(),
        password: document.getElementById('reg-password').value,
        confirmPassword: document.getElementById('reg-confirm').value,
      };
      const confirm = document.getElementById('reg-confirm').value;

      // Validation
      if (!data.firstName || !data.lastName || !data.username || !data.email || !data.password) {
        UI.showToast('Please fill in all required fields.', 'warning');
        return;
      }

      if (data.password.length < 8) {
        UI.showToast('Password must be at least 8 characters.', 'warning');
        return;
      }

      if (data.password !== confirm) {
        UI.showToast('Passwords do not match.', 'error');
        return;
      }

      // Email format check
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        UI.showToast('Please enter a valid email address.', 'warning');
        return;
      }

      btn.classList.add('is-loading');

      try {
        const response = await API.Auth.register(data);

        // If the backend returns a token directly, log in
        if (response?.accessToken || response?.AccessToken || response?.token || response?.Token || response?.access_token) {
          Auth.handleLoginSuccess(response);
        } else {
          UI.showToast('Account created successfully! Please log in.', 'success');
          setTimeout(() => {
            window.location.href = '/login.html';
          }, 1500);
        }
      } catch (err) {
        btn.classList.remove('is-loading');
        if (err.status === 409) {
          UI.showToast('Username or email already exists.', 'error');
        } else {
          UI.handleApiError(err);
        }
      }
    });
  }
});
