import React from 'react';

interface Props {
    componentId: string;
    children: React.ReactNode;
}

interface State { hasError: boolean; error: Error | null; }

export class ComponentErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    render() {
        if (this.state.hasError) {
            return (
                <div
                    role="alert"
                    style={{
                        padding: '12px 16px',
                        background: 'rgba(239,68,68,0.08)',
                        border: '1px solid rgba(239,68,68,0.3)',
                        borderRadius: 4,
                        color: '#ef4444',
                        fontSize: 12,
                    }}
                >
                    <strong>Component error</strong> [{this.props.componentId}]:{' '}
                    {this.state.error?.message ?? 'Unknown error'}
                </div>
            );
        }
        return this.props.children;
    }
}
