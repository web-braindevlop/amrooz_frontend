'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Toggle from '@/components/ui/Toggle';
import ImageUploader from '@/components/admin/ImageUploader';
import FeaturedImageUploader from '@/components/admin/FeaturedImageUploader';
import VariantsEditor, { ColorPicker, SizePicker, guessColorHex } from '@/components/admin/VariantsEditor';
import TagSelector from '@/components/admin/TagSelector';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { AlertIcon } from '@/components/ui/Icons';
import {
  createProduct,
  fetchAdminCategories,
  fetchAdminProducts,
  updateProduct,
} from '@/lib/admin/products';
import { fetchAttributes, fetchBrands, fetchTags, tagsApi } from '@/lib/admin/taxonomy';
import { isHtmlEmpty } from '@/lib/richText';

const inputClass =
  'w-full rounded-2xl border border-black/10 bg-sand-50 px-4 py-3 text-sm text-primary placeholder:text-primary/35 outline-none transition-colors focus:border-accent focus:bg-white';
const labelClass = 'mb-2 block text-xs font-semibold uppercase tracking-[0.1em] text-primary/60';

// WooCommerce product types.
const PRODUCT_TYPES = [
  { value: 'simple', label: 'Simple product' },
  { value: 'grouped', label: 'Grouped product' },
  { value: 'external', label: 'External/Affiliate product' },
  { value: 'variable', label: 'Variable product' },
];

// Which "Product data" tabs each type exposes (mirrors WooCommerce). A
// variable product's price and stock live entirely on its variations, so it
// gets only the Variations tab — no separate General/Inventory to conflict with it.
// For simple products, SKU and stock are now in General tab, so Inventory tab is removed.
const TABS_BY_TYPE = {
  simple: ['general'],
  grouped: ['general', 'inventory'],
  external: ['general', 'inventory'],
  variable: ['variations'],
};
const TAB_LABELS = { general: 'General', inventory: 'Inventory', variations: 'Variations' };

/** Stored sale value → <input type="datetime-local"> value ("YYYY-MM-DDTHH:mm").
 *  Legacy date-only values get a midnight time so they still populate the input. */
function toDateTimeLocal(value) {
  if (!value) return '';
  let s = String(value).replace(' ', 'T');
  if (s.length <= 10) s = `${s}T00:00`;
  return s.slice(0, 16);
}

/** <input datetime-local> value → stored local ISO datetime, ensuring seconds
 *  ("YYYY-MM-DDTHH:mm" → "YYYY-MM-DDTHH:mm:00") so it validates as a date string. */
function toStoredDateTime(value) {
  if (!value) return null;
  let s = String(value).replace(' ', 'T');
  if (s.length === 16) s = `${s}:00`;
  return s;
}

/** A variation's own sale price, or regular price override — null if it has neither set. */
function variantEffectivePrice(v) {
  if (v.salePrice !== '' && v.salePrice != null) return Number(v.salePrice);
  if (v.priceOverride !== '' && v.priceOverride != null) return Number(v.priceOverride);
  return null;
}

function Card({ title, description, children }) {
  return (
    <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-card">
      {title && <h2 className="font-serif text-lg text-primary">{title}</h2>}
      {description && <p className="mt-1 text-sm text-primary/50">{description}</p>}
      <div className={title ? 'mt-5 space-y-5' : 'space-y-5'}>{children}</div>
    </div>
  );
}

