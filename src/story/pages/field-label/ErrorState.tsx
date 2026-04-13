import React from 'react';
import { FieldLabel, TextInput } from '../../../components';
import { ComponentDemo } from '../../ComponentDemo';

const ErrorState: React.FC = () => {
    return (
        <ComponentDemo title="Error State" description="Label in error state" centered={false}>
            <FieldLabel label="Password" error="This field has an error">
                <TextInput id="error-input" placeholder="Invalid input" />
            </FieldLabel>
        </ComponentDemo>
    );
};

export default ErrorState;
