import cn from 'classnames';
import React from 'react';
import { useMobile } from '../../../hooks';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';

const code = `import { useMobile } from 'fluxo-ui/hooks';

const isMobile = useMobile();

return isMobile ? <MobileLayout /> : <DesktopLayout />;`;

const UseMobileDemo: React.FC = () => {
    const { isDark } = useStoryTheme();
    const isMobile = useMobile();

    return (
        <>
            <ComponentDemo
                title="useMobile"
                description="Returns true when viewport width is below 768px. Automatically updates on resize."
            >
                <div
                    className={cn('p-4 rounded-lg border text-center', {
                        'bg-white/5 border-white/10': isDark,
                        'bg-white border-gray-200': !isDark,
                    })}
                >
                    <div className="text-3xl mb-2">{isMobile ? '📱' : '🖥️'}</div>
                    <p className="font-semibold" style={{ color: 'var(--eui-text)' }}>
                        {isMobile ? 'Mobile View' : 'Desktop View'}
                    </p>
                    <p className="text-sm mt-1" style={{ color: 'var(--eui-text-muted)' }}>
                        isMobile ={' '}
                        <code className="font-mono" style={{ color: 'var(--eui-primary)' }}>
                            {String(isMobile)}
                        </code>
                    </p>
                    <p className="text-xs mt-2" style={{ color: 'var(--eui-text-disabled)' }}>
                        Resize your browser window to see this change
                    </p>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default UseMobileDemo;
