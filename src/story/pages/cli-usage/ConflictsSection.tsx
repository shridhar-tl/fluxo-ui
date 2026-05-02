import React from 'react';

interface ConflictRow {
    kind: string;
    detection: string;
    behavior: string;
    chip: string;
    chipClass: string;
}

const rows: ConflictRow[] = [
    {
        kind: 'new',
        chip: 'auto-write',
        chipClass: 'bg-emerald-100 text-emerald-700',
        detection: 'No file at the target path on disk.',
        behavior: 'Writes the new file. Resolver is never consulted.',
    },
    {
        kind: 'unchanged',
        chip: 'no-op',
        chipClass: 'bg-gray-100 text-gray-700',
        detection: 'Target exists and its content already matches the new content (CR/CRLF normalized).',
        behavior: 'Skipped silently. The file is never touched, mtime stays the same.',
    },
    {
        kind: 'updated',
        chip: 'auto-write',
        chipClass: 'bg-emerald-100 text-emerald-700',
        detection: 'Target exists, on-disk content matches the recorded checksum, but the new content differs (a real upstream change).',
        behavior: 'Writes the new file. Resolver is never consulted — there are no local edits to preserve.',
    },
    {
        kind: 'locally-modified',
        chip: 'asks',
        chipClass: 'bg-amber-100 text-amber-800',
        detection: 'Target exists, on-disk content differs from the recorded checksum (you edited the file).',
        behavior:
            'Default = Skip (preserve your edit). Force mode = Overwrite. In TTY mode the per-file resolver asks Overwrite / Skip / Overwrite all of this kind / Skip all of this kind.',
    },
    {
        kind: 'foreign',
        chip: 'asks',
        chipClass: 'bg-amber-100 text-amber-800',
        detection: 'Target exists but no checksum is recorded (the file was added outside the CLI, often a leftover from a previous tool).',
        behavior:
            'Default = Skip. Force mode = Overwrite. The per-file resolver tracks foreign decisions independently from locally-modified ones — Skip-all on one kind does not silence the other.',
    },
];

const ConflictsSection: React.FC = () => (
    <section className="scroll-mt-8" id="conflicts">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">Conflict resolution</h2>
        <p className="mb-6 text-gray-600 leading-relaxed">
            Every file the CLI is about to write is classified into one of five kinds. Two of them auto-write, one is a no-op, and the
            remaining two are conflicts that fire the per-file resolver. Decisions made via the batch options apply only within their kind so
            you stay in control even when answering a long stream of prompts.
        </p>
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
                <caption className="sr-only">Per-file conflict classifications and how the CLI handles each kind</caption>
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="text-left px-4 py-3 font-semibold text-gray-700 w-44">
                            Kind
                        </th>
                        <th scope="col" className="text-left px-4 py-3 font-semibold text-gray-700">
                            Detected when
                        </th>
                        <th scope="col" className="text-left px-4 py-3 font-semibold text-gray-700">
                            Behavior
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, idx) => (
                        <tr key={row.kind} className={idx > 0 ? 'border-t border-gray-200' : undefined}>
                            <td className="align-top px-4 py-3">
                                <div className="flex items-center gap-2">
                                    <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs font-semibold">
                                        {row.kind}
                                    </code>
                                </div>
                                <span className={`mt-2 inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide ${row.chipClass}`}>
                                    {row.chip}
                                </span>
                            </td>
                            <td className="align-top px-4 py-3 text-gray-600 leading-relaxed">{row.detection}</td>
                            <td className="align-top px-4 py-3 text-gray-600 leading-relaxed">{row.behavior}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </section>
);

export default ConflictsSection;
