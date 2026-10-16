'use client';

import TaxonomyManager from '@/components/admin/TaxonomyManager';
import { tagsApi } from '@/lib/admin/taxonomy';

export default function TagsPage() {
  return (
    <TaxonomyManager
      singular="Tag"
      plural="Tags"
      description="Tags are keywords that help shoppers discover related products."
      api={tagsApi}
    />
  );
}
