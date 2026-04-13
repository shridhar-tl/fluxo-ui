import cn from 'classnames';
import React from 'react';
import { useStoryTheme } from './StoryThemeContext';

interface PropDefinition {
    type: string;
    default?: unknown;
    required?: boolean;
    description: string;
}

interface PropsTableProps {
    props: Record<string, PropDefinition>;
    className?: string;
}

const formatDefault = (value: unknown): string => {
    if (typeof value === 'string') return `"${value}"`;
    return String(value);
};

export const PropsTable: React.FC<PropsTableProps> = ({ props, className = '' }) => {
    const { isDark } = useStoryTheme();
    const entries = Object.entries(props);

    return (
        <div
            className={cn(
                'overflow-hidden rounded-xl border',
                {
                    'border-white/8 bg-[#0d0f14]': isDark,
                    'border-gray-200 bg-white shadow-sm': !isDark,
                },
                className
            )}
        >
            <div
                className={cn('hidden md:grid px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest border-b', {
                    'bg-white/3 border-white/8 text-gray-600': isDark,
                    'bg-gray-50 border-gray-200 text-gray-400': !isDark,
                })}
                style={{ gridTemplateColumns: '180px 160px 130px 1fr' }}
            >
                <span>Property</span>
                <span>Type</span>
                <span>Default</span>
                <span>Description</span>
            </div>

            <div>
                {entries.map(([propName, propDef], index) => (
                    <div
                        key={propName}
                        className={cn('transition-colors', {
                            'hover:bg-white/3': isDark,
                            'hover:bg-gray-50': !isDark,
                            'border-t border-white/5': isDark && index > 0,
                            'border-t border-gray-100': !isDark && index > 0,
                        })}
                    >
                        <div
                            className="hidden md:grid px-4 py-3 items-start"
                            style={{ gridTemplateColumns: '180px 160px 130px 1fr' }}
                        >
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <code
                                    className={cn('text-xs font-mono px-1.5 py-0.5 rounded', {
                                        'bg-indigo-500/15 text-indigo-300': isDark,
                                        'bg-indigo-50 text-indigo-700': !isDark,
                                    })}
                                >
                                    {propName}
                                </code>
                                {propDef.required && (
                                    <span
                                        className={cn('text-[10px] font-medium px-1 py-0.5 rounded', {
                                            'bg-red-500/15 text-red-400': isDark,
                                            'bg-red-50 text-red-600': !isDark,
                                        })}
                                    >
                                        req
                                    </span>
                                )}
                            </div>

                            <div>
                                <code
                                    className={cn('text-xs font-mono px-1.5 py-0.5 rounded', {
                                        'bg-emerald-500/10 text-emerald-400': isDark,
                                        'bg-emerald-50 text-emerald-700': !isDark,
                                    })}
                                >
                                    {propDef.type}
                                </code>
                            </div>

                            <div>
                                {propDef.default !== undefined ? (
                                    <code
                                        className={cn('text-xs font-mono px-1.5 py-0.5 rounded', {
                                            'bg-amber-500/10 text-amber-400': isDark,
                                            'bg-amber-50 text-amber-700': !isDark,
                                        })}
                                    >
                                        {formatDefault(propDef.default)}
                                    </code>
                                ) : (
                                    <span
                                        className={cn('text-xs', {
                                            'text-gray-700': isDark,
                                            'text-gray-300': !isDark,
                                        })}
                                    >
                                        —
                                    </span>
                                )}
                            </div>

                            <p
                                className={cn('text-xs leading-relaxed', {
                                    'text-gray-400': isDark,
                                    'text-gray-500': !isDark,
                                })}
                            >
                                {propDef.description}
                            </p>
                        </div>

                        <div className="md:hidden px-4 py-3 space-y-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <code
                                    className={cn('text-xs font-mono px-1.5 py-0.5 rounded', {
                                        'bg-indigo-500/15 text-indigo-300': isDark,
                                        'bg-indigo-50 text-indigo-700': !isDark,
                                    })}
                                >
                                    {propName}
                                </code>
                                {propDef.required && (
                                    <span
                                        className={cn('text-[10px] font-medium px-1 py-0.5 rounded', {
                                            'bg-red-500/15 text-red-400': isDark,
                                            'bg-red-50 text-red-600': !isDark,
                                        })}
                                    >
                                        req
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <code
                                    className={cn('text-xs font-mono px-1.5 py-0.5 rounded', {
                                        'bg-emerald-500/10 text-emerald-400': isDark,
                                        'bg-emerald-50 text-emerald-700': !isDark,
                                    })}
                                >
                                    {propDef.type}
                                </code>
                                {propDef.default !== undefined && (
                                    <code
                                        className={cn('text-xs font-mono px-1.5 py-0.5 rounded', {
                                            'bg-amber-500/10 text-amber-400': isDark,
                                            'bg-amber-50 text-amber-700': !isDark,
                                        })}
                                    >
                                        {formatDefault(propDef.default)}
                                    </code>
                                )}
                            </div>
                            <p
                                className={cn('text-xs leading-relaxed', {
                                    'text-gray-400': isDark,
                                    'text-gray-500': !isDark,
                                })}
                            >
                                {propDef.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
