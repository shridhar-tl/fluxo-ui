export const suggestions = [
    'Apple',
    'Banana',
    'Cherry',
    'Date',
    'Elderberry',
    'Fig',
    'Grape',
    'Honeydew',
    'Kiwi',
    'Lemon',
    'Mango',
    'Orange',
].map((v) => ({ label: v, value: v }));

export const basicUsageCode = `import { AutocompleteMulti } from 'fluxo-ui';

const items = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry' },
  { label: 'Date', value: 'date' },
];

function MyComponent() {
  const [value, setValue] = useState([]);

  return (
    <AutocompleteMulti
      items={items}
      value={value}
      placeholder="Select multiple items..."
      onChange={(e) => setValue(e.value)}
    />
  );
}`;

export const advancedUsageCode = `import { AutocompleteMulti } from 'fluxo-ui';

function MyComponent() {
  const [value, setValue] = useState(['apple']);
  const [items, setItems] = useState([
    { label: 'Apple', value: 'apple' },
    { label: 'Banana', value: 'banana' },
    { label: 'Cherry', value: 'cherry' },
  ]);

  const handleFilter = (query) => {
    const filtered = items.filter(item =>
      item.label.toLowerCase().includes(query.toLowerCase())
    );
    setItems(filtered);
  };

  return (
    <AutocompleteMulti
      items={items}
      value={value}
      placeholder="Max 3 selections..."
      maxSelectedItems={3}
      minLength={2}
      onChange={(e) => setValue(e.value)}
      onFilter={handleFilter}
      showCount
    />
  );
}`;
