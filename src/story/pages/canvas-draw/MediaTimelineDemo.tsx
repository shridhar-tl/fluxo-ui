import React, { useCallback, useState } from 'react';
import MediaTimeline from '../../../components/canvas-draw/MediaTimeline';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { initialTimelineItems } from './canvas-draw-story-data';
import type { TimelineItem, TimelineGroup } from './canvas-draw-story-data';

const code = `import { MediaTimeline } from 'ether-ui';
import type { TimelineItem, TimelineGroup } from 'ether-ui';

const [items, setItems] = useState<TimelineItem[]>([
  { id: '1', label: 'Intro', showAtMs: 0, hideAtMs: 3000,
    groupId: null, transition: 'fade' },
]);
const [groups, setGroups] = useState<TimelineGroup[]>([]);
const [selected, setSelected] = useState<string | null>(null);
const [currentMs, setCurrentMs] = useState(0);

<MediaTimeline
  items={items}
  groups={groups}
  durationMs={10000}
  currentMs={currentMs}
  selectedItemId={selected}
  onSelectItem={setSelected}
  onUpdateItem={(id, patch) =>
    setItems(prev => prev.map(it => it.id === id ? { ...it, ...patch } : it))
  }
  onUpdateGroup={(id, patch) =>
    setGroups(prev => prev.map(g => g.id === id ? { ...g, ...patch } : g))
  }
  onAddGroup={() => setGroups(prev => [...prev, { id: \`g-\${Date.now()}\`, label: 'New Group', showAtMs: 0, hideAtMs: null, transition: 'none' }])}
  onDeleteGroup={(id) => setGroups(prev => prev.filter(g => g.id !== id))}
  onSeek={setCurrentMs}
/>`;

const MediaTimelineDemo: React.FC = () => {
    const [timelineItems, setTimelineItems] = useState<TimelineItem[]>(initialTimelineItems);
    const [timelineGroups, setTimelineGroups] = useState<TimelineGroup[]>([]);
    const [selectedTimelineItem, setSelectedTimelineItem] = useState<string | null>(null);
    const [currentMs, setCurrentMs] = useState(0);

    const handleTimelineUpdateItem = useCallback((id: string, patch: Partial<TimelineItem>) => {
        setTimelineItems(prev => prev.map(it => it.id === id ? { ...it, ...patch } : it));
    }, []);

    const handleTimelineUpdateGroup = useCallback((id: string, patch: Partial<TimelineGroup>) => {
        setTimelineGroups(prev => prev.map(g => g.id === id ? { ...g, ...patch } : g));
    }, []);

    const handleTimelineAddGroup = useCallback(() => {
        const newGroup: TimelineGroup = {
            id: `grp-${Date.now()}`,
            label: `Group ${timelineGroups.length + 1}`,
            showAtMs: 0,
            hideAtMs: null,
            transition: 'none',
        };
        setTimelineGroups(prev => [...prev, newGroup]);
    }, [timelineGroups.length]);

    const handleTimelineDeleteGroup = useCallback((id: string) => {
        setTimelineGroups(prev => prev.filter(g => g.id !== id));
        setTimelineItems(prev => prev.map(it => it.groupId === id ? { ...it, groupId: null } : it));
    }, []);

    return (
        <>
            <ComponentDemo title="Interactive Timeline" centered={false}>
                <div style={{ padding: '0 8px 8px' }}>
                    <MediaTimeline
                        items={timelineItems}
                        groups={timelineGroups}
                        durationMs={10000}
                        currentMs={currentMs}
                        selectedItemId={selectedTimelineItem}
                        onSelectItem={setSelectedTimelineItem}
                        onUpdateItem={handleTimelineUpdateItem}
                        onUpdateGroup={handleTimelineUpdateGroup}
                        onAddGroup={handleTimelineAddGroup}
                        onDeleteGroup={handleTimelineDeleteGroup}
                        onSeek={setCurrentMs}
                    />
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default MediaTimelineDemo;
