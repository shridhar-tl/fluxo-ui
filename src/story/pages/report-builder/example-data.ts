export interface Order {
    id: string;
    region: 'North' | 'South' | 'East' | 'West';
    country: string;
    category: 'Electronics' | 'Apparel' | 'Home' | 'Sports';
    product: string;
    salesRep: string;
    status: 'paid' | 'pending' | 'shipped' | 'cancelled' | 'refunded';
    orderDate: string;
    units: number;
    unitPrice: number;
    discount: number;
    revenue: number;
    cost: number;
}

const regions: Order['region'][] = ['North', 'South', 'East', 'West'];
const regionCountry: Record<Order['region'], string[]> = {
    North: ['USA', 'Canada'],
    South: ['Mexico', 'Brazil'],
    East: ['UK', 'Germany', 'France'],
    West: ['Japan', 'India', 'Australia'],
};
const categoryProducts: Record<Order['category'], string[]> = {
    Electronics: ['Laptop Pro', 'Wireless Buds', 'Smart Watch', 'USB Hub'],
    Apparel: ['T-Shirt', 'Jeans', 'Sneakers', 'Jacket'],
    Home: ['Desk Lamp', 'Throw Pillow', 'Rug 5x8', 'Candle Set'],
    Sports: ['Yoga Mat', 'Dumbbells', 'Water Bottle', 'Running Shoes'],
};
const salesReps = ['A. Chen', 'B. Patel', 'C. Nguyen', 'D. García', 'E. Johnson', 'F. O\'Brien', 'G. Müller', 'H. Tanaka'];
const statuses: Order['status'][] = ['paid', 'paid', 'paid', 'shipped', 'pending', 'cancelled', 'refunded'];

function mulberry32(seed: number) {
    return function () {
        seed |= 0;
        seed = (seed + 0x6D2B79F5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function pick<T>(rand: () => number, arr: T[]): T {
    return arr[Math.floor(rand() * arr.length)];
}

function padNum(n: number, size = 4): string {
    return String(n).padStart(size, '0');
}

function formatDate(d: Date): string {
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function buildOrders(): Order[] {
    const rand = mulberry32(42);
    const out: Order[] = [];
    const startEpoch = Date.UTC(2025, 0, 1);
    for (let i = 0; i < 80; i++) {
        const region = pick(rand, regions);
        const country = pick(rand, regionCountry[region]);
        const category = pick(rand, Object.keys(categoryProducts) as Order['category'][]);
        const product = pick(rand, categoryProducts[category]);
        const salesRep = pick(rand, salesReps);
        const status = pick(rand, statuses);
        const daysOffset = Math.floor(rand() * 330);
        const orderDate = formatDate(new Date(startEpoch + daysOffset * 86_400_000));
        const units = 1 + Math.floor(rand() * 20);
        const unitPriceBase = category === 'Electronics' ? 250 : category === 'Apparel' ? 55 : category === 'Home' ? 40 : 35;
        const unitPrice = unitPriceBase + Math.floor(rand() * unitPriceBase * 0.6);
        const discount = rand() < 0.3 ? Math.floor(rand() * 20) : 0;
        const gross = units * unitPrice;
        const revenue = Math.round(gross * (1 - discount / 100));
        const cost = Math.round(revenue * (0.45 + rand() * 0.2));
        out.push({
            id: `ORD-${padNum(1000 + i)}`,
            region,
            country,
            category,
            product,
            salesRep,
            status,
            orderDate,
            units,
            unitPrice,
            discount,
            revenue,
            cost,
        });
    }
    return out;
}

export const orders: Order[] = buildOrders();

export interface Employee {
    id: string;
    name: string;
    department: 'Engineering' | 'Sales' | 'Marketing' | 'Operations';
    level: 'Junior' | 'Mid' | 'Senior' | 'Lead';
    location: 'NY' | 'SF' | 'London' | 'Tokyo';
    salary: number;
    hireDate: string;
    manager: string;
    performance: number;
    active: boolean;
}

function buildEmployees(): Employee[] {
    const rand = mulberry32(7);
    const depts: Employee['department'][] = ['Engineering', 'Sales', 'Marketing', 'Operations'];
    const levels: Employee['level'][] = ['Junior', 'Mid', 'Senior', 'Lead'];
    const locations: Employee['location'][] = ['NY', 'SF', 'London', 'Tokyo'];
    const salaryBase: Record<Employee['level'], number> = { Junior: 55000, Mid: 80000, Senior: 115000, Lead: 150000 };
    const firstNames = ['Aditi', 'Ben', 'Carlos', 'Dana', 'Elena', 'Faisal', 'Grace', 'Hugo', 'Ines', 'Jun', 'Kira', 'Luis'];
    const lastNames = ['Sharma', 'Park', 'Nakamura', 'Rossi', 'Silva', 'Khan', 'Lee', 'Smith', 'Martínez', 'Dubois', 'Fischer', 'Costa'];
    const managers = ['Ann Lee', 'Bob Patel', 'Cara Wong', 'David Kim'];
    const out: Employee[] = [];
    for (let i = 0; i < 48; i++) {
        const department = pick(rand, depts);
        const level = pick(rand, levels);
        const base = salaryBase[level];
        const name = `${pick(rand, firstNames)} ${pick(rand, lastNames)}`;
        const hireYear = 2019 + Math.floor(rand() * 6);
        const hireMonth = 1 + Math.floor(rand() * 12);
        const hireDay = 1 + Math.floor(rand() * 27);
        out.push({
            id: `EMP-${padNum(200 + i)}`,
            name,
            department,
            level,
            location: pick(rand, locations),
            salary: base + Math.floor(rand() * 25000),
            hireDate: `${hireYear}-${String(hireMonth).padStart(2, '0')}-${String(hireDay).padStart(2, '0')}`,
            manager: pick(rand, managers),
            performance: Math.round((2.8 + rand() * 2.2) * 10) / 10,
            active: rand() > 0.08,
        });
    }
    return out;
}

export const employees: Employee[] = buildEmployees();
