import cn from 'classnames';
import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';

const code = `function FormModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setIsOpen(false);
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Add User</Button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Add New User">
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" onClick={() => setIsOpen(false)} layout="outlined">Cancel</Button>
            <Button type="submit" variant="primary">Create User</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}`;

const FormExample: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <ComponentDemo title="Modal with Form">
            <div className="space-y-4">
                <p className={cn('text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Modals work great for forms. Here's an example of how to structure a form inside a modal:
                </p>
                <CodeBlock code={code} />
            </div>
        </ComponentDemo>
    );
};

export default FormExample;
