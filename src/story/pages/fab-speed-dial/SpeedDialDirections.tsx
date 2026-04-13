import cn from 'classnames';
import React from 'react';
import { SpeedDial } from '../../../components';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';
import { PencilIcon, ShareIcon, PrintIcon, CopyIcon } from './fab-story-icons';

const actions = [
    { icon: CopyIcon, label: 'Copy' },
    { icon: PrintIcon, label: 'Print' },
    { icon: ShareIcon, label: 'Share' },
    { icon: PencilIcon, label: 'Edit' },
];

const SpeedDialDirections: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <ComponentDemo title="Directions" description="Speed dial opens in up, down, left, or right direction" centered={false}>
            <div className="w-full grid grid-cols-2 gap-8 p-4">
                <div className="flex flex-col items-center">
                    <p className={cn('text-sm mb-2 font-medium', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>Up</p>
                    <div className="relative h-48 w-full flex items-end justify-center">
                        <SpeedDial items={actions} direction="up" />
                    </div>
                </div>
                <div className="flex flex-col items-center">
                    <p className={cn('text-sm mb-2 font-medium', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>Down</p>
                    <div className="relative h-48 w-full flex items-start justify-center">
                        <SpeedDial items={actions} direction="down" />
                    </div>
                </div>
                <div className="flex flex-col items-center">
                    <p className={cn('text-sm mb-2 font-medium', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>Left</p>
                    <div className="relative h-24 w-full flex items-center justify-end pr-4">
                        <SpeedDial items={actions} direction="left" showLabels={false} />
                    </div>
                </div>
                <div className="flex flex-col items-center">
                    <p className={cn('text-sm mb-2 font-medium', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>Right</p>
                    <div className="relative h-24 w-full flex items-center justify-start pl-4">
                        <SpeedDial items={actions} direction="right" showLabels={false} />
                    </div>
                </div>
            </div>
        </ComponentDemo>
    );
};

export default SpeedDialDirections;
