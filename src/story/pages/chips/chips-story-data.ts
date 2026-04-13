export const basicUsageCode = `import { Chips } from 'fluxo-ui';

function MyComponent() {
  const [chips, setChips] = useState(['React', 'TypeScript']);

  return (
    <Chips
      value={chips}
      placeholder="Add tags..."
      onChange={(e) => setChips(e.value)}
    />
  );
}`;

export const advancedUsageCode = `import { Chips } from 'fluxo-ui';

function MyComponent() {
  const [chips, setChips] = useState([]);

  return (
    <Chips
      value={chips}
      placeholder="Max 5 tags, comma separated..."
      maxItems={5}
      separator=","
      allowDuplicates={false}
      onChange={(e) => setChips(e.value)}
    />
  );
}`;
