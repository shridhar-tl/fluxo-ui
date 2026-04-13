import React from 'react';
import { FieldLabel, TextInput } from '../../../components';
import { ComponentDemo } from '../../ComponentDemo';

const RequiredField: React.FC = () => {
    return (
        <ComponentDemo title="Required Field" description="Label with required indicator" centered={false}>
            <FieldLabel label="Username" required>
                <TextInput id="required-input" placeholder="Required field" />
            </FieldLabel>
        </ComponentDemo>
    );
};

export default RequiredField;
