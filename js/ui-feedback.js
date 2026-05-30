/**
 * Shared UI feedback helpers — toasts, confirmations, placeholders.
 */

export function showToast(message, isError = false) {
  document.querySelector('.toast')?.remove();
  const toast = document.createElement('div');
  toast.className = `toast${isError ? ' toast--error' : ''}`;
  toast.setAttribute('role', 'status');
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('is-visible'));
  setTimeout(() => {
    toast.classList.remove('is-visible');
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

export function showComingSoon(feature = 'This feature') {
  showToast(`${feature} — coming soon in a future release.`);
}

export function showInfo(message) {
  showToast(message);
}

export function confirmDialog(message) {
  return new Promise((resolve) => {
    let modal = document.getElementById('global-confirm-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'global-confirm-modal';
      modal.className = 'modal admin-modal';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.hidden = true;
      modal.innerHTML = `
        <div class="modal__backdrop" data-global-confirm-cancel></div>
        <div class="modal__panel admin-modal__panel glass-card">
          <h2 class="export-modal__title">Confirm Action</h2>
          <p id="global-confirm-message" class="settings-row__hint" style="margin-bottom: var(--space-5);"></p>
          <div class="btn-group">
            <button class="btn btn--primary" type="button" id="global-confirm-yes">Confirm</button>
            <button class="btn btn--secondary" type="button" data-global-confirm-cancel>Cancel</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }

    const msgEl = document.getElementById('global-confirm-message');
    const yesBtn = document.getElementById('global-confirm-yes');
    if (msgEl) msgEl.textContent = message;
    modal.removeAttribute('hidden');
    document.body.classList.add('modal-open');

    const cleanup = (result) => {
      modal.setAttribute('hidden', '');
      document.body.classList.remove('modal-open');
      yesBtn?.removeEventListener('click', onYes);
      modal.querySelectorAll('[data-global-confirm-cancel]').forEach((el) => {
        el.removeEventListener('click', onNo);
      });
      resolve(result);
    };

    const onYes = () => cleanup(true);
    const onNo = () => cleanup(false);

    yesBtn?.addEventListener('click', onYes);
    modal.querySelectorAll('[data-global-confirm-cancel]').forEach((el) => {
      el.addEventListener('click', onNo);
    });
  });
}

export function openModal(id) {
  document.getElementById(id)?.removeAttribute('hidden');
  document.body.classList.add('modal-open');
}

export function closeModal(id) {
  document.getElementById(id)?.setAttribute('hidden', '');
  if (!document.querySelector('.modal:not([hidden])')) {
    document.body.classList.remove('modal-open');
  }
}

export function setButtonLoading(button, loading, loadingText = 'Loading…') {
  if (!button) return;
  if (loading) {
    button.dataset.originalText = button.textContent;
    button.textContent = loadingText;
    button.disabled = true;
    button.classList.add('is-loading');
  } else {
    button.textContent = button.dataset.originalText || button.textContent;
    button.disabled = false;
    button.classList.remove('is-loading');
  }
}
