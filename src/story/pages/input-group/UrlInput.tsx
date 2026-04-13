import React, { useState } from 'react';
import { Button, InputGroup, TextInput } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const UrlInput: React.FC = () => {
    const [urlValue, setUrlValue] = useState('');

    return (
        <>
            <ComponentDemo title="URL Input with Protocol" description="Input with text prefix and multiple buttons">
                <div className="w-full max-w-lg">
                    <InputGroup>
                        <span>https://</span>
                        <TextInput
                            value={urlValue}
                            placeholder="example.com"
                            onChange={(e) => setUrlValue(e.value)}
                        />
                        <Button layout="outlined">Copy</Button>
                        <Button>Visit</Button>
                    </InputGroup>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock
                    code={`<InputGroup>
  <span>https://</span>
  <TextInput value={url} placeholder="example.com" onChange={(e) => setUrl(e.value)} />
  <Button layout="outlined">Copy</Button>
  <Button>Visit</Button>
</InputGroup>`}
                />
            </div>
        </>
    );
};

export default UrlInput;
