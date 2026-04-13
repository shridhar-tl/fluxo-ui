import cn from 'classnames';
import React from 'react';
import { showTooltip, hideTooltip } from '../../../components';
import { InfoIcon } from '../../../assets/icons';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';

const code = `<span
  onMouseEnter={(e) =>
    showTooltip(e, {
      content: 'Balance is updated every 24 hours.',
      placement: 'topRight',
    })
  }
  onMouseLeave={() => hideTooltip({ timeout: 0 })}
>
  <InfoIcon />
</span>`;

const OnAnyElement: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <>
            <ComponentDemo title="Tooltip on any element">
                <div className="flex items-center gap-2">
                    <span className={cn('text-sm', { 'text-gray-300': isDark, 'text-gray-700': !isDark })}>Account balance</span>
                    <span
                        className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white cursor-help"
                        onMouseEnter={(e) =>
                            showTooltip(e, {
                                content: 'Balance is updated every 24 hours. Contact support for discrepancies.',
                                placement: 'topRight',
                            })
                        }
                        onMouseLeave={() => hideTooltip({ timeout: 0 })}
                    >
                        <InfoIcon className="w-3 h-3" />
                    </span>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default OnAnyElement;
