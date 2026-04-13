import React from 'react';
import { InputGroup, TextInput } from '../../../components';
import { ComponentDemo } from '../../ComponentDemo';

const EmailInput: React.FC = () => {
    return (
        <ComponentDemo title="Email Input" description="Input with @ symbol addon">
            <div className="w-full max-w-96">
                <InputGroup>
                    <TextInput placeholder="username" />
                    <span>@</span>
                    <TextInput placeholder="domain.com" />
                </InputGroup>
            </div>
        </ComponentDemo>
    );
};

export default EmailInput;
