import React from 'react';
import { FloatingLabelInput } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<FloatingLabelInput label="Small"  size="sm" />
<FloatingLabelInput label="Medium" size="md" />
<FloatingLabelInput label="Large"  size="lg" />`;

const Sizes: React.FC = () => (
    <>
        <ComponentDemo title="Three sizes" description="Pair size to surrounding form density. Large is recommended for mobile-first forms.">
            <div style={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <FloatingLabelInput fullWidth label="Small" size="sm" />
                <FloatingLabelInput fullWidth label="Medium" size="md" />
                <FloatingLabelInput fullWidth label="Large" size="lg" />
            </div>
        </ComponentDemo>
        <div className="mt-4"><CodeBlock code={code} language="tsx" /></div>
    </>
);

export default Sizes;
