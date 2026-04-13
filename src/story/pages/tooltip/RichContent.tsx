import React from 'react';
import { Button, showTooltip, hideTooltip } from '../../../components';
import { InfoIcon } from '../../../assets/icons';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `showTooltip(e, {
  content: (
    <div className="space-y-1">
      <p className="font-semibold text-sm">Pro tip</p>
      <p className="text-xs opacity-80">
        You can render any React node inside a tooltip.
      </p>
    </div>
  ),
  placement: 'bottomLeft',
});`;

const RichContent: React.FC = () => {
    return (
        <>
            <ComponentDemo title="ReactNode as tooltip content">
                <Button
                    variant="info"
                    layout="outlined"
                    leftIcon={<InfoIcon className="w-4 h-4" />}
                    onMouseEnter={(e) =>
                        showTooltip(e, {
                            content: (
                                <div className="space-y-1">
                                    <p className="font-semibold text-sm">Pro tip</p>
                                    <p className="text-xs opacity-80">You can render any React node inside a tooltip including lists, icons, and formatted text.</p>
                                </div>
                            ),
                            placement: 'bottomLeft',
                        })
                    }
                    onMouseLeave={() => hideTooltip({ timeout: 0 })}
                >
                    Rich Tooltip
                </Button>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default RichContent;
