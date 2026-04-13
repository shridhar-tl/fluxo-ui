import React, { useState } from 'react';
import {
    Autocomplete,
    AutocompleteMulti,
    Button,
    Chips,
    Dropdown,
    InputGroup,
    InputSwitch,
    Multiselect,
    Password,
    RadioButtonGroup,
    SelectButton,
    TextArea,
    TextInput,
    ToggleButton,
} from '../../../components';
import { Size } from '../../../types';
import { withFieldLabel } from '../../../utils/field-label';

const TextInputWithLabel = withFieldLabel(TextInput);
const PasswordWithLabel = withFieldLabel(Password);
const TextAreaWithLabel = withFieldLabel(TextArea);
const DropdownWithLabel = withFieldLabel(Dropdown);
const MultiselectWithLabel = withFieldLabel(Multiselect);
const ChipsWithLabel = withFieldLabel(Chips);
const AutocompleteWithLabel = withFieldLabel(Autocomplete);
const AutocompleteMultiWithLabel = withFieldLabel(AutocompleteMulti);

const roleOptions = [
    { label: 'Admin', value: 'admin' },
    { label: 'Editor', value: 'editor' },
    { label: 'Viewer', value: 'viewer' },
    { label: 'Moderator', value: 'moderator' },
];

const departmentOptions = [
    { label: 'Engineering', value: 'engineering' },
    { label: 'Design', value: 'design' },
    { label: 'Marketing', value: 'marketing' },
    { label: 'Sales', value: 'sales' },
    { label: 'Operations', value: 'operations' },
    { label: 'HR', value: 'hr' },
];

const statusItems = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Pending', value: 'pending' },
];

const priorityItems = [
    { label: 'Low', value: 'low' },
    { label: 'Medium', value: 'medium' },
    { label: 'High', value: 'high' },
    { label: 'Critical', value: 'critical' },
];

const cityItems = [
    { label: 'New York', value: 'ny' },
    { label: 'San Francisco', value: 'sf' },
    { label: 'Los Angeles', value: 'la' },
    { label: 'Chicago', value: 'chi' },
    { label: 'Seattle', value: 'sea' },
    { label: 'Austin', value: 'aus' },
    { label: 'Denver', value: 'den' },
    { label: 'Miami', value: 'mia' },
];

const tagItems = [
    { label: 'React', value: 'react' },
    { label: 'TypeScript', value: 'typescript' },
    { label: 'Node.js', value: 'nodejs' },
    { label: 'Python', value: 'python' },
    { label: 'Go', value: 'go' },
    { label: 'Rust', value: 'rust' },
    { label: 'Docker', value: 'docker' },
    { label: 'Kubernetes', value: 'k8s' },
];

interface FormSectionProps {
    onSave: (data: Record<string, unknown>) => void;
    size?: Size;
}

const FormSection: React.FC<FormSectionProps> = ({ onSave, size = 'md' }) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [bio, setBio] = useState('');
    const [role, setRole] = useState<string | undefined>(undefined);
    const [departments, setDepartments] = useState<string[]>([]);
    const [skills, setSkills] = useState<string[]>([]);
    const [status, setStatus] = useState('active');
    const [priority, setPriority] = useState('medium');
    const [notifications, setNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [website, setWebsite] = useState('');
    const [phone, setPhone] = useState('');
    const [city, setCity] = useState('');
    const [tags, setTags] = useState<string[]>([]);

    const handleSubmit = () => {
        onSave({
            firstName, lastName, email, password, bio, role,
            departments, skills, status, priority,
            notifications, darkMode, website, phone,
        });
    };

    const handleReset = () => {
        setFirstName(''); setLastName(''); setEmail(''); setPassword('');
        setBio(''); setRole(undefined); setDepartments([]); setSkills([]);
        setStatus('active'); setPriority('medium');
        setNotifications(true); setDarkMode(false);
        setWebsite(''); setPhone('');
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInputWithLabel label="First Name" required value={firstName} placeholder="John" onChange={(e) => setFirstName(e.value)} size={size} />
                <TextInputWithLabel label="Last Name" required value={lastName} placeholder="Doe" onChange={(e) => setLastName(e.value)} size={size} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1.5 opacity-80">Email</label>
                    <InputGroup>
                        <TextInput value={email} placeholder="john.doe" onChange={(e) => setEmail(e.value)} size={size} />
                        <span>@company.com</span>
                    </InputGroup>
                </div>
                <PasswordWithLabel label="Password" required value={password} placeholder="Enter password" onChange={(e) => setPassword(e.value)} size={size} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1.5 opacity-80">Website</label>
                    <InputGroup>
                        <span>https://</span>
                        <TextInput value={website} placeholder="example.com" onChange={(e) => setWebsite(e.value)} size={size} />
                    </InputGroup>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1.5 opacity-80">Phone</label>
                    <InputGroup>
                        <span>+1</span>
                        <TextInput value={phone} placeholder="(555) 000-0000" onChange={(e) => setPhone(e.value)} size={size} />
                    </InputGroup>
                </div>
            </div>

            <TextAreaWithLabel label="Bio" value={bio} placeholder="Tell us about yourself..." onChange={(e) => setBio(e.value)} hint="Max 500 characters" size={size} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DropdownWithLabel label="Role" required options={roleOptions} value={role} onChange={(e) => setRole(e.value)} placeholder="Select role..." size={size} />
                <MultiselectWithLabel label="Departments" options={departmentOptions} value={departments} onChange={(e) => setDepartments(e.value)} placeholder="Select departments..." size={size} />
            </div>

            <ChipsWithLabel label="Skills" value={skills} onChange={(e) => setSkills(e.value)} placeholder="Type a skill and press Enter" size={size} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AutocompleteWithLabel label="City" items={cityItems} value={city} onChange={(e) => setCity(e.value)} placeholder="Search for a city..." size={size} />
                <AutocompleteMultiWithLabel label="Tags" items={tagItems} value={tags} onChange={(e) => setTags(e.value)} placeholder="Search and select tags..." size={size} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1.5 opacity-80">Status</label>
                    <SelectButton items={statusItems} value={status} onChange={(e) => setStatus(e.value as string)} size={size} />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1.5 opacity-80">Priority</label>
                    <RadioButtonGroup
                        items={priorityItems}
                        value={priority}
                        onChange={(e) => setPriority(e.value)}
                        orientation="horizontal"
                    />
                </div>
            </div>

            <div className="flex flex-wrap gap-6 items-center">
                <div className="flex items-center gap-2">
                    <InputSwitch checked={notifications} onChange={(e) => setNotifications(e.value)} size={size} />
                    <span className="text-sm">Email notifications</span>
                </div>
                <div className="flex items-center gap-2">
                    <ToggleButton checked={darkMode} onChange={(e) => setDarkMode(e.value)} onLabel="Dark" offLabel="Light" size={size} />
                    <span className="text-sm">Theme preference</span>
                </div>
            </div>

            <div className="flex gap-3 pt-2">
                <Button variant="primary" size={size} onClick={handleSubmit}>Save Changes</Button>
                <Button variant="secondary" size={size} layout="outlined" onClick={handleReset}>Reset</Button>
            </div>
        </div>
    );
};

export default FormSection;
