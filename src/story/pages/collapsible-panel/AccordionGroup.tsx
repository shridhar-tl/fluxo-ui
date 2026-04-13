import React from 'react';
import { CollapsiblePanel, CollapsiblePanelGroup } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `import { CollapsiblePanel, CollapsiblePanelGroup } from 'fluxo-ui';

<CollapsiblePanelGroup accordion variant="bordered">
  <CollapsiblePanel id="faq-1" title="What is CollapsiblePanel?">
    <p>A flexible panel that expands and collapses.</p>
  </CollapsiblePanel>
  <CollapsiblePanel id="faq-2" title="Does it support accordion mode?">
    <p>Yes! Wrap panels in a Group with accordion prop.</p>
  </CollapsiblePanel>
</CollapsiblePanelGroup>`;

const AccordionGroup: React.FC = () => (
    <>
        <ComponentDemo title="Accordion Group" centered={false}>
            <div className="w-full">
                <CollapsiblePanelGroup accordion variant="bordered" defaultOpenKeys={['acc-faq-1']}>
                    <CollapsiblePanel id="acc-faq-1" title="What is CollapsiblePanel?">
                        <p className="text-sm leading-relaxed">
                            A flexible, accessible component for expanding and collapsing content sections. Supports multiple variants,
                            sizes, icons, and group/accordion behavior.
                        </p>
                    </CollapsiblePanel>
                    <CollapsiblePanel id="acc-faq-2" title="Does it support accordion mode?">
                        <p className="text-sm leading-relaxed">
                            Yes! Wrap multiple panels in a <code className="font-mono text-xs">CollapsiblePanelGroup</code> with the{' '}
                            <code className="font-mono text-xs">accordion</code> prop. Only one panel can be open at a time.
                        </p>
                    </CollapsiblePanel>
                    <CollapsiblePanel id="acc-faq-3" title="Can I control which panels are open?">
                        <p className="text-sm leading-relaxed">
                            Use <code className="font-mono text-xs">defaultOpenKeys</code> for initial state, or the individual{' '}
                            <code className="font-mono text-xs">open</code> and <code className="font-mono text-xs">onToggle</code> props
                            for full controlled behavior.
                        </p>
                    </CollapsiblePanel>
                    <CollapsiblePanel id="acc-faq-4" title="Is it keyboard accessible?">
                        <p className="text-sm leading-relaxed">
                            Fully ADA-compliant. Headers are focusable, respond to Enter and Space, use proper ARIA attributes (
                            <code className="font-mono text-xs">aria-expanded</code>,
                            <code className="font-mono text-xs">aria-controls</code>,{' '}
                            <code className="font-mono text-xs">role="region"</code>), and respect{' '}
                            <code className="font-mono text-xs">prefers-reduced-motion</code>.
                        </p>
                    </CollapsiblePanel>
                </CollapsiblePanelGroup>
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} />
        </div>
    </>
);

export default AccordionGroup;
