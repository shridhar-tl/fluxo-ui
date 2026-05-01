import cn from 'classnames';
import React, { useCallback, useState } from 'react';
import { Button, FieldLabel, TextInput } from '../../../components';
import { create, createHook } from '../../../store';
import { validationMiddleware } from '../../../store/middlewares';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';

interface FormState {
    name: string;
    email: string;
    age: number;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

const formValidationErrors: { current: FormErrors } = { current: {} };

const formStore = create<FormState>(
    () => ({ name: '', email: '', age: 0 }),
    [
        validationMiddleware<FormState>({
            validator: (state) => {
                const errors: FormErrors = {};
                if (state.name.length > 0 && state.name.length < 2) {
                    errors.name = 'Name must be at least 2 characters';
                }
                if (state.name.length > 50) {
                    errors.name = 'Name cannot exceed 50 characters';
                }
                if (state.email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) {
                    errors.email = 'Please enter a valid email address';
                }
                if (state.age < 0) {
                    errors.age = 'Age cannot be negative';
                }
                if (state.age > 150) {
                    errors.age = 'Age cannot exceed 150';
                }
                return Object.keys(errors).length > 0 ? errors : undefined;
            },
            onValidationError: (errors) => {
                formValidationErrors.current = errors as FormErrors;
            },
        }),
    ],
);
const useFormStore = createHook(formStore);

interface SimpleValidatedState {
    amount: number;
}

const simpleValidationError: { current: string } = { current: '' };

const simpleValidatedStore = create<SimpleValidatedState>(
    () => ({ amount: 10 }),
    [
        validationMiddleware<SimpleValidatedState>({
            validator: (state) => {
                const errors: Record<string, string> = {};
                if (state.amount < 0) {
                    errors.amount = 'Amount cannot be negative';
                }
                if (state.amount > 100) {
                    errors.amount = 'Amount cannot exceed 100';
                }
                return Object.keys(errors).length > 0 ? errors : undefined;
            },
            onValidationError: (errors) => {
                simpleValidationError.current = errors.amount || 'Validation failed';
            },
        }),
    ],
);
const useSimpleValidatedStore = createHook(simpleValidatedStore);

const validationCode = `import { create, createHook } from 'fluxo-ui/store';
import { validationMiddleware } from 'fluxo-ui/store/middlewares';

interface FormState {
  name: string;
  email: string;
  age: number;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

const validationErrors: { current: FormErrors } = { current: {} };

const formStore = create<FormState>(
  () => ({ name: '', email: '', age: 0 }),
  [validationMiddleware<FormState>({
    validator: (state) => {
      const errors: FormErrors = {};
      if (state.name.length > 0 && state.name.length < 2) {
        errors.name = 'Name must be at least 2 characters';
      }
      if (state.email.length > 0 &&
          !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(state.email)) {
        errors.email = 'Please enter a valid email address';
      }
      if (state.age < 0) errors.age = 'Age cannot be negative';
      if (state.age > 150) errors.age = 'Age cannot exceed 150';
      return Object.keys(errors).length > 0 ? errors : undefined;
    },
    onValidationError: (errors) => {
      validationErrors.current = errors as FormErrors;
    }
  })]
);

const useFormStore = createHook(formStore);

function FormDemo() {
  const { name, email, age } = useFormStore();
  const [errors, setErrors] = useState<FormErrors>({});

  const updateField = (update: Partial<FormState>) => {
    validationErrors.current = {};
    formStore.setState(update);
    requestAnimationFrame(() => {
      setErrors({ ...validationErrors.current });
    });
  };

  return (
    <form>
      <TextInput label="Name" value={name}
        onChange={v => updateField({ name: v })} />
      {errors.name && <span className="error">{errors.name}</span>}

      <TextInput label="Email" value={email}
        onChange={v => updateField({ email: v })} />
      {errors.email && <span className="error">{errors.email}</span>}

      <TextInput label="Age" type="number" value={String(age)}
        onChange={v => updateField({ age: Number(v) })} />
      {errors.age && <span className="error">{errors.age}</span>}
    </form>
  );
}`;

const SimpleValidation: React.FC = () => {
    const { isDark } = useStoryTheme();
    const { amount } = useSimpleValidatedStore();
    const [lastError, setLastError] = useState<string | null>(null);

    const trySetAmount = useCallback((newAmount: number) => {
        simpleValidationError.current = '';
        simpleValidatedStore.setState({ amount: newAmount });
        requestAnimationFrame(() => {
            if (simpleValidationError.current) {
                setLastError(simpleValidationError.current);
            } else {
                setLastError(null);
            }
        });
    }, []);

    return (
        <ComponentDemo
            title="Basic Validation"
            description="Reject invalid state updates with validationMiddleware. Invalid setState calls are blocked entirely."
        >
            <div className="flex flex-col items-center gap-4">
                <div className="text-4xl font-bold tabular-nums text-[var(--eui-primary)]">{amount}</div>
                <div className={cn('text-xs', { 'text-gray-500': isDark, 'text-gray-400': !isDark })}>Valid range: 0 to 100</div>
                {lastError && (
                    <div
                        className={cn('flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg', {
                            'bg-red-500/10 text-red-400 border border-red-500/20': isDark,
                            'bg-red-50 text-red-600 border border-red-200': !isDark,
                        })}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0">
                            <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                                clipRule="evenodd"
                            />
                        </svg>
                        {lastError}
                    </div>
                )}
                <div className="flex gap-2 flex-wrap justify-center">
                    <Button label="+10" size="sm" onClick={() => trySetAmount(amount + 10)} />
                    <Button label="-10" size="sm" onClick={() => trySetAmount(amount - 10)} />
                    <Button label="Set -5 (blocked)" size="sm" variant="danger" onClick={() => trySetAmount(-5)} />
                    <Button label="Set 150 (blocked)" size="sm" variant="danger" onClick={() => trySetAmount(150)} />
                </div>
            </div>
        </ComponentDemo>
    );
};

const FormValidation: React.FC = () => {
    const { isDark } = useStoryTheme();
    const { name, email, age } = useFormStore();
    const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
    const [touchedFields, setTouchedFields] = useState<Set<keyof FormState>>(new Set());
    const [submitAttempted, setSubmitAttempted] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const updateField = useCallback(<K extends keyof FormState>(field: K, value: FormState[K]) => {
        formValidationErrors.current = {};
        formStore.setState({ [field]: value } as Partial<FormState>);
        setTouchedFields((prev) => new Set(prev).add(field));
        requestAnimationFrame(() => {
            setFieldErrors((prev) => {
                const next = { ...prev };
                if (formValidationErrors.current[field]) {
                    next[field] = formValidationErrors.current[field];
                } else {
                    delete next[field];
                }
                return next;
            });
            setSubmitSuccess(false);
        });
    }, []);

    const handleSubmit = useCallback(() => {
        setSubmitAttempted(true);
        const allFields: (keyof FormState)[] = ['name', 'email', 'age'];
        setTouchedFields(new Set(allFields));

        const currentState = formStore.getState();
        const requiredErrors: FormErrors = {};
        if (!currentState.name) requiredErrors.name = 'Name is required';
        if (!currentState.email) requiredErrors.email = 'Email is required';
        if (!currentState.age) requiredErrors.age = 'Age is required';

        const combined = { ...requiredErrors, ...fieldErrors };
        if (Object.keys(combined).length > 0) {
            setFieldErrors(combined);
            setSubmitSuccess(false);
        } else {
            setFieldErrors({});
            setSubmitSuccess(true);
        }
    }, [fieldErrors]);

    const handleReset = useCallback(() => {
        formStore.setState({ name: '', email: '', age: 0 });
        setFieldErrors({});
        setTouchedFields(new Set());
        setSubmitAttempted(false);
        setSubmitSuccess(false);
    }, []);

    const shouldShowError = (field: keyof FormState) => (touchedFields.has(field) || submitAttempted) && !!fieldErrors[field];

    return (
        <ComponentDemo
            title="Form Validation"
            description="Field-level validation with per-field error messages. Invalid updates are rejected by the middleware."
        >
            <div className="w-full max-w-md mx-auto flex flex-col gap-4">
                <FieldLabel label="Name" error={shouldShowError('name') ? fieldErrors.name : undefined}>
                    <TextInput value={name} placeholder="Enter your name" onChange={(e) => updateField('name', e.value)} />
                </FieldLabel>

                <FieldLabel label="Email" error={shouldShowError('email') ? fieldErrors.email : undefined}>
                    <TextInput value={email} placeholder="user@example.com" onChange={(e) => updateField('email', e.value)} />
                </FieldLabel>

                <FieldLabel label="Age" error={shouldShowError('age') ? fieldErrors.age : undefined}>
                    <TextInput
                        value={age === 0 && !touchedFields.has('age') ? '' : String(age)}
                        placeholder="Enter your age"
                        onChange={(e) => updateField('age', Number(e.value) || 0)}
                    />
                </FieldLabel>

                {submitSuccess && (
                    <div
                        className={cn('flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg', {
                            'bg-green-500/10 text-green-400 border border-green-500/20': isDark,
                            'bg-green-50 text-green-700 border border-green-200': !isDark,
                        })}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0">
                            <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
                                clipRule="evenodd"
                            />
                        </svg>
                        All fields are valid! Form submitted successfully.
                    </div>
                )}

                <div className="flex gap-2 justify-end pt-2">
                    <Button label="Reset" size="sm" variant="secondary" onClick={handleReset} />
                    <Button label="Submit" size="sm" onClick={handleSubmit} />
                </div>

                <div
                    className={cn('rounded-lg px-4 py-3 text-xs font-mono', {
                        'bg-white/5 text-gray-400 border border-white/10': isDark,
                        'bg-gray-50 text-gray-500 border border-gray-200': !isDark,
                    })}
                >
                    <div
                        className={cn('text-[10px] uppercase tracking-wider font-semibold mb-2', {
                            'text-gray-500': isDark,
                            'text-gray-400': !isDark,
                        })}
                    >
                        Current Store State
                    </div>
                    <pre className="whitespace-pre-wrap">{JSON.stringify({ name, email, age }, null, 2)}</pre>
                </div>
            </div>
        </ComponentDemo>
    );
};

const ValidationDemo: React.FC = () => {
    return (
        <>
            <div className="space-y-8">
                <SimpleValidation />
                <FormValidation />
            </div>
            <div className="mt-4">
                <CodeBlock code={validationCode} language="tsx" />
            </div>
        </>
    );
};

export default ValidationDemo;
