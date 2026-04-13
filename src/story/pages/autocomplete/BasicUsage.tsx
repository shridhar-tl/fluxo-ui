import React, { useState } from 'react';
import { Autocomplete } from '../../../components';
import { ComponentDemo } from '../../ComponentDemo';
import { suggestions } from './autocomplete-story-data';

const BasicUsage: React.FC = () => {
    const [basicValue, setBasicValue] = useState('');

    return (
        <ComponentDemo title="Basic Autocomplete" description="Simple autocomplete with a list of suggestions">
            <div className="w-full max-w-80">
                <Autocomplete
                    items={suggestions}
                    value={basicValue}
                    placeholder="Type to search fruits..."
                    onChange={(e) => setBasicValue(e.value)}
                />
            </div>
        </ComponentDemo>
    );
};

export default BasicUsage;
