import type { ListItem } from '../../../../types';
import type { ExpressionTypeContext } from '../../expression/expression-types';
import type { DerivedTransform } from '../../report-definition-types';

export interface TransformEditorProps<T extends DerivedTransform> {
    transform: T;
    onChange: (transform: DerivedTransform) => void;
    fieldPaths: string[];
    typeContext: ExpressionTypeContext;
    datasourceOptions: ListItem[];
    idPrefix: string;
}
