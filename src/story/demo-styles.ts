import type React from 'react';

export const headingStyle: React.CSSProperties = { color: 'var(--eui-text)' };
export const subtleStyle: React.CSSProperties = { color: 'var(--eui-text-muted)' };
export const stackStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' };
export const rowStyle: React.CSSProperties = { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' };
export const rowLabelStyle: React.CSSProperties = {
    color: 'var(--eui-text-muted)',
    fontSize: '0.6875rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    minWidth: '5.5rem',
};
export const readoutStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem 1rem',
    borderRadius: '0.5rem',
    border: '1px solid var(--eui-border-subtle)',
    background: 'var(--eui-bg)',
    color: 'var(--eui-text-muted)',
    fontSize: '0.8125rem',
    boxSizing: 'border-box',
};
export const panelStyle: React.CSSProperties = {
    padding: '1rem',
    borderRadius: '0.75rem',
    border: '1px solid var(--eui-border-subtle)',
    background: 'var(--eui-bg)',
    color: 'var(--eui-text)',
    boxSizing: 'border-box',
};
