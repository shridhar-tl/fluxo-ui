import cn from 'classnames';
import React, { useEffect, useRef, useState } from 'react';
import { Button, InputSwitch, TextInput } from '../../../components';
import { create, createHook } from '../../../store';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';

interface ProfileState {
    user: {
        name: string;
        email: string;
        role: string;
    };
    settings: {
        theme: string;
        notifications: boolean;
        language: string;
    };
    metadata: {
        lastLogin: string;
        version: number;
    };
}

const profileStore = create<ProfileState>(() => ({
    user: { name: 'Alice', email: 'alice@example.com', role: 'Admin' },
    settings: { theme: 'light', notifications: true, language: 'English' },
    metadata: { lastLogin: new Date().toLocaleTimeString(), version: 1 },
}));

const useProfile = createHook(profileStore);

const code = `import { create, createHook } from 'fluxo-ui/store';

const profileStore = create<ProfileState>(() => ({
  user: { name: 'Alice', email: 'alice@example.com', role: 'Admin' },
  settings: { theme: 'light', notifications: true, language: 'English' },
  metadata: { lastLogin: '...', version: 1 },
}));

const useProfile = createHook(profileStore);

// Hook with selector + shallow equality (true = shallow compare)
// Only re-renders when the user object reference changes
function UserCard() {
  const user = useProfile((s) => s.user, true);
  return <div>{user.name} ({user.role})</div>;
}

// Hook with selector — only re-renders when settings change
function SettingsPanel() {
  const settings = useProfile((s) => s.settings, true);
  return <div>{settings.theme} / {settings.language}</div>;
}

// Hook with no selector — re-renders on EVERY state change
function FullStateWatcher() {
  const state = useProfile();
  return <pre>{JSON.stringify(state, null, 2)}</pre>;
}

// External (non-React) path subscription
profileStore.on('change', 'user.name', (state) => {
  console.log('Name changed:', state.user.name);
});

profileStore.on('change', 'settings', (state) => {
  console.log('Settings changed:', state.settings);
});`;

const names = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'];
const roles = ['Admin', 'Editor', 'Viewer', 'Moderator'];
const languages = ['English', 'Spanish', 'French', 'German', 'Japanese'];

const RenderBadge: React.FC<{ count: number; label: string }> = ({ count, label }) => {
    const { isDark } = useStoryTheme();

    return (
        <div
            className={cn('text-xs px-2 py-0.5 rounded flex items-center gap-1.5', {
                'bg-amber-500/20 text-amber-400': isDark,
                'bg-amber-100 text-amber-700': !isDark,
            })}
        >
            <span>{label}:</span>
            <span className="font-bold tabular-nums">{count}</span>
        </div>
    );
};

const UserCard: React.FC = () => {
    const { isDark } = useStoryTheme();
    const renderCount = useRef(0);
    renderCount.current++;

    const user = useProfile((s) => s.user, true);

    const updateName = () => {
        const current = profileStore.getState().user.name;
        const next = names[(names.indexOf(current) + 1) % names.length];
        profileStore.setState((s) => ({ user: { ...s.user, name: next } }));
    };

    const updateEmail = () => {
        const u = profileStore.getState().user;
        const domain = u.email.includes('@example.com') ? '@company.io' : '@example.com';
        profileStore.setState((s) => ({ user: { ...s.user, email: `${s.user.name.toLowerCase()}${domain}` } }));
    };

    const cycleRole = () => {
        const current = profileStore.getState().user.role;
        const next = roles[(roles.indexOf(current) + 1) % roles.length];
        profileStore.setState((s) => ({ user: { ...s.user, role: next } }));
    };

    return (
        <div className={cn('rounded-lg p-4 border', { 'border-white/10 bg-white/5': isDark, 'border-gray-200 bg-gray-50': !isDark })}>
            <div className="flex items-center justify-between mb-3">
                <div className={cn('text-xs uppercase tracking-wide font-semibold', { 'text-gray-500': isDark, 'text-gray-400': !isDark })}>
                    User Card
                </div>
                <RenderBadge count={renderCount.current} label="Renders" />
            </div>
            <div
                className={cn('text-xs mb-3 px-2 py-1 rounded italic', {
                    'bg-blue-500/10 text-blue-400': isDark,
                    'bg-blue-50 text-blue-600': !isDark,
                })}
            >
                useProfile((s) =&gt; s.user, true)
            </div>
            <div className="space-y-1 mb-3">
                <div className={cn('text-sm', { 'text-gray-300': isDark, 'text-gray-700': !isDark })}>
                    Name: <span className="font-medium text-[var(--eui-primary)]">{user.name}</span>
                </div>
                <div className={cn('text-sm', { 'text-gray-300': isDark, 'text-gray-700': !isDark })}>
                    Email: <span className="font-medium text-[var(--eui-primary)]">{user.email}</span>
                </div>
                <div className={cn('text-sm', { 'text-gray-300': isDark, 'text-gray-700': !isDark })}>
                    Role: <span className="font-medium text-[var(--eui-primary)]">{user.role}</span>
                </div>
            </div>
            <div className="flex gap-2 flex-wrap">
                <Button label="Change Name" size="xs" onClick={updateName} />
                <Button label="Change Email" size="xs" onClick={updateEmail} />
                <Button label="Cycle Role" size="xs" onClick={cycleRole} />
            </div>
        </div>
    );
};

