import React from 'react';
import { ProgressBar } from '../../../components';
import { ComponentDemo } from '../../ComponentDemo';

const MultiSegment: React.FC = () => (
    <ComponentDemo title="Multi-Segment Progress" description="Stacked segments representing multiple values" centered={false}>
        <div className="space-y-5 w-full p-2">
            <ProgressBar
                value={0}
                multipleValues={[
                    { value: 35, variant: 'success', label: 'Passed' },
                    { value: 15, variant: 'warning', label: 'Pending' },
                    { value: 10, variant: 'danger', label: 'Failed' },
                ]}
                label="Test Results"
                showValue
                valueTemplate="60 / 100 tests"
                size="lg"
            />
            <ProgressBar
                value={0}
                multipleValues={[
                    { value: 40, variant: 'primary', label: 'Used' },
                    { value: 20, variant: 'info', label: 'Cached' },
                ]}
                label="Disk Space"
                showValue
                valueTemplate="60 GB / 100 GB"
                layout="rounded"
            />
        </div>
    </ComponentDemo>
);

export default MultiSegment;
