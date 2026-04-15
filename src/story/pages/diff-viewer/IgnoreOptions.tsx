import React, { useState } from 'react';
import { Checkbox, DiffViewer } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const oldText = `// Config file
const   HOST = "localhost";
const   PORT = 3000;

const   USER = "Admin";
const   PASS = "Secret";


const DB = "mydb";
const TIMEOUT = 30;
`;

const newText = `// config file
const HOST = "localhost";
const PORT = 3000;
const user = "admin";
const pass = "secret";
const DB = "mydb";
const TIMEOUT = 30;
`;

const code = `<DiffViewer
    oldValue={oldText}
    newValue={newText}
    ignoreWhitespace
    ignoreCase
    ignoreEmptyLines
/>`;

const IgnoreOptions: React.FC = () => {
    const [ignoreWs, setIgnoreWs] = useState(false);
    const [ignoreCase, setIgnoreCase] = useState(false);
    const [ignoreEmpty, setIgnoreEmpty] = useState(false);

    return (
        <>
            <ComponentDemo title="Ignore Options" description="Toggle whitespace, case, and empty-line sensitivity.">
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', padding: '10px 14px', background: 'var(--eui-bg-subtle)', border: '1px solid var(--eui-border-subtle)', borderRadius: 6 }}>
                        <Checkbox checked={ignoreWs} onChange={(e) => setIgnoreWs(e.value)} label="Ignore whitespace" />
                        <Checkbox checked={ignoreCase} onChange={(e) => setIgnoreCase(e.value)} label="Ignore case" />
                        <Checkbox checked={ignoreEmpty} onChange={(e) => setIgnoreEmpty(e.value)} label="Ignore empty lines" />
                    </div>
                    <DiffViewer
                        oldValue={oldText}
                        newValue={newText}
                        ignoreWhitespace={ignoreWs}
                        ignoreCase={ignoreCase}
                        ignoreEmptyLines={ignoreEmpty}
                    />
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default IgnoreOptions;
