import React from 'react';

export interface ConsoleEntry {
    level: 'info' | 'warn' | 'error';
    message: string;
    timestamp: Date;
    componentId?: string;
    property?: string;
}

interface ConsolePanelProps {
    entries?: ConsoleEntry[];
}

export const ConsolePanel: React.FC<ConsolePanelProps> = ({ entries = [] }) => {
    if (entries.length === 0) {
        return (
            <div className="eui-rb-console">
                <div className="eui-rb-console-empty">No messages</div>
            </div>
        );
    }

    return (
        <div className="eui-rb-console">
            <div className="eui-rb-console-output" role="log" aria-live="polite" aria-label="Console output">
                {entries.map((entry, i) => (
                    <div
                        key={i}
                        style={{
                            color: entry.level === 'error'
                                ? 'var(--eui-danger)'
                                : entry.level === 'warn'
                                    ? 'var(--eui-warning)'
                                    : 'var(--eui-text)',
                            padding: '2px 0',
                            borderBottom: '1px solid var(--eui-border-subtle)',
                        }}
                    >
                        <span style={{ opacity: 0.5, fontSize: 10, marginRight: 8 }}>
                            {entry.timestamp.toLocaleTimeString()}
                        </span>
                        {entry.componentId && (
                            <span style={{ opacity: 0.7, marginRight: 6, fontSize: 11 }}>
                                [{entry.componentId}]
                            </span>
                        )}
                        {entry.message}
                    </div>
                ))}
            </div>
        </div>
    );
};
