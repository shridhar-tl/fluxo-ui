import React, { useState } from 'react';
import { JsonEditor } from '../../../components';
import type { JsonValue } from '../../../components';
import { ComponentDemo } from '../../ComponentDemo';
import { complexData } from './json-editor-story-data';

const ComplexData: React.FC = () => {
    const [data, setData] = useState<JsonValue>(complexData);

    return (
        <ComponentDemo title="Complex Nested Data" description="Real-world configuration with mixed nested objects, arrays, URLs, and null values" centered={false}>
            <div className="w-full p-4">
                <JsonEditor
                    value={data}
                    onChange={setData}
                    expandDepth={2}
                    showItemCount
                    maxHeight={400}
                />
            </div>
        </ComponentDemo>
    );
};

export default ComplexData;