const SettingsPanel: React.FC = () => {
    const { isDark } = useStoryTheme();
    const renderCount = useRef(0);
    renderCount.current++;

    const settings = useProfile((s) => s.settings, true);

    const toggleTheme = () => {
        profileStore.setState((s) => ({
            settings: { ...s.settings, theme: s.settings.theme === 'light' ? 'dark' : 'light' },
        }));
    };

    const toggleNotifications = () => {
        profileStore.setState((s) => ({
            settings: { ...s.settings, notifications: !s.settings.notifications },
        }));
    };

    const cycleLanguage = () => {
        const current = profileStore.getState().settings.language;
        const next = languages[(languages.indexOf(current) + 1) % languages.length];
        profileStore.setState((s) => ({ settings: { ...s.settings, language: next } }));
    };

    return (
        <div className={cn('rounded-lg p-4 border', { 'border-white/10 bg-white/5': isDark, 'border-gray-200 bg-gray-50': !isDark })}>
            <div className="flex items-center justify-between mb-3">
                <div className={cn('text-xs uppercase tracking-wide font-semibold', { 'text-gray-500': isDark, 'text-gray-400': !isDark })}>
                    Settings Panel
                </div>
                <RenderBadge count={renderCount.current} label="Renders" />
            </div>
            <div
                className={cn('text-xs mb-3 px-2 py-1 rounded italic', {
                    'bg-blue-500/10 text-blue-400': isDark,
                    'bg-blue-50 text-blue-600': !isDark,
                })}
            >
                useProfile((s) =&gt; s.settings, true)
            </div>
            <div className="space-y-1 mb-3">
                <div className={cn('text-sm', { 'text-gray-300': isDark, 'text-gray-700': !isDark })}>
                    Theme: <span className="font-medium text-[var(--eui-primary)]">{settings.theme}</span>
                </div>
                <div className={cn('text-sm flex items-center gap-2', { 'text-gray-300': isDark, 'text-gray-700': !isDark })}>
                    Notifications:
                    <InputSwitch checked={settings.notifications} onChange={toggleNotifications} size="sm" />
                </div>
                <div className={cn('text-sm', { 'text-gray-300': isDark, 'text-gray-700': !isDark })}>
                    Language: <span className="font-medium text-[var(--eui-primary)]">{settings.language}</span>
                </div>
            </div>
            <div className="flex gap-2 flex-wrap">
                <Button label="Toggle Theme" size="xs" onClick={toggleTheme} />
                <Button label="Cycle Language" size="xs" onClick={cycleLanguage} />
            </div>
        </div>
    );
};

const FullStateWatcher: React.FC = () => {
    const { isDark } = useStoryTheme();
    const renderCount = useRef(0);
    renderCount.current++;

    const state = useProfile();

    return (
        <div className={cn('rounded-lg p-4 border', { 'border-white/10 bg-white/5': isDark, 'border-gray-200 bg-gray-50': !isDark })}>
            <div className="flex items-center justify-between mb-3">
                <div className={cn('text-xs uppercase tracking-wide font-semibold', { 'text-gray-500': isDark, 'text-gray-400': !isDark })}>
                    Full State Watcher (no selector)
                </div>
                <RenderBadge count={renderCount.current} label="Renders" />
            </div>
            <div
                className={cn('text-xs mb-3 px-2 py-1 rounded italic', {
                    'bg-red-500/10 text-red-400': isDark,
                    'bg-red-50 text-red-600': !isDark,
                })}
            >
                useProfile() — re-renders on every change
            </div>
            <pre
                className={cn('text-xs font-mono overflow-auto max-h-32 p-2 rounded', {
                    'bg-black/30 text-gray-300': isDark,
                    'bg-gray-100 text-gray-700': !isDark,
                })}
            >
                {JSON.stringify(state, null, 2)}
            </pre>
        </div>
    );
};

