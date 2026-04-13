import React from 'react';
import { Button, showSnackbar } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const types = ['info', 'success', 'warning', 'error'] as const;

const code = `showSnackbar('Saved successfully.', 'Success', {
  type: 'success',
  lightBg: true,
});`;

const LightBackground: React.FC = () => {
    return (
        <>
            <ComponentDemo title="Light background" description="Use lightBg for a softer appearance on light-themed UIs.">
                <div className="flex gap-3 flex-wrap">
                    {types.map((type) => (
                        <Button
                            key={type}
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                                showSnackbar(`Light ${type} notification`, type.charAt(0).toUpperCase() + type.slice(1), {
                                    type,
                                    lightBg: true,
                                });
                            }}
                        >
                            Light {type}
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

export default LightBackground;
