import cn from 'classnames';
import React from 'react';
import { useStoryTheme } from '../../StoryThemeContext';

const keyboardRows = [
    { key: 'Any valid char', behaviour: 'Insert into the current editable slot and advance cursor' },
    { key: 'Backspace', behaviour: 'Clear the slot to the left of the cursor' },
    { key: 'Delete', behaviour: 'Clear the slot under the cursor' },
    { key: '← / →', behaviour: 'Jump to previous / next editable slot' },
    { key: 'Home', behaviour: 'Jump to the first editable slot' },
    { key: 'End', behaviour: 'Jump to the slot after the last filled character' },
    { key: 'Tab', behaviour: 'Default browser tab-focus behaviour (not intercepted)' },
    { key: 'Paste', behaviour: 'Insert pasted text character-by-character, skipping non-matching chars' },
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
                    <tr className={cn('text-xs font-semibold uppercase tracking-wider', {
                        'bg-white/6 text-gray-500': isDark,
                        'bg-gray-50 text-gray-500': !isDark,
                    })}>
                        <th className="px-4 py-2 text-left">Key</th>
                        <th className="px-4 py-2 text-left">Behaviour</th>
                    </tr>
                </thead>
                <tbody className={cn('divide-y', { 'divide-white/6': isDark, 'divide-gray-100': !isDark })}>
                    {keyboardRows.map((row) => (
                        <tr key={row.key} className={cn({ 'text-gray-300': isDark, 'text-gray-700': !isDark })}>
                            <td className="px-4 py-2 font-mono font-medium">{row.key}</td>
                            <td className="px-4 py-2">{row.behaviour}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default KeyboardNavigation;
