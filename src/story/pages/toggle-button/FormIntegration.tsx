import cn from 'classnames';
import React, { useState } from 'react';
import { ToggleButton } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';

const code = `<form onSubmit={handleSubmit}>
  <ToggleButton
    name="terms-accepted"
    checked={accepted}
    onChange={(e) => setAccepted(e.value)}
  />
  <button type="submit">Submit</button>
</form>

// The toggle value is available in form data as a string
// FormData will contain: terms-accepted: "true" or "false"`;

const FormIntegration: React.FC = () => {
    const { isDark } = useStoryTheme();
    const [formToggle, setFormToggle] = useState(false);

    return (
        <>
            <ComponentDemo title="Toggle Button in Forms">
                <form
                    className="w-full max-w-md space-y-4"
                    onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        alert(`Form submitted with: ${formData.get('terms-accepted')}`);
                    }}
                >
                    <div className={cn('flex items-center justify-between p-4 rounded-lg', { 'bg-gray-800': isDark, 'bg-gray-100': !isDark })}>
                        <label htmlFor="terms-toggle" className={cn({ 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                            Accept Terms and Conditions
                        </label>
                        <ToggleButton
                            id="terms-toggle"
                            name="terms-accepted"
                            checked={formToggle}
                            onChange={(e) => setFormToggle(e.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Submit Form
                    </button>
                </form>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default FormIntegration;
