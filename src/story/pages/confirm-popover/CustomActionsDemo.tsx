import React from 'react';
import { Button, Confirm } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `Confirm.show({
  target: e.currentTarget as HTMLElement,
  title: 'Choose action',
  message: 'What would you like to do with this record?',
  placement: 'auto',
  actions: [
    { label: 'Archive', variant: 'warning', layout: 'outlined', onClick: () => archive() },
    { label: 'Delete', variant: 'danger', layout: 'default', onClick: () => remove() },
  ],
});`;

const CustomActionsDemo: React.FC = () => {
    return (
        <>
            <ComponentDemo title="Low-level API with custom action set">
                <Button
                    variant="secondary"
                    onClick={(e) => {
                        Confirm.show({
                            target: e.currentTarget as HTMLElement,
                            title: 'Choose action',
                            message: 'What would you like to do with this record?',
                            placement: 'auto',
                            actions: [
                                { label: 'Archive', variant: 'warning', layout: 'outlined', onClick: () => console.log('archived') },
                                { label: 'Delete', variant: 'danger', layout: 'default', onClick: () => console.log('deleted') },
                            ],
                        });
                    }}
                >
                    Custom Actions
                </Button>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default CustomActionsDemo;
