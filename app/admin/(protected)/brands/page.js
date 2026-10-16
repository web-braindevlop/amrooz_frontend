'use client';

import TaxonomyManager from '@/components/admin/TaxonomyManager';
import Badge from '@/components/ui/Badge';
import { brandsApi } from '@/lib/admin/taxonomy';

const extraFields = [
  { key: 'logoUrl', label: 'Logo URL', type: 'text', placeholder: 'https://…' },
  { key: 'sortOrder', label: 'Sort Order', type: 'number', default: 0 },
  {
    key: 'isActive',
    label: 'Active',
    type: 'toggle',
    default: true,
    help: 'Show this brand in the storefront.',
  },
];

const columns = [
  { key: 'sortOrder', label: 'Sort' },
  {
    key: 'isActive',
    label: 'Status',
    render: (item) => (
      <Badge tone={item.isActive ? 'neutral' : 'soldout'}>
        {item.isActive ? 'Active' : 'Hidden'}
      </Badge>
    ),
  },
];

export default function BrandsPage() {
  return (
    <TaxonomyManager
      singular="Brand"
      plural="Brands"
      description="Manage the labels and makers behind your products."
      api={brandsApi}
      extraFields={extraFields}
      columns={columns}
    />
  );
}
