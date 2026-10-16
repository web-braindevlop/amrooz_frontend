'use client';

import TaxonomyManager from '@/components/admin/TaxonomyManager';
import { ToastProvider } from '@/components/ui/ToastProvider';
import { categoriesApi } from '@/lib/admin/taxonomy';

const extraFields = [
  {
    key: 'parentId',
    label: 'Parent Category',
    type: 'select',
    numeric: true,
    clearable: true,
    help: 'Assign a parent to create a sub-category. Only top-level categories can be a parent.',
    options: (items, editing) => [
      { value: '', label: '— None (top level) —' },
      ...items
        // Only top-level categories are valid parents — a category that is
        // itself a child can't be picked, which keeps the tree two levels deep.
        .filter((i) => !i.parentId && (!editing || i.id !== editing.id))
        .map((i) => ({ value: i.id, label: i.name })),
    ],
  },
  { key: 'imageUrl', label: 'Image URL', type: 'text', placeholder: 'https://…' },
  {
    key: 'isActive',
    label: 'Active',
    type: 'toggle',
    default: true,
    help: 'Show this category in the storefront.',
  },
];

const columns = [
  {
    key: 'parentId',
    label: 'Parent',
    render: (item, items) => items.find((i) => i.id === item.parentId)?.name || '—',
  },
];

// Names only need to be unique within their own sibling group — two
// top-level categories can't both be "Accessories", but "Sandals" can exist
// under both Men's and Women's. The server enforces this too; this just
// gives instant inline feedback before a round trip.
function validate(form, items, editing) {
  const scopeParentId = form.parentId ? Number(form.parentId) : null;
  const name = form.name.trim().toLowerCase();
  const clash = items.find(
    (i) =>
      (i.parentId || null) === scopeParentId &&
      i.id !== editing?.id &&
      i.name.trim().toLowerCase() === name,
  );
  if (!clash) return null;
  return scopeParentId
    ? `A category named "${form.name.trim()}" already exists under this parent.`
    : `A top-level category named "${form.name.trim()}" already exists.`;
}

export default function CategoriesPage() {
  return (
    <ToastProvider>
      <TaxonomyManager
        singular="Category"
        plural="Categories"
        description="Organize products into browsable groups. Drag the handle on the right table to reorder."
        api={categoriesApi}
        extraFields={extraFields}
        columns={columns}
        hierarchical
        statusField="isActive"
        reorderable
        headerClassName="border-b border-blue-700 bg-blue-600 text-xs font-semibold uppercase tracking-wide text-white"
        validate={validate}
      />
    </ToastProvider>
  );
}
