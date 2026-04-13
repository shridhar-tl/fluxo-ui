import React from 'react';

type IconComponent = React.FC<React.SVGProps<SVGSVGElement>>;

const PlusIcon: IconComponent = (props) => React.createElement('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 20 20', fill: 'currentColor', ...props },
    React.createElement('path', { d: 'M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z' })
);

const PencilIcon: IconComponent = (props) => React.createElement('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 20 20', fill: 'currentColor', ...props },
    React.createElement('path', { d: 'm5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z' }),
    React.createElement('path', { d: 'M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z' })
);

const ShareIcon: IconComponent = (props) => React.createElement('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 20 20', fill: 'currentColor', ...props },
    React.createElement('path', { d: 'M13 4.5a2.5 2.5 0 1 1 .702 1.737L6.97 9.604a2.518 2.518 0 0 1 0 .799l6.733 3.36a2.5 2.5 0 1 1-.671 1.341l-6.733-3.36a2.5 2.5 0 1 1 0-3.481l6.733-3.36A2.52 2.52 0 0 1 13 4.5Z' })
);

const PrintIcon: IconComponent = (props) => React.createElement('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 20 20', fill: 'currentColor', ...props },
    React.createElement('path', { fillRule: 'evenodd', d: 'M5 2.75C5 1.784 5.784 1 6.75 1h6.5c.966 0 1.75.784 1.75 1.75v3.552c.377.338.75.714 1.016 1.198.38.693.484 1.548.484 2.5v3.25a.75.75 0 0 1-.75.75H14v2.25A1.75 1.75 0 0 1 12.25 18h-4.5A1.75 1.75 0 0 1 6 16.25V14H4.25a.75.75 0 0 1-.75-.75V9c0-.952.104-1.807.484-2.5.266-.484.639-.86 1.016-1.198V2.75Zm8.5 3.397V2.75a.25.25 0 0 0-.25-.25h-6.5a.25.25 0 0 0-.25.25v3.397c.566-.162 1.205-.23 2-.31A68.74 68.74 0 0 1 10 5.5c.546 0 1.058.015 1.5.087.795.08 1.434.148 2 .31ZM7.5 14v2.25c0 .138.112.25.25.25h4.5a.25.25 0 0 0 .25-.25V14h-5Z', clipRule: 'evenodd' })
);

const CopyIcon: IconComponent = (props) => React.createElement('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 20 20', fill: 'currentColor', ...props },
    React.createElement('path', { d: 'M7 3.5A1.5 1.5 0 0 1 8.5 2h3.879a1.5 1.5 0 0 1 1.06.44l3.122 3.12A1.5 1.5 0 0 1 17 6.622V12.5a1.5 1.5 0 0 1-1.5 1.5h-1v-3.379a3 3 0 0 0-.879-2.121L10.5 5.379A3 3 0 0 0 8.379 4.5H7v-1Z' }),
    React.createElement('path', { d: 'M4.5 6A1.5 1.5 0 0 0 3 7.5v9A1.5 1.5 0 0 0 4.5 18h7a1.5 1.5 0 0 0 1.5-1.5v-5.879a1.5 1.5 0 0 0-.44-1.06L9.44 6.439A1.5 1.5 0 0 0 8.378 6H4.5Z' })
);

const TrashIcon: IconComponent = (props) => React.createElement('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 20 20', fill: 'currentColor', ...props },
    React.createElement('path', { fillRule: 'evenodd', d: 'M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z', clipRule: 'evenodd' })
);

const HeartIcon: IconComponent = (props) => React.createElement('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 20 20', fill: 'currentColor', ...props },
    React.createElement('path', { d: 'm9.653 16.915-.005-.003-.019-.01a20.759 20.759 0 0 1-1.162-.682 22.045 22.045 0 0 1-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 0 1 8-2.828A4.5 4.5 0 0 1 18 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 0 1-3.744 2.582l-.019.01-.005.003h-.002a.723.723 0 0 1-.692 0l-.002-.001Z' })
);

const BookmarkIcon: IconComponent = (props) => React.createElement('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 20 20', fill: 'currentColor', ...props },
    React.createElement('path', { fillRule: 'evenodd', d: 'M10 2c-1.716 0-3.408.106-5.07.31C3.806 2.45 3 3.414 3 4.517v11.966c0 1.103.806 2.068 1.93 2.207 1.662.204 3.354.31 5.07.31 1.716 0 3.408-.106 5.07-.31 1.124-.14 1.93-1.104 1.93-2.207V4.517c0-1.103-.806-2.068-1.93-2.207A41.403 41.403 0 0 0 10 2Z', clipRule: 'evenodd' })
);

export { PlusIcon, PencilIcon, ShareIcon, PrintIcon, CopyIcon, TrashIcon, HeartIcon, BookmarkIcon };
