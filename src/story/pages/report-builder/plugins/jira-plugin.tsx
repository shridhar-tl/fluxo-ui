import React from 'react';
import type { DatasourcePlugin, DatasetField } from '../../../../components/report-builder';
import { jiraSampleData } from './jira-sample-data';

function buildJiraFields(flattenSubtasks: boolean, includeComments: boolean): DatasetField[] {
    if (flattenSubtasks) {
        return [
            { name: 'issueKey', type: 'string' },
            { name: 'issueSummary', type: 'string' },
            { name: 'issueStatus', type: 'string' },
            { name: 'subtaskKey', type: 'string' },
            { name: 'subtaskSummary', type: 'string' },
            { name: 'subtaskStatus', type: 'string' },
            { name: 'subtaskAssignee', type: 'string' },
        ];
    }
    const base: DatasetField[] = [
        { name: 'id', type: 'string' },
        { name: 'key', type: 'string' },
        { name: 'summary', type: 'string' },
        { name: 'status', type: 'string' },
        { name: 'priority', type: 'string' },
        { name: 'assignee', type: 'string' },
        { name: 'reporter', type: 'string' },
        { name: 'created', type: 'date' },
        { name: 'updated', type: 'date' },
        { name: 'storyPoints', type: 'number' },
        { name: 'subtaskCount', type: 'number' },
        { name: 'commentCount', type: 'number' },
    ];
    if (!includeComments) return base;
    return [
        ...base,
        { name: 'subtasks', type: 'array', children: [
            { name: 'id', type: 'string' },
            { name: 'key', type: 'string' },
            { name: 'summary', type: 'string' },
            { name: 'status', type: 'string' },
            { name: 'assignee', type: 'string' },
        ] },
        { name: 'comments', type: 'array', children: [
            { name: 'id', type: 'string' },
            { name: 'author', type: 'string' },
            { name: 'body', type: 'string' },
            { name: 'created', type: 'date' },
        ] },
    ];
}

const JiraConfigUI: React.FC<{ config: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }> = ({ config, onChange }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ padding: '10px 12px', background: 'var(--eui-bg-subtle)', borderRadius: 6, border: '1px solid var(--eui-border-subtle)', fontSize: 12, color: 'var(--eui-text-muted)' }}>
            Uses built-in Jira-like sample data. Nested structure: Issues → Subtasks → Comments.
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, cursor: 'pointer' }}>
            <input
                type="checkbox"
                checked={(config.flattenSubtasks as boolean) ?? false}
                onChange={(e) => onChange({ ...config, flattenSubtasks: e.target.checked })}
            />
            Flatten subtasks (return subtasks as flat rows)
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, cursor: 'pointer' }}>
            <input
                type="checkbox"
                checked={(config.includeComments as boolean) ?? true}
                onChange={(e) => onChange({ ...config, includeComments: e.target.checked })}
            />
            Include comments in output
        </label>
    </div>
);

export const jiraPlugin: DatasourcePlugin = {
    type: 'jira-sample',
    name: 'Jira Sample',
    description: 'Pre-loaded Jira-like nested dataset. Issues with subtasks and comments.',
    icon: (() => (
        <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.53 2c0 2.4 1.97 4.35 4.35 4.35h1.81v1.76c0 2.4 1.96 4.36 4.36 4.36V2.5a.5.5 0 0 0-.5-.5H11.53zM6.77 6.8c0 2.4 1.96 4.36 4.36 4.36h1.8v1.77c0 2.4 1.97 4.36 4.37 4.36V7.3a.5.5 0 0 0-.5-.5H6.77zM2 11.6c0 2.4 1.97 4.36 4.37 4.36h1.8v1.77c0 2.4 1.97 4.36 4.37 4.36v-10a.5.5 0 0 0-.5-.5H2z"/>
        </svg>
    )) as unknown as DatasourcePlugin['icon'],
    initialConfig: () => ({ flattenSubtasks: false, includeComments: true }),
    ConfigUI: JiraConfigUI,
    fetch: async (config) => {
        const flattenSubtasks = config.flattenSubtasks as boolean;
        const includeComments = (config.includeComments as boolean) ?? true;

        if (flattenSubtasks) {
            const rows = jiraSampleData.flatMap((issue) =>
                issue.subtasks.map((sub) => ({
                    issueKey: issue.key,
                    issueSummary: issue.summary,
                    issueStatus: issue.status,
                    subtaskKey: sub.key,
                    subtaskSummary: sub.summary,
                    subtaskStatus: sub.status,
                    subtaskAssignee: sub.assignee,
                })),
            );
            return { rows, fields: buildJiraFields(true, includeComments) };
        }

        const rows = jiraSampleData.map((issue) => ({
            id: issue.id,
            key: issue.key,
            summary: issue.summary,
            status: issue.status,
            priority: issue.priority,
            assignee: issue.assignee,
            reporter: issue.reporter,
            created: issue.created,
            updated: issue.updated,
            storyPoints: issue.storyPoints,
            subtaskCount: issue.subtasks.length,
            commentCount: issue.comments.length,
            ...(includeComments ? {
                subtasks: issue.subtasks,
                comments: issue.comments,
            } : {}),
        }));

        return { rows, fields: buildJiraFields(false, includeComments) };
    },
    inferSchema: (config) => buildJiraFields(
        (config.flattenSubtasks as boolean) ?? false,
        (config.includeComments as boolean) ?? true,
    ),
};
