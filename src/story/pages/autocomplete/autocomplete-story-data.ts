export const suggestions = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry', 'Fig', 'Grape', 'Honeydew'].map((v) => ({
    label: v,
    value: v,
}));

export const basicUsageCode = `import { Autocomplete } from 'fluxo-ui';

const items = ['Apple', 'Banana', 'Cherry', 'Date'].map(v => ({ label: v, value: v }));

function MyComponent() {
  const [value, setValue] = useState('');
  const [selectedValue, setSelectedValue] = useState(null);

  return (
    <Autocomplete
      items={items}
      value={value}
      selectedValue={selectedValue}
      placeholder="Type to search..."
      onChange={(e) => setValue(e.value)}
      onSelect={(e) => setSelectedValue(e.value)}
    />
  );
}`;

export const advancedUsageCode = `import { Autocomplete } from 'fluxo-ui';

function MyComponent() {
  const [value, setValue] = useState('');
  const [selectedValue, setSelectedValue] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const allItems = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry'].map(v => ({ label: v, value: v }));

  const handleFilter = async (query) => {
    setLoading(true);
    setTimeout(() => {
      const filtered = allItems.filter(item =>
        item.label.toLowerCase().includes(query.toLowerCase())
      );
      setItems(filtered);
      setLoading(false);
    }, 500);
  };

  return (
    <Autocomplete
      items={items}
      value={value}
      selectedValue={selectedValue}
      placeholder="Search fruits..."
      minLength={2}
      maxSuggestions={3}
      debounceMs={300}
      loading={loading}
      onChange={(e) => setValue(e.value)}
      onSelect={(e) => {
        setSelectedValue(e.value);
        console.log('Selected:', e.value);
      }}
      onFilter={handleFilter}
    />
  );
}`;
