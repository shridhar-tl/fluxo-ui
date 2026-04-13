import React, { useState } from 'react';
import { AutocompleteMulti } from '../../../components';
import { ComponentDemo } from '../../ComponentDemo';
import { suggestions } from './autocomplete-multi-story-data';

const BasicUsage: React.FC = () => {
    const [basicValues, setBasicValues] = useState<string[]>([]);

    return (
        <ComponentDemo title="Basic Multi-Select Autocomplete" description="Select multiple items with autocomplete functionality">
            <div className="w-full max-w-96">
                <AutocompleteMulti
                    items={suggestions}
                    value={basicValues}
                    placeholder="Type to search and select fruits..."
                    onChange={(e) => setBasicValues(e.value)}
                />
            </div>
        </ComponentDemo>
    );
};

export default BasicUsage;
