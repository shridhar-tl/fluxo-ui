import React, { useState } from 'react';
import { Checkbox, DiffViewer, SelectButton } from '../../../components';
import { AlignLeftIcon, SplitViewIcon } from '../../../assets/icons';
import type { DiffVariant } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

interface DiffFile {
    name: string;
    path: string;
    added: number;
    removed: number;
    oldValue: string;
    newValue: string;
}

const files: DiffFile[] = [
    {
        name: 'server.js',
        path: 'src/server.js',
        added: 18,
        removed: 6,
        oldValue: `import express from 'express';
import { createPool } from 'mysql2/promise';
import bcrypt from 'bcrypt';

const app = express();
const PORT = 3000;

const pool = createPool({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'users_db',
});

app.use(express.json());

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Missing fields' });
    }
    const hashed = await bcrypt.hash(password, 10);
    await pool.execute(
        'INSERT INTO users (username, password) VALUES (?, ?)',
        [username, hashed]
    );
    res.status(201).json({ message: 'User created' });
});

app.get('/users', async (req, res) => {
    const [rows] = await pool.execute('SELECT id, username FROM users');
    res.json(rows);
});

app.listen(PORT, () => {
    console.log(\`Server running on port \${PORT}\`);
});
`,
        newValue: `import express from 'express';
import { createPool } from 'mysql2/promise';
import bcrypt from 'bcrypt';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const app = express();
const PORT = process.env.PORT ?? 3000;

const pool = createPool({
    host: process.env.DB_HOST ?? 'localhost',
    user: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASS ?? '',
    database: process.env.DB_NAME ?? 'users_db',
    connectionLimit: 10,
});

app.use(helmet());
app.use(express.json({ limit: '16kb' }));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/register', limiter);

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    if (password.length < 8) {
        return res.status(400).json({ error: 'Password too short' });
    }
    const hashed = await bcrypt.hash(password, 12);
    await pool.execute(
        'INSERT INTO users (username, password_hash, created_at) VALUES (?, ?, NOW())',
        [username, hashed]
    );
    res.status(201).json({ message: 'User registered successfully' });
});

app.get('/users', async (req, res) => {
    const [rows] = await pool.execute(
        'SELECT id, username, created_at FROM users ORDER BY created_at DESC'
    );
    res.json({ users: rows, total: (rows as unknown[]).length });
});

app.listen(PORT, () => {
    console.log(\`Server running on port \${PORT}\`);
});
`,
    },
    {
        name: 'auth.ts',
        path: 'src/middleware/auth.ts',
        added: 14,
        removed: 8,
        oldValue: `import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const SECRET = 'hardcoded-secret-key';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    try {
        const decoded = jwt.verify(token, SECRET);
        (req as any).user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Invalid token' });
    }
};
`,
        newValue: `import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const SECRET = process.env.JWT_SECRET;
if (!SECRET) throw new Error('JWT_SECRET env variable is required');

const BEARER_PREFIX = 'Bearer ';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith(BEARER_PREFIX)) {
        return res.status(401).json({ error: 'Authorization header missing or malformed' });
    }
    const token = authHeader.slice(BEARER_PREFIX.length);
    try {
        const decoded = jwt.verify(token, SECRET as string, { algorithms: ['HS256'] });
        (req as any).user = decoded;
        next();
    } catch (err) {
        const message = err instanceof jwt.TokenExpiredError ? 'Token expired' : 'Invalid token';
        return res.status(403).json({ error: message });
    }
};

export const requireRole = (role: string) => (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user || user.role !== role) {
        return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
};
`,
    },
    {
        name: '.env.example',
        path: '.env.example',
        added: 7,
        removed: 2,
        oldValue: `PORT=3000
DB_HOST=localhost
`,
        newValue: `PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=users_db
JWT_SECRET=change-me-in-production
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
`,
    },
    {
        name: 'package.json',
        path: 'package.json',
        added: 4,
        removed: 1,
        oldValue: `{
  "name": "api-server",
  "version": "1.0.0",
  "dependencies": {
    "bcrypt": "^5.1.0",
    "express": "^4.18.0",
    "jsonwebtoken": "^9.0.0",
    "mysql2": "^3.6.0"
  }
}
`,
        newValue: `{
  "name": "api-server",
  "version": "1.1.0",
  "dependencies": {
    "bcrypt": "^5.1.0",
    "express": "^4.18.0",
    "express-rate-limit": "^7.1.0",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.0.0",
    "mysql2": "^3.6.0"
  }
}
`,
    },
];

const viewItems = [
    { label: 'Unified', value: 'unified', icon: <AlignLeftIcon style={{ width: 14, height: 14 }} aria-hidden="true" /> },
    { label: 'Split', value: 'split', icon: <SplitViewIcon style={{ width: 14, height: 14 }} aria-hidden="true" /> },
];

const code = `<DiffViewer
    variant={view}
    oldValue={selectedFile.oldValue}
    newValue={selectedFile.newValue}
    oldTitle={\`\${selectedFile.name} (before)\`}
    newTitle={\`\${selectedFile.name} (after)\`}
    wordDiff={wordDiff}
    ignoreWhitespace={ignoreWs}
    ignoreCase={ignoreCase}
    ignoreEmptyLines={ignoreEmpty}
    collapseUnchanged={3}
/>`;

const totalAdded = files.reduce((s, f) => s + f.added, 0);
const totalRemoved = files.reduce((s, f) => s + f.removed, 0);

