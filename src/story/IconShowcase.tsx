import cn from 'classnames';
import React, { useState } from 'react';
import * as icons from '../assets/icons';
import { useStoryTheme } from './StoryThemeContext';

interface IconShowcaseProps {
    className?: string;
}

export const IconShowcase: React.FC<IconShowcaseProps> = ({ className = '' }) => {
    const { isDark } = useStoryTheme();
    const [copiedIcon, setCopiedIcon] = useState<string | null>(null);

    const handleCopyCode = async (iconName: string) => {
        const code = `<${iconName} className="size-8" />`;
        try {
            await navigator.clipboard.writeText(code);
            setCopiedIcon(iconName);
            setTimeout(() => setCopiedIcon(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const iconEntries = Object.entries(icons);

    return (
        <div className={`p-2 md:p-6 ${className}`}>
            <h2 className={cn('text-xl md:text-2xl font-bold mb-6', { 'text-white': isDark, 'text-gray-900': !isDark })}>Available Icons</h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4">
                {iconEntries.map(([iconName, IconComponent]) => {
                    const isCopied = copiedIcon === iconName;

                    return (
                        <div
                            key={iconName}
                            onClick={() => handleCopyCode(iconName)}
                            className={cn(
                                'group relative flex flex-col items-center p-4 rounded-lg border transition-all duration-200 cursor-pointer',
                                {
                                    'bg-white/4 border-white/8 hover:border-blue-400/50 hover:bg-blue-500/10': isDark,
                                    'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50 shadow-sm': !isDark,
                                }
                            )}
                        >
                            <div
                                className={cn('flex items-center justify-center w-12 h-12 mb-2 transition-colors', {
                                    'text-gray-300 group-hover:text-blue-400': isDark,
                                    'text-gray-700 group-hover:text-blue-600': !isDark,
                                })}
                            >
                                <IconComponent className="size-8" />
                            </div>

                            <span
                                className={cn('text-xs text-center font-medium break-all transition-colors', {
                                    'text-gray-400 group-hover:text-blue-300': isDark,
                                    'text-gray-600 group-hover:text-blue-700': !isDark,
                                })}
                            >
                                {iconName}
                            </span>

                            {isCopied && (
                                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-600 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
                                    Copied!
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {iconEntries.length === 0 && (
                <div className={cn('text-center py-12', { 'text-gray-500': isDark, 'text-gray-400': !isDark })}>
                    <p className="text-lg">No icons found</p>
                    <p className="text-sm">Make sure icons are exported from '../assets/icons'</p>
                </div>
            )}
        </div>
    );
};
