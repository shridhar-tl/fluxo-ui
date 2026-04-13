import React, { useState } from 'react';
import { MenuNav } from '../../../components';
import type { MenuNavSelectionStyle } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { basicMenuItems } from './menu-nav-story-data';

const code = `import { MenuNav } from 'ether-ui';
import type { MenuNavSelectionStyle } from 'ether-ui';

<MenuNav
  items={items}
  selectionStyle="border-left"
  selectedId={selectedId}
  onSelect={(id) => setSelectedId(id)}
/>

<MenuNav
  items={items}
  selectionStyle="background"
  selectedId={selectedId}
  onSelect={(id) => setSelectedId(id)}
/>

<MenuNav
  items={items}
  selectionStyle="arrow"
  selectedId={selectedId}
  onSelect={(id) => setSelectedId(id)}
/>

<MenuNav
  items={items}
  selectionStyle="highlight"
  selectedId={selectedId}
  onSelect={(id) => setSelectedId(id)}
/>`;

const selectionStyles: { label: string; value: MenuNavSelectionStyle }[] = [
    { label: 'Border Left', value: 'border-left' },
    { label: 'Border Bottom', value: 'border-bottom' },
    { label: 'Background', value: 'background' },
    { label: 'Arrow', value: 'arrow' },
    { label: 'Highlight', value: 'highlight' },
];

const SelectionStyles: React.FC = () => {
    const [selectedIds, setSelectedIds] = useState<Record<string, string>>({
        'border-left': 'home',
        'border-bottom': 'home',
        'background': 'home',
        'arrow': 'home',
        'highlight': 'home',
    });

    return (
        <>
            <ComponentDemo title="Selection Styles" description="Five different visual styles for the selected menu item." centered={false}>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
                    {selectionStyles.map(({ label, value }) => (
                        <div key={value}>
                            <p className="text-xs font-semibold mb-2 opacity-70">{label}</p>
                            <div className="w-full">
                                <MenuNav
                                    items={basicMenuItems}
                                    selectionStyle={value}
                                    selectedId={selectedIds[value]}
                                    onSelect={(id) => setSelectedIds((prev) => ({ ...prev, [value]: id }))}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default SelectionStyles;
