import React from 'react';
import { AutocompleteMulti } from '../../../components';
import { ComponentDemo } from '../../ComponentDemo';
import { suggestions } from './autocomplete-multi-story-data';

const DisabledState: React.FC = () => {
    return (
        <ComponentDemo title="Disabled State" description="AutocompleteMulti in disabled state">
            <div className="w-full max-w-96">
                <AutocompleteMulti items={suggestions} value={['Apple', 'Banana']} disabled />
            </div>
        </ComponentDemo>
    );
};

export default DisabledState;
