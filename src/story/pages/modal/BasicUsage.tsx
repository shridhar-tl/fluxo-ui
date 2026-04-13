import React, { useState } from 'react';
import { Button, Modal } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `import { Modal, Button } from 'fluxo-ui';
import { useState } from 'react';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Modal Title"
      >
        <p>Modal content goes here...</p>

        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={() => setIsOpen(false)} layout="outlined">
            Cancel
          </Button>
          <Button onClick={() => setIsOpen(false)} variant="primary">
            Confirm
          </Button>
        </div>
      </Modal>
    </>
  );
}`;

const BasicUsage: React.FC = () => {
    const [basicModal, setBasicModal] = useState(false);

    return (
        <>
            <ComponentDemo title="Basic Modal">
                <Button onClick={() => setBasicModal(true)} variant="primary">
                    Open Modal
                </Button>

                <Modal isOpen={basicModal} onClose={() => setBasicModal(false)} title="Modal Title">
                    <div className="space-y-4">
                        <p className="text-theme-default">
                            This is a basic modal dialog. It contains a title, content area, and a close button.
                        </p>
                        <p className="text-theme-default">
                            You can close this modal by clicking the X button, pressing Escape, or clicking outside the modal.
                        </p>
                        <div className="flex justify-end gap-2 mt-6">
                            <Button onClick={() => setBasicModal(false)} layout="outlined">
                                Cancel
                            </Button>
                            <Button onClick={() => setBasicModal(false)} variant="primary">
                                Confirm
                            </Button>
                        </div>
                    </div>
                </Modal>
            </ComponentDemo>

            <div className="mt-4">
                <CodeBlock title="Basic Example" code={code} />
            </div>
        </>
    );
};

export default BasicUsage;
