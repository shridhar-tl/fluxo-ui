import React from 'react';
import { InputGroup, TextInput } from '../../../components';
import { ComponentDemo } from '../../ComponentDemo';

const PhoneNumber: React.FC = () => {
    return (
        <ComponentDemo title="Phone Number" description="Input with country code prefix">
            <div className="w-full max-w-80">
                <InputGroup>
                    <span>+1</span>
                    <TextInput placeholder="(555) 000-0000" />
                </InputGroup>
            </div>
        </ComponentDemo>
    );
};

export default PhoneNumber;
