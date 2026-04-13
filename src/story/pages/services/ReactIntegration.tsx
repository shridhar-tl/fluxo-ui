import React from 'react';
import { CodeBlock } from '../../CodeBlock';

const providerCode = `import { createContainer, ServiceProvider, ServiceScope } from 'fluxo-ui/services';

const services = createContainer();

// Class-based
class ThemeService {
    primary = '#2563eb';
    toggle() { /* ... */ }
}

services.registerSingleton(ThemeService, 'ThemeService', '$theme');

// Factory-based
services.registerTransientFactory(
    'ApiService', '$api',
    () => ({
        fetch: (url: string) => window.fetch(url).then(r => r.json()),
    })
);

// Parameterized
services.registerParameterized(
    'UserApiService', '$userApi', 'scoped',
    (resolver, userId: string) => {
        const api = resolver.resolve('ApiService');
        return {
            getProfile: () => api.fetch(\`/api/users/\${userId}\`),
            getActivity: () => api.fetch(\`/api/users/\${userId}/activity\`),
        };
    }
);

// App root — defaultParams provides fallback args for parameterized services
function App() {
    const userId = useCurrentUserId();

    return (
        <ServiceProvider container={services} defaultParams={{ UserApiService: [userId] }}>
            <Dashboard />
            <ServiceScope>
                <UserPanel />
            </ServiceScope>
        </ServiceProvider>
    );
}`;

const hooksCode = `import { useService, useServiceWithArgs, useContainer } from 'fluxo-ui/services';

// useService — resolve by name, get { $shortName: instance }
function Dashboard() {
    const { $theme, $api } = useService('ThemeService', 'ApiService');

    return (
        <div style={{ color: $theme.primary }}>
            <button onClick={() => $api.fetch('/api/stats')}>Load Stats</button>
        </div>
    );
}

// useServiceWithArgs — uses defaultParams from ServiceProvider if no args passed
function UserPanel() {
    const userApi = useServiceWithArgs('UserApiService');

    // Or override with explicit args
    const adminApi = useServiceWithArgs('UserApiService', 'admin-user-id');

    return (
        <div>
            <button onClick={() => userApi.getProfile()}>My Profile</button>
            <button onClick={() => adminApi.getActivity()}>Admin Activity</button>
        </div>
    );
}

// useContainer — direct access to the container
function AdminPanel() {
    const container = useContainer();
    const resetAll = () => container.clearInstances();
    return <button onClick={resetAll}>Reset Services</button>;
}`;

const hocCode = `import { withServices } from 'fluxo-ui/services';

function ProfileComponent({ $theme, $api, username }) {
    return (
        <div style={{ color: $theme.primary }}>
            <h2>{username}</h2>
            <button onClick={() => $api.fetch('/profile')}>Refresh</button>
        </div>
    );
}

const Profile = withServices(ProfileComponent, {
    services: ['ThemeService', 'ApiService'],
});

// Usage — only pass non-injected props
<Profile username="Jane Doe" />`;

const scopeCode = `import { ServiceScope, useScope } from 'fluxo-ui/services';

// ServiceScope auto-creates and disposes a scope on mount/unmount
function RequestHandler() {
    return (
        <ServiceScope>
            <RequestContent />
        </ServiceScope>
    );
}

function RequestContent() {
    const scope = useScope();

    // All scoped services resolved here share the same scope
    const db = scope.resolve('DbConnection');
    const logger = scope.resolve('LoggerService');

    // Scope auto-disposes on unmount
    return <div>...</div>;
}`;

const ReactIntegration: React.FC = () => (
    <div className="space-y-6">
        <div className="space-y-4">
            <h3 className="text-lg font-medium">Provider Setup</h3>
            <CodeBlock code={providerCode} language="tsx" />
        </div>
        <div className="space-y-4">
            <h3 className="text-lg font-medium">Hooks</h3>
            <CodeBlock code={hooksCode} language="tsx" />
        </div>
        <div className="space-y-4">
            <h3 className="text-lg font-medium">Higher-Order Component</h3>
            <CodeBlock code={hocCode} language="tsx" />
        </div>
        <div className="space-y-4">
            <h3 className="text-lg font-medium">Scopes</h3>
            <CodeBlock code={scopeCode} language="tsx" />
        </div>
    </div>
);

export default ReactIntegration;
