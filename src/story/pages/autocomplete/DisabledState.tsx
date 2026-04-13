import React from 'react';
import { Autocomplete } from '../../../components';
import { ComponentDemo } from '../../ComponentDemo';
import { suggestions } from './autocomplete-story-data';

const DisabledState: React.FC = () => {
    return (
        <ComponentDemo title="Disabled State" description="Autocomplete in disabled state">
            <div className="w-full max-w-80">
                <Autocomplete items={suggestions} value="Disabled input" disabled />
            </div>
        </ComponentDemo>
    );
};

export default DisabledState;
