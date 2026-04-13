import React, { useState } from 'react';
import { Button, InputGroup, TextInput } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const SearchInput: React.FC = () => {
    const [searchValue, setSearchValue] = useState('');

    return (
        <>
            <ComponentDemo title="Search Input with Button" description="Text input grouped with a search button">
                <div className="w-full max-w-96">
                    <InputGroup>
                        <TextInput value={searchValue} placeholder="Search..." onChange={(e) => setSearchValue(e.value)} />
                        <Button>Search</Button>
                    </InputGroup>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock
                    title="Basic Example"
                    code={`<InputGroup>
  <TextInput value={value} placeholder="Search..." onChange={(e) => setValue(e.value)} />
  <Button>Search</Button>
</InputGroup>`}
                />
            </div>
        </>
    );
};

export default SearchInput;
