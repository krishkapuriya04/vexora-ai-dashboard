/**
 * VEXORA Signup Page
 */

import VexoraTheme from '../theme.js';
import { register, setAuth, isAuthenticated, checkApiHealth } from '../auth-client.js';

if (isAuthenticated()) {
  window.location.href = 'dashboard.html';
}

VexoraTheme.init();

const form = document.getElementById('signup-form');
const errorEl = document.getElementById('auth-error');
const submitBtn = document.getElementById('signup-submit');

checkApiHealth().catch((error) => {
  if (errorEl) {
    errorEl.textContent = error.message;
    errorEl.hidden = false;
  }
  if (submitBtn) submitBtn.disabled = true;
});

form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  errorEl.hidden = true;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Creating account…';

  const formData = new FormData(form);
  const fullName = String(formData.get('fullName') || '').trim();
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  const confirmPassword = String(formData.get('confirmPassword') || '');

  if (password !== confirmPassword) {
    errorEl.textContent = 'Passwords do not match.';
    errorEl.hidden = false;
    submitBtn.disabled = false;
    submitBtn.textContent = 'Create Account';
    return;
  }

  try {
    const data = await register({ fullName, email, password, role: 'Viewer' });
    setAuth({ token: data.token, user: data.user, rememberMe: false });
    window.location.href = 'dashboard.html';
  } catch (error) {
    errorEl.textContent = error.message || 'Unable to create account. Please try again.';
    errorEl.hidden = false;
    submitBtn.disabled = false;
    submitBtn.textContent = 'Create Account';
  }
});
