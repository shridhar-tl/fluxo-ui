import React from 'react';
import { ProgressBar } from '../../../components';
import { ComponentDemo } from '../../ComponentDemo';

const Indeterminate: React.FC = () => (
    <ComponentDemo title="Indeterminate Mode" description="For when progress duration is unknown" centered={false}>
        <div className="space-y-5 w-full p-2">
            <ProgressBar value={0} indeterminate variant="primary" label="Loading data..." />
            <ProgressBar value={0} indeterminate variant="info" label="Processing..." size="sm" />
            <ProgressBar value={0} indeterminate variant="success" label="Syncing..." layout="rounded" />
        </div>
    </ComponentDemo>
);

export default Indeterminate;
