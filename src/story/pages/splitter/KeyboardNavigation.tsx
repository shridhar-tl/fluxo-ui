import cn from 'classnames';
import React from 'react';
import { useStoryTheme } from '../../StoryThemeContext';

const keyboardRows = [
    { key: '← / →', action: 'Move gutter left / right by 20px (horizontal layout)' },
    { key: '↑ / ↓', action: 'Move gutter up / down by 20px (vertical layout)' },
    { key: 'Tab', action: 'Focus the gutter from the page tab order' },
];

const KeyboardNavigation: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <div
            className={cn('rounded-lg border overflow-hidden text-sm', {
                'border-white/10 bg-white/4': isDark,
                'border-gray-200 bg-white': !isDark,
            })}
        >
            <table className="w-full">
                <thead>
                    <tr
                        className={cn('text-xs font-semibold uppercase tracking-wider', {
                            'bg-white/6 text-gray-500': isDark,
                            'bg-gray-50 text-gray-500': !isDark,
                        })}
                    >
                        <th className="px-4 py-2 text-left">Key</th>
                        <th className="px-4 py-2 text-left">Action</th>
                    </tr>
                </thead>
                <tbody className={cn('divide-y', { 'divide-white/6': isDark, 'divide-gray-100': !isDark })}>
                    {keyboardRows.map((row) => (
                        <tr key={row.key} className={cn({ 'text-gray-300': isDark, 'text-gray-700': !isDark })}>
                            <td className="px-4 py-2 font-mono font-medium">{row.key}</td>
                            <td className="px-4 py-2">{row.action}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default KeyboardNavigation;
