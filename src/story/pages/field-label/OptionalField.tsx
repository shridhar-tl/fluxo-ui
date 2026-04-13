import React from 'react';
import { FieldLabel, TextInput } from '../../../components';
import { ComponentDemo } from '../../ComponentDemo';

const OptionalField: React.FC = () => {
    return (
        <ComponentDemo title="Optional Field" description="Label with optional indicator" centered={false}>
            <FieldLabel label="Middle Name" optional>
                <TextInput id="optional-input" placeholder="Optional field" />
            </FieldLabel>
        </ComponentDemo>
    );
};

export default OptionalField;
