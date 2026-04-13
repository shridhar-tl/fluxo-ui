import cn from 'classnames';
import React from 'react';
import { useStoryTheme } from '../../StoryThemeContext';

const UsageNotes: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <div
            className={cn('rounded-lg p-6 space-y-4', {
                'bg-gray-800 text-gray-300': isDark,
                'bg-gray-100 text-gray-700': !isDark,
            })}
        >
            <div>
                <h3 className={cn('font-semibold mb-2', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    ListItem Structure
                </h3>
                <p className="text-sm">
                    Each item in the{' '}
                    <code
                        className={cn('px-2 py-1 rounded', {
                            'text-primary-400 bg-gray-900': isDark,
                            'text-primary-700 bg-gray-200': !isDark,
                        })}
                    >
                        items
                    </code>{' '}
                    array should have:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2 text-sm space-y-1">
                    <li>
                        <code className="text-primary-400">value</code>: The value to use when selected
                    </li>
                    <li>
                        <code className="text-primary-400">label</code>: The display text
                    </li>
                    <li>
                        <code className="text-primary-400">disabled</code>: (optional) Disable this specific item
                    </li>
                    <li>
                        <code className="text-primary-400">icon</code>: (optional) Icon component or element to display
                    </li>
                </ul>
            </div>
            <div>
                <h3 className={cn('font-semibold mb-2', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Multiple Selection
                </h3>
                <p className="text-sm">
                    When{' '}
                    <code
                        className={cn('px-2 py-1 rounded', {
                            'text-primary-400 bg-gray-900': isDark,
                            'text-primary-700 bg-gray-200': !isDark,
                        })}
                    >
                        multiple={'{true}'}
                    </code>
                    , the value prop should be an array of selected values. Users can select/deselect multiple items.
                </p>
            </div>
            <div>
                <h3 className={cn('font-semibold mb-2', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Hidden Input</h3>
                <p className="text-sm">
                    SelectButton includes a hidden input field for form submissions. The{' '}
                    <code
                        className={cn('px-2 py-1 rounded', {
                            'text-primary-400 bg-gray-900': isDark,
                            'text-primary-700 bg-gray-200': !isDark,
                        })}
                    >
                        name
                    </code>{' '}
                    prop sets the input's name attribute. For multiple selection, values are comma-separated.
                </p>
            </div>
            <div>
                <h3 className={cn('font-semibold mb-2', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Accessibility</h3>
                <p className="text-sm">
                    The component uses proper ARIA attributes (
                    <code
                        className={cn('px-2 py-1 rounded', {
                            'text-primary-400 bg-gray-900': isDark,
                            'text-primary-700 bg-gray-200': !isDark,
                        })}
                    >
                        role="group"
                    </code>
                    ,
                    <code
                        className={cn('px-2 py-1 rounded ml-1', {
                            'text-primary-400 bg-gray-900': isDark,
                            'text-primary-700 bg-gray-200': !isDark,
                        })}
                    >
                        aria-pressed
                    </code>
                    ) for screen reader support.
                </p>
            </div>
        </div>
    );
};

export default UsageNotes;