const BitbucketStyle: React.FC = () => {
    const [selectedIdx, setSelectedIdx] = useState(0);
    const [view, setView] = useState<DiffVariant>('unified');
    const [wordDiff, setWordDiff] = useState(true);
    const [ignoreWs, setIgnoreWs] = useState(false);
    const [ignoreCase, setIgnoreCase] = useState(false);
    const [ignoreEmpty, setIgnoreEmpty] = useState(false);

    const selectedFile = files[selectedIdx];

    return (
        <>
            <ComponentDemo
                title="Interactive Diff Viewer"
                description="File list on the left, diff on the right. Switch between unified and split view, toggle word highlighting and ignore options."
            >
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 0 }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 8,
                        padding: '8px 12px',
                        background: 'var(--eui-bg-subtle)',
                        border: '1px solid var(--eui-border-subtle)',
                        borderBottom: 'none',
                        borderRadius: '6px 6px 0 0',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--eui-text)' }}>
                                {files.length} files changed
                            </span>
                            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#16a34a', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 4, padding: '1px 7px' }}>
                                +{totalAdded}
                            </span>
                            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#dc2626', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 4, padding: '1px 7px' }}>
                                −{totalRemoved}
                            </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
                                <Checkbox checked={wordDiff} onChange={(e) => setWordDiff(e.value)} label="Word diff" />
                                <Checkbox checked={ignoreWs} onChange={(e) => setIgnoreWs(e.value)} label="Ignore whitespace" />
                                <Checkbox checked={ignoreCase} onChange={(e) => setIgnoreCase(e.value)} label="Ignore case" />
                                <Checkbox checked={ignoreEmpty} onChange={(e) => setIgnoreEmpty(e.value)} label="Ignore empty lines" />
                            </div>
                            <div style={{ width: 1, height: 20, background: 'var(--eui-border-subtle)', flexShrink: 0 }} aria-hidden="true" />
                            <SelectButton
                                items={viewItems}
                                value={view}
                                size="sm"
                                onChange={(e) => setView(e.value as DiffVariant)}
                            />
                        </div>
                    </div>

                    <div style={{
                        display: 'flex',
                        border: '1px solid var(--eui-border-subtle)',
                        borderRadius: '0 0 6px 6px',
                        overflow: 'hidden',
                        minHeight: 520,
                    }}>
                        <div style={{
                            width: 220,
                            flexShrink: 0,
                            borderRight: '1px solid var(--eui-border-subtle)',
                            background: 'var(--eui-bg-subtle)',
                            display: 'flex',
                            flexDirection: 'column',
                            overflowY: 'auto',
                        }}
                            role="list"
                            aria-label="Changed files"
                        >
                            <div style={{ padding: '8px 10px 4px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--eui-text-muted)' }}>
                                Files changed
                            </div>
                            {files.map((file, idx) => (
                                <button
                                    key={idx}
                                    role="listitem"
                                    onClick={() => setSelectedIdx(idx)}
                                    aria-current={idx === selectedIdx ? 'true' : undefined}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 2,
                                        padding: '7px 10px',
                                        background: idx === selectedIdx ? 'var(--eui-primary-subtle, rgba(var(--eui-primary-rgb,59,130,246),0.1))' : 'transparent',
                                        borderLeft: idx === selectedIdx ? '2px solid var(--eui-primary, #3b82f6)' : '2px solid transparent',
                                        borderTop: 'none',
                                        borderRight: 'none',
                                        borderBottom: '1px solid var(--eui-border-subtle)',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        width: '100%',
                                        boxSizing: 'border-box',
                                    }}
                                >
                                    <span style={{
                                        fontSize: '0.78rem',
                                        fontWeight: idx === selectedIdx ? 600 : 400,
                                        color: idx === selectedIdx ? 'var(--eui-primary, #3b82f6)' : 'var(--eui-text)',
                                        fontFamily: 'monospace',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        display: 'block',
                                    }}>
                                        {file.name}
                                    </span>
                                    <span style={{
                                        fontSize: '0.68rem',
                                        color: 'var(--eui-text-muted)',
                                        fontFamily: 'monospace',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        display: 'block',
                                    }}>
                                        {file.path}
                                    </span>
                                    <div style={{ display: 'flex', gap: 5, marginTop: 1 }}>
                                        <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#16a34a' }}>+{file.added}</span>
                                        <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#dc2626' }}>−{file.removed}</span>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                padding: '6px 12px',
                                background: 'var(--eui-bg-subtle)',
                                borderBottom: '1px solid var(--eui-border-subtle)',
                            }}>
                                <span style={{ fontSize: '0.78rem', color: 'var(--eui-text-muted)', fontFamily: 'monospace', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {selectedFile.path}
                                </span>
                                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#16a34a', whiteSpace: 'nowrap' }}>+{selectedFile.added}</span>
                                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#dc2626', whiteSpace: 'nowrap' }}>−{selectedFile.removed}</span>
                            </div>
                            <div style={{ flex: 1 }}>
                                <DiffViewer
                                    variant={view}
                                    oldValue={selectedFile.oldValue}
                                    newValue={selectedFile.newValue}
                                    oldTitle={`${selectedFile.name} (before)`}
                                    newTitle={`${selectedFile.name} (after)`}
                                    wordDiff={wordDiff}
                                    ignoreWhitespace={ignoreWs}
                                    ignoreCase={ignoreCase}
                                    ignoreEmptyLines={ignoreEmpty}
                                    collapseUnchanged={3}
                                    maxHeight={480}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default BitbucketStyle;
