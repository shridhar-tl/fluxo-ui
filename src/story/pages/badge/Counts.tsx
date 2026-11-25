import React, { useState } from 'react';

import { AnnouncementIcon, MinusIcon, PlusIcon } from '../../../assets/icons';
import { Badge, Button, InputSwitch } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { readoutStyle, rowLabelStyle, rowStyle, stackStyle } from '../../demo-styles';

const code = `<Badge count={count} max={99} showZero={showZero} invisible={hidden} animateChanges pulse={pulse}>
    <Button leftIcon={AnnouncementIcon} layout="outlined" ariaLabel="Notifications" />
</Badge>

<Badge count={1500} max={999}>…</Badge>
<Badge content="NEW" color="info">…</Badge>`;

const Counts: React.FC = () => {
    const [count, setCount] = useState(7);
    const [showZero, setShowZero] = useState(false);
    const [pulse, setPulse] = useState(false);
    const [hidden, setHidden] = useState(false);

    return (
        <>
            <ComponentDemo title="Counts, Max & Animation" description="Counts cap at max, hide at zero unless showZero is set, and pop when they change.">
                <div style={stackStyle}>
                    <div style={{ ...rowStyle, gap: '2rem' }}>
                        <Badge count={count} showZero={showZero} invisible={hidden} animateChanges pulse={pulse} ariaLabel={`${count} notifications`}>
                            <Button leftIcon={AnnouncementIcon} layout="outlined" size="lg" ariaLabel="Notifications" />
                        </Badge>
                        <Badge count={count * 15} max={99} color="primary" animateChanges>
                            <Button label="Inbox" layout="outlined" />
                        </Badge>
                        <Badge count={1500} max={999} color="secondary">
                            <Button label="Archive" layout="outlined" />
                        </Badge>
                        <Badge content="NEW" color="info" size="sm">
                            <Button label="Releases" layout="outlined" />
                        </Badge>
                    </div>
                    <div style={rowStyle}>
                        <Button leftIcon={MinusIcon} size="sm" layout="outlined" ariaLabel="Decrease" onClick={() => setCount((c) => Math.max(0, c - 1))} />
                        <Button leftIcon={PlusIcon} size="sm" layout="outlined" ariaLabel="Increase" onClick={() => setCount((c) => c + 1)} />
                        <Button label="Random" size="sm" variant="primary" onClick={() => setCount(Math.floor(Math.random() * 150))} />
                        <Button label="Clear" size="sm" layout="plain" onClick={() => setCount(0)} />
                    </div>
                    <div style={{ ...rowStyle, gap: '1.5rem' }}>
                        <span style={rowLabelStyle}>Options</span>
                        <InputSwitch label="Show zero" checked={showZero} onChange={(event) => setShowZero(Boolean(event.value))} />
                        <InputSwitch label="Pulse" checked={pulse} onChange={(event) => setPulse(Boolean(event.value))} />
                        <InputSwitch label="Hide badge" checked={hidden} onChange={(event) => setHidden(Boolean(event.value))} />
                    </div>
                    <div style={readoutStyle}>Current count: {count}</div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default Counts;
