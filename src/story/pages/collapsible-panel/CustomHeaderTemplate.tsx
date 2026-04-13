import React from 'react';
import { CollapsiblePanel } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<CollapsiblePanel
  title="Custom Header"
  headerTemplate={({ isOpen, toggle }) => (
    <div className="custom-header" onClick={toggle}>
      <span>{isOpen ? '▼' : '▶'}</span>
      <span>My Custom Header</span>
    </div>
  )}
>
  ...
</CollapsiblePanel>`;

const CustomHeaderTemplate: React.FC = () => (
    <>
        <ComponentDemo title="Custom Header Template" centered={false}>
            <div className="space-y-3 w-full">
                <CollapsiblePanel
                    title="Custom Header"
                    variant="ghost"
                    defaultOpen
                    headerTemplate={({ isOpen, toggle }) => (
                        <div
                            className="flex items-center gap-3 p-3 rounded-lg cursor-pointer"
                            style={{
                                background: isOpen
                                    ? 'linear-gradient(135deg, var(--eui-primary-subtle), transparent)'
                                    : 'transparent',
                                borderLeft: `3px solid ${isOpen ? 'var(--eui-primary)' : 'transparent'}`,
                                transition: 'all 0.3s ease',
                            }}
                            onClick={toggle}
                        >
                            <span
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: 32,
                                    height: 32,
                                    borderRadius: '50%',
                                    backgroundColor: 'var(--eui-primary)',
                                    color: 'var(--eui-text-on-primary)',
                                    fontSize: 14,
                                    fontWeight: 600,
                                }}
                            >
                                1
                            </span>
                            <div className="flex-1">
                                <div className="font-semibold text-sm" style={{ color: 'var(--eui-text)' }}>Step 1: Project Setup</div>
                                <div className="text-xs" style={{ color: 'var(--eui-text-muted)' }}>Initialize repository and install dependencies</div>
                            </div>
                            <svg
                                style={{
                                    width: 16, height: 16,
                                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
                                    transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
                                    color: 'var(--eui-text-muted)',
                                }}
                                viewBox="0 0 20 20" fill="currentColor"
                            >
                                <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                            </svg>
                        </div>
                    )}
                >
                    <div className="p-3 text-sm leading-relaxed">
                        The <code className="font-mono text-xs">headerTemplate</code> prop gives you full control over the
                        header rendering. You receive <code className="font-mono text-xs">isOpen</code> and
                        <code className="font-mono text-xs">toggle</code> and can build any custom UI. The toggle indicator,
                        title, subtitle, and icon props are all ignored when a template is provided.
                    </div>
                </CollapsiblePanel>
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} />
        </div>
    </>
);

export default CustomHeaderTemplate;
