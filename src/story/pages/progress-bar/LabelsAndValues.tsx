import React from 'react';
import { ProgressBar } from '../../../components';
import { ComponentDemo } from '../../ComponentDemo';

const LabelsAndValues: React.FC = () => (
    <ComponentDemo title="Labels & Custom Templates" description="Progress bars with labels and custom value templates" centered={false}>
        <div className="space-y-5 w-full p-2">
            <ProgressBar value={45} showValue label="Default Value" />
            <ProgressBar value={750} max={1000} showValue valueTemplate="{value} / {max} MB" label="Storage Used" sublabel="Free tier" />
            <ProgressBar value={3} max={5} showValue valueTemplate={(v, m) => <span><strong>{v}</strong> of {m} tasks</span>} label="Tasks Completed" />
            <ProgressBar value={88} showValue valueTemplate="{percent}% complete" label="Project Alpha" variant="success" />
        </div>
    </ComponentDemo>
);

export default LabelsAndValues;
