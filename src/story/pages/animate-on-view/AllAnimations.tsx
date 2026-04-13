import cn from 'classnames';
import React from 'react';
import { AnimateOnView } from '../../../components';
import type { AnimationType } from '../../../components';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';

const animations: { type: AnimationType; label: string; color: string }[] = [
    { type: 'fadeIn', label: 'Fade In', color: '#3b82f6' },
    { type: 'fadeInUp', label: 'Fade In Up', color: '#8b5cf6' },
    { type: 'fadeInDown', label: 'Fade In Down', color: '#06b6d4' },
    { type: 'fadeInLeft', label: 'Fade In Left', color: '#10b981' },
    { type: 'fadeInRight', label: 'Fade In Right', color: '#f59e0b' },
    { type: 'zoomIn', label: 'Zoom In', color: '#ef4444' },
    { type: 'zoomOut', label: 'Zoom Out', color: '#ec4899' },
    { type: 'slideUp', label: 'Slide Up', color: '#14b8a6' },
    { type: 'slideDown', label: 'Slide Down', color: '#6366f1' },
    { type: 'slideLeft', label: 'Slide Left', color: '#f97316' },
    { type: 'slideRight', label: 'Slide Right', color: '#84cc16' },
    { type: 'flipX', label: 'Flip X', color: '#a855f7' },
    { type: 'flipY', label: 'Flip Y', color: '#e11d48' },
    { type: 'rotateIn', label: 'Rotate In', color: '#0ea5e9' },
    { type: 'bounceIn', label: 'Bounce In', color: '#22c55e' },
    { type: 'scaleUp', label: 'Scale Up', color: '#d946ef' },
];

const AllAnimations: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <ComponentDemo title="All Animation Types" description="Scroll down to see each animation type in action. Each card animates independently.">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {animations.map(({ type, label, color }, idx) => (
                    <AnimateOnView
                        key={type}
                        animation={type}
                        duration={700}
                        delay={idx * 50}
                        once={false}
                    >
                        <div
                            className={cn('p-5 rounded-xl border text-center', {
                                'border-white/10': isDark,
                                'border-gray-200': !isDark,
                            })}
                            style={{ backgroundColor: `${color}15` }}
                        >
                            <div
                                className="w-10 h-10 rounded-lg mx-auto mb-3 flex items-center justify-center"
                                style={{ backgroundColor: `${color}25`, color }}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                                </svg>
                            </div>
                            <p className="font-semibold text-sm" style={{ color }}>{label}</p>
                            <p className="text-xs mt-1" style={{ color: 'var(--eui-text-muted)' }}>{type}</p>
                        </div>
                    </AnimateOnView>
                ))}
            </div>
        </ComponentDemo>
    );
};

export default AllAnimations;