const MetadataDisplay: React.FC = () => {
    const { isDark } = useStoryTheme();
    const renderCount = useRef(0);
    renderCount.current++;

    const metadata = useProfile((s) => s.metadata, true);

    const bumpVersion = () => {
        profileStore.setState((s) => ({
            metadata: { ...s.metadata, version: s.metadata.version + 1, lastLogin: new Date().toLocaleTimeString() },
        }));
    };

    return (
        <div className={cn('rounded-lg p-4 border', { 'border-white/10 bg-white/5': isDark, 'border-gray-200 bg-gray-50': !isDark })}>
            <div className="flex items-center justify-between mb-3">
                <div className={cn('text-xs uppercase tracking-wide font-semibold', { 'text-gray-500': isDark, 'text-gray-400': !isDark })}>
                    Metadata Display
                </div>
                <RenderBadge count={renderCount.current} label="Renders" />
            </div>
            <div
                className={cn('text-xs mb-3 px-2 py-1 rounded italic', {
                    'bg-blue-500/10 text-blue-400': isDark,
                    'bg-blue-50 text-blue-600': !isDark,
                })}
            >
                useProfile((s) =&gt; s.metadata, true)
            </div>
            <div className="space-y-1 mb-3">
                <div className={cn('text-sm', { 'text-gray-300': isDark, 'text-gray-700': !isDark })}>
                    Last Login: <span className="font-medium text-[var(--eui-primary)]">{metadata.lastLogin}</span>
                </div>
                <div className={cn('text-sm', { 'text-gray-300': isDark, 'text-gray-700': !isDark })}>
                    Version: <span className="font-medium text-[var(--eui-primary)]">v{metadata.version}</span>
                </div>
            </div>
            <Button label="Bump Version" size="xs" onClick={bumpVersion} />
        </div>
    );
};

const ExternalSubscriptionLog: React.FC = () => {
    const { isDark } = useStoryTheme();
    const [logs, setLogs] = useState<string[]>([]);
    const [pathFilter, setPathFilter] = useState('');

    useEffect(() => {
        const unsub1 = profileStore.on('change', 'user.name', (newState) => {
            setLogs((prev) => [...prev.slice(-19), `[user.name] → "${newState.user.name}"`]);
        });

        const unsub2 = profileStore.on('change', 'user.email', (newState) => {
            setLogs((prev) => [...prev.slice(-19), `[user.email] → "${newState.user.email}"`]);
        });

        const unsub3 = profileStore.on('change', 'user.role', (newState) => {
            setLogs((prev) => [...prev.slice(-19), `[user.role] → "${newState.user.role}"`]);
        });

        const unsub4 = profileStore.on('change', 'settings', (newState) => {
            setLogs((prev) => [
                ...prev.slice(-19),
                `[settings] → theme=${newState.settings.theme}, notifications=${newState.settings.notifications}, lang=${newState.settings.language}`,
            ]);
        });

        const unsub5 = profileStore.on('change', 'metadata', (newState) => {
            setLogs((prev) => [...prev.slice(-19), `[metadata] → v${newState.metadata.version}, login=${newState.metadata.lastLogin}`]);
        });

        return () => {
            unsub1();
            unsub2();
            unsub3();
            unsub4();
            unsub5();
        };
    }, []);

    const filteredLogs = pathFilter ? logs.filter((log) => log.toLowerCase().includes(pathFilter.toLowerCase())) : logs;

    return (
        <div className={cn('rounded-lg p-4 border', { 'border-white/10 bg-white/5': isDark, 'border-gray-200 bg-gray-50': !isDark })}>
            <div className="flex items-center justify-between mb-2">
                <div className={cn('text-xs uppercase tracking-wide font-semibold', { 'text-gray-500': isDark, 'text-gray-400': !isDark })}>
                    External Path Subscription Log
                </div>
                <div className="flex items-center gap-2">
                    <TextInput value={pathFilter} onChange={(e) => setPathFilter(e.value)} placeholder="Filter paths..." size="sm" />
                    <Button label="Clear" size="xs" variant="secondary" layout="plain" onClick={() => setLogs([])} />
                </div>
            </div>
            <div
                className={cn('font-mono text-xs space-y-1 max-h-48 overflow-y-auto', {
                    'text-gray-400': isDark,
                    'text-gray-600': !isDark,
                })}
            >
                {filteredLogs.length === 0 && (
                    <div className="italic opacity-50">
                        {logs.length === 0
                            ? 'Click buttons above to see which path subscriptions fire'
                            : 'No logs match the current filter'}
                    </div>
                )}
                {filteredLogs.map((log, i) => (
                    <div key={i} className={cn('py-0.5 px-2 rounded', { 'bg-white/5': isDark, 'bg-gray-100': !isDark })}>
                        {log}
                    </div>
                ))}
            </div>
        </div>
    );
};

const PathSubscriptions: React.FC = () => {
    return (
        <>
            <ComponentDemo
                title="Path-Based Subscriptions"
                description="Each component subscribes to a specific slice of state using useProfile(selector, true). The second argument enables shallow comparison. Change user data — only UserCard re-renders. Change settings — only SettingsPanel re-renders. The Full State Watcher (no selector) re-renders on every change."
                centered={false}
            >
                <div className="p-6 flex flex-col gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <UserCard />
                        <SettingsPanel />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <MetadataDisplay />
                        <FullStateWatcher />
                    </div>
                    <ExternalSubscriptionLog />
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default PathSubscriptions;
