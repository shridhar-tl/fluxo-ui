import React, { useState } from 'react';
import { Button, Modal } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="Terms and Conditions"
  footer={
    <div className="flex justify-end gap-2">
      <Button onClick={onClose} layout="outlined">Decline</Button>
      <Button onClick={onClose} variant="success">Accept</Button>
    </div>
  }
>
  {/* Content scrolls automatically when it exceeds viewport */}
  <p>Long content...</p>
  <p>More content...</p>
</Modal>`;

const ScrollableContent: React.FC = () => {
    const [scrollableModal, setScrollableModal] = useState(false);

    return (
        <>
            <ComponentDemo title="Modal with Long Content">
                <Button onClick={() => setScrollableModal(true)} variant="info">
                    Open Scrollable Modal
                </Button>

                <Modal
                    isOpen={scrollableModal}
                    onClose={() => setScrollableModal(false)}
                    title="Terms and Conditions"
                    footer={
                        <div className="flex justify-end gap-2">
                            <Button onClick={() => setScrollableModal(false)} layout="outlined">
                                Decline
                            </Button>
                            <Button onClick={() => setScrollableModal(false)} variant="success">
                                Accept
                            </Button>
                        </div>
                    }
                >
                    <div className="space-y-4">
                        <p className="text-theme-default">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore
                            et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
                        </p>
                        <p className="text-theme-default">
                            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
                            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit
                            anim id est laborum.
                        </p>
                        <p className="text-theme-default">
                            Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium,
                            totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae
                            dicta sunt explicabo.
                        </p>
                        <p className="text-theme-default">
                            Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur
                            magni dolores eos qui ratione voluptatem sequi nesciunt.
                        </p>
                        <p className="text-theme-default">
                            Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed
                            quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.
                        </p>
                        <p className="text-theme-default">
                            Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut
                            aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit
                            esse quam nihil molestiae consequatur.
                        </p>
                        <p className="text-theme-default">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore
                            et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
                        </p>
                        <p className="text-theme-default">
                            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
                            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit
                            anim id est laborum.
                        </p>
                    </div>
                </Modal>
            </ComponentDemo>

            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default ScrollableContent;
