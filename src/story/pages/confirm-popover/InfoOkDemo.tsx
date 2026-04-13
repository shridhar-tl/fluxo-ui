import React from 'react';
import { Button, Confirm } from '../../../components';
import { InfoIcon, CheckCircleIcon } from '../../../assets/icons';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `Confirm.ok(
  e.currentTarget as HTMLElement,
  'Your changes have been saved automatically.',
  undefined,
  { title: 'Auto-saved', icon: CheckCircleIcon, okText: 'Got it' }
);`;

const InfoOkDemo: React.FC = () => {
    return (
        <>
            <ComponentDemo title="Single-button informational popover">
                <Button
                    variant="info"
                    layout="outlined"
                    leftIcon={<InfoIcon className="w-4 h-4" />}
                    onClick={(e) => {
                        Confirm.ok(
                            e.currentTarget as HTMLElement,
                            'Your changes have been saved automatically.',
                            undefined,
                            { title: 'Auto-saved', icon: CheckCircleIcon, okText: 'Got it' }
                        );
                    }}
                >
                    Show Info
                </Button>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default InfoOkDemo;
