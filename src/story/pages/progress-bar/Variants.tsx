import React from 'react';
import { ProgressBar } from '../../../components';
import { ComponentDemo } from '../../ComponentDemo';

const Variants: React.FC = () => (
    <ComponentDemo title="Color Variants" description="All available color variants" centered={false}>
        <div className="space-y-5 w-full p-2">
            <ProgressBar value={70} variant="default" showValue label="Default" />
            <ProgressBar value={70} variant="primary" showValue label="Primary" />
            <ProgressBar value={70} variant="success" showValue label="Success" />
            <ProgressBar value={70} variant="warning" showValue label="Warning" />
            <ProgressBar value={70} variant="danger" showValue label="Danger" />
            <ProgressBar value={70} variant="info" showValue label="Info" />
        </div>
    </ComponentDemo>
);

export default Variants;
