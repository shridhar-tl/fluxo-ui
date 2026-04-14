import React, { useState } from 'react';
import { Checkbox, DiffViewer } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const oldText = `function   hello( name ) {
    console.log( "Hi, " + name );

}
`;

const newText = `function hello(name) {
    CONSOLE.log("hi, " + name);
}
`;

const code = `<DiffViewer
    oldValue={oldText}
    newValue={newText}
    ignoreWhitespace
    ignoreCase
    ignoreEmptyLines
/>`;

const IgnoreOptions: React.FC = () => {
    const [ignoreWs, setIgnoreWs] = useState(true);
    const [ignoreCase, setIgnoreCase] = useState(false);
    const [ignoreEmpty, setIgnoreEmpty] = useState(true);

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
