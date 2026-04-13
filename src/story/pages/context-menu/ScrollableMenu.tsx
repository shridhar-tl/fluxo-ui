import React from 'react';
import { showContextMenu } from '../../../components';
import { ComponentDemo } from '../../ComponentDemo';
import { longMenuItems } from './context-menu-story-data';

const ScrollableMenu: React.FC = () => {
    return (
        <ComponentDemo
            title="Scrollable menu"
            description="Right-click to open a long menu. Hover near the top or bottom arrow to scroll without a scrollbar."
        >
            <div
                onContextMenu={(e) => showContextMenu(e, longMenuItems)}
                className="w-full h-40 rounded-lg border-2 border-dashed border-purple-500 dark:border-purple-700 flex items-center justify-center text-gray-500 dark:text-gray-400 select-none cursor-context-menu hover:border-purple-400 dark:hover:border-purple-500 transition-colors"
            >
                Right-click for long scrollable menu
            </div>
        </ComponentDemo>
    );
};

export default ScrollableMenu;
