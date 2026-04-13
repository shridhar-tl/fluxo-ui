import React from 'react';
import { ShimmerBarChart } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const ShimmerBarChartDemo: React.FC = () => {
    return (
        <>
            <ComponentDemo title="Bar chart skeleton" description="Skeleton for bar chart visualizations while data loads.">
                <div className="w-full">
                    <ShimmerBarChart count={7} legendsCount={4} />
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock
                    code={`import { ShimmerBarChart } from 'ether-ui';

{isLoading && <ShimmerBarChart bars={7} showXAxis showYAxis />}
{!isLoading && <BarChart data={chartData} />}`}
                />
            </div>
        </>
    );
};

export default ShimmerBarChartDemo;