function toFormState(product) {
  if (!product) {
    return {
      name: '',
      slug: '',
      type: 'simple',
      externalUrl: '',
      buttonText: '',
      categoryId: '',
      brandId: '',
      shortDescription: '',
      description: '',
      regularPrice: '',
      salePrice: '',
      sku: '',
      stock: '0',
      sizes: ['Small', 'Medium', 'Large', 'X-Large'],
      isActive: true,
      isFeatured: false,
      isNew: false,
    };
  }
  // Sale price is only meaningful when it's actually lower than the
  // regular price — otherwise there's no markdown to show.
  const onSale =
    product.compareAtPrice != null && Number(product.compareAtPrice) > Number(product.price);
  return {
    name: product.name || '',
    slug: product.slug || '',
    type: product.type || 'simple',
    externalUrl: product.externalUrl || '',
    buttonText: product.buttonText || '',
    categoryId: product.categoryId ? String(product.categoryId) : '',
    brandId: product.brandId ? String(product.brandId) : '',
    shortDescription: product.shortDescription || '',
    description: product.description || '',
    regularPrice: onSale
      ? String(product.compareAtPrice)
      : product.price != null
        ? String(product.price)
        : '',
    salePrice: onSale ? String(product.price) : '',
    sku: product.sku || '',
    stock: product.stock != null ? String(product.stock) : '0',
    sizes: Array.isArray(product.sizes) && product.sizes.length
      ? product.sizes
      : ['Small', 'Medium', 'Large', 'X-Large'],
    isActive: !!product.isActive,
    isFeatured: !!product.isFeatured,
    isNew: !!product.isNew,
  };
}

