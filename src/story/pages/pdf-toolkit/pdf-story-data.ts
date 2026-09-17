export interface InvoiceLineItem {
    description: string;
    detail: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
}

export interface InvoiceRecord {
    number: string;
    issuedOn: string;
    dueOn: string;
    seller: { name: string; addressLines: string[]; email: string; taxId: string };
    buyer: { name: string; addressLines: string[]; email: string };
    items: InvoiceLineItem[];
    currency: string;
    notes: string;
    paymentTerms: string;
}

export const sampleInvoice: InvoiceRecord = {
    number: 'INV-2026-0418',
    issuedOn: '17 Sep 2026',
    dueOn: '17 Oct 2026',
    seller: {
        name: 'Northwind Studio Ltd.',
        addressLines: ['48 Harbour Road, Unit 12', 'Bristol BS1 5TY', 'United Kingdom'],
        email: 'accounts@northwind.example',
        taxId: 'GB 417 2299 03',
    },
    buyer: {
        name: 'Lumen Retail Group',
        addressLines: ['1200 Market Street, Floor 9', 'Philadelphia, PA 19107', 'United States'],
        email: 'ap@lumenretail.example',
    },
    items: [
        { description: 'Design system audit', detail: 'Component inventory and accessibility review', quantity: 1, unitPrice: 4800, taxRate: 0.2 },
        { description: 'Interface engineering', detail: 'Checkout redesign, 3 sprints', quantity: 3, unitPrice: 7200, taxRate: 0.2 },
        { description: 'Motion guidelines', detail: 'Interaction spec and prototypes', quantity: 1, unitPrice: 2650, taxRate: 0.2 },
        { description: 'Quality assurance', detail: 'Cross-browser and screen-reader passes', quantity: 2, unitPrice: 1450, taxRate: 0.2 },
        { description: 'Handover workshop', detail: 'Two half-day sessions with the in-house team', quantity: 2, unitPrice: 980, taxRate: 0 },
    ],
    currency: '$',
    notes: 'Thank you for your business. Payment is due within 30 days of the issue date.',
    paymentTerms: 'Bank transfer — Sort 04-00-75 — Account 8842 1190',
};

export const invoiceTotals = (invoice: InvoiceRecord): { subtotal: number; tax: number; total: number } => {
    let subtotal = 0;
    let tax = 0;

    for (const item of invoice.items) {
        const lineTotal = item.quantity * item.unitPrice;
        subtotal += lineTotal;
        tax += lineTotal * item.taxRate;
    }

    return { subtotal, tax, total: subtotal + tax };
};

export interface SalesRow {
    region: string;
    representative: string;
    units: number;
    revenue: number;
    growth: number;
    status: 'On track' | 'At risk' | 'Behind';
}

const regions = ['North America', 'Latin America', 'Western Europe', 'Nordics', 'Middle East', 'South Asia', 'East Asia', 'Oceania'];
const representatives = [
    'Amara Okafor',
    'Bruno Salgado',
    'Chen Wei',
    'Divya Raman',
    'Elias Hoffmann',
    'Fatima Al-Sayed',
    'Grace Lindqvist',
    'Hiroshi Tanaka',
];

export const salesRows: SalesRow[] = Array.from({ length: 48 }, (_unused, index) => {
    const growth = ((index * 37) % 61) - 22;
    return {
        region: regions[index % regions.length],
        representative: representatives[(index * 3) % representatives.length],
        units: 120 + ((index * 53) % 900),
        revenue: 18500 + ((index * 7919) % 264000),
        growth,
        status: growth > 12 ? 'On track' : growth > -5 ? 'At risk' : 'Behind',
    };
});

export interface CatalogEntry {
    sku: string;
    product: string;
    category: string;
    stock: number;
    price: number;
}

export const catalogEntries: CatalogEntry[] = [
    { sku: 'FRN-1042', product: 'Oak reading chair', category: 'Furniture', stock: 24, price: 489 },
    { sku: 'FRN-1088', product: 'Walnut side table', category: 'Furniture', stock: 8, price: 265 },
    { sku: 'LGT-2210', product: 'Brass floor lamp', category: 'Lighting', stock: 41, price: 178 },
    { sku: 'LGT-2255', product: 'Linen pendant shade', category: 'Lighting', stock: 0, price: 96 },
    { sku: 'TXT-3301', product: 'Wool throw blanket', category: 'Textiles', stock: 132, price: 74 },
    { sku: 'TXT-3348', product: 'Cotton cushion cover', category: 'Textiles', stock: 87, price: 32 },
    { sku: 'DEC-4419', product: 'Ceramic vase, tall', category: 'Decor', stock: 15, price: 58 },
    { sku: 'DEC-4460', product: 'Stoneware bowl set', category: 'Decor', stock: 3, price: 112 },
];

export const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
});

export const preciseCurrencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});
