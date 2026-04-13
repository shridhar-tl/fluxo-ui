import cn from 'classnames';
import React from 'react';
import { AnimateOnView } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';

const code = `import { AnimateOnView } from 'fluxo-ui';

{items.map((item, index) => (
  <AnimateOnView
    key={item.id}
    animation="fadeInUp"
    stagger={100}
    staggerIndex={index}
  >
    <Card {...item} />
  </AnimateOnView>
))}`;

const items = [
    { title: 'Dashboard', desc: 'Overview of all metrics', icon: '📊' },
    { title: 'Analytics', desc: 'Deep dive into data', icon: '📈' },
    { title: 'Reports', desc: 'Generated insights', icon: '📋' },
    { title: 'Settings', desc: 'Configure preferences', icon: '⚙️' },
    { title: 'Users', desc: 'Manage team members', icon: '👥' },
    { title: 'Billing', desc: 'Plans and payments', icon: '💳' },
];

const StaggeredAnimations: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <>
            <ComponentDemo
                title="Staggered Animation"
                description="Use stagger and staggerIndex to cascade animations across a list of elements."
            >
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((item, idx) => (
                        <AnimateOnView key={item.title} animation="fadeInUp" duration={500} stagger={100} staggerIndex={idx} once={false}>
                            <div
                                className={cn('p-4 rounded-lg border flex items-start gap-3', {
                                    'bg-white/3 border-white/10': isDark,
                                    'bg-white border-gray-200 shadow-sm': !isDark,
                                })}
                            >
                                <span className="text-2xl">{item.icon}</span>
                                <div>
                                    <p className={cn('font-semibold text-sm', { 'text-gray-200': isDark, 'text-gray-800': !isDark })}>
                                        {item.title}
                                    </p>
                                    <p className="text-xs" style={{ color: 'var(--eui-text-muted)' }}>
                                        {item.desc}
                                    </p>
                                </div>
                            </div>
                        </AnimateOnView>
                    ))}
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default StaggeredAnimations;
