import React from 'react';
import { ShimmerPieChart } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const ShimmerPieChartDemo: React.FC = () => {
    return (
        <>
            <ComponentDemo title="Pie chart skeleton" description="Skeleton for pie chart visualizations with optional legends.">
                <div className="w-full flex justify-center">
                    <ShimmerPieChart legendsCount={4} legendPosition="right" />
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock
                    code={`import { ShimmerPieChart } from 'ether-ui';

{isLoading && <ShimmerPieChart legendsCount={4} legendPosition="right" />}
{!isLoading && <PieChart data={chartData} />}`}
                />
            </div>

            <div className="mt-6">
                <ComponentDemo title="Donut chart skeleton" description="Donut (doughnut) variant with center hole.">
                    <div className="w-full flex justify-center">
                        <ShimmerPieChart doughnut legendsCount={3} legendPosition="bottom" />
                    </div>
                </ComponentDemo>
                <div className="mt-4">
                    <CodeBlock
                        code={`<ShimmerPieChart doughnut legendsCount={3} legendPosition="bottom" />`}
                    />
                </div>
            </div>
        </>
    );
};

export default ShimmerPieChartDemo;
