import cn from 'classnames';
import React, { useCallback, useMemo, useState } from 'react';
import { Button } from '../../../components';
import { createModel } from '../../../store';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';

interface Product {
    id: number;
    name: string;
    price: number;
    category: string;
}

let productIdCounter = 0;

const initialProducts: Partial<Product>[] = [
    { name: 'Wireless Mouse', price: 29.99, category: 'Electronics' },
    { name: 'Mechanical Keyboard', price: 89.99, category: 'Electronics' },
    { name: 'USB-C Hub', price: 45.0, category: 'Accessories' },
    { name: 'Monitor Stand', price: 34.99, category: 'Furniture' },
    { name: 'Webcam HD', price: 59.99, category: 'Electronics' },
    { name: 'Desk Lamp', price: 24.99, category: 'Furniture' },
    { name: 'Mouse Pad XL', price: 19.99, category: 'Accessories' },
    { name: 'Headphone Stand', price: 15.99, category: 'Accessories' },
];

const productFactory = createModel<Product>({
    nextId: () => ++productIdCounter,
    createWithDefaults: (id) => ({
        id,
        name: '',
        price: 0,
        category: 'Uncategorized',
    }),
    selectId: (state) => state.id,
});

initialProducts.forEach((p) => productFactory.create(p));

const code = `import { createModel, createListHook } from 'fluxo-ui/store';

const productFactory = createModel<Product>({
    nextId: () => ++productIdCounter,
    createWithDefaults: (id) => ({ id, name: '', price: 0, category: '' }),
    selectId: (state) => state.id,
});

const useProductList = createListHook(productFactory);

function ProductList() {
    const [page, setPage] = useState(1);
    const list = useProductList();

    return (
        <div>
            {list.items.map(item => (
                <div key={item.id}>{item.name} - \${item.price}</div>
            ))}
            <span>{list.totalCount} total</span>
        </div>
    );
}`;

const ListManagement: React.FC = () => {
    const { isDark } = useStoryTheme();
    const [page, setPage] = useState(1);
    const [itemsPerPage] = useState(4);
    const [sortBy, setSortBy] = useState<string>('name');
    const [, setRefreshKey] = useState(0);

    const listState = useMemo(() => productFactory.list({ page, itemsPerPage, sortBy }), [page, itemsPerPage, sortBy]);
    const totalPages = Math.max(1, Math.ceil(listState.totalCount / itemsPerPage));

    const handleAddProduct = useCallback(() => {
        const names = ['Laptop Stand', 'Cable Organizer', 'Screen Protector', 'USB Drive', 'Bluetooth Speaker'];
        const categories = ['Electronics', 'Accessories', 'Furniture'];
        const randomName = names[Math.floor(Math.random() * names.length)];
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        const randomPrice = Math.round((Math.random() * 80 + 10) * 100) / 100;
        productFactory.create({ name: randomName, price: randomPrice, category: randomCategory });
        setRefreshKey((k) => k + 1);
    }, []);

    const handleRemoveLast = useCallback(() => {
        if (listState.items.length > 0) {
            const lastItem = listState.items[listState.items.length - 1];
            const store = productFactory.get(lastItem.id);
            store?.destroy();
            setRefreshKey((k) => k + 1);
            const newTotalPages = Math.max(1, Math.ceil((listState.totalCount - 1) / itemsPerPage));
            if (page > newTotalPages) {
                setPage(newTotalPages);
            }
        }
    }, [listState, page, itemsPerPage]);

    return (
        <>
            <ComponentDemo
                title="List Management with Pagination"
                description="Use list() to paginate and sort model items"
                centered={false}
            >
                <div className="w-full max-w-2xl mx-auto p-4">
                    <div className="flex flex-wrap gap-2 mb-4">
                        <Button label="Add Random Product" size="sm" onClick={handleAddProduct} />
                        <Button label="Remove Last" size="sm" variant="secondary" layout="outlined" onClick={handleRemoveLast} />
                        <div className="flex items-center gap-2 ml-auto">
                            <span className={cn('text-xs', { 'text-gray-500': isDark, 'text-gray-400': !isDark })}>Sort by:</span>
                            {['name', 'price', 'category'].map((field) => (
                                <Button
                                    key={field}
                                    label={field}
                                    size="xs"
                                    variant={sortBy === field ? 'default' : 'secondary'}
                                    layout={sortBy === field ? 'default' : 'plain'}
                                    onClick={() => setSortBy(field)}
                                />
                            ))}
                        </div>
                    </div>

                    <div
                        className={cn('rounded-lg border overflow-hidden', {
                            'border-white/10': isDark,
                            'border-gray-200': !isDark,
                        })}
                    >
                        <table className="w-full text-sm">
                            <thead>
                                <tr
                                    className={cn('border-b', {
                                        'border-white/10 bg-white/5': isDark,
                                        'border-gray-200 bg-gray-50': !isDark,
                                    })}
                                >
                                    <th
                                        className={cn('text-left px-4 py-2 font-medium', {
                                            'text-gray-400': isDark,
                                            'text-gray-500': !isDark,
                                        })}
                                    >
                                        Name
                                    </th>
                                    <th
                                        className={cn('text-left px-4 py-2 font-medium', {
                                            'text-gray-400': isDark,
                                            'text-gray-500': !isDark,
                                        })}
                                    >
                                        Category
                                    </th>
                                    <th
                                        className={cn('text-right px-4 py-2 font-medium', {
                                            'text-gray-400': isDark,
                                            'text-gray-500': !isDark,
                                        })}
                                    >
                                        Price
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {listState.items.map((item) => (
                                    <tr
                                        key={item.id}
                                        className={cn('border-b last:border-b-0', {
                                            'border-white/5': isDark,
                                            'border-gray-100': !isDark,
                                        })}
                                    >
                                        <td className={cn('px-4 py-2.5', { 'text-gray-200': isDark, 'text-gray-700': !isDark })}>
                                            {item.name}
                                        </td>
                                        <td className={cn('px-4 py-2.5', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                                            {item.category}
                                        </td>
                                        <td
                                            className={cn('px-4 py-2.5 text-right font-mono', {
                                                'text-gray-300': isDark,
                                                'text-gray-600': !isDark,
                                            })}
                                        >
                                            ${item.price.toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                                {listState.items.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={3}
                                            className={cn('px-4 py-8 text-center text-sm', {
                                                'text-gray-600': isDark,
                                                'text-gray-400': !isDark,
                                            })}
                                        >
                                            No products. Add some above.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                        <span className={cn('text-xs', { 'text-gray-500': isDark, 'text-gray-400': !isDark })}>
                            {listState.totalCount} total items
                        </span>
                        <div className="flex items-center gap-1">
                            <Button
                                label="Prev"
                                size="xs"
                                variant="secondary"
                                layout="plain"
                                disabled={page <= 1}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                            />
                            <span className={cn('px-3 py-1 text-xs', { 'text-gray-300': isDark, 'text-gray-600': !isDark })}>
                                {page} / {totalPages}
                            </span>
                            <Button
                                label="Next"
                                size="xs"
                                variant="secondary"
                                layout="plain"
                                disabled={page >= totalPages}
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            />
                        </div>
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default ListManagement;
