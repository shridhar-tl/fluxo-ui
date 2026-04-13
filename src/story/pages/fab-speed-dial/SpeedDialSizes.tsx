import React from 'react';
import { SpeedDial } from '../../../components';
import { ComponentDemo } from '../../ComponentDemo';
import { PencilIcon, ShareIcon, CopyIcon } from './fab-story-icons';

const actions = [
    { icon: CopyIcon, label: 'Copy' },
    { icon: ShareIcon, label: 'Share' },
    { icon: PencilIcon, label: 'Edit' },
];

const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

const SpeedDialSizes: React.FC = () => (
    <ComponentDemo title="Size Options" description="Five sizes from xs to xl">
        <div className="flex items-end gap-6 flex-wrap h-40">
            {sizes.map((s) => (
                <div key={s} className="relative flex flex-col items-center gap-2">
                    <SpeedDial items={actions} size={s} direction="up" showLabels={false} />
                    <span className="text-xs uppercase mt-1 opacity-60">{s}</span>
                </div>
            ))}
        </div>
    </ComponentDemo>
);

export default SpeedDialSizes;
