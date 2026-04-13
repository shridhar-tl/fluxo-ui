import React from 'react';
import { showContextMenu } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { nestedMenuItems } from './context-menu-story-data';

const NestedSubmenus: React.FC = () => {
    return (
        <>
            <ComponentDemo
                title="Sub-menu items"
                description="Right-click to see nested menu items. Hover over 'Export' to reveal sub-options."
            >
                <div
                    onContextMenu={(e) => showContextMenu(e, nestedMenuItems)}
                    className="w-full h-40 rounded-lg border-2 border-dashed border-blue-500 dark:border-blue-700 flex items-center justify-center text-gray-500 dark:text-gray-400 select-none cursor-context-menu hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
                >
                    Right-click for nested menu
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock
                    code={`const menuItems = [
  { label: 'View Details', icon: <InfoIcon /> },
  {
    label: 'Export',
    icon: <DownloadIcon />,
    items: [
      { label: 'Export as CSV', command: () => exportCsv() },
      { label: 'Export as PDF', command: () => exportPdf() },
      { label: 'Export as JSON', command: () => exportJson() },
    ],
  },
  { seperator: true },
  { label: 'Delete', icon: <TrashIcon />, command: () => handleDelete() },
];`}
                />
            </div>
        </>
    );
};

export default NestedSubmenus;
