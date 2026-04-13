import React from 'react';
import { Button, showTooltip, hideTooltip } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `// Instant hide
showTooltip(e, { content: 'Text', timeout: 0 });
hideTooltip({ timeout: 0 });

// Custom delay (ms)
showTooltip(e, { content: 'Text', timeout: 3000 });
hideTooltip({ timeout: 3000 });

// Default (1500ms)
showTooltip(e, { content: 'Text' });
hideTooltip();`;

const CustomTimeout: React.FC = () => {
    return (
        <>
            <ComponentDemo
                title="Tooltip with custom hide delay"
                description="The tooltip auto-hides after the configured timeout when the mouse leaves."
            >
                <div className="flex gap-4 flex-wrap">
                    <Button
                        size="sm"
                        onMouseEnter={(e) => showTooltip(e, { content: 'Hides immediately on mouse leave', timeout: 0 })}
                        onMouseLeave={() => hideTooltip({ timeout: 0 })}
                    >
                        Instant hide
                    </Button>
                    <Button
                        size="sm"
                        variant="secondary"
                        onMouseEnter={(e) => showTooltip(e, { content: 'Stays for 3 seconds after mouse leave', timeout: 3000 })}
                        onMouseLeave={() => hideTooltip({ timeout: 3000 })}
                    >
                        3 s delay
                    </Button>
                    <Button
                        size="sm"
                        variant="info"
                        onMouseEnter={(e) => showTooltip(e, { content: 'Default: 1.5 s delay' })}
                        onMouseLeave={() => hideTooltip()}
                    >
                        Default (1.5 s)
                    </Button>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default CustomTimeout;
