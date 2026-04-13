import React from 'react';
import { InputSwitch } from '../../../components';
import { ComponentDemo } from '../../ComponentDemo';

const CustomLabels: React.FC = () => {
    return (
        <ComponentDemo title="Custom Labels" description="Switches with custom on/off labels">
            <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-4">
                    <InputSwitch
                        checked={true}
                        onChange={(e) => console.log('Yes/No:', e.value)}
                        onLabel="Yes"
                        offLabel="No"
                    />
                </div>
                <div className="flex items-center space-x-4">
                    <InputSwitch
                        checked={false}
                        onChange={(e) => console.log('Active/Inactive:', e.value)}
                        onLabel="Active"
                        offLabel="Inactive"
                    />
                </div>
                <div className="flex items-center space-x-4">
                    <InputSwitch
                        checked={true}
                        onChange={(e) => console.log('Enabled/Disabled:', e.value)}
                        onLabel="Enabled"
                        offLabel="Disabled"
                    />
                </div>
            </div>
        </ComponentDemo>
    );
};

export default CustomLabels;
