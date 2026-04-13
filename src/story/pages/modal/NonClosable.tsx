import React, { useState } from 'react';
import { Button, Modal } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="Important Action"
  closeOnBackdrop={false}
>
  <p>This modal requires explicit action.</p>
  <p>Clicking outside won't close it.</p>

  <div className="flex justify-end gap-2 mt-4">
    <Button onClick={onClose}>Cancel</Button>
    <Button onClick={handleConfirm} variant="danger">Confirm</Button>
  </div>
</Modal>`;

const NonClosable: React.FC = () => {
    const [nonClosableModal, setNonClosableModal] = useState(false);

    return (
        <>
            <ComponentDemo title="Modal Without Backdrop Close">
                <Button onClick={() => setNonClosableModal(true)} variant="warning">
                    Open Non-closable Modal
                </Button>

                <Modal
                    isOpen={nonClosableModal}
                    onClose={() => setNonClosableModal(false)}
                    title="Important Action"
                    closeOnBackdrop={false}
                >
                    <div className="space-y-4">
                        <p className="text-theme-default">
                            This modal cannot be closed by clicking outside of it. You must use the buttons below or press
                            Escape.
                        </p>
                        <p className="text-theme-default">This is useful for critical actions that require explicit user choice.</p>
                        <div className="flex justify-end gap-2 mt-6">
                            <Button onClick={() => setNonClosableModal(false)} layout="outlined">
                                Cancel
                            </Button>
                            <Button onClick={() => setNonClosableModal(false)} variant="danger">
                                Delete
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

export default NonClosable;
