import React from 'react';
import { ProgressBar } from '../../../components';
import { ComponentDemo } from '../../ComponentDemo';

const Sizes: React.FC = () => (
    <ComponentDemo title="Size Options" description="Five size options from extra small to extra large" centered={false}>
        <div className="space-y-5 w-full p-2">
            <ProgressBar value={60} size="xs" showValue label="Extra Small" />
            <ProgressBar value={60} size="sm" showValue label="Small" />
            <ProgressBar value={60} size="md" showValue label="Medium" />
            <ProgressBar value={60} size="lg" showValue label="Large" />
            <ProgressBar value={60} size="xl" showValue label="Extra Large" />
        </div>
    </ComponentDemo>
);

export default Sizes;
