import React from 'react';

const CSS = `
.heft-avatar {
  display: inline-flex; align-items: center; justify-content: center;
  border-radius: var(--radius-circle); overflow: hidden;
  background: var(--green-deep); color: var(--green-300);
  font-family: var(--font-sans); font-weight: var(--fw-bold);
  border: 1px solid var(--border-subtle); flex-shrink: 0;
  text-transform: uppercase; line-height: 1;
}
.heft-avatar img { width: 100%; height: 100%; object-fit: cover; }
.heft-avatar--xs { width: 28px; height: 28px; font-size: 11px; }
.heft-avatar--sm { width: 36px; height: 36px; font-size: 13px; }
.heft-avatar--md { width: 44px; height: 44px; font-size: 16px; }
.heft-avatar--lg { width: 64px; height: 64px; font-size: 22px; }
.heft-avatar--ring { box-shadow: 0 0 0 2px var(--bg-app), 0 0 0 4px var(--accent); }
`;

if (typeof document !== 'undefined' && !document.getElementById('heft-avatar-css')) {
  const s = document.createElement('style');
  s.id = 'heft-avatar-css'; s.textContent = CSS;
  document.head.appendChild(s);
}

function initials(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0] || '').join('');
}

/** User avatar — image or initials fallback. */
export function Avatar({ src, name = '', size = 'md', ring = false, className = '', ...rest }) {
  const cls = ['heft-avatar', `heft-avatar--${size}`, ring ? 'heft-avatar--ring' : '', className].filter(Boolean).join(' ');
  return (
    <span className={cls} {...rest}>
      {src ? <img src={src} alt={name} /> : initials(name)}
    </span>
  );
}
