import React from 'react';
import { Button, showSnackbar } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const types = ['info', 'success', 'warning', 'error'] as const;

const code = `showSnackbar('File uploaded successfully.', 'Success', { type: 'success' });
showSnackbar('Disk usage is high.', 'Warning', { type: 'warning' });
showSnackbar('Connection failed.', 'Error', { type: 'error' });
showSnackbar('3 new messages arrived.', 'Info', { type: 'info' });`;

const TypesDemo: React.FC = () => {
    return (
        <>
            <ComponentDemo title="Notification types" description="Four semantic types with distinct colors and icons.">
                <div className="flex gap-3 flex-wrap">
                    {types.map((type) => (
                        <Button
                            key={type}
                            variant={type === 'info' ? 'primary' : type === 'success' ? 'success' : type === 'warning' ? 'warning' : 'danger'}
                            onClick={() => {
                                showSnackbar(`This is a ${type} notification`, `${type.charAt(0).toUpperCase() + type.slice(1)}`, { type });
                            }}
                        >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
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

export default TypesDemo;
