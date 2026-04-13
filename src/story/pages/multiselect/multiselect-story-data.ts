export const frameworkOptions = [
    { label: 'React', value: 'react' },
    { label: 'Vue.js', value: 'vue' },
    { label: 'Angular', value: 'angular' },
    { label: 'Svelte', value: 'svelte' },
    { label: 'TypeScript', value: 'typescript' },
    { label: 'JavaScript', value: 'javascript' },
    { label: 'Next.js', value: 'nextjs' },
    { label: 'Nuxt.js', value: 'nuxtjs' },
];

export const colorOptions = [
    { label: 'Red', value: 'red' },
    { label: 'Blue', value: 'blue' },
    { label: 'Green', value: 'green' },
    { label: 'Yellow', value: 'yellow' },
    { label: 'Purple', value: 'purple' },
    { label: 'Orange', value: 'orange' },
];

export const skillOptions = [
    { label: 'HTML', value: 'html' },
    { label: 'CSS', value: 'css' },
    { label: 'JavaScript', value: 'javascript' },
    { label: 'React', value: 'react' },
    { label: 'Node.js', value: 'nodejs' },
    { label: 'Python', value: 'python' },
    { label: 'SQL', value: 'sql' },
    { label: 'Git', value: 'git' },
];

export const groupedOptions = [
    {
        label: 'Frontend',
        items: [
            { label: 'React', value: 'react' },
            { label: 'Vue.js', value: 'vue' },
            { label: 'Angular', value: 'angular' },
            { label: 'Svelte', value: 'svelte' },
        ],
    },
    {
        label: 'Backend',
        items: [
            { label: 'Node.js', value: 'nodejs' },
            { label: 'Django', value: 'django' },
            { label: 'Spring Boot', value: 'spring' },
            { label: 'Laravel', value: 'laravel' },
        ],
    },
    {
        label: 'Mobile',
        items: [
            { label: 'React Native', value: 'react-native' },
            { label: 'Flutter', value: 'flutter' },
            { label: 'Swift', value: 'swift', disabled: true },
        ],
    },
];

export const countryOptions = [
    { name: 'United States', code: 'US' },
    { name: 'Canada', code: 'CA' },
    { name: 'United Kingdom', code: 'UK' },
    { name: 'Germany', code: 'DE' },
    { name: 'France', code: 'FR' },
];
