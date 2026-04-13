import React from 'react';
import { useStoryTheme } from '../../StoryThemeContext';

const DarkModeSection: React.FC = () => {
    const { isDark } = useStoryTheme();

    const mutedText = isDark ? 'text-gray-400' : 'text-gray-500';
    const headingText = isDark ? 'text-gray-100' : 'text-gray-900';

    return (
        <div className={`rounded-xl border p-5 space-y-3 ${isDark ? 'border-white/8 bg-[#0d0f14]' : 'border-gray-200 bg-white'}`}>
            <div className="flex gap-6 text-sm flex-wrap">
                <div className="space-y-1">
                    <div className={`text-xs font-medium ${mutedText}`}>Light mode</div>
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded border border-gray-200 bg-white shadow-sm" />
                        <span className={headingText}>Tooltip background</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded bg-black opacity-80" />
                        <span className={headingText}>Overlay (80% black)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded border-2 border-dashed border-yellow-500" />
                        <span className={headingText}>Highlight border</span>
                    </div>
                </div>
                <div className="space-y-1">
                    <div className={`text-xs font-medium ${mutedText}`}>Dark mode</div>
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded border border-gray-600 bg-gray-800" />
                        <span className={headingText}>Tooltip background</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded bg-gray-500 opacity-60" />
                        <span className={headingText}>Overlay (60% gray)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded border-2 border-dashed border-yellow-300" />
                        <span className={headingText}>Highlight border</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DarkModeSection;
