import cn from 'classnames';
import React from 'react';
import { useStoryTheme } from '../../StoryThemeContext';

const MaskSyntax: React.FC = () => {
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
                        <th className="px-4 py-2 text-left">Character</th>
                        <th className="px-4 py-2 text-left">Accepts</th>
                        <th className="px-4 py-2 text-left">Example slot</th>
                    </tr>
                </thead>
                <tbody className={cn('divide-y', { 'divide-white/6': isDark, 'divide-gray-100': !isDark })}>
                    {[
                        { ch: '9', accepts: 'Digit (0–9)', ex: '5' },
                        { ch: 'a', accepts: 'Letter (a–z, A–Z)', ex: 'B' },
                        { ch: '*', accepts: 'Alphanumeric (a–z, A–Z, 0–9)', ex: 'X3' },
                        { ch: 'other', accepts: 'Fixed literal separator', ex: '-, /, (, ) …' },
                    ].map((row) => (
                        <tr key={row.ch} className={cn({ 'text-gray-300': isDark, 'text-gray-700': !isDark })}>
                            <td className="px-4 py-2 font-mono font-bold">{row.ch}</td>
                            <td className="px-4 py-2">{row.accepts}</td>
                            <td className={cn('px-4 py-2 font-mono', { 'text-gray-500': isDark, 'text-gray-400': !isDark })}>{row.ex}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default MaskSyntax;