export default function ProductForm({ mode, product }) {
  const router = useRouter();
  const isEdit = mode === 'edit';

  const [form, setForm] = useState(() => toFormState(product));

  // Featured/main image and the untagged "shared" gallery are generic
  // (color: null). Color-tagged gallery photos aren't managed separately —
  // each variation's own image (below) doubles as that color's storefront
  // gallery entry, so there's exactly one upload control per color/variation,
  // not two. All of this is flattened into one `images: {url, color}[]` on submit.
  const [mainImage, setMainImage] = useState(() => {
    const generic = (product?.imagesDetailed || []).filter((d) => !d.color);
    return generic[0]?.url || '';
  });
  const [genericGalleryImages, setGenericGalleryImages] = useState(() => {
    const generic = (product?.imagesDetailed || []).filter((d) => !d.color);
    return generic.slice(1).map((d) => d.url);
  });

  const [variants, setVariants] = useState(
    () =>
      product?.variants?.map((v) => ({
        size: v.size || '',
        color: v.color || '',
        colorHex: v.colorHex || '#1a1a1a',
        sku: v.sku || '',
        stock: v.stock ?? 0,
        priceOverride: v.priceOverride != null ? String(v.priceOverride) : '',
        salePrice: v.salePrice != null ? String(v.salePrice) : '',
        saleStartDate: toDateTimeLocal(v.saleStartDate),
        saleEndDate: toDateTimeLocal(v.saleEndDate),
        isActive: v.isActive !== false,
        imageUrl: v.imageUrl || '',
      })) || [],
  );

  // Which attribute terms this product is offered in. Held here (not inside
  // VariantsEditor) so the selection survives switching product-data tabs, and
  // seeded from existing variants when editing an existing product.
  const [selectedColors, setSelectedColors] = useState(() => {
    const map = new Map();
    for (const v of product?.variants || []) {
      const name = (v.color || '').trim();
      if (name && !map.has(name)) {
        map.set(name, { name, hex: v.colorHex || guessColorHex(name) });
      }
    }
    return Array.from(map.values());
  });
  const [selectedSizes, setSelectedSizes] = useState(() => {
    const seen = new Set();
    const list = [];
    for (const v of product?.variants || []) {
      const s = (v.size || '').trim();
      if (s && !seen.has(s)) {
        seen.add(s);
        list.push(s);
      }
    }
    return list;
  });

  const [selectedTagIds, setSelectedTagIds] = useState(
    () => product?.tagIds || (product?.tags || []).map((t) => t.id) || [],
  );
  const [groupedIds, setGroupedIds] = useState(() => product?.groupedProductIds || []);

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [attributes, setAttributes] = useState([]);
  // Which of the store's attributes feed the Color/Size pickers below — the
  // admin picks explicitly (defaulted to a same-name guess once attributes
  // load) rather than the picker silently grabbing whichever one loaded first.
  const [colorAttributeId, setColorAttributeId] = useState('');
  const [sizeAttributeId, setSizeAttributeId] = useState('');
  const [tab, setTab] = useState('general');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const type = form.type;
  const isGrouped = type === 'grouped';
  const isExternal = type === 'external';
  const isVariable = type === 'variable';
  const allowedTabs = TABS_BY_TYPE[type] || TABS_BY_TYPE.simple;

  // Global attributes (from Products → Attributes) drive the variation
  // pickers, so the admin selects existing terms instead of retyping them.
  const colorAttribute = useMemo(
    () => attributes.find((a) => String(a.id) === colorAttributeId) || null,
    [attributes, colorAttributeId],
  );
  const sizeAttribute = useMemo(
    () => attributes.find((a) => String(a.id) === sizeAttributeId) || null,
    [attributes, sizeAttributeId],
  );
  const colorOptions = useMemo(
    () => (colorAttribute?.terms || []).map((t) => ({ name: t.name, hex: guessColorHex(t.name) })),
    [colorAttribute],
  );
  const sizeOptions = useMemo(
    () => (sizeAttribute?.terms || []).map((t) => t.name),
    [sizeAttribute],
  );

  // Every variation's own photo (uploaded on its card) automatically becomes
  // part of the product gallery too — with 8-9 variations that's already a
  // full gallery, so there's nothing extra to upload here for it to show up.
  const variantGalleryImages = useMemo(() => {
    const seen = new Set();
    const list = [];
    for (const v of variants) {
      if (v.imageUrl && !seen.has(v.imageUrl)) {
        seen.add(v.imageUrl);
        list.push(v.imageUrl);
      }
    }
    return list;
  }, [variants]);

  // Picking an attribute selects all of its terms by default — the admin
  // removes the ones they don't want rather than adding each one by hand.
  // Reads `attributes` directly (not the colorOptions/sizeOptions memo) since
  // state set here hasn't re-rendered yet when this function runs.
  function handleColorAttributeChange(id) {
    setColorAttributeId(id);
    const terms = attributes.find((a) => String(a.id) === id)?.terms || [];
    setSelectedColors(terms.map((t) => ({ name: t.name, hex: guessColorHex(t.name) })));
  }
  function handleSizeAttributeChange(id) {
    setSizeAttributeId(id);
    const terms = attributes.find((a) => String(a.id) === id)?.terms || [];
    setSelectedSizes(terms.map((t) => t.name));
  }


  useEffect(() => {
    Promise.all([
      fetchAdminCategories().catch(() => []),
      fetchBrands().catch(() => []),
      fetchTags().catch(() => []),
      fetchAdminProducts().catch(() => []),
      fetchAttributes().catch(() => []),
    ]).then(([cats, brs, tgs, prods, attrs]) => {
      setCategories(cats);
      setBrands(brs);
      setAllTags(tgs);
      setAllProducts(prods);
      setAttributes(attrs);
      // Color/Size attribute pickers start on "None" — the Colors/Sizes chip
      // pools below only appear once the admin explicitly picks one.
    });
  }, []);

  // Keep the active tab valid when the product type changes.
  useEffect(() => {
    if (!allowedTabs.includes(tab)) setTab(allowedTabs[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleGrouped(id) {
    setGroupedIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  }

  async function handleCreateTag(name) {
    const created = await tagsApi.create({ name });
    setAllTags((prev) => [...prev, created]);
    return created;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) return setError('Product name is required.');
    if (isHtmlEmpty(form.description)) return setError('Description is required.');
    if (!isGrouped && !isVariable && (!form.regularPrice || Number(form.regularPrice) <= 0))
      return setError('Enter a valid regular price.');
    if (!isGrouped && !isVariable && form.salePrice && Number(form.salePrice) >= Number(form.regularPrice))
      return setError('Sale price must be less than the regular price.');
    const activeVariants = variants.filter((v) => v.size.trim() || v.color.trim());
    if (isVariable && !activeVariants.length) {
      return setError('Generate at least one variation under the Variations tab.');
    }
    if (isVariable && activeVariants.some((v) => !v.color.trim() || !v.size.trim())) {
      return setError('Every variation needs both a color and a size.');
    }
    if (isVariable && !activeVariants.some((v) => variantEffectivePrice(v) != null)) {
      return setError('Set a price on at least one variation.');
    }
    if (isExternal && !form.externalUrl.trim())
      return setError('Enter the product URL for an external/affiliate product.');
    if (!form.categoryId) return setError('Select a category.');

    setSubmitting(true);
    try {
      const onSale = !isGrouped && !isVariable && form.salePrice && Number(form.salePrice) > 0;

      // A variable product has no product-level price/stock inputs — both
      // are rolled up from its variations (lowest price "from", combined stock).
      let variablePrice = 0;
      let variableStock = 0;
      if (isVariable) {
        const prices = activeVariants.map(variantEffectivePrice).filter((p) => p != null);
        variablePrice = prices.length ? Math.min(...prices) : 0;
        variableStock = activeVariants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
      }

      const payload = {
        name: form.name.trim(),
        type,
        ...(form.slug.trim() ? { slug: form.slug.trim() } : {}),
        description: form.description.trim(),
        ...(!isHtmlEmpty(form.shortDescription)
          ? { shortDescription: form.shortDescription.trim() }
          : {}),
        price: isGrouped ? 0 : isVariable ? variablePrice : Number(onSale ? form.salePrice : form.regularPrice),
        compareAtPrice: onSale ? Number(form.regularPrice) : null,
        ...(form.sku.trim() && !isVariable ? { sku: form.sku.trim() } : {}),
        brandId: form.brandId ? Number(form.brandId) : null,
        stock: isVariable ? variableStock : Number(form.stock) || 0,
        sizes: type === 'simple' ? form.sizes : [],
        categoryId: Number(form.categoryId),
        tagIds: selectedTagIds,
        externalUrl: isExternal ? form.externalUrl.trim() || null : null,
        buttonText: isExternal ? form.buttonText.trim() || null : null,
        groupedProductIds: isGrouped ? groupedIds : [],
        isActive: form.isActive,
        isFeatured: form.isFeatured,
        isNew: form.isNew,
        images: [
          ...(mainImage ? [{ url: mainImage, color: null }] : []),
          ...genericGalleryImages.map((url) => ({ url, color: null })),
          // Each variation's own photo also becomes that color's storefront
          // gallery entry — one upload control per variation, not a second,
          // separate per-color gallery to keep in sync with it.
          ...activeVariants
            .filter((v) => v.color.trim() && v.imageUrl)
            .map((v) => ({ url: v.imageUrl, color: v.color.trim() })),
        ],
        variants: activeVariants
          .map((v) => ({
            ...(v.size.trim() ? { size: v.size.trim() } : {}),
            ...(v.color.trim() ? { color: v.color.trim() } : {}),
            ...(v.colorHex ? { colorHex: v.colorHex } : {}),
            ...(v.sku.trim() ? { sku: v.sku.trim() } : {}),
            stock: Number(v.stock) || 0,
            ...(v.priceOverride !== '' && v.priceOverride != null
              ? { priceOverride: Number(v.priceOverride) }
              : {}),
            ...(v.salePrice !== '' && v.salePrice != null
              ? { salePrice: Number(v.salePrice) }
              : {}),
            ...(v.saleStartDate ? { saleStartDate: toStoredDateTime(v.saleStartDate) } : {}),
            ...(v.saleEndDate ? { saleEndDate: toStoredDateTime(v.saleEndDate) } : {}),
            isActive: v.isActive !== false,
            ...(v.imageUrl ? { imageUrl: v.imageUrl } : {}),
          })),
      };

      if (isEdit) {
        await updateProduct(product.id, payload);
      } else {
        await createProduct(payload);
      }
      router.push('/admin/products');
      router.refresh();
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  }

  const groupableProducts = allProducts.filter((p) => !isEdit || p.id !== product?.id);

  return (
    <form onSubmit={handleSubmit} noValidate>
      {error && (
        <div className="mb-6 flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-6 lg:col-span-2">
          <Card title="Basic Information">
            <div>
              <label htmlFor="name" className={labelClass}>
                Product Name
              </label>
              <input
                id="name"
                required
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                placeholder="Silk-Blend Evening Dress"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="shortDescription" className={labelClass}>
                Short Description{' '}
                <span className="normal-case text-primary/35">(shown on product cards)</span>
              </label>
              <RichTextEditor
                id="shortDescription"
                value={form.shortDescription}
                onChange={(html) => setField('shortDescription', html)}
                placeholder="Fluid drape with a hand-finished hem."
                minHeight={140}
              />
            </div>

            <div>
              <label htmlFor="description" className={labelClass}>
                Full Description
              </label>
              <RichTextEditor
                id="description"
                value={form.description}
                onChange={(html) => setField('description', html)}
                placeholder="Detailed description shown on the product page…"
              />
            </div>
          </Card>

          {/* Product data — WooCommerce-style tabbed panel with a type selector */}
          <div className="overflow-hidden rounded-3xl border border-black/5 bg-white shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 px-6 pt-5">
              <div className="flex gap-1">
                {allowedTabs.map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setTab(key)}
                    className={
                      tab === key
                        ? 'border-b-2 border-accent px-4 pb-3 text-sm font-semibold text-primary'
                        : 'border-b-2 border-transparent px-4 pb-3 text-sm font-medium text-primary/45 transition-colors hover:text-primary/70'
                    }
                  >
                    {TAB_LABELS[key]}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 pb-3">
                <span className="font-serif text-sm text-primary/40">Product data —</span>
                <select
                  aria-label="Product type"
                  value={type}
                  onChange={(e) => setField('type', e.target.value)}
                  className="rounded-xl border border-black/10 bg-sand-50 px-3 py-1.5 text-sm font-medium text-primary outline-none transition-colors focus:border-accent focus:bg-white"
                >
                  {PRODUCT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-6">
              {tab === 'general' && (
                <div className="space-y-5">
                  {isGrouped ? (
                    <GroupedProductsPicker
                      products={groupableProducts}
                      value={groupedIds}
                      onToggle={toggleGrouped}
                    />
                  ) : (
                    <>
                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div>
                          <label htmlFor="regularPrice" className={labelClass}>
                            Regular Price ($)
                          </label>
                          <input
                            id="regularPrice"
                            type="number"
                            min="0"
                            step="0.01"
                            required
                            value={form.regularPrice}
                            onChange={(e) => setField('regularPrice', e.target.value)}
                            placeholder="169.00"
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label htmlFor="salePrice" className={labelClass}>
                            Sale Price{' '}
                            <span className="normal-case text-primary/35">(optional)</span>
                          </label>
                          <input
                            id="salePrice"
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.salePrice}
                            onChange={(e) => setField('salePrice', e.target.value)}
                            placeholder="129.00"
                            className={inputClass}
                          />
                          <p className="mt-1.5 text-xs text-primary/40">
                            Discounted price — shown as the current price, with the regular price
                            struck through.
                          </p>
                        </div>
                      </div>

                      {/* SKU and Stock Quantity fields - moved from Inventory tab */}
                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div>
                          <label htmlFor="sku" className={labelClass}>
                            SKU <span className="normal-case text-primary/35">(optional)</span>
                          </label>
                          <input
                            id="sku"
                            value={form.sku}
                            onChange={(e) => setField('sku', e.target.value)}
                            placeholder="AMR-DRS-001"
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label htmlFor="stock" className={labelClass}>
                            Stock Quantity
                          </label>
                          <input
                            id="stock"
                            type="number"
                            min="0"
                            value={form.stock}
                            onChange={(e) => setField('stock', e.target.value)}
                            className={inputClass}
                          />
                          <p className="mt-1.5 text-xs text-primary/40">
                            Set to 0 to show the product as "Sold Out".
                          </p>
                        </div>
                      </div>

                      {type === 'simple' && (
                        <div>
                          <label htmlFor="sizes" className={labelClass}>Available Sizes</label>
                          <input
                            id="sizes"
                            value={form.sizes.join(', ')}
                            onChange={(e) => setField('sizes', e.target.value.split(',').map((size) => size.trim()).filter(Boolean))}
                            placeholder="Small, Medium, Large, X-Large"
                            className={inputClass}
                          />
                          <p className="mt-1.5 text-xs text-primary/40">
                            Enter sizes separated by commas. These appear as selectable buttons on the product page.
                          </p>
                        </div>
                      )}

                      {isExternal && (
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                          <div>
                            <label htmlFor="externalUrl" className={labelClass}>
                              Product URL
                            </label>
                            <input
                              id="externalUrl"
                              value={form.externalUrl}
                              onChange={(e) => setField('externalUrl', e.target.value)}
                              placeholder="https://partner.com/product"
                              className={inputClass}
                            />
                          </div>
                          <div>
                            <label htmlFor="buttonText" className={labelClass}>
                              Button Text{' '}
                              <span className="normal-case text-primary/35">(optional)</span>
                            </label>
                            <input
                              id="buttonText"
                              value={form.buttonText}
                              onChange={(e) => setField('buttonText', e.target.value)}
                              placeholder="Buy product"
                              className={inputClass}
                            />
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {tab === 'inventory' && (
                <div className="rounded-md bg-blue-50 p-4 border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> SKU and Stock Quantity fields have been moved to the General tab for easier access.
                  </p>
                </div>
              )}

              {tab === 'variations' && (
                <div>
                  <p className="mb-4 text-sm text-primary/50">
                    Pick which of your store&apos;s attributes provide colors and sizes for this
                    product, choose the terms that apply, then generate a purchasable variation
                    for each combination — each with its own SKU, stock, price, image and
                    availability. Swatch colors power the storefront color dots, and each
                    variation&apos;s photo also becomes part of that color&apos;s storefront
                    gallery. A variable product has no separate price/stock fields — set at least
                    one variation&apos;s price below; the product&apos;s listing price is the
                    lowest one, and its stock is the total across all variations.
                  </p>

                  {attributes.length > 0 && (
                    <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="colorAttribute" className={labelClass}>
                          Color attribute
                        </label>
                        <select
                          id="colorAttribute"
                          value={colorAttributeId}
                          onChange={(e) => handleColorAttributeChange(e.target.value)}
                          className={inputClass}
                        >
                          <option value="">None</option>
                          {attributes.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.name}
                            </option>
                          ))}
                        </select>
                        <ColorPicker
                          colorOptions={colorOptions}
                          selectedColors={selectedColors}
                          onChange={setSelectedColors}
                          className="mt-3"
                        />
                      </div>
                      <div>
                        <label htmlFor="sizeAttribute" className={labelClass}>
                          Size attribute
                        </label>
                        <select
                          id="sizeAttribute"
                          value={sizeAttributeId}
                          onChange={(e) => handleSizeAttributeChange(e.target.value)}
                          className={inputClass}
                        >
                          <option value="">None</option>
                          {attributes.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.name}
                            </option>
                          ))}
                        </select>
                        <SizePicker
                          sizeOptions={sizeOptions}
                          selectedSizes={selectedSizes}
                          onChange={setSelectedSizes}
                          className="mt-3"
                        />
                      </div>
                    </div>
                  )}

                  <VariantsEditor
                    variants={variants}
                    onChange={setVariants}
                    colorOptions={colorOptions}
                    sizeOptions={sizeOptions}
                    selectedColors={selectedColors}
                    selectedSizes={selectedSizes}
                  />
                </div>
              )}
            </div>
          </div>

          <Card
            title="Product Image"
            description="The main photo shown on product cards and store listings."
          >
            <FeaturedImageUploader image={mainImage} onChange={setMainImage} />
          </Card>

          <Card
            title="Product Gallery"
            description={
              isVariable
                ? "Every variation's photo (uploaded on its card, in Variations) automatically becomes part of this gallery — nothing extra to do. Add more shared photos below if you want."
                : 'Additional shared photos shown on the product page (used when no color-specific gallery applies).'
            }
          >
            {isVariable && variantGalleryImages.length > 0 && (
              <div>
                <p className={labelClass}>From your variations</p>
                <div className="flex flex-wrap gap-3">
                  {variantGalleryImages.map((url) => (
                    <div
                      key={url}
                      className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-black/10 bg-sand-50"
                    >
                      <img src={url} alt="" className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}
            <ImageUploader images={genericGalleryImages} onChange={setGenericGalleryImages} />
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="flex flex-col gap-3 rounded-3xl border border-black/5 bg-white p-6 shadow-card">
            <Button type="submit" fullWidth size="lg" loading={submitting} disabled={submitting}>
              {isEdit ? 'Save Changes' : 'Publish Product'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              fullWidth
              onClick={() => router.push('/admin/products')}
              disabled={submitting}
            >
              Cancel
            </Button>
          </div>

          <Card title="Product Categories">
            <div>
              <label htmlFor="categoryId" className={labelClass}>
                Category
              </label>
              <select
                id="categoryId"
                required
                value={form.categoryId}
                onChange={(e) => setField('categoryId', e.target.value)}
                className={inputClass}
              >
                <option value="">Select a category…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-primary/40">
                Manage the full list under Products → Categories.
              </p>
            </div>
          </Card>

          <Card title="Brand">
            <div>
              <label htmlFor="brandId" className={labelClass}>
                Brand <span className="normal-case text-primary/35">(optional)</span>
              </label>
              <select
                id="brandId"
                value={form.brandId}
                onChange={(e) => setField('brandId', e.target.value)}
                className={inputClass}
              >
                <option value="">No brand</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </Card>

          <Card title="Product Tags">
            <TagSelector
              tags={allTags}
              value={selectedTagIds}
              onChange={setSelectedTagIds}
              onCreateTag={handleCreateTag}
            />
          </Card>

          <Card title="Visibility">
            <Toggle
              id="isActive"
              checked={form.isActive}
              onChange={(v) => setField('isActive', v)}
              label="Visible in store"
              description="Shown to shoppers when on"
            />
            <Toggle
              id="isFeatured"
              checked={form.isFeatured}
              onChange={(v) => setField('isFeatured', v)}
              label="Featured"
              description="Highlighted on the homepage"
            />
            <Toggle
              id="isNew"
              checked={form.isNew}
              onChange={(v) => setField('isNew', v)}
              label="Mark as New"
              description="Shows a “New” badge"
            />
          </Card>
        </div>
      </div>
    </form>
  );
}

/** Checkbox list used by Grouped products to pick child products. */
function GroupedProductsPicker({ products, value, onToggle }) {
  return (
    <div>
      <label className={labelClass}>Grouped Products</label>
      <p className="mb-3 text-xs text-primary/40">
        Pick the child products sold together in this group. A grouped product has no price of its
        own — shoppers buy the children.
      </p>
      {products.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-black/15 px-4 py-6 text-center text-sm text-primary/40">
          No other products to group yet.
        </p>
      ) : (
        <div className="max-h-72 space-y-1 overflow-y-auto rounded-2xl border border-black/10 bg-sand-50 p-2">
          {products.map((p) => {
            const checked = value.includes(p.id);
            return (
              <label
                key={p.id}
                className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-white"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(p.id)}
                  className="h-4 w-4 accent-accent"
                />
                <span className="h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-sand-100">
                  {p.imageUrl && (
                    <img src={p.imageUrl} alt="" className="h-full w-full object-cover" />
                  )}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-primary">{p.name}</span>
                {p.sku && <span className="text-xs text-primary/35">{p.sku}</span>}
              </label>
            );
          })}
        </div>
      )}
      {value.length > 0 && (
        <p className="mt-2 text-xs text-primary/50">
          {value.length} product{value.length === 1 ? '' : 's'} grouped.
        </p>
      )}
    </div>
  );
}
