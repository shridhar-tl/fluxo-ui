import React from 'react';
import { Button, showSnackbar } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `showSnackbar('Critical error occurred.', 'Error', {
  type: 'error',
  timeout: 0,
  showCloseButton: true,
});`;

const PersistentTimeout: React.FC = () => {
    return (
        <>
            <ComponentDemo title="Timeout control" description="Set timeout to 0 for a persistent snackbar that only dismisses manually.">
                <div className="flex gap-3 flex-wrap">
                    <Button
                        variant="warning"
                        onClick={() => {
                            showSnackbar('This will not auto-dismiss. Click \u00d7 to close.', 'Persistent', {
                                type: 'warning',
                                timeout: 0,
                                showCloseButton: true,
                            });
                        }}
                    >
                        Persistent (no auto-dismiss)
                    </Button>
                    <Button
                        variant="success"
                        layout="outlined"
                        onClick={() => {
                            showSnackbar('Dismisses in 1.5 seconds.', 'Fast', {
                                type: 'success',
                                timeout: 1500,
                            });
                        }}
                    >
                        1.5s Timeout
                    </Button>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default PersistentTimeout;
