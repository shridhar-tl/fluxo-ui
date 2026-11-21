import type { DatasourceConfig, ReportDefinition, ReportParentContext } from '../report-definition-types';
import type { SchemaResolver } from './schema-resolver';

export async function buildParentContext(
    parent: ReportDefinition,
    datasources: DatasourceConfig[],
    resolver: SchemaResolver,
): Promise<ReportParentContext> {
    const fields = await Promise.all(datasources.map((d) => resolver.resolveFields(d.id)));
    return {
        reportId: parent.id,
        reportTitle: parent.metadata.title,
        parameters: [...(parent.parentContext?.parameters ?? []), ...parent.parameters],
        datasources: datasources.map((d, i) => ({ id: d.id, name: d.name, fields: fields[i] })),
    };
}
