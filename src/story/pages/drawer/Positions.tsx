import React, { useState } from 'react';
import type { DrawerPosition } from '../../../components';
import { Button, Drawer } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `import { Drawer } from 'fluxo-ui';
import type { DrawerPosition } from 'fluxo-ui';

<Drawer open={open} onClose={close} position="left" header="Left Drawer">
  ...
</Drawer>

<Drawer open={open} onClose={close} position="top" header="Top Drawer" size="300px">
  ...
</Drawer>

<Drawer open={open} onClose={close} position="bottom" header="Bottom Drawer" size="300px">
  ...
</Drawer>`;

const positions: { label: string; position: DrawerPosition; size?: string }[] = [
    { label: 'Left', position: 'left' },
    { label: 'Right', position: 'right' },
    { label: 'Top', position: 'top', size: '300px' },
    { label: 'Bottom', position: 'bottom', size: '300px' },
];

const Positions: React.FC = () => {
    const [activePosition, setActivePosition] = useState<DrawerPosition | null>(null);

    return (
        <>
            <ComponentDemo title="Drawer Positions" description="Drawers can slide in from any edge: left, right, top, or bottom.">
                <div className="flex flex-wrap gap-3">
                    {positions.map(({ label, position }) => (
                        <Button key={position} variant="primary" layout="outlined" onClick={() => setActivePosition(position)}>
                            {label}
                        </Button>
                    ))}
                </div>
            </ComponentDemo>
            {positions.map(({ position, size }) => (
                <Drawer
                    key={position}
                    open={activePosition === position}
                    onClose={() => setActivePosition(null)}
                    position={position}
                    size={size || '400px'}
                    header={`${position.charAt(0).toUpperCase() + position.slice(1)} Drawer`}
                >
                    <p>
                        This drawer slides in from the <strong>{position}</strong> edge of the screen.
                    </p>
                </Drawer>
            ))}
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default Positions;
