import React from 'react';
import { SpeedDial } from '../../../components';
import { ComponentDemo } from '../../ComponentDemo';
import { PencilIcon, ShareIcon, PrintIcon, CopyIcon } from './fab-story-icons';

const actions = [
    { icon: CopyIcon, label: 'Copy' },
    { icon: PrintIcon, label: 'Print' },
    { icon: ShareIcon, label: 'Share' },
    { icon: PencilIcon, label: 'Edit' },
];

const variants = ['primary', 'success', 'warning', 'danger', 'info', 'secondary', 'default'] as const;

const SpeedDialVariants: React.FC = () => (
    <ComponentDemo title="Trigger Variants" description="Different color themes for the speed dial trigger">
        <div className="flex items-end gap-6 flex-wrap h-48">
            {variants.map((v) => (
                <div key={v} className="relative flex flex-col items-center gap-2">
                    <SpeedDial items={actions} variant={v} direction="up" showLabels={false} />
                    <span className="text-xs capitalize mt-1 opacity-60">{v}</span>
                </div>
            ))}
        </div>
    </ComponentDemo>
);

export default SpeedDialVariants;
