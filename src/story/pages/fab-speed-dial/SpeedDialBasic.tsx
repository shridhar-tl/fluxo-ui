import React from 'react';
import { SpeedDial } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { CopyIcon, PencilIcon, PrintIcon, ShareIcon } from './fab-story-icons';

const code = `import { SpeedDial } from 'fluxo-ui';

const actions = [
  { icon: CopyIcon, label: 'Copy', onClick: () => console.log('copy') },
  { icon: PrintIcon, label: 'Print', onClick: () => console.log('print') },
  { icon: ShareIcon, label: 'Share', onClick: () => console.log('share') },
  { icon: PencilIcon, label: 'Edit', onClick: () => console.log('edit') },
];

<SpeedDial items={actions} />`;

const actions = [
    { icon: CopyIcon, label: 'Copy', onClick: () => console.log('copy') },
    { icon: PrintIcon, label: 'Print', onClick: () => console.log('print') },
    { icon: ShareIcon, label: 'Share', onClick: () => console.log('share') },
    { icon: PencilIcon, label: 'Edit', onClick: () => console.log('edit') },
];

const SpeedDialBasic: React.FC = () => (
    <>
        <ComponentDemo title="Basic Speed Dial" description="Hover over the FAB to reveal action buttons">
            <div className="relative h-40 w-full flex items-end justify-center">
                <SpeedDial items={actions} direction="up" />
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default SpeedDialBasic;
