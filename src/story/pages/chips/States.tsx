import React from 'react';
import { Chips } from '../../../components';
import { ComponentDemo } from '../../ComponentDemo';

const States: React.FC = () => {
    return (
        <ComponentDemo title="Disabled State" description="Chips in disabled state">
            <div className="w-full max-w-96">
                <Chips value={['Disabled', 'Chips']} disabled />
            </div>
        </ComponentDemo>
    );
};

export default States;
