import React, { useState } from 'react';
import { Button, Modal } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `function MyComponent() {
  const [firstModal, setFirstModal] = useState(false);
  const [secondModal, setSecondModal] = useState(false);

  return (
    <>
      <Button onClick={() => setFirstModal(true)}>Open First Modal</Button>

      <Modal isOpen={firstModal} onClose={() => setFirstModal(false)} title="First Modal">
        <p>First modal content</p>
        <Button onClick={() => setSecondModal(true)}>Open Second Modal</Button>
      </Modal>

      <Modal isOpen={secondModal} onClose={() => setSecondModal(false)} title="Second Modal">
        <p>Nested modal content</p>
      </Modal>
    </>
  );
}`;

const NestedModals: React.FC = () => {
    const [nestedModal, setNestedModal] = useState(false);
    const [nestedModal2, setNestedModal2] = useState(false);

    return (
        <>
            <ComponentDemo title="Modal Opening Another Modal">
                <Button onClick={() => setNestedModal(true)} variant="secondary">
                    Open First Modal
                </Button>

                <Modal isOpen={nestedModal} onClose={() => setNestedModal(false)} title="First Modal">
                    <div className="space-y-4">
                        <p className="text-theme-default">This is the first modal. You can open another modal from here.</p>
                        <Button onClick={() => setNestedModal2(true)} variant="primary">
                            Open Second Modal
                        </Button>
                        <div className="flex justify-end mt-4">
                            <Button onClick={() => setNestedModal(false)} layout="outlined">
                                Close
                            </Button>
                        </div>
                    </div>
                </Modal>

                <Modal isOpen={nestedModal2} onClose={() => setNestedModal2(false)} title="Second Modal" size="sm">
                    <div className="space-y-4">
                        <p className="text-theme-default">This is a nested modal opened from the first modal.</p>
                        <div className="flex justify-end mt-4">
                            <Button onClick={() => setNestedModal2(false)} variant="primary">
                                Close This Modal
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

export default NestedModals;
