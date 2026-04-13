import React, { useState } from 'react';
import { AutocompleteMulti } from '../../../components';
import { ComponentDemo } from '../../ComponentDemo';
import { suggestions } from './autocomplete-multi-story-data';

const PresetValues: React.FC = () => {
    const [customValues, setCustomValues] = useState<string[]>(['Apple']);

    return (
        <ComponentDemo title="With Preset Values" description="Autocomplete with pre-selected values">
            <div className="w-full max-w-96">
                <AutocompleteMulti
                    items={suggestions}
                    value={customValues}
                    placeholder="Add more fruits..."
                    onChange={(e) => setCustomValues(e.value)}
                />
            </div>
        </ComponentDemo>
    );
};

export default PresetValues;
