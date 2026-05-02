import React, { useState } from 'react';
import { Button } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<Button
    variant="danger"
    confirmText="Are you sure you want to delete this item? This cannot be undone."
    confirmTitle="Delete item"
    confirmOkText="Delete"
    onClick={() => deleteItem()}
>
    Delete
</Button>`;

const Confirmation: React.FC = () => {
    const [count, setCount] = useState(0);
    return (
        <>
            <ComponentDemo title="Inline Confirmation" description="Use confirmText to show a confirm popover before the click handler runs. The handler only runs after the user clicks the confirm action.">
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
                    <div className="flex flex-wrap gap-4 items-center justify-center">
                        <Button
                            variant="danger"
                            confirmText="Are you sure you want to delete this item? This cannot be undone."
                            confirmTitle="Delete item"
                            confirmOkText="Delete"
                            onClick={() => setCount((c) => c + 1)}
                        >
                            Delete
                        </Button>
                        <Button
                            variant="primary"
                            confirmText="Submit the form now?"
                            confirmTitle="Confirm submission"
                            onClick={() => setCount((c) => c + 1)}
                        >
                            Submit
                        </Button>
                    </div>
                    <div style={{ padding: '10px 14px', background: 'var(--eui-bg-subtle)', border: '1px solid var(--eui-border-subtle)', borderRadius: 6, color: 'var(--eui-text)' }}>
                        Confirmed actions: <strong>{count}</strong>
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default Confirmation;
