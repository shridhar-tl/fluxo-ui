import cn from 'classnames';
import React from 'react';
import { AnimateOnView } from '../../../components';
import type { AnimationType } from '../../../components';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';

const sections: { animation: AnimationType; title: string; content: string; accent: string }[] = [
    { animation: 'fadeInLeft', title: 'Step 1: Design', content: 'Create beautiful interfaces with our component library. Every component is crafted with attention to detail and accessibility.', accent: '#3b82f6' },
    { animation: 'fadeInRight', title: 'Step 2: Develop', content: 'Build with TypeScript-first components that provide full type safety and IntelliSense support out of the box.', accent: '#8b5cf6' },
    { animation: 'fadeInLeft', title: 'Step 3: Test', content: 'Ensure quality with comprehensive accessibility support, keyboard navigation, and theme compatibility across all components.', accent: '#10b981' },
    { animation: 'fadeInRight', title: 'Step 4: Deploy', content: 'Ship with confidence using tree-shakeable imports, CSS code splitting, and optimized bundle sizes.', accent: '#f59e0b' },
    { animation: 'zoomIn', title: 'Step 5: Scale', content: 'Grow your application with our state management solution, 12 color themes, and mobile-responsive design system.', accent: '#ef4444' },
    { animation: 'bounceIn', title: 'Step 6: Celebrate!', content: 'You have built something amazing. Time to share it with the world and keep iterating.', accent: '#ec4899' },
];

const ScrollDemo: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <ComponentDemo title="Scroll-triggered Showcase" description="Scroll through this section to see alternating animations. Each section uses once={false} to re-animate on scroll.">
            <div className="space-y-6">
                {sections.map((section, idx) => (
                    <AnimateOnView
                        key={section.title}
                        animation={section.animation}
                        duration={800}
                        delay={100}
                        once={false}
                    >
                        <div
                            className={cn('p-6 rounded-xl border flex gap-5 items-start', {
                                'bg-white/3 border-white/10': isDark,
                                'bg-white border-gray-200 shadow-sm': !isDark,
                                'flex-row-reverse text-right': idx % 2 !== 0,
                            })}
                        >
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                                style={{ backgroundColor: section.accent }}
                            >
                                {idx + 1}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-base mb-1" style={{ color: section.accent }}>{section.title}</h3>
                                <p className="text-sm leading-relaxed" style={{ color: 'var(--eui-text-muted)' }}>{section.content}</p>
                            </div>
                        </div>
                    </AnimateOnView>
                ))}
            </div>
        </ComponentDemo>
    );
};

export default ScrollDemo;
