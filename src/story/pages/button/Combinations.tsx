import cn from 'classnames';
import React from 'react';
import { Button } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';

const code = `<Button layout="outlined" variant="success">Outlined Success</Button>
<Button layout="sharp" variant="primary">Sharp Primary</Button>
<Button layout="rounded" variant="danger">Rounded Danger</Button>
<Button layout="plain" variant="primary">Plain Primary</Button>`;

const layoutLabels = ['default', 'outlined', 'sharp', 'rounded', 'plain'] as const;
const variants = ['primary', 'success', 'danger'] as const;

const Combinations: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <>
            <ComponentDemo title="Variants with Different Layouts">
                <div className="space-y-4">
                    {layoutLabels.map(layout => (
                        <div key={layout} className="flex flex-wrap gap-4">
                            <span className={cn('w-full text-sm', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                                {layout.charAt(0).toUpperCase() + layout.slice(1)} Layout:
                            </span>
                            {variants.map(variant => (
                                <Button key={variant} layout={layout} variant={variant}>
                                    {variant.charAt(0).toUpperCase() + variant.slice(1)}
                                </Button>
                            ))}
                        </div>
                    ))}
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default Combinations;
