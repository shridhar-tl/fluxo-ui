import cn from 'classnames';
import React, { useMemo, useState } from 'react';
import { createModel, createItemHook } from '../../../store';
import { Button, TextInput, TextArea } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';

interface ContactForm {
    id: string;
    name: string;
    email: string;
    phone: string;
    message: string;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\+?[\d\s-]{7,15}$/;

const contactFactory = createModel<ContactForm>({
    selectId: (state) => state.id,
    createWithDefaults: (id) => ({
        id,
        name: '',
        email: '',
        phone: '',
        message: '',
    }),
    validate: (state) => {
        const errors: Record<string, string | object> = {};

        if (!state.name.trim()) {
            errors.name = 'Name is required';
        } else if (state.name.trim().length < 2) {
            errors.name = 'Name must be at least 2 characters';
        }

        if (!state.email.trim()) {
            errors.email = 'Email is required';
        } else if (!emailRegex.test(state.email)) {
            errors.email = 'Please enter a valid email address';
        }

        if (state.phone && !phoneRegex.test(state.phone)) {
            errors.phone = 'Please enter a valid phone number';
        }

        if (!state.message.trim()) {
            errors.message = 'Message is required';
        } else if (state.message.trim().length < 10) {
            errors.message = 'Message must be at least 10 characters';
        }

        return Object.keys(errors).length > 0 ? errors as Partial<Record<keyof ContactForm, string | object>> & Record<string, object> : undefined;
    },
    validateBehavior: 'change',
});

const code = `import { createModel } from 'ether-ui/store';

interface ContactForm {
    id: string;
    name: string;
    email: string;
    phone: string;
    message: string;
}

const contactFactory = createModel<ContactForm>({
    selectId: (state) => state.id,
    createWithDefaults: (id) => ({
        id, name: '', email: '', phone: '', message: '',
    }),
    validate: (state) => {
        const errors: Partial<Record<keyof ContactForm, string>> = {};
        if (!state.name.trim()) errors.name = 'Name is required';
        else if (state.name.trim().length < 2)
            errors.name = 'Name must be at least 2 characters';

        if (!state.email.trim()) errors.email = 'Email is required';
        else if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(state.email))
            errors.email = 'Invalid email';

        if (state.phone && !/^\\+?[\\d\\s-]{7,15}$/.test(state.phone))
            errors.phone = 'Invalid phone number';

        if (!state.message.trim()) errors.message = 'Message is required';
        else if (state.message.trim().length < 10)
            errors.message = 'At least 10 characters';

        return Object.keys(errors).length > 0 ? errors : undefined;
    },
    validateBehavior: 'change',
});

const store = contactFactory.create({ id: 'form-1' });
const useForm = createItemHook(store);

function ContactFormUI() {
    const form = useForm();
    const [touched, setTouched] = useState(new Set());
    const errors = useMemo(() => { /* derive from form state */ }, [form]);

    return (
        <form>
            <TextInput value={form.name}
                onChange={(e) => store.setState({ name: e.value })}
                onBlur={() => setTouched(prev => new Set(prev).add('name'))}
                invalid={touched.has('name') && !!errors.name} />
            {touched.has('name') && errors.name &&
                <p className="error">{errors.name}</p>}
            {/* ... other fields */}
        </form>
    );
}`;

interface FieldErrors {
    name?: string;
    email?: string;
    phone?: string;
    message?: string;
}

type FieldKey = keyof FieldErrors;

const requiredFields: FieldKey[] = ['name', 'email', 'message'];

const fieldLabels: Record<FieldKey, string> = {
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    message: 'Message',
};

const fieldPlaceholders: Record<FieldKey, string> = {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1 555-0123 (optional)',
    message: 'Your message here (at least 10 characters)...',
};

const ValidationDemo: React.FC = () => {
    const { isDark } = useStoryTheme();
    const [store] = useState(() => contactFactory.create({ id: 'validation-demo-' + Date.now() }));
    const useForm = useMemo(() => createItemHook(store), [store]);
    const form = useForm() as ContactForm & { id: string; isStale: boolean; isLoading: boolean; isSaving: boolean; isDeleting: boolean };
    const [submitted, setSubmitted] = useState(false);
    const [touched, setTouched] = useState<Set<string>>(new Set());

    const errors: FieldErrors = useMemo(() => {
        const result: FieldErrors = {};
        if (!form.name.trim()) result.name = 'Name is required';
        else if (form.name.trim().length < 2) result.name = 'Name must be at least 2 characters';
        if (!form.email.trim()) result.email = 'Email is required';
        else if (!emailRegex.test(form.email)) result.email = 'Please enter a valid email address';
        if (form.phone && !phoneRegex.test(form.phone)) result.phone = 'Please enter a valid phone number';
        if (!form.message.trim()) result.message = 'Message is required';
        else if (form.message.trim().length < 10) result.message = 'Message must be at least 10 characters';
        return result;
    }, [form.name, form.email, form.phone, form.message]);

    const hasErrors = Object.keys(errors).length > 0;

    const handleBlur = (field: string) => {
        setTouched((prev) => new Set(prev).add(field));
    };

    const handleSubmit = () => {
        setTouched(new Set(['name', 'email', 'phone', 'message']));
        if (!hasErrors) {
            setSubmitted(true);
            setTimeout(() => setSubmitted(false), 3000);
        }
    };

    const handleReset = () => {
        store.setState({ name: '', email: '', phone: '', message: '' });
        setTouched(new Set());
        setSubmitted(false);
    };

    const showError = (field: FieldKey) => touched.has(field) && errors[field];
    const isFieldValid = (field: FieldKey) => touched.has(field) && !errors[field] && (field === 'phone' ? form[field].length > 0 : true);

    const validCount = requiredFields.filter((f) => !errors[f]).length;
    const totalRequired = requiredFields.length;

    return (
        <>
            <ComponentDemo title="Validation" description="Built-in validation with real-time error feedback and field-level indicators" centered={false}>
                <div className="w-full max-w-lg mx-auto p-4">
                    {submitted && (
                        <div className={cn('mb-4 px-4 py-3 rounded-lg text-sm flex items-center gap-2', {
                            'bg-green-500/10 border border-green-500/30 text-green-400': isDark,
                            'bg-green-50 border border-green-200 text-green-700': !isDark,
                        })}>
                            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Form submitted successfully!
                        </div>
                    )}

                    <div className={cn('flex items-center gap-3 mb-4 px-3 py-2 rounded-lg text-xs', {
                        'bg-white/5 border border-white/10': isDark,
                        'bg-gray-50 border border-gray-200': !isDark,
                    })}>
                        <div className="flex-1">
                            <div className={cn('h-1.5 rounded-full overflow-hidden', {
                                'bg-white/10': isDark,
                                'bg-gray-200': !isDark,
                            })}>
                                <div
                                    className={cn('h-full rounded-full transition-all duration-300', {
                                        'bg-red-400': validCount === 0,
                                        'bg-amber-400': validCount > 0 && validCount < totalRequired,
                                        'bg-green-400': validCount === totalRequired,
                                    })}
                                    style={{ width: `${(validCount / totalRequired) * 100}%` }}
                                />
                            </div>
                        </div>
                        <span className={cn('tabular-nums shrink-0', { 'text-gray-500': isDark, 'text-gray-400': !isDark })}>
                            {validCount}/{totalRequired} required fields valid
                        </span>
                    </div>

                    <div className="space-y-4">
                        {(['name', 'email', 'phone', 'message'] as FieldKey[]).map((field) => {
                            const hasError = showError(field);
                            const valid = isFieldValid(field);
                            const isRequired = requiredFields.includes(field);

                            return (
                                <div key={field}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <label className={cn('text-sm font-medium', { 'text-gray-300': isDark, 'text-gray-600': !isDark })}>
                                            {fieldLabels[field]}
                                            {isRequired && <span className="text-red-400 ml-0.5">*</span>}
                                        </label>
                                        {hasError && (
                                            <span className="flex items-center gap-1 text-red-400">
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                                                </svg>
                                            </span>
                                        )}
                                        {valid && (
                                            <span className="flex items-center gap-1 text-green-400">
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </span>
                                        )}
                                    </div>
                                    {field === 'message' ? (
                                        <TextArea
                                            value={form[field]}
                                            onChange={(e) => store.setState({ [field]: e.value })}
                                            onBlur={() => handleBlur(field)}
                                            placeholder={fieldPlaceholders[field]}
                                            rows={3}
                                            borderColor={hasError ? '#ef4444' : undefined}
                                        />
                                    ) : (
                                        <TextInput
                                            value={form[field]}
                                            onChange={(e) => store.setState({ [field]: e.value })}
                                            onBlur={() => handleBlur(field)}
                                            placeholder={fieldPlaceholders[field]}
                                            borderColor={hasError ? '#ef4444' : undefined}
                                        />
                                    )}
                                    {hasError && (
                                        <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                                            {errors[field]}
                                        </p>
                                    )}
                                </div>
                            );
                        })}

                        <div className="flex gap-2 pt-2">
                            <Button
                                label="Submit"
                                size="sm"
                                disabled={hasErrors && touched.size > 0}
                                onClick={handleSubmit}
                            />
                            <Button
                                label="Reset"
                                size="sm"
                                variant="secondary"
                                layout="outlined"
                                onClick={handleReset}
                            />
                            <Button
                                label="Touch All Fields"
                                size="sm"
                                variant="secondary"
                                layout="plain"
                                onClick={() => setTouched(new Set(['name', 'email', 'phone', 'message']))}
                            />
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

export default ValidationDemo;
