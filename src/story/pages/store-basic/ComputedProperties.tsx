import cn from 'classnames';
import React from 'react';
import { create, createHook } from '../../../store';
import { Button, TextInput } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';

interface UserState {
    firstName: string;
    lastName: string;
}

const userStore = create<UserState>(() => ({
    firstName: 'John',
    lastName: 'Doe',
}));

userStore.compute('fullName', (state) => `${state.firstName} ${state.lastName}`, ['firstName', 'lastName']);
userStore.compute('initials', (state) => `${state.firstName.charAt(0)}${state.lastName.charAt(0)}`.toUpperCase(), ['firstName', 'lastName']);

const useUser = createHook(userStore);

const syncCode = `import { create, createHook } from 'ether-ui/store';

const userStore = create<UserState>(() => ({
  firstName: 'John',
  lastName: 'Doe',
}));

userStore.compute(
  'fullName',
  (state) => \`\${state.firstName} \${state.lastName}\`,
  ['firstName', 'lastName']
);

userStore.compute(
  'initials',
  (state) => \`\${state.firstName.charAt(0)}\${state.lastName.charAt(0)}\`.toUpperCase(),
  ['firstName', 'lastName']
);

const useUser = createHook(userStore);

function UserCard() {
  const state = useUser();
  const { firstName, lastName, fullName, initials } = state as any;

  return (
    <div>
      <div className="avatar">{initials}</div>
      <div>{fullName}</div>
      <TextInput value={firstName}
        onChange={(e) => userStore.setState({ firstName: e.value })} />
      <TextInput value={lastName}
        onChange={(e) => userStore.setState({ lastName: e.value })} />
    </div>
  );
}`;

const SyncUserCard: React.FC = () => {
    const { isDark } = useStoryTheme();
    const state = useUser() as any;
    const { firstName, lastName, fullName, initials } = state;

    return (
        <div className="flex flex-col items-center gap-5 w-full max-w-md mx-auto">
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[var(--eui-primary)] flex items-center justify-center text-white text-lg font-bold">
                    {initials}
                </div>
                <div>
                    <div className={cn('text-lg font-semibold', { 'text-gray-100': isDark, 'text-gray-800': !isDark })}>
                        {fullName}
                    </div>
                    <div className={cn('text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                        Computed from firstName + lastName
                    </div>
                </div>
            </div>
            <div className="flex gap-3 w-full">
                <TextInput
                    value={firstName}
                    onChange={(e) => userStore.setState({ firstName: e.value })}
                    placeholder="First Name"
                />
                <TextInput
                    value={lastName}
                    onChange={(e) => userStore.setState({ lastName: e.value })}
                    placeholder="Last Name"
                />
            </div>
        </div>
    );
};

interface AsyncDemoState {
    userId: number;
}

const simulateFetch = (userId: number): Promise<string> =>
    new Promise((resolve) => {
        setTimeout(() => {
            const profiles: Record<number, string> = {
                1: 'Alice Johnson — Senior Engineer',
                2: 'Bob Smith — Product Manager',
                3: 'Charlie Brown — Designer',
            };
            resolve(profiles[userId] || `User #${userId} — Unknown`);
        }, 1500);
    });

const asyncStore = create<AsyncDemoState>(() => ({ userId: 1 }));
asyncStore.compute('profile', (state) => simulateFetch(state.userId), ['userId']);
const useAsyncDemo = createHook(asyncStore);

const asyncCode = `import { create, createHook } from 'ether-ui/store';

const asyncStore = create<{ userId: number }>(() => ({ userId: 1 }));

asyncStore.compute(
  'profile',
  async (state) => {
    const res = await fetch(\`/api/users/\${state.userId}\`);
    return res.json();
  },
  ['userId']
);

const useStore = createHook(asyncStore);

function UserProfile() {
  const state = useStore() as any;
  // state.profile       → the resolved value (undefined while loading)
  // state.profileLoading → boolean (true while fetching)

  if (state.profileLoading) return <p>Loading profile...</p>;
  return <p>{state.profile}</p>;
}`;

const AsyncComputeDemo: React.FC = () => {
    const { isDark } = useStoryTheme();
    const state = useAsyncDemo() as any;

    return (
        <div className="flex flex-col items-center gap-4 w-full max-w-md mx-auto">
            <div className={cn('text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                Select a user to load their profile asynchronously
            </div>
            <div className="flex gap-2">
                {[1, 2, 3].map((id) => (
                    <Button
                        key={id}
                        label={`User ${id}`}
                        size="sm"
                        variant={state.userId === id ? 'default' : 'secondary'}
                        onClick={() => asyncStore.setState({ userId: id })}
                    />
                ))}
            </div>
            <div className={cn('w-full rounded-lg border p-4 text-center min-h-[60px] flex items-center justify-center', {
                'border-white/10 bg-white/5': isDark,
                'border-gray-200 bg-gray-50': !isDark,
            })}>
                {state.profileLoading ? (
                    <div className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-[var(--eui-primary)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <span className={cn('text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>Loading profile...</span>
                    </div>
                ) : (
                    <span className={cn('text-sm font-medium', { 'text-gray-200': isDark, 'text-gray-700': !isDark })}>
                        {state.profile || 'No profile loaded'}
                    </span>
                )}
            </div>
        </div>
    );
};

const ComputedProperties: React.FC = () => {
    return (
        <>
            <ComponentDemo title="Synchronous Computed Properties" description="Derived state that updates automatically when dependencies change" centered={false}>
                <div className="p-6">
                    <SyncUserCard />
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={syncCode} language="tsx" />
            </div>

            <div className="mt-8">
                <ComponentDemo title="Async Computed Properties" description="Computed properties that resolve asynchronously with automatic loading state" centered={false}>
                    <div className="p-6">
                        <AsyncComputeDemo />
                    </div>
                </ComponentDemo>
                <div className="mt-4">
                    <CodeBlock code={asyncCode} language="tsx" />
                </div>
            </div>
        </>
    );
};

export default ComputedProperties;
