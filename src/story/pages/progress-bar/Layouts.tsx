import React from 'react';
import { ProgressBar } from '../../../components';
import { ComponentDemo } from '../../ComponentDemo';

const Layouts: React.FC = () => (
    <ComponentDemo title="Layout Styles" description="Different visual styles for the progress bar" centered={false}>
        <div className="space-y-5 w-full p-2">
            <ProgressBar value={65} layout="default" showValue label="Default" />
            <ProgressBar value={65} layout="rounded" showValue label="Rounded" />
            <ProgressBar value={65} layout="sharp" showValue label="Sharp" />
            <ProgressBar value={65} layout="striped" showValue label="Striped" />
            <ProgressBar value={65} layout="animated" showValue label="Animated Striped" />
        </div>
    </ComponentDemo>
);

export default Layouts;
