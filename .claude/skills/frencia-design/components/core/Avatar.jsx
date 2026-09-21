import React from 'react';

const CSS = `
.frencia-avatar {
  display: inline-flex; align-items: center; justify-content: center;
  border-radius: var(--radius-circle); overflow: hidden;
  background: var(--green-deep); color: var(--green-300);
  font-family: var(--font-sans); font-weight: var(--fw-bold);
  border: 1px solid var(--border-subtle); flex-shrink: 0;
  text-transform: uppercase; line-height: 1;
}
.frencia-avatar img { width: 100%; height: 100%; object-fit: cover; }
.frencia-avatar--xs { width: 28px; height: 28px; font-size: 11px; }
.frencia-avatar--sm { width: 36px; height: 36px; font-size: 13px; }
.frencia-avatar--md { width: 44px; height: 44px; font-size: 16px; }
.frencia-avatar--lg { width: 64px; height: 64px; font-size: 22px; }
.frencia-avatar--ring { box-shadow: 0 0 0 2px var(--bg-app), 0 0 0 4px var(--accent); }
`;

if (typeof document !== 'undefined' && !document.getElementById('frencia-avatar-css')) {
  const s = document.createElement('style');
  s.id = 'frencia-avatar-css'; s.textContent = CSS;
  document.head.appendChild(s);
}

function initials(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0] || '').join('');
}

/** User avatar — image or initials fallback. */
export function Avatar({ src, name = '', size = 'md', ring = false, className = '', ...rest }) {
  const cls = ['frencia-avatar', `frencia-avatar--${size}`, ring ? 'frencia-avatar--ring' : '', className].filter(Boolean).join(' ');
  return (
    <span className={cls} {...rest}>
      {src ? <img src={src} alt={name} /> : initials(name)}
    </span>
  );
}
