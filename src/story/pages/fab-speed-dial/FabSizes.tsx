import React from 'react';
import { Fab } from '../../../components';
import { ComponentDemo } from '../../ComponentDemo';
import { PlusIcon } from './fab-story-icons';

const FabSizes: React.FC = () => (
    <ComponentDemo title="FAB Sizes" description="Five size options from extra small to extra large">
        <div className="flex items-center gap-4 flex-wrap">
            <Fab icon={PlusIcon} size="xs" variant="primary" />
            <Fab icon={PlusIcon} size="sm" variant="primary" />
            <Fab icon={PlusIcon} size="md" variant="primary" />
            <Fab icon={PlusIcon} size="lg" variant="primary" />
            <Fab icon={PlusIcon} size="xl" variant="primary" />
        </div>
    </ComponentDemo>
);

export default FabSizes;
