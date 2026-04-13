import React, { useState } from 'react';
import type { MenuNavSize } from '../../../components';
import { MenuNav } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { basicMenuItems } from './menu-nav-story-data';

const code = `import { MenuNav } from 'fluxo-ui';

<MenuNav items={items} size="xs" />
<MenuNav items={items} size="sm" />
<MenuNav items={items} size="md" />
<MenuNav items={items} size="lg" />
<MenuNav items={items} size="xl" />`;

const sizes: { label: string; value: MenuNavSize }[] = [
    { label: 'Extra Small (xs)', value: 'xs' },
    { label: 'Small (sm)', value: 'sm' },
    { label: 'Medium (md)', value: 'md' },
    { label: 'Large (lg)', value: 'lg' },
    { label: 'Extra Large (xl)', value: 'xl' },
];

const Sizes: React.FC = () => {
    const [selectedIds, setSelectedIds] = useState<Record<string, string>>({
        xs: 'home',
        sm: 'home',
        md: 'home',
        lg: 'home',
        xl: 'home',
    });

    return (
        <>
            <ComponentDemo
                title="Size Variants"
                description="The menu supports five size options from extra small to extra large."
                centered={false}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
                    {sizes.map(({ label, value }) => (
                        <div key={value}>
                            <p className="text-xs font-semibold mb-2 opacity-70">{label}</p>
                            <MenuNav
                                items={basicMenuItems}
                                size={value}
                                selectedId={selectedIds[value]}
                                onSelect={(id) => setSelectedIds((prev) => ({ ...prev, [value]: id }))}
                            />
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

export default Sizes;
