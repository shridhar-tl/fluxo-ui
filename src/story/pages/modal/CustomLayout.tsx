import React, { useState } from 'react';
import { Button, Modal } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<Modal isOpen={isOpen} onClose={onClose}>
  {/* Custom Header */}
  <div className="flex items-center justify-between pb-4 border-b">
    <div>
      <h2 className="text-2xl font-bold">Custom Header</h2>
      <p className="text-sm text-gray-500">With subtitle</p>
    </div>
    <span className="px-3 py-1 bg-green-100 rounded-full">Active</span>
  </div>

  {/* Content */}
  <div className="py-4">
    <p>Your modal content here...</p>
  </div>

  {/* Custom Footer */}
  <div className="flex justify-between pt-4 border-t">
    <Button layout="plain">Skip</Button>
    <div className="flex gap-2">
      <Button onClick={onClose} layout="outlined">Cancel</Button>
      <Button onClick={onSave} variant="success">Save</Button>
    </div>
  </div>
</Modal>`;

const CustomLayout: React.FC = () => {
    const [customHeaderModal, setCustomHeaderModal] = useState(false);

    return (
        <>
            <ComponentDemo title="Modal with Custom Layout">
                <Button onClick={() => setCustomHeaderModal(true)} variant="success">
                    Open Custom Modal
                </Button>

                <Modal isOpen={customHeaderModal} onClose={() => setCustomHeaderModal(false)}>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between pb-4 border-b border-theme-default">
                            <div>
                                <h2 className="text-2xl font-bold text-theme-default">Custom Header</h2>
                                <p className="text-sm text-theme-muted">With subtitle and custom styling</p>
                            </div>
                            <span className="px-3 py-1 bg-success-100 text-success-700 rounded-full text-sm font-medium">
                                Active
                            </span>
                        </div>

                        <div className="space-y-4">
                            <p className="text-theme-default">
                                You can create completely custom headers and footers by not providing a title prop and
                                structuring your content however you like.
                            </p>
                            <div className="bg-info-50 p-4 rounded border border-info-500/20">
                                <p className="text-sm text-info-700">
                                    <strong>Pro tip:</strong> Use custom layouts for complex forms, multi-step processes, or
                                    when you need more control over the modal structure.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-theme-default">
                            <Button onClick={() => setCustomHeaderModal(false)} layout="plain">
                                Maybe later
                            </Button>
                            <div className="flex gap-2">
                                <Button onClick={() => setCustomHeaderModal(false)} layout="outlined">
                                    Cancel
                                </Button>
                                <Button onClick={() => setCustomHeaderModal(false)} variant="success">
                                    Save Changes
                                </Button>
                            </div>
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

export default CustomLayout;
