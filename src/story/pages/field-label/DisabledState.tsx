import React from 'react';
import { FieldLabel, TextInput } from '../../../components';
import { ComponentDemo } from '../../ComponentDemo';

const DisabledState: React.FC = () => {
    return (
        <ComponentDemo title="Disabled State" description="Label in disabled state" centered={false}>
            <FieldLabel label="Disabled Field" disabled>
                <TextInput id="disabled-input" placeholder="Disabled input" disabled />
            </FieldLabel>
        </ComponentDemo>
    );
};

export default DisabledState;
