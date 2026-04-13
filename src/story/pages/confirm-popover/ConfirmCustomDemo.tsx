import React from 'react';
import { Button, Confirm } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const placements = ['topLeft', 'top', 'topRight', 'left', 'right', 'bottomLeft', 'bottom', 'bottomRight'] as const;

const code = `Confirm.confirm(
  e.currentTarget as HTMLElement,
  'Submit the form? All data will be saved.',
  () => handleSubmit(),
  undefined,
  { title: 'Submit Form', confirmText: 'Submit', cancelText: 'Not yet', placement: 'topLeft' }
);`;

const ConfirmCustomDemo: React.FC = () => {
    return (
        <>
            <ComponentDemo title="Placement options" description="Click each button to see the popover in that position.">
                <div className="flex gap-3 flex-wrap justify-center">
                    {placements.map((placement) => (
                        <Button
                            key={placement}
                            variant="primary"
                            size="sm"
                            onClick={(e) => {
                                Confirm.confirm(
                                    e.currentTarget as HTMLElement,
                                    'Submit the form? All data will be saved.',
                                    () => console.log('Confirmed'),
                                    undefined,
                                    { title: 'Submit Form', confirmText: 'Submit', cancelText: 'Not yet', placement }
                                );
                            }}
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

export default ConfirmCustomDemo;
