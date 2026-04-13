import React, { useState } from 'react';
import { MenuNav } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { collapsibleMenuItems } from './menu-nav-story-data';

const code = `import { MenuNav } from 'fluxo-ui';

<MenuNav
  items={items}
  showSearch
  searchPlaceholder="Search menu..."
  headerSlot={
    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--eui-border)' }}>
      <div style={{ fontWeight: 600, fontSize: '14px' }}>Acme Inc.</div>
      <div style={{ fontSize: '12px', opacity: 0.6 }}>Workspace</div>
    </div>
  }
  footerSlot={
    <div style={{ padding: '12px 16px', borderTop: '1px solid var(--eui-border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--eui-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '13px', fontWeight: 600 }}>JD</div>
      <div>
        <div style={{ fontSize: '13px', fontWeight: 500 }}>John Doe</div>
        <div style={{ fontSize: '11px', opacity: 0.6 }}>john@acme.com</div>
      </div>
    </div>
  }
  selectedId={selectedId}
  onSelect={(id) => setSelectedId(id)}
/>`;

const headerSlot = (
    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--eui-border)' }}>
        <div style={{ fontWeight: 600, fontSize: '14px' }}>Acme Inc.</div>
        <div style={{ fontSize: '12px', opacity: 0.6 }}>Workspace</div>
    </div>
);

const footerSlot = (
    <div style={{ padding: '12px 16px', borderTop: '1px solid var(--eui-border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div
            style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'var(--eui-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 600,
            }}
        >
            JD
        </div>
        <div>
            <div style={{ fontSize: '13px', fontWeight: 500 }}>John Doe</div>
            <div style={{ fontSize: '11px', opacity: 0.6 }}>john@acme.com</div>
        </div>
    </div>
);

const CustomSlots: React.FC = () => {
    const [selectedId, setSelectedId] = useState('home');

    return (
        <>
            <ComponentDemo
                title="Header, Footer & Search"
                description="Custom header and footer slots with built-in search functionality."
                centered={false}
            >
                <div className="flex flex-col sm:flex-row gap-6 w-full">
                    <div className="w-full sm:w-64 shrink-0">
                        <MenuNav
                            items={collapsibleMenuItems}
                            showSearch
                            searchPlaceholder="Search menu..."
                            headerSlot={headerSlot}
                            footerSlot={footerSlot}
                            selectedId={selectedId}
                            onSelect={(id) => setSelectedId(id)}
                        />
                    </div>
                    <div className="flex-1 flex items-center justify-center text-sm opacity-60">
                        Selected: <strong className="ml-1">{selectedId}</strong>
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default CustomSlots;
