export interface StoryTeamMember {
    id: string;
    name: string;
    role: string;
    load: number;
    tasks: { key: string; title: string; hours: number }[];
}

export const storyTeamMembers: StoryTeamMember[] = [
    {
        id: 'amelia',
        name: 'Amelia Ross',
        role: 'Frontend engineer',
        load: 85,
        tasks: [
            { key: 'WEB-142', title: 'Checkout page redesign', hours: 4 },
            { key: 'WEB-150', title: 'Fix cart badge count', hours: 2.8 },
        ],
    },
    {
        id: 'noah',
        name: 'Noah Patel',
        role: 'Backend engineer',
        load: 120,
        tasks: [
            { key: 'API-77', title: 'Payment webhook retries', hours: 6 },
            { key: 'API-81', title: 'Rate limit admin endpoints', hours: 3.6 },
        ],
    },
    {
        id: 'lena',
        name: 'Lena Fischer',
        role: 'QA engineer',
        load: 55,
        tasks: [{ key: 'QA-19', title: 'Regression suite for release 4.2', hours: 4.4 }],
    },
];
