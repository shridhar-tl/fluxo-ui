import React from 'react';
import { InputGroup, TextInput } from '../../../components';
import { ComponentDemo } from '../../ComponentDemo';

const PriceInput: React.FC = () => {
    return (
        <ComponentDemo title="Price Input" description="Input with currency prefix and suffix">
            <div className="w-full max-w-80">
                <InputGroup>
                    <span>$</span>
                    <TextInput placeholder="0.00" />
                    <span>USD</span>
                </InputGroup>
            </div>
        </ComponentDemo>
    );
};

export default PriceInput;
