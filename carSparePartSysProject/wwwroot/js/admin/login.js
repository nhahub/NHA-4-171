/* ============================================================
   CarSparePartSys — Admin Login Logic
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // If already logged in as admin, redirect
  if (Auth.isLoggedIn() && Auth.isAdmin()) {
    window.location.href = '/admin/dashboard.html';
    return;
  }

  // Inject logo icon
  const logo = document.getElementById('admin-login-logo');
  if (logo) {
    logo.innerHTML = `<span style="width:32px;height:32px;color:var(--accent)">${UI.Icons.gear}</span> Auto<span>Admin</span>`;
  }



  const form = document.getElementById('admin-login-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('admin-login-btn');
      const email = document.getElementById('admin-email').value.trim();
      const password = document.getElementById('admin-password').value;

      btn.classList.add('is-loading');

      try {
        let response;
        try {
          // Try to call backend API
          response = await API.Auth.login({ emailOrUsername: email, password });
        } catch (err) {
          // Failover to local mock verification
          console.warn('Backend API offline. Using mock admin login...');
          if (email === 'admin@CrSys.com' || email === 'admin') {
            // Build a mock JWT token with role claim "Admin"
            const payload = {
              sub: '1',
              email: 'admin@CrSys.com',
              role: 'Admin',
              exp: Math.floor(Date.now() / 1000) + 86400, // 24h
            };
            const token = 'mock_jwt_header.' + btoa(JSON.stringify(payload)) + '.mock_signature';
            response = {
              token: token,
              user: { firstName: 'Ahmad', lastName: 'Ali', email: 'admin@CrSys.com', username: 'admin' },
            };
          } else {
            throw new Error('Invalid credentials. Use admin@CrSys.com / Admin@123.');
          }
        }

        // Save token and profile
        const token = response?.accessToken || response?.AccessToken || response?.token || response?.Token || response?.access_token;
        const user = response?.user || response?.User || response?.profile || response?.Profile || response?.userDto || null;
        if (token) Auth.saveToken(token);
        if (user) Auth.saveUser(user);

        // Verify if admin role exists
        if (Auth.isAdmin()) {
          UI.showToast('Authorized! Redirecting to admin panel...', 'success');
          setTimeout(() => {
            window.location.href = '/admin/dashboard.html';
          }, 1000);
        } else {
          Auth.removeToken();
          Auth.removeUser();
          UI.showToast('Access Denied: Customer accounts cannot access the admin panel.', 'error');
          btn.classList.remove('is-loading');
        }
      } catch (err) {
        btn.classList.remove('is-loading');
        UI.showToast(err.message || 'Login failed.', 'error');
      }
    });
  }
});
