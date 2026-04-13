import React from 'react';
import { Button, showSnackbar } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const animations = ['slide', 'fade', 'zoom', 'bounce'] as const;

const code = `showSnackbar('Done!', 'Success', { type: 'success', animation: 'bounce' });`;

const AnimationsDemo: React.FC = () => {
    return (
        <>
            <ComponentDemo title="Entry animations" description="Each snackbar supports different entry/exit animations.">
                <div className="flex gap-3 flex-wrap">
                    {animations.map((animation) => (
                        <Button
                            key={animation}
                            variant="primary"
                            layout="outlined"
                            size="sm"
                            onClick={() => {
                                showSnackbar(`Animation: ${animation}`, 'Demo', { type: 'success', animation });
                            }}
                        >
                            {animation}
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

export default AnimationsDemo;
