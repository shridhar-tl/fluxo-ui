import React, { useState } from 'react';
import { MultiStateCheckbox } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { approvalStates, priorityStates } from './multi-state-checkbox-story-data';

const code = `import { MultiStateCheckbox } from 'ether-ui';
import { InfoIcon, WarningIcon, FlagIcon, CheckIcon, MinusIcon } from 'ether-ui/icons';

const priorityStates = [
  { value: null, label: 'No Priority', icon: undefined },
  { value: 'low', label: 'Low', icon: InfoIcon },
  { value: 'medium', label: 'Medium', icon: WarningIcon },
  { value: 'high', label: 'High', icon: FlagIcon },
];

const approvalStates = [
  { value: 'pending', label: 'Pending', icon: InfoIcon },
  { value: 'approved', label: 'Approved', icon: CheckIcon },
  { value: 'rejected', label: 'Rejected', icon: MinusIcon },
  { value: 'flagged', label: 'Flagged', icon: FlagIcon },
];

function MyComponent() {
  const [priority, setPriority] = useState(null);
  const [approval, setApproval] = useState('pending');

  return (
    <>
      <MultiStateCheckbox
        items={priorityStates}
        value={priority}
        onChange={(e) => setPriority(e.value)}
      />
      <MultiStateCheckbox
        items={approvalStates}
        value={approval}
        onChange={(e) => setApproval(e.value)}
      />
    </>
  );
}`;

const CustomStates: React.FC = () => {
    const [priority, setPriority] = useState<string | null>(null);
    const [approval, setApproval] = useState<string>('pending');

    return (
        <>
            <ComponentDemo title="Custom State Configurations">
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-gray-500">Priority Selector (3 states)</span>
                        <MultiStateCheckbox
                            items={priorityStates}
                            value={priority}
                            onChange={(e) => setPriority(e.value)}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-gray-500">Approval Workflow (4 states)</span>
                        <MultiStateCheckbox
                            items={approvalStates}
                            value={approval}
                            onChange={(e) => setApproval(e.value)}
                        />
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock title="Custom States Example" code={code} />
            </div>
        </>
    );
};

export default CustomStates;
