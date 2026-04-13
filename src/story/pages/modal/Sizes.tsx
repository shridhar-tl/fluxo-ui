import React, { useState } from 'react';
import { Button, Modal } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<Modal size="sm" isOpen={isOpen} onClose={onClose} title="Small">
  Small modal content
</Modal>

<Modal size="md" isOpen={isOpen} onClose={onClose} title="Medium">
  Medium modal content (default)
</Modal>

<Modal size="lg" isOpen={isOpen} onClose={onClose} title="Large">
  Large modal content
</Modal>

<Modal size="xl" isOpen={isOpen} onClose={onClose} title="Extra Large">
  Extra large modal content
</Modal>`;

const Sizes: React.FC = () => {
    const [smallModal, setSmallModal] = useState(false);
    const [mediumModal, setMediumModal] = useState(false);
    const [largeModal, setLargeModal] = useState(false);
    const [xlModal, setXlModal] = useState(false);

    return (
        <>
            <ComponentDemo title="Modal Sizes">
                <div className="flex flex-wrap gap-4">
                    <Button onClick={() => setSmallModal(true)} size="sm">
                        Small (sm)
                    </Button>
                    <Button onClick={() => setMediumModal(true)}>
                        Medium (md)
                    </Button>
                    <Button onClick={() => setLargeModal(true)} size="lg">
                        Large (lg)
                    </Button>
                    <Button onClick={() => setXlModal(true)} size="lg">
                        Extra Large (xl)
                    </Button>
                </div>

                <Modal isOpen={smallModal} onClose={() => setSmallModal(false)} title="Small Modal" size="sm">
                    <p className="text-theme-default">This is a small modal (max-width: 28rem / 448px)</p>
                    <div className="flex justify-end mt-4">
                        <Button onClick={() => setSmallModal(false)} variant="primary">
                            Close
                        </Button>
                    </div>
                </Modal>

                <Modal isOpen={mediumModal} onClose={() => setMediumModal(false)} title="Medium Modal">
                    <p className="text-theme-default">This is the default medium modal (max-width: 32rem / 512px)</p>
                    <div className="flex justify-end mt-4">
                        <Button onClick={() => setMediumModal(false)} variant="primary">
                            Close
                        </Button>
                    </div>
                </Modal>

                <Modal isOpen={largeModal} onClose={() => setLargeModal(false)} title="Large Modal" size="lg">
                    <p className="text-theme-default">This is a large modal (max-width: 42rem / 672px)</p>
                    <div className="flex justify-end mt-4">
                        <Button onClick={() => setLargeModal(false)} variant="primary">
                            Close
                        </Button>
                    </div>
                </Modal>

                <Modal isOpen={xlModal} onClose={() => setXlModal(false)} title="Extra Large Modal" size="xl">
                    <p className="text-theme-default">This is an extra large modal (max-width: 56rem / 896px)</p>
                    <div className="flex justify-end mt-4">
                        <Button onClick={() => setXlModal(false)} variant="primary">
                            Close
                        </Button>
                    </div>
                </Modal>
            </ComponentDemo>

            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default Sizes;
