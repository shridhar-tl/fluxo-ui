export const basicUsageCode = `import { DateRangePicker } from 'ether-ui';
import { useState } from 'react';

function MyComponent() {
  const [dateRange, setDateRange] = useState<[Date, Date] | null>(null);

  return (
    <DateRangePicker
      value={dateRange}
      placeholder="Select date range..."
      onChange={(selection) => setDateRange(selection.value)}
    />
  );
}`;

export const quickSelectCode = `import { DateRangePicker } from 'ether-ui';
import { useState } from 'react';

function MyComponent() {
  const [dateRange, setDateRange] = useState<[Date, Date]>([new Date(), new Date()]);

  const quickRanges = [
    {
      value: 'today',
      label: 'Today',
      range: [new Date(), new Date()] as [Date, Date],
    },
    {
      value: 'last7days',
      label: 'Last 7 Days',
      range: [
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        new Date(),
      ] as [Date, Date],
    },
    {
      value: 'last30days',
      label: 'Last 30 Days',
      range: [
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        new Date(),
      ] as [Date, Date],
    },
  ];

  return (
    <DateRangePicker
      value={dateRange}
      ranges={quickRanges}
      onChange={(selection) => setDateRange(selection.value)}
      onClose={() => console.log('Picker closed')}
    />
  );
}`;

export const advancedUsageCode = `import { DateRangePicker } from 'ether-ui';
import { useState } from 'react';

function MyComponent() {
  const [dateRange, setDateRange] = useState<[Date, Date]>([new Date(), new Date()]);

  const today = new Date();
  const maxDate = new Date();
  maxDate.setFullYear(today.getFullYear() + 1);

  return (
    <DateRangePicker
      value={dateRange}
      dateFormat="yyyy-MM-dd"
      separator=" to "
      minDate={today}
      maxDate={maxDate}
      customLabel="Custom Range"
      showTodayButton={true}
      onChange={(selection) => {
        setDateRange(selection.value);
        console.log('Range changed:', selection);
      }}
      onClose={() => console.log('Date range selection complete')}
    />
  );
}`;

export const quickRanges = [
    {
        value: 'today',
        label: 'Today',
        range: [new Date(), new Date()] as [Date, Date],
    },
    {
        value: 'last7days',
        label: 'Last 7 Days',
        range: [new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()] as [Date, Date],
    },
    {
        value: 'last30days',
        label: 'Last 30 Days',
        range: [new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()] as [Date, Date],
    },
    {
        value: 'thismonth',
        label: 'This Month',
        range: [
            new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            new Date(),
        ] as [Date, Date],
    },
];
