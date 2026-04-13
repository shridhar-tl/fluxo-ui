import React from 'react';
import { Button, showSnackbar } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const positions = ['topLeft', 'topCenter', 'topRight', 'bottomLeft', 'bottomCenter', 'bottomRight'] as const;

const code = `showSnackbar('Saved!', 'Success', { type: 'success', position: 'topRight' });`;

const PositionsDemo: React.FC = () => {
    return (
        <>
            <ComponentDemo title="Screen positions" description="Click a position to see the snackbar appear there.">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {positions.map((position) => (
                        <Button
                            key={position}
                            variant="secondary"
                            layout="outlined"
                            size="sm"
                            onClick={() => {
                                showSnackbar(`Placed at ${position}`, 'Position Demo', { position, type: 'info' });
                            }}
                        >
                            {position}
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

export default PositionsDemo;
