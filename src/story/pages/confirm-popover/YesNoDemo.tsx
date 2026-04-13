import React from 'react';
import { Button, Confirm } from '../../../components';
import { TrashIcon } from '../../../assets/icons';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `Confirm.yesNo(
  e.currentTarget as HTMLElement,
  'Are you sure you want to delete this item?',
  () => handleDelete(),
  () => console.log('Cancelled'),
  { title: 'Delete Item', icon: TrashIcon }
);`;

const YesNoDemo: React.FC = () => {
    return (
        <>
            <ComponentDemo title="Delete confirmation" description="Classic yes/no anchored to the clicked element.">
                <Button
                    variant="danger"
                    layout="outlined"
                    leftIcon={<TrashIcon className="w-4 h-4" />}
                    onClick={(e) => {
                        Confirm.yesNo(
                            e.currentTarget as HTMLElement,
                            'Are you sure you want to delete this item? This action cannot be undone.',
                            () => console.log('Deleted!'),
                            () => console.log('Cancelled'),
                            { title: 'Delete Item', icon: TrashIcon }
                        );
                    }}
                >
                    Delete Item
                </Button>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default YesNoDemo;
