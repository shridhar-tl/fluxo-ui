import React from 'react';
import { FieldLabel, TextInput } from '../../../components';
import { ComponentDemo } from '../../ComponentDemo';

const BasicLabel: React.FC = () => {
    return (
        <ComponentDemo title="Basic Label" description="Simple field label" centered={false}>
            <FieldLabel label="Email Address">
                <TextInput id="basic-input" placeholder="Enter your email" />
            </FieldLabel>
        </ComponentDemo>
    );
};

export default BasicLabel;
