import React from 'react';
import { SpeedDial } from '../../../components';
import { ComponentDemo } from '../../ComponentDemo';
import { PencilIcon, ShareIcon, PrintIcon, CopyIcon, TrashIcon, HeartIcon, BookmarkIcon } from './fab-story-icons';

const actions = [
    { icon: CopyIcon, label: 'Copy' },
    { icon: PrintIcon, label: 'Print' },
    { icon: ShareIcon, label: 'Share' },
    { icon: PencilIcon, label: 'Edit' },
];

const coloredActions = [
    { icon: HeartIcon, label: 'Favorite', variant: 'danger' as const },
    { icon: BookmarkIcon, label: 'Bookmark', variant: 'warning' as const },
    { icon: ShareIcon, label: 'Share', variant: 'info' as const },
    { icon: PencilIcon, label: 'Edit', variant: 'success' as const },
    { icon: TrashIcon, label: 'Delete', variant: 'danger' as const },
];

const SpeedDialClick: React.FC = () => (
    <ComponentDemo title="Click Trigger & Colored Actions" description="Click to toggle, and actions with individual color variants">
        <div className="flex items-end gap-12 flex-wrap h-56">
            <div className="relative flex flex-col items-center gap-2">
                <SpeedDial items={actions} trigger="click" direction="up" />
                <span className="text-xs mt-1 opacity-60">Click trigger</span>
            </div>
            <div className="relative flex flex-col items-center gap-2">
                <SpeedDial items={coloredActions} direction="up" />
                <span className="text-xs mt-1 opacity-60">Colored actions</span>
            </div>
            <div className="relative flex flex-col items-center gap-2">
                <SpeedDial items={actions} trigger="click" mask direction="up" variant="danger" />
                <span className="text-xs mt-1 opacity-60">With mask overlay</span>
            </div>
        </div>
    </ComponentDemo>
);

export default SpeedDialClick;
