import React from 'react';
import { Button } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const plusIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);

const arrowRightIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
    </svg>
);

const downloadIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);

const code = `<Button leftIcon={<PlusIcon />}>Left Icon</Button>
<Button rightIcon={<ArrowRightIcon />}>Right Icon</Button>
<Button leftIcon={<DownloadIcon />} variant="success">Download</Button>`;

const WithIcons: React.FC = () => (
    <>
        <ComponentDemo title="Buttons with Icons">
            <div className="flex flex-wrap gap-4">
                <Button leftIcon={plusIcon}>Left Icon</Button>
                <Button rightIcon={arrowRightIcon}>Right Icon</Button>
                <Button leftIcon={downloadIcon} variant="success">Download</Button>
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} />
        </div>
    </>
);

export default WithIcons;
