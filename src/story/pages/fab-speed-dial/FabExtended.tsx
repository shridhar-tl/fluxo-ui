import React from 'react';
import { Fab } from '../../../components';
import { ComponentDemo } from '../../ComponentDemo';
import { PlusIcon, PencilIcon, ShareIcon } from './fab-story-icons';

const FabExtended: React.FC = () => (
    <ComponentDemo title="Extended FAB" description="FAB with icon and label text">
        <div className="flex items-center gap-4 flex-wrap">
            <Fab icon={PlusIcon} label="Create" extended variant="primary" />
            <Fab icon={PencilIcon} label="Edit" extended variant="success" />
            <Fab icon={ShareIcon} label="Share" extended variant="info" />
            <Fab icon={PlusIcon} label="Add Item" extended variant="warning" size="lg" />
        </div>
    </ComponentDemo>
);

export default FabExtended;
