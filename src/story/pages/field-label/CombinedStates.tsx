import React from 'react';
import { FieldLabel, TextInput } from '../../../components';
import { ComponentDemo } from '../../ComponentDemo';

const CombinedStates: React.FC = () => {
    return (
        <ComponentDemo title="Combined States" description="Multiple form fields with different label states" centered={false}>
            <div className="space-y-4 max-w-md">
                <FieldLabel label="Full Name" required>
                    <TextInput id="name" placeholder="John Doe" />
                </FieldLabel>
                <FieldLabel label="Phone Number">
                    <TextInput id="phone" placeholder="+1 (555) 123-4567" />
                </FieldLabel>
                <FieldLabel label="Email Address" error="Please enter a valid email">
                    <TextInput id="email-error" placeholder="invalid-email" />
                </FieldLabel>
                <FieldLabel label="Bio" optional>
                    <TextInput id="bio" placeholder="Tell us about yourself (optional)" />
                </FieldLabel>
                <FieldLabel label="Account ID" disabled>
                    <TextInput id="frozen-field" placeholder="ACC-00123" disabled />
                </FieldLabel>
            </div>
        </ComponentDemo>
    );
};

export default CombinedStates;
