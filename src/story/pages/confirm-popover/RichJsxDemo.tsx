import React from 'react';
import { Button, Confirm } from '../../../components';
import { WarningIcon } from '../../../assets/icons';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `Confirm.yesNo(
  e.currentTarget as HTMLElement,
  <div className="space-y-2">
    <p className="font-medium">This will permanently remove:</p>
    <ul className="list-disc list-inside text-xs">
      <li>All associated records</li>
      <li>Media files and attachments</li>
    </ul>
  </div>,
  () => handleDelete(),
  undefined,
  { title: 'Destructive Action', icon: WarningIcon }
);`;

const RichJsxDemo: React.FC = () => {
    return (
        <>
            <ComponentDemo title="ReactNode as message" description="The message prop accepts any React node for complex content.">
                <Button
                    variant="warning"
                    leftIcon={<WarningIcon className="w-4 h-4" />}
                    onClick={(e) => {
                        Confirm.yesNo(
                            e.currentTarget as HTMLElement,
                            <div className="space-y-2">
                                <p className="font-medium">This will permanently remove:</p>
                                <ul className="list-disc list-inside text-xs space-y-1 text-theme-muted">
                                    <li>All associated records</li>
                                    <li>Media files and attachments</li>
                                    <li>Audit history</li>
                                </ul>
                            </div>,
                            () => console.log('Confirmed'),
                            undefined,
                            { title: 'Destructive Action', icon: WarningIcon }
                        );
                    }}
                >
                    Rich Message
                </Button>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default RichJsxDemo;
