import React, { useEffect, useState } from 'react';
import { ProgressBar } from '../../../components';
import { ComponentDemo } from '../../ComponentDemo';

const BufferProgress: React.FC = () => {
    const [value, setValue] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setValue((prev) => (prev >= 100 ? 0 : prev + 2));
        }, 100);
        return () => clearInterval(interval);
    }, []);

    return (
        <ComponentDemo title="Buffered Progress" description="Progress with buffer indicator for streaming content" centered={false}>
            <div className="space-y-5 w-full p-2">
                <ProgressBar value={35} buffer={60} showValue label="Video Playback" variant="info" />
                <ProgressBar value={value} buffer={Math.min(value + 20, 100)} showValue label="Streaming" variant="primary" layout="rounded" />
            </div>
        </ComponentDemo>
    );
};

export default BufferProgress;
