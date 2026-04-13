import React from 'react';
import { Button, showContextMenu } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { basicMenuItems } from './context-menu-story-data';

const ButtonTriggered: React.FC = () => {
    return (
        <>
            <ComponentDemo title="Click button to open menu" description="Use onClick instead of onContextMenu for button-triggered menus.">
                <Button
                    variant="secondary"
                    layout="outlined"
                    onClick={(e) => {
                        const syntheticEvent = {
                            ...e,
                            preventDefault: () => {},
                        } as React.MouseEvent;
                        showContextMenu(syntheticEvent, basicMenuItems);
                    }}
                >
                    Open Menu
                </Button>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock
                    code={`<Button onClick={(e) => showContextMenu(e as React.MouseEvent, menuItems)}>
  Open Menu
</Button>`}
                />
            </div>
        </>
    );
};

export default ButtonTriggered;
