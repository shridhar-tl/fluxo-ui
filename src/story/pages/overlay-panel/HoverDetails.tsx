import React, { useCallback, useRef, useState } from 'react';
import { Button, OverlayPanel } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { storyTeamMembers, type StoryTeamMember } from './overlay-panel-story-data';

const hideDelay = 200;

const code = `const open = (e: React.MouseEvent<HTMLElement>, member: Member) => {
  window.clearTimeout(hideTimer.current);
  setActive({ target: e.currentTarget, member });
};
const scheduleClose = () => {
  hideTimer.current = window.setTimeout(() => setActive(null), 200);
};

<OverlayPanel
  isOpen={!!active}
  target={active?.target ?? null}
  onClose={() => setActive(null)}
  title={active?.member.name}
  autoFocus={false}
  onMouseEnter={() => window.clearTimeout(hideTimer.current)}
  onMouseLeave={scheduleClose}
>
  {active && <MemberTasks member={active.member} />}
</OverlayPanel>`;

interface ActiveMember {
    target: HTMLElement;
    member: StoryTeamMember;
}

const getLoadVariant = (load: number) => (load > 100 ? 'danger' : load >= 80 ? 'success' : 'warning');

const HoverDetails: React.FC = () => {
    const [active, setActive] = useState<ActiveMember | null>(null);
    const hideTimer = useRef<number | undefined>(undefined);

    const cancelClose = useCallback(() => window.clearTimeout(hideTimer.current), []);
    const scheduleClose = useCallback(() => {
        window.clearTimeout(hideTimer.current);
        hideTimer.current = window.setTimeout(() => setActive(null), hideDelay);
    }, []);

    const open = (target: HTMLElement, member: StoryTeamMember) => {
        cancelClose();
        setActive({ target, member });
    };

    return (
        <>
            <ComponentDemo
                title="Hover details"
                description="Opens on hover or focus without moving focus. The pointer can move into the panel to use its links."
            >
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {storyTeamMembers.map((member) => (
                        <span
                            key={member.id}
                            onMouseEnter={(e) => open(e.currentTarget, member)}
                            onMouseLeave={scheduleClose}
                            onFocus={(e) => open(e.currentTarget, member)}
                            onBlur={scheduleClose}
                        >
                            <Button variant={getLoadVariant(member.load)} layout="outlined" size="sm">
                                {member.name.split(' ')[0]} · {member.load}%
                            </Button>
                        </span>
                    ))}
                </div>
                <OverlayPanel
                    isOpen={!!active}
                    target={active?.target ?? null}
                    onClose={() => setActive(null)}
                    title={active?.member.name}
                    autoFocus={false}
                    onMouseEnter={cancelClose}
                    onMouseLeave={scheduleClose}
                >
                    {active && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <span style={{ color: 'var(--eui-text-muted)' }}>
                                {active.member.role} · {active.member.load}% planned
                            </span>
                            {active.member.tasks.map((task) => (
                                <div key={task.key} style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem' }}>
                                    <span>
                                        <strong style={{ color: 'var(--eui-primary)' }}>{task.key}</strong> {task.title}
                                    </span>
                                    <strong>{task.hours}h</strong>
                                </div>
                            ))}
                        </div>
                    )}
                </OverlayPanel>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default HoverDetails;
