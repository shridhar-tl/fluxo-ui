import cn from 'classnames';
import React from 'react';
import { useStoryTheme } from './StoryThemeContext';

export interface FeatureItem {
    title: string;
    description: string;
    icon?: string;
}

interface FeatureGridProps {
    features: FeatureItem[];
    columns?: 2 | 3;
}

interface FeatureListProps {
    features: FeatureItem[];
}

export const FeatureGrid: React.FC<FeatureGridProps> = ({ features, columns = 3 }) => {
    const { isDark } = useStoryTheme();

    return (
        <div className={cn('grid grid-cols-1 gap-4', {
            'md:grid-cols-2': columns === 2,
            'md:grid-cols-2 lg:grid-cols-3': columns === 3,
        })}>
            {features.map(({ title, description, icon }) => (
                <div
                    key={title}
                    className={cn(
                        'group relative rounded-xl border p-5 transition-all duration-200',
                        'hover:-translate-y-0.5 hover:shadow-lg',
                        {
                            'border-white/6 bg-white/3 hover:border-white/12 hover:bg-white/6': isDark,
                            'border-gray-200 bg-white hover:border-gray-300 hover:shadow-gray-200/60': !isDark,
                        }
                    )}
                >
                    {icon && (
                        <div className={cn(
                            'mb-3 inline-flex items-center justify-center w-9 h-9 rounded-lg',
                            {
                                'bg-indigo-500/10 text-indigo-400': isDark,
                                'bg-indigo-50 text-indigo-600': !isDark,
                            }
                        )}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                            </svg>
                        </div>
                    )}
                    <h3 className={cn('font-semibold text-sm mb-1', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                        {title}
                    </h3>
                    <p className={cn('text-[13px] leading-relaxed', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                        {description}
                    </p>
                </div>
            ))}
        </div>
    );
};

export const FeatureList: React.FC<FeatureListProps> = ({ features }) => {
    const { isDark } = useStoryTheme();

    return (
        <ul className="space-y-3">
            {features.map(({ title, description, icon }) => (
                <li key={title} className="flex items-start gap-3">
                    {icon ? (
                        <span className={cn(
                            'mt-0.5 inline-flex items-center justify-center w-6 h-6 shrink-0 rounded-md',
                            { 'bg-indigo-500/10 text-indigo-400': isDark, 'bg-indigo-50 text-indigo-600': !isDark }
                        )}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                            </svg>
                        </span>
                    ) : (
                        <span className={cn('mt-1.5 w-1.5 h-1.5 shrink-0 rounded-full', { 'bg-indigo-400': isDark, 'bg-indigo-500': !isDark })} />
                    )}
                    <span>
                        <strong className={cn('text-sm font-semibold', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                            {title}:
                        </strong>{' '}
                        <span className={cn('text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                            {description}
                        </span>
                    </span>
                </li>
            ))}
        </ul>
    );
};
