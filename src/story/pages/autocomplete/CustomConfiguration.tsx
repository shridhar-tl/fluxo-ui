import React, { useState } from 'react';
import { Autocomplete } from '../../../components';
import { ComponentDemo } from '../../ComponentDemo';
import { suggestions } from './autocomplete-story-data';

const CustomConfiguration: React.FC = () => {
    const [customValue, setCustomValue] = useState('');

    return (
        <ComponentDemo title="Custom Configuration" description="Autocomplete with custom minLength and maxSuggestions">
            <div className="w-full max-w-80">
                <Autocomplete
                    items={suggestions}
                    value={customValue}
                    placeholder="Min 2 chars, max 3 suggestions..."
                    minLength={2}
                    maxSuggestions={3}
                    onChange={(e) => setCustomValue(e.value)}
                    onSelect={(suggestion) => console.log('Selected:', suggestion)}
                />
            </div>
        </ComponentDemo>
    );
};

export default CustomConfiguration;
