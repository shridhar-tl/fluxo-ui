import React, { useState } from 'react';
import { Button, Modal } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<Modal isOpen={isOpen} onClose={onClose}>
  <h2 className="text-xl font-semibold mb-4">Custom Header</h2>
  <p>Your custom content here...</p>
</Modal>`;

const WithoutTitle: React.FC = () => {
    const [noTitleModal, setNoTitleModal] = useState(false);

    return (
        <>
            <ComponentDemo title="Modal Without Title">
                <Button onClick={() => setNoTitleModal(true)} variant="secondary">
                    Open Modal Without Title
                </Button>

                <Modal isOpen={noTitleModal} onClose={() => setNoTitleModal(false)}>
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-theme-default">Custom Content Header</h2>
                        <p className="text-theme-default">
                            When no title prop is provided, the close button appears in the top-right corner,
                            giving you full control over the modal content layout.
                        </p>
                        <div className="flex justify-end mt-4">
                            <Button onClick={() => setNoTitleModal(false)} variant="primary">
                                Got it
                            </Button>
                        </div>
                    </div>
                </Modal>
            </ComponentDemo>

            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default WithoutTitle;
