import type { DatasourceConfig } from '../report-definition-types';

const invalidNameChars = /[^A-Za-z0-9_]/g;

export function toDatasourceIdentifier(label: string): string {
    const cleaned = label.replace(invalidNameChars, '');
    if (!cleaned) return 'Datasource';
    return /^[0-9]/.test(cleaned) ? `Ds${cleaned}` : cleaned;
}

export function uniqueDatasourceName(base: string, existing: DatasourceConfig[], excludeId?: string): string {
    const taken = new Set(existing.filter((d) => d.id !== excludeId).map((d) => d.name.toLowerCase()));
    const root = toDatasourceIdentifier(base);
    if (!taken.has(root.toLowerCase())) return root;
    let i = 2;
    while (taken.has(`${root}${i}`.toLowerCase())) i++;
    return `${root}${i}`;
}

export function findDependents(datasourceId: string, datasources: DatasourceConfig[], getDependencies: (ds: DatasourceConfig) => string[]): DatasourceConfig[] {
    return datasources.filter((d) => d.id !== datasourceId && getDependencies(d).includes(datasourceId));
}
