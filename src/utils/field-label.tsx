import { FieldLabel } from '../components';

type ComponentProps<T> = T extends React.ComponentType<infer P> ? P : never;

type WithFieldLabelProps<T extends React.ComponentType<any>> = {
    label?: string;
    required?: boolean;
    error?: string;
    hint?: string;
} & ComponentProps<T>;

export type LabelOptions = {
    labelType?: 'default' | 'float' | 'fieldset';
};

export function withFieldLabel<T extends React.ComponentType<any>>(
    Component: T,
    options?: LabelOptions
): React.ComponentType<WithFieldLabelProps<T>> {
    const WrappedComponent: React.ComponentType<WithFieldLabelProps<T>> = (props) => {
        const { label, error, hint, ...componentProps } = props;
        const child = <Component {...(componentProps as ComponentProps<T>)} />;

        if (!label) {
            return child;
        }

        return (
            <FieldLabel
                label={label}
                required={componentProps.required}
                error={error}
                hint={hint}
                disabled={componentProps.disabled}
                {...options}
            >
                {child}
            </FieldLabel>
        );
    };

    WrappedComponent.displayName = `withFieldLabel(${Component.displayName || Component.name || 'Component'})`;

    return WrappedComponent;
}
