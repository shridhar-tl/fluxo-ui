import React from 'react';
import { Button, showSnackbar } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `showSnackbar('3 new messages received. Click to view.', 'Messages', {
  type: 'info',
  timeout: 6000,
  onClick: () => navigate('/messages'),
  onClose: (manual) => console.log('closed by user:', manual),
});`;

const ClickCallback: React.FC = () => {
    return (
        <>
            <ComponentDemo title="Clickable snackbar" description="Attach onClick to handle user interaction (e.g., navigate to details).">
                <Button
                    variant="primary"
                    onClick={() => {
                        showSnackbar('3 new messages received. Click to view.', 'Messages', {
                            type: 'info',
                            timeout: 6000,
                            onClick: () => console.log('Navigating to messages...'),
                        });
                    }}
                >
                    Show Clickable Snackbar
                </Button>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default ClickCallback;
