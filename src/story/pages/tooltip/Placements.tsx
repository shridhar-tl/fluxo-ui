import React from 'react';
import { Button, showTooltip, hideTooltip } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const placements = ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'] as const;

const code = `showTooltip(e, { content: 'Tooltip text', placement: 'topLeft' });
showTooltip(e, { content: 'Tooltip text', placement: 'topRight' });
showTooltip(e, { content: 'Tooltip text', placement: 'bottomLeft' });
showTooltip(e, { content: 'Tooltip text', placement: 'bottomRight' });
showTooltip(e, { content: 'Tooltip text', placement: 'auto' }); // default`;

const Placements: React.FC = () => {
    return (
        <>
            <ComponentDemo title="All placement options" description="Hover each button to see the tooltip in that position.">
                <div className="flex flex-wrap gap-4 justify-center py-4">
                    {placements.map((placement) => (
                        <Button
                            key={placement}
                            size="sm"
                            onMouseEnter={(e) =>
                                showTooltip(e, { content: `Placement: ${placement}`, placement })
                            }
                            onMouseLeave={() => hideTooltip({ timeout: 0 })}
                        >
                            {placement}
                        </Button>
                    ))}
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default Placements;
