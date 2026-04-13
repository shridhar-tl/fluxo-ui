import type { JsonValue } from '../../../components';

const basicObject: JsonValue = {
    name: 'John Doe',
    age: 30,
    email: 'john@example.com',
    active: true,
    role: null,
};

const nestedObject: JsonValue = {
    user: {
        id: 1,
        profile: {
            firstName: 'Jane',
            lastName: 'Smith',
            avatar: 'https://example.com/avatar.jpg',
        },
        settings: {
            theme: 'dark',
            notifications: true,
            language: 'en',
        },
    },
    metadata: {
        createdAt: '2024-01-15T10:30:00Z',
        version: '2.1.0',
    },
};

const arrayData: JsonValue = {
    fruits: ['Apple', 'Banana', 'Cherry', 'Date'],
    matrix: [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
    ],
    users: [
        { name: 'Alice', role: 'admin' },
        { name: 'Bob', role: 'user' },
        { name: 'Charlie', role: 'moderator' },
    ],
};

const complexData: JsonValue = {
    apiEndpoint: 'https://api.example.com/v2',
    database: {
        host: 'localhost',
        port: 5432,
        name: 'myapp_db',
        credentials: {
            username: 'admin',
            password: null,
        },
        replicas: [
            { host: 'replica-1.example.com', port: 5432, healthy: true },
            { host: 'replica-2.example.com', port: 5432, healthy: false },
        ],
    },
    features: {
        darkMode: true,
        beta: false,
        maxUploadSize: 10485760,
        allowedFormats: ['jpg', 'png', 'gif', 'webp'],
    },
    tags: ['production', 'v2', 'stable'],
    readme: 'https://github.com/example/project#readme',
    deprecated: null,
    debug: undefined,
};

const readOnlyData: JsonValue = {
    server: {
        hostname: 'prod-web-01',
        ip: '192.168.1.100',
        os: 'Ubuntu 22.04 LTS',
        uptime: '45 days',
    },
    resources: {
        cpu: '4 cores',
        memory: '16 GB',
        disk: '500 GB SSD',
    },
    services: ['nginx', 'node', 'postgresql', 'redis'],
};

const typeShowcaseData: JsonValue = {
    string: 'Hello, World!',
    number: 42,
    float: 3.14159,
    boolTrue: true,
    boolFalse: false,
    nullValue: null,
    emptyString: '',
    url: 'https://github.com',
    negativeNumber: -273.15,
    largeNumber: 9007199254740991,
    emptyObject: {},
    emptyArray: [],
};

export { basicObject, nestedObject, arrayData, complexData, readOnlyData, typeShowcaseData };
