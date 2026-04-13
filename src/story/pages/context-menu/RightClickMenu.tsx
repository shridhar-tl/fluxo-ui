import React, { useRef } from 'react';
import { showContextMenu } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { basicMenuItems } from './context-menu-story-data';

const RightClickMenu: React.FC = () => {
    const contextAreaRef = useRef<HTMLDivElement>(null);

    return (
        <>
            <ComponentDemo title="Right-click area" description="Right-click anywhere in the shaded area to open the context menu.">
                <div
                    ref={contextAreaRef}
                    onContextMenu={(e) => showContextMenu(e, basicMenuItems)}
                    className="w-full h-40 rounded-lg border-2 border-dashed border-gray-400 dark:border-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-400 select-none cursor-context-menu hover:border-gray-500 dark:hover:border-gray-500 transition-colors"
                >
                    Right-click here
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock
                    code={`import { showContextMenu } from 'fluxo-ui';

const menuItems = [
  { label: 'Edit', icon: <EditIcon />, command: () => handleEdit() },
  { label: 'Duplicate', icon: <CopyIcon />, command: () => handleDuplicate() },
  { seperator: true },
  { label: 'Delete', icon: <TrashIcon />, command: () => handleDelete() },
];

<div onContextMenu={(e) => showContextMenu(e, menuItems)}>
  Right-click here
</div>`}
                />
            </div>
        </>
    );
};

export default RightClickMenu;
