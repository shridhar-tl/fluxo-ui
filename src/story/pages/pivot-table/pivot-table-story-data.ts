export interface SalesRecord {
    [key: string]: unknown;
    region: string;
    country: string;
    city: string;
    product: string;
    category: string;
    quarter: string;
    salesperson: string;
    revenue: number;
    quantity: number;
    profit: number;
}

export const salesData: SalesRecord[] = [
    { region: 'North America', country: 'USA', city: 'New York', product: 'Laptop Pro', category: 'Electronics', quarter: 'Q1', salesperson: 'Alice', revenue: 45000, quantity: 30, profit: 13500 },
    { region: 'North America', country: 'USA', city: 'New York', product: 'Wireless Mouse', category: 'Accessories', quarter: 'Q1', salesperson: 'Alice', revenue: 4500, quantity: 150, profit: 2250 },
    { region: 'North America', country: 'USA', city: 'New York', product: 'Laptop Pro', category: 'Electronics', quarter: 'Q2', salesperson: 'Alice', revenue: 52000, quantity: 35, profit: 15600 },
    { region: 'North America', country: 'USA', city: 'Chicago', product: 'Desktop Elite', category: 'Electronics', quarter: 'Q1', salesperson: 'Bob', revenue: 38000, quantity: 20, profit: 11400 },
    { region: 'North America', country: 'USA', city: 'Chicago', product: 'Monitor Ultra', category: 'Electronics', quarter: 'Q2', salesperson: 'Bob', revenue: 27000, quantity: 45, profit: 8100 },
    { region: 'North America', country: 'USA', city: 'Chicago', product: 'Keyboard Mech', category: 'Accessories', quarter: 'Q3', salesperson: 'Bob', revenue: 6500, quantity: 65, profit: 3250 },
    { region: 'North America', country: 'Canada', city: 'Toronto', product: 'Laptop Pro', category: 'Electronics', quarter: 'Q1', salesperson: 'Charlie', revenue: 36000, quantity: 24, profit: 10800 },
    { region: 'North America', country: 'Canada', city: 'Toronto', product: 'Wireless Mouse', category: 'Accessories', quarter: 'Q2', salesperson: 'Charlie', revenue: 3200, quantity: 107, profit: 1600 },
    { region: 'North America', country: 'Canada', city: 'Vancouver', product: 'Desktop Elite', category: 'Electronics', quarter: 'Q3', salesperson: 'Diana', revenue: 29000, quantity: 15, profit: 8700 },
    { region: 'North America', country: 'Canada', city: 'Vancouver', product: 'Monitor Ultra', category: 'Electronics', quarter: 'Q4', salesperson: 'Diana', revenue: 18000, quantity: 30, profit: 5400 },
    { region: 'Europe', country: 'UK', city: 'London', product: 'Laptop Pro', category: 'Electronics', quarter: 'Q1', salesperson: 'Eve', revenue: 42000, quantity: 28, profit: 12600 },
    { region: 'Europe', country: 'UK', city: 'London', product: 'Desktop Elite', category: 'Electronics', quarter: 'Q2', salesperson: 'Eve', revenue: 31000, quantity: 16, profit: 9300 },
    { region: 'Europe', country: 'UK', city: 'London', product: 'Keyboard Mech', category: 'Accessories', quarter: 'Q3', salesperson: 'Eve', revenue: 5800, quantity: 58, profit: 2900 },
    { region: 'Europe', country: 'UK', city: 'Manchester', product: 'Wireless Mouse', category: 'Accessories', quarter: 'Q1', salesperson: 'Frank', revenue: 3800, quantity: 127, profit: 1900 },
    { region: 'Europe', country: 'UK', city: 'Manchester', product: 'Monitor Ultra', category: 'Electronics', quarter: 'Q4', salesperson: 'Frank', revenue: 21000, quantity: 35, profit: 6300 },
    { region: 'Europe', country: 'Germany', city: 'Berlin', product: 'Laptop Pro', category: 'Electronics', quarter: 'Q1', salesperson: 'Grace', revenue: 48000, quantity: 32, profit: 14400 },
    { region: 'Europe', country: 'Germany', city: 'Berlin', product: 'Desktop Elite', category: 'Electronics', quarter: 'Q2', salesperson: 'Grace', revenue: 34000, quantity: 18, profit: 10200 },
    { region: 'Europe', country: 'Germany', city: 'Berlin', product: 'Wireless Mouse', category: 'Accessories', quarter: 'Q3', salesperson: 'Grace', revenue: 5200, quantity: 173, profit: 2600 },
    { region: 'Europe', country: 'Germany', city: 'Munich', product: 'Monitor Ultra', category: 'Electronics', quarter: 'Q2', salesperson: 'Hank', revenue: 24000, quantity: 40, profit: 7200 },
    { region: 'Europe', country: 'Germany', city: 'Munich', product: 'Keyboard Mech', category: 'Accessories', quarter: 'Q4', salesperson: 'Hank', revenue: 7200, quantity: 72, profit: 3600 },
    { region: 'Asia Pacific', country: 'Japan', city: 'Tokyo', product: 'Laptop Pro', category: 'Electronics', quarter: 'Q1', salesperson: 'Ivy', revenue: 56000, quantity: 37, profit: 16800 },
    { region: 'Asia Pacific', country: 'Japan', city: 'Tokyo', product: 'Desktop Elite', category: 'Electronics', quarter: 'Q2', salesperson: 'Ivy', revenue: 41000, quantity: 22, profit: 12300 },
    { region: 'Asia Pacific', country: 'Japan', city: 'Tokyo', product: 'Keyboard Mech', category: 'Accessories', quarter: 'Q3', salesperson: 'Ivy', revenue: 8400, quantity: 84, profit: 4200 },
    { region: 'Asia Pacific', country: 'Japan', city: 'Osaka', product: 'Wireless Mouse', category: 'Accessories', quarter: 'Q1', salesperson: 'Jake', revenue: 4100, quantity: 137, profit: 2050 },
    { region: 'Asia Pacific', country: 'Japan', city: 'Osaka', product: 'Monitor Ultra', category: 'Electronics', quarter: 'Q4', salesperson: 'Jake', revenue: 19500, quantity: 33, profit: 5850 },
    { region: 'Asia Pacific', country: 'Australia', city: 'Sydney', product: 'Laptop Pro', category: 'Electronics', quarter: 'Q2', salesperson: 'Kate', revenue: 39000, quantity: 26, profit: 11700 },
    { region: 'Asia Pacific', country: 'Australia', city: 'Sydney', product: 'Desktop Elite', category: 'Electronics', quarter: 'Q3', salesperson: 'Kate', revenue: 28000, quantity: 15, profit: 8400 },
    { region: 'Asia Pacific', country: 'Australia', city: 'Sydney', product: 'Wireless Mouse', category: 'Accessories', quarter: 'Q4', salesperson: 'Kate', revenue: 3600, quantity: 120, profit: 1800 },
    { region: 'Asia Pacific', country: 'Australia', city: 'Melbourne', product: 'Monitor Ultra', category: 'Electronics', quarter: 'Q1', salesperson: 'Leo', revenue: 22000, quantity: 37, profit: 6600 },
    { region: 'Asia Pacific', country: 'Australia', city: 'Melbourne', product: 'Keyboard Mech', category: 'Accessories', quarter: 'Q2', salesperson: 'Leo', revenue: 5900, quantity: 59, profit: 2950 },
    { region: 'North America', country: 'USA', city: 'New York', product: 'Monitor Ultra', category: 'Electronics', quarter: 'Q3', salesperson: 'Alice', revenue: 25000, quantity: 42, profit: 7500 },
    { region: 'North America', country: 'USA', city: 'New York', product: 'Keyboard Mech', category: 'Accessories', quarter: 'Q4', salesperson: 'Alice', revenue: 7800, quantity: 78, profit: 3900 },
    { region: 'Europe', country: 'Germany', city: 'Berlin', product: 'Monitor Ultra', category: 'Electronics', quarter: 'Q4', salesperson: 'Grace', revenue: 26000, quantity: 43, profit: 7800 },
    { region: 'North America', country: 'Canada', city: 'Toronto', product: 'Desktop Elite', category: 'Electronics', quarter: 'Q3', salesperson: 'Charlie', revenue: 32000, quantity: 17, profit: 9600 },
    { region: 'Europe', country: 'UK', city: 'London', product: 'Laptop Pro', category: 'Electronics', quarter: 'Q4', salesperson: 'Eve', revenue: 47000, quantity: 31, profit: 14100 },
    { region: 'Asia Pacific', country: 'Japan', city: 'Tokyo', product: 'Wireless Mouse', category: 'Accessories', quarter: 'Q2', salesperson: 'Ivy', revenue: 5500, quantity: 183, profit: 2750 },
    { region: 'North America', country: 'USA', city: 'Chicago', product: 'Laptop Pro', category: 'Electronics', quarter: 'Q4', salesperson: 'Bob', revenue: 43000, quantity: 29, profit: 12900 },
    { region: 'Asia Pacific', country: 'Australia', city: 'Melbourne', product: 'Laptop Pro', category: 'Electronics', quarter: 'Q3', salesperson: 'Leo', revenue: 35000, quantity: 23, profit: 10500 },
    { region: 'Europe', country: 'Germany', city: 'Munich', product: 'Laptop Pro', category: 'Electronics', quarter: 'Q3', salesperson: 'Hank', revenue: 44000, quantity: 29, profit: 13200 },
    { region: 'North America', country: 'Canada', city: 'Vancouver', product: 'Keyboard Mech', category: 'Accessories', quarter: 'Q2', salesperson: 'Diana', revenue: 4800, quantity: 48, profit: 2400 },
];

export const currencyFormat = (value: number | string) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return String(value);
    return `$${num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

export const numberFormat = (value: number | string) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return String(value);
    return num.toLocaleString('en-US');
};

export const decimalFormat = (value: number | string) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return String(value);
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
