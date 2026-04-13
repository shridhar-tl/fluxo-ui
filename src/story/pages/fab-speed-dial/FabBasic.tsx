import React from 'react';
import { Fab } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { PlusIcon, PencilIcon, HeartIcon } from './fab-story-icons';

const code = `import { Fab } from 'ether-ui';

<Fab icon={PlusIcon} variant="primary" onClick={() => console.log('clicked')} />
<Fab icon={PencilIcon} variant="success" />
<Fab icon={HeartIcon} variant="danger" />`;

const FabBasic: React.FC = () => (
    <>
        <ComponentDemo title="Basic FAB" description="Floating action buttons with different variants">
            <div className="flex items-center gap-4 flex-wrap">
                <Fab icon={PlusIcon} variant="primary" onClick={() => console.log('clicked')} />
                <Fab icon={PencilIcon} variant="success" />
                <Fab icon={HeartIcon} variant="danger" />
                <Fab icon={PlusIcon} variant="warning" />
                <Fab icon={PlusIcon} variant="info" />
                <Fab icon={PlusIcon} variant="secondary" />
                <Fab icon={PlusIcon} variant="default" />
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default FabBasic;
