import cn from 'classnames';
import React from 'react';
import { useStoryTheme } from './StoryThemeContext';

interface ComponentDemoProps {
    title: string;
    description?: string;
    children: React.ReactNode;
    className?: string;
    centered?: boolean;
}

export const ComponentDemo: React.FC<ComponentDemoProps> = ({
    title,
    description,
    children,
    className = '',
    centered = true,
}) => {
    const { isDark } = useStoryTheme();

    return (
        <div
            className={cn(
                'rounded-xl border overflow-hidden',
                {
                    'border-white/8 bg-[#0d0f14]': isDark,
                    'border-gray-200 bg-white shadow-sm': !isDark,
                },
                className
            )}
        >
            <div
                className={cn('px-5 py-3.5 border-b', {
                    'border-white/8': isDark,
                    'border-gray-200': !isDark,
                })}
            >
                <h3
                    className={cn('text-sm font-semibold', {
                        'text-gray-100': isDark,
                        'text-gray-800': !isDark,
                    })}
                >
                    {title}
                </h3>
                {description && (
                    <p
                        className={cn('text-xs mt-0.5 leading-relaxed', {
                            'text-gray-500': isDark,
                            'text-gray-400': !isDark,
                        })}
                    >
                        {description}
                    </p>
                )}
            </div>

            <div
                className={cn('p-4 md:p-8', {
                    'bg-[#080a0f]': isDark,
                    'bg-gray-50': !isDark,
                    'flex items-center justify-center min-h-50': centered,
                })}
            >
                {children}
            </div>
        </div>
    );
};
