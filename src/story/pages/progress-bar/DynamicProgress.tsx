import React, { useEffect, useState } from 'react';
import { ProgressBar } from '../../../components';
import { ComponentDemo } from '../../ComponentDemo';

const DynamicProgress: React.FC = () => {
    const [value, setValue] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setValue((prev) => (prev >= 100 ? 0 : prev + 2));
        }, 100);
        return () => clearInterval(interval);
    }, []);

    return (
        <ComponentDemo title="Animated Progress" description="Live updating progress bar" centered={false}>
            <div className="space-y-5 w-full p-2">
                <ProgressBar value={value} showValue label="Uploading..." variant="primary" layout="animated" size="lg" />
                <ProgressBar value={value} showValue label="Compiling..." variant="success" layout="rounded" />
            </div>
        </ComponentDemo>
    );
};

export default DynamicProgress;
