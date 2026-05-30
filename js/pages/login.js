/**
 * VEXORA Login Page
 */

import VexoraTheme from '../theme.js';
import { login, setAuth, isAuthenticated } from '../auth-client.js';

if (isAuthenticated()) {
  window.location.href = 'dashboard.html';
}

VexoraTheme.init();

const form = document.getElementById('login-form');
const errorEl = document.getElementById('auth-error');
const submitBtn = document.getElementById('login-submit');

form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  errorEl.hidden = true;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Signing in…';

  const formData = new FormData(form);
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  const rememberMe = formData.get('rememberMe') === 'on';

  try {
    const data = await login({ email, password, rememberMe });
    setAuth({ token: data.token, user: data.user, rememberMe: data.rememberMe ?? rememberMe });
    window.location.href = 'dashboard.html';
  } catch (error) {
    errorEl.textContent = error.message || 'Unable to sign in. Please try again.';
    errorEl.hidden = false;
    submitBtn.disabled = false;
    submitBtn.textContent = 'Sign In';
  }
});
