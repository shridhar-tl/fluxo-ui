import React, { useState } from 'react';

import { CalendarIcon, ChevronDownIcon, DownloadIcon, ExternalLinkIcon, HeartFilledIcon, HeartIcon, ShareIcon } from '../../../assets/icons';
import { Chip } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { readoutStyle, rowLabelStyle, rowStyle, stackStyle } from '../../demo-styles';

const code = `<Chip icon={ShareIcon} variant="outlined" onClick={share}>Share</Chip>
<Chip icon={CalendarIcon} trailingIcon={ChevronDownIcon} variant="outlined" onClick={openMenu}>This week</Chip>
<Chip href="https://react.dev" target="_blank" trailingIcon={ExternalLinkIcon}>Docs</Chip>
<Chip selectable defaultSelected icon={HeartIcon} color="danger">Favourite</Chip>`;

const ActionChips: React.FC = () => {
    const [lastAction, setLastAction] = useState<string | null>(null);
    const [liked, setLiked] = useState(false);

    return (
        <>
            <ComponentDemo title="Action, Link & Toggle Chips" description="Chips can trigger actions, navigate, or toggle on their own with aria-pressed.">
                <div style={stackStyle}>
                    <div style={rowStyle}>
                        <span style={rowLabelStyle}>Actions</span>
                        <Chip icon={ShareIcon} variant="outlined" onClick={() => setLastAction('Share')}>
                            Share
                        </Chip>
                        <Chip icon={DownloadIcon} variant="outlined" onClick={() => setLastAction('Download')}>
                            Download
                        </Chip>
                        <Chip icon={CalendarIcon} trailingIcon={ChevronDownIcon} variant="elevated" onClick={() => setLastAction('Date range')}>
                            This week
                        </Chip>
                    </div>
                    <div style={rowStyle}>
                        <span style={rowLabelStyle}>Links</span>
                        <Chip href="https://react.dev" target="_blank" trailingIcon={ExternalLinkIcon} color="info" variant="soft">
                            React docs
                        </Chip>
                        <Chip href="https://developer.mozilla.org" target="_blank" trailingIcon={ExternalLinkIcon} variant="outlined">
                            MDN
                        </Chip>
                    </div>
                    <div style={rowStyle}>
                        <span style={rowLabelStyle}>Toggle</span>
                        <Chip
                            selectable
                            selected={liked}
                            onSelectedChange={(next) => setLiked(next)}
                            icon={liked ? HeartFilledIcon : HeartIcon}
                            showCheckmark={false}
                            color="danger"
                            variant="outlined"
                        >
                            {liked ? 'Favourited' : 'Favourite'}
                        </Chip>
                        <Chip selectable defaultSelected color="success" variant="soft">
                            Notifications
                        </Chip>
                        <Chip disabled variant="outlined" onClick={() => setLastAction('Disabled')}>
                            Disabled
                        </Chip>
                    </div>
                    <div style={readoutStyle} aria-live="polite">
                        {lastAction ? `Action: ${lastAction}` : 'Click an action chip.'}
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default ActionChips;
