import classNames from 'classnames';
import React, { useState } from 'react';

export interface PropsTabItem {
    id: string;
    label: string;
    render: () => React.ReactNode;
}

interface PropsTabsProps {
    tabs: PropsTabItem[];
    /** Optional persistence key; remembers last tab in sessionStorage. */
    storageKey?: string;
    initialTabId?: string;
}

export const PropsTabs: React.FC<PropsTabsProps> = ({ tabs, storageKey, initialTabId }) => {
    const [activeId, setActiveId] = useState<string>(() => {
        if (storageKey) {
            try {
                const stored = sessionStorage.getItem(storageKey);
                if (stored && tabs.some((t) => t.id === stored)) return stored;
            } catch { /* ignore */ }
        }
        return initialTabId ?? tabs[0]?.id ?? '';
    });

    const handleSelect = (id: string) => {
        setActiveId(id);
        if (storageKey) {
            try { sessionStorage.setItem(storageKey, id); } catch { /* ignore */ }
        }
    };

    const active = tabs.find((t) => t.id === activeId) ?? tabs[0];

    return (
        <div className="eui-rb-props-tabs">
            <div className="eui-rb-props-tabs-header" role="tablist">
                {tabs.map((t) => (
                    <button
                        key={t.id}
                        role="tab"
                        aria-selected={t.id === activeId}
                        className={classNames('eui-rb-props-tabs-btn', { active: t.id === activeId })}
                        onClick={() => handleSelect(t.id)}
                        type="button"
                    >
                        {t.label}
                    </button>
                ))}
            </div>
            <div className="eui-rb-props-tabs-panel" role="tabpanel">
                {active?.render()}
            </div>
        </div>
    );
};
