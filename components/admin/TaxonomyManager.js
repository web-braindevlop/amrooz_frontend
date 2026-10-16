'use client';

import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Button from '@/components/ui/Button';
import Toggle from '@/components/ui/Toggle';
import Badge from '@/components/ui/Badge';
import {
  ChevronDownIcon,
  DotsIcon,
  EditIcon,
  GripIcon,
  TrashIcon,
} from '@/components/ui/Icons';
import { cn } from '@/utils/format';
import { useToast } from '@/components/ui/ToastProvider';

const DEFAULT_HEADER_CLASS =
  'border-b border-black/5 text-xs font-semibold uppercase tracking-wide text-primary/45';

const inputClass =
  'w-full rounded-2xl border border-black/10 bg-sand-50 px-4 py-3 text-sm text-primary placeholder:text-primary/35 outline-none transition-colors focus:border-accent focus:bg-white';
const labelClass = 'mb-2 block text-xs font-semibold uppercase tracking-[0.1em] text-primary/60';

/**
 * WordPress/WooCommerce-style taxonomy screen: an "Add / Edit" form on the left
 * and a table of existing terms on the right. Reused for Categories, Tags and Brands.
 *
 * Props:
 *  - singular / plural: display names ("Category" / "Categories")
 *  - description: subtitle under the add form
 *  - api: { list, create, update, remove }
 *  - showSlug / showDescription: toggle the baseline fields
 *  - extraFields: [{ key, label, type: 'text'|'number'|'toggle'|'select',
 *                    placeholder, help, default, numeric, clearable, options }]
 *      `options` may be an array of { value, label } or a fn (items, editingItem) => [...]
 *  - columns: [{ key, label, render?(item, items) }] extra table columns
 *  - hierarchical: when true, groups items by `parentId` (top-level items as
 *    parents, everything else nested under its parent) with a per-parent
 *    expand/collapse toggle. Used for Categories; Tags/Brands stay flat.
 *  - statusField: key of a boolean field (e.g. "isActive") to render as a
 *    clickable green/red status switch in its own table column. In
 *    hierarchical mode, switching a parent off cascades to its children
 *    (the server enforces this; the UI just reflects it after reload), and a
 *    child can't be switched on while its parent is off (also server-enforced).
 *  - reorderable: when true, adds a drag handle so admins can reorder items
 *    by dragging — parents among parents, and each parent's children among
 *    their own siblings only (drag targets outside that group are ignored).
 *    Persists the new order as sequential `sortOrder` values.
 *  - headerClassName: overrides the table header row's classes (e.g. a
 *    colored header for one taxonomy without changing the others).
 *  - validate: optional (form, items, editing) => errorMessage|null, run
 *    before submit for checks the caller needs to inject (e.g. category name
 *    uniqueness within a sibling group). Returning a message blocks submit
 *    and shows it inline, same as the built-in "name is required" check.
 *  - bulkCreate: when true (and not editing), the Name field becomes a
 *    textarea accepting several values at once — split on commas and/or
 *    newlines — and submit creates one item per value in a single action.
 *    Editing an existing item still targets just that one row.
 *
 * Toasts: success/error/warning notifications fire via useToast() from
 * ToastProvider. If the page isn't wrapped in one, calls are safe no-ops —
 * only pages that opt in (e.g. Categories) actually show them.
 */
export default function TaxonomyManager({
  singular,
  plural,
  description,
  api,
  showSlug = true,
  showDescription = true,
  extraFields = [],
  columns = [],
  hierarchical = false,
  statusField,
  reorderable = false,
  headerClassName = DEFAULT_HEADER_CLASS,
  validate,
  bulkCreate = false,
}) {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(() => blankForm(extraFields));
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Top-level items and each parent's children — only computed in hierarchical mode.
  const { parents, childrenByParent } = useMemo(() => {
    if (!hierarchical) return { parents: items, childrenByParent: new Map() };
    const parentItems = items.filter((i) => !i.parentId);
    const parentIds = new Set(parentItems.map((i) => i.id));
    const byParent = new Map();
    for (const item of items) {
      if (item.parentId && parentIds.has(item.parentId)) {
        if (!byParent.has(item.parentId)) byParent.set(item.parentId, []);
        byParent.get(item.parentId).push(item);
      }
    }
    // Anything whose parent no longer exists is shown at the top level too,
    // so no data silently disappears from the list.
    const orphans = items.filter((i) => i.parentId && !parentIds.has(i.parentId));
    return { parents: [...parentItems, ...orphans], childrenByParent: byParent };
  }, [items, hierarchical]);

  // Default every parent to expanded the first time its children are known,
  // without stomping on toggles the admin has already made.
  useEffect(() => {
    if (!hierarchical || expanded !== null) return;
    if (loading) return;
    setExpanded(new Set(parents.filter((p) => childrenByParent.has(p.id)).map((p) => p.id)));
  }, [hierarchical, loading, expanded, parents, childrenByParent]);

  function toggleExpanded(id) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function load() {
    setLoading(true);
    try {
      const data = await api.list();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function startEdit(item) {
    setEditing(item);
    setForm(toForm(item, extraFields));
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setEditing(null);
    setForm(blankForm(extraFields));
  }

  const isBulkAdd = bulkCreate && !editing;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return toast.error(`${singular} name is required.`);

    if (isBulkAdd) return handleBulkCreate();

    if (validate) {
      const validationError = validate(form, items, editing);
      if (validationError) return toast.error(validationError);
    }

    setSaving(true);
    try {
      const payload = buildPayload(form, extraFields, {
        showSlug,
        showDescription,
        isEdit: !!editing,
      });
      if (editing) {
        await api.update(editing.id, payload);
        toast.success(`${singular} updated.`);
      } else {
        await api.create(payload);
        toast.success(`${singular} created.`);
      }
      await load();
      cancelEdit();
    } catch (err) {
      toast.error(err.message || 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  }

  /** Splits the Name textarea on commas/newlines and creates one item per value. */
  async function handleBulkCreate() {
    const names = parseBulkNames(form.name);
    if (!names.length) return toast.error(`${singular} name is required.`);

    if (validate) {
      for (const name of names) {
        const validationError = validate({ ...form, name }, items, editing);
        if (validationError) return toast.error(validationError);
      }
    }

    setSaving(true);
    try {
      // Auto-slug each one individually — a shared typed slug can't apply to
      // more than one item at once, so it's ignored for a bulk submission.
      const basePayload = buildPayload({ ...form, slug: '' }, extraFields, {
        showSlug: false,
        showDescription,
        isEdit: false,
      });

      let created = 0;
      const failures = [];
      for (const name of names) {
        try {
          await api.create({ ...basePayload, name });
          created++;
        } catch (err) {
          failures.push(`${name}: ${err.message}`);
        }
      }

      await load();
      cancelEdit();
      if (created) {
        toast.success(`${created} ${created === 1 ? singular : plural} created.`);
      }
      if (failures.length) {
        toast.error(failures.join(' · '));
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    const previous = items;
    const removed = items.find((i) => i.id === id);
    setItems((list) => list.filter((i) => i.id !== id));
    if (editing?.id === id) cancelEdit();
    try {
      await api.remove(id);
      toast.success(removed ? `"${removed.name}" deleted.` : `${singular} deleted.`);
    } catch (err) {
      setItems(previous);
      toast.error(err.message);
    }
  }

  async function handleToggleActive(item) {
    const next = !item[statusField];
    const isParent = hierarchical && !item.parentId;

    // Can't switch a child on while its parent is hidden — the server would
    // reject this too, but checking here avoids a pointless round trip.
    if (next && item.parentId) {
      const parent = items.find((i) => i.id === item.parentId);
      if (parent && !parent[statusField]) {
        toast.warning('Activate the parent category before activating this sub-category.');
        return;
      }
    }

    // Optimistic flip — cascades to children in the UI immediately when
    // switching a parent off, matching what the server is about to do.
    setItems((list) =>
      list.map((i) => {
        if (i.id === item.id) return { ...i, [statusField]: next };
        if (isParent && !next && i.parentId === item.id) return { ...i, [statusField]: false };
        return i;
      }),
    );

    try {
      await api.update(item.id, { [statusField]: next });
      toast.success(`"${item.name}" ${next ? 'activated' : 'deactivated'}.`);
      await load(); // reconcile with the server's cascade
    } catch (err) {
      toast.error(err.message);
      await load(); // revert to server truth on failure
    }
  }

  const [dragItemId, setDragItemId] = useState(null);
  const [dragOverItemId, setDragOverItemId] = useState(null);

  function handleDragStart(id) {
    setDragItemId(id);
  }

  function handleDragEnd() {
    setDragItemId(null);
    setDragOverItemId(null);
  }

  /** Reorders `dragged` next to `target` — only within the same group (siblings share a parentId). */
  async function handleDrop(target) {
    const draggedId = dragItemId;
    setDragItemId(null);
    setDragOverItemId(null);
    if (draggedId == null || draggedId === target.id) return;

    const dragged = items.find((i) => i.id === draggedId);
    if (!dragged) return;
    if ((dragged.parentId || null) !== (target.parentId || null)) return;

    const group = items
      .filter((i) => (i.parentId || null) === (dragged.parentId || null))
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.id - b.id);

    const fromIndex = group.findIndex((i) => i.id === dragged.id);
    const toIndex = group.findIndex((i) => i.id === target.id);
    if (fromIndex === -1 || toIndex === -1) return;

    const reordered = [...group];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    const nextSortOrder = new Map(reordered.map((i, idx) => [i.id, idx]));

    const previous = items;
    setItems((list) =>
      list.map((i) => (nextSortOrder.has(i.id) ? { ...i, sortOrder: nextSortOrder.get(i.id) } : i)),
    );

    try {
      await Promise.all(
        reordered
          .filter((i) => i.sortOrder !== nextSortOrder.get(i.id))
          .map((i) => api.update(i.id, { sortOrder: nextSortOrder.get(i.id) })),
      );
      await load();
    } catch (err) {
      setItems(previous);
      toast.error(err.message);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Add / Edit form */}
      <div className="lg:col-span-1">
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-black/5 bg-white p-6 shadow-card"
        >
          <h2 className="font-serif text-lg text-primary">
            {editing ? `Edit ${singular}` : `Add New ${singular}`}
          </h2>
          <p className="mt-1 text-sm text-primary/50">{description}</p>

          <div className="mt-5 space-y-5">
            <div>
              <label className={labelClass}>Name</label>
              {isBulkAdd ? (
                <>
                  <textarea
                    rows={3}
                    value={form.name}
                    onChange={(e) => setField('name', e.target.value)}
                    placeholder={`e.g. 4, 5, 6 — or one ${singular.toLowerCase()} per line`}
                    className={inputClass}
                    required
                  />
                  <p className="mt-1.5 text-xs text-primary/40">
                    Add several at once — separate with commas or put each on its own line.
                  </p>
                </>
              ) : (
                <input
                  value={form.name}
                  onChange={(e) => setField('name', e.target.value)}
                  placeholder={`${singular} name`}
                  className={inputClass}
                  required
                />
              )}
            </div>

            {showSlug && !isBulkAdd && (
              <div>
                <label className={labelClass}>
                  Slug <span className="normal-case text-primary/35">(optional)</span>
                </label>
                <input
                  value={form.slug}
                  onChange={(e) => setField('slug', e.target.value)}
                  placeholder="auto-generated from name"
                  className={inputClass}
                />
              </div>
            )}

            {extraFields.map((field) => (
              <ExtraField
                key={field.key}
                field={field}
                value={form[field.key]}
                onChange={(v) => setField(field.key, v)}
                items={items}
                editing={editing}
              />
            ))}

            {showDescription && (
              <div>
                <label className={labelClass}>
                  Description <span className="normal-case text-primary/35">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setField('description', e.target.value)}
                  placeholder="A short description of this term."
                  className={inputClass}
                />
              </div>
            )}

            <div className="flex items-center gap-3 pt-1">
              <Button type="submit" loading={saving} disabled={saving}>
                {editing ? 'Update' : isBulkAdd ? `Add ${plural}` : `Add ${singular}`}
              </Button>
              {editing && (
                <Button type="button" variant="ghost" onClick={cancelEdit} disabled={saving}>
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Terms table */}
      <div className="lg:col-span-2">
        <div className="overflow-hidden rounded-3xl border border-black/5 bg-white shadow-card">
          <div className="flex items-center justify-between border-b border-black/5 px-6 py-4">
            <h2 className="font-serif text-lg text-primary">All {plural}</h2>
            <span className="text-sm text-primary/50">
              {loading ? 'Loading…' : `${items.length} ${items.length === 1 ? singular : plural}`}
            </span>
          </div>

          {loading ? (
            <div className="space-y-3 p-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton h-12 rounded-xl" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <p className="px-6 py-16 text-center text-sm text-primary/45">
              No {plural.toLowerCase()} yet. Add your first one on the left.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className={headerClassName}>
                    {reorderable && <th className="w-10 px-3 py-3.5" aria-hidden="true" />}
                    <th className="px-6 py-3.5">Name</th>
                    {showSlug && <th className="px-4 py-3.5">Slug</th>}
                    {columns.map((c) => (
                      <th key={c.key} className="px-4 py-3.5">
                        {c.label}
                      </th>
                    ))}
                    {statusField && <th className="px-4 py-3.5">Status</th>}
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {hierarchical
                    ? parents.map((parent) => {
                        const children = childrenByParent.get(parent.id) || [];
                        const isExpanded = expanded?.has(parent.id) ?? true;
                        return (
                          <Fragment key={parent.id}>
                            <Row
                              item={parent}
                              items={items}
                              showSlug={showSlug}
                              columns={columns}
                              onEdit={() => startEdit(parent)}
                              onDelete={() => handleDelete(parent.id)}
                              hasChildren={children.length > 0}
                              expanded={isExpanded}
                              onToggleExpand={() => toggleExpanded(parent.id)}
                              statusField={statusField}
                              onToggleActive={statusField ? () => handleToggleActive(parent) : undefined}
                              reorderable={reorderable}
                              isDragging={dragItemId === parent.id}
                              isDragOver={reorderable && dragOverItemId === parent.id}
                              onDragStart={() => handleDragStart(parent.id)}
                              onDragEndItem={handleDragEnd}
                              onDragOverItem={() => setDragOverItemId(parent.id)}
                              onDropItem={() => handleDrop(parent)}
                            />
                            {isExpanded &&
                              children.map((child, i) => (
                                <Row
                                  key={child.id}
                                  item={child}
                                  items={items}
                                  showSlug={showSlug}
                                  columns={columns}
                                  onEdit={() => startEdit(child)}
                                  onDelete={() => handleDelete(child.id)}
                                  depth={1}
                                  isLastChild={i === children.length - 1}
                                  statusField={statusField}
                                  onToggleActive={statusField ? () => handleToggleActive(child) : undefined}
                                  reorderable={reorderable}
                                  isDragging={dragItemId === child.id}
                                  isDragOver={reorderable && dragOverItemId === child.id}
                                  onDragStart={() => handleDragStart(child.id)}
                                  onDragEndItem={handleDragEnd}
                                  onDragOverItem={() => setDragOverItemId(child.id)}
                                  onDropItem={() => handleDrop(child)}
                                />
                              ))}
                          </Fragment>
                        );
                      })
                    : items.map((item) => (
                        <Row
                          key={item.id}
                          item={item}
                          items={items}
                          showSlug={showSlug}
                          columns={columns}
                          onEdit={() => startEdit(item)}
                          onDelete={() => handleDelete(item.id)}
                          statusField={statusField}
                          onToggleActive={statusField ? () => handleToggleActive(item) : undefined}
                          reorderable={reorderable}
                          isDragging={dragItemId === item.id}
                          isDragOver={reorderable && dragOverItemId === item.id}
                          onDragStart={() => handleDragStart(item.id)}
                          onDragEndItem={handleDragEnd}
                          onDragOverItem={() => setDragOverItemId(item.id)}
                          onDropItem={() => handleDrop(item)}
                        />
                      ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({
  item,
  items,
  showSlug,
  columns,
  onEdit,
  onDelete,
  depth = 0,
  hasChildren = false,
  expanded = false,
  onToggleExpand,
  isLastChild = false,
  statusField,
  onToggleActive,
  reorderable = false,
  isDragging = false,
  isDragOver = false,
  onDragStart,
  onDragEndItem,
  onDragOverItem,
  onDropItem,
}) {
  // A sub-category can't be switched on while its own parent is hidden.
  const parent = statusField && item.parentId ? items.find((i) => i.id === item.parentId) : null;
  const toggleDisabled = !!parent && !parent[statusField] && !item[statusField];

  return (
    <tr
      className={cn(
        'border-b border-black/5 last:border-0 hover:bg-sand-50/60',
        isDragging && 'opacity-40',
        isDragOver && 'bg-accent/10'
      )}
      onDragOver={
        reorderable
          ? (e) => {
              e.preventDefault();
              onDragOverItem?.();
            }
          : undefined
      }
      onDrop={
        reorderable
          ? (e) => {
              e.preventDefault();
              onDropItem?.();
            }
          : undefined
      }
    >
      {reorderable && (
        <td className="px-3 py-4">
          <span
            draggable
            onDragStart={(e) => {
              e.dataTransfer.effectAllowed = 'move';
              e.dataTransfer.setData('text/plain', String(item.id));
              onDragStart?.();
            }}
            onDragEnd={onDragEndItem}
            aria-label={`Drag to reorder ${item.name}`}
            className="flex h-8 w-8 cursor-grab items-center justify-center rounded-lg text-primary/30 transition-colors hover:bg-sand-100 hover:text-primary active:cursor-grabbing"
          >
            <GripIcon className="h-4 w-4" />
          </span>
        </td>
      )}
      <td className="relative px-6 py-4 font-medium text-primary">
        {depth > 0 && <TreeGuideLine isLast={isLastChild} />}
        <div className="flex items-center gap-2">
          {hasChildren ? (
            <button
              type="button"
              onClick={onToggleExpand}
              aria-label={expanded ? `Collapse ${item.name}` : `Expand ${item.name}`}
              aria-expanded={expanded}
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-primary/40 transition-colors hover:bg-sand-100 hover:text-primary"
            >
              <ChevronDownIcon
                className={cn('h-3.5 w-3.5 transition-transform', !expanded && '-rotate-90')}
              />
            </button>
          ) : depth > 0 ? (
            // The branch: sits in the same w-5 slot the parent's chevron
            // occupies, so the tick lines up with the vertical guide below.
            <span className="relative h-5 w-5 shrink-0">
              <span className="absolute left-1/2 top-1/2 h-px w-2.5 -translate-y-1/2 bg-primary/20" />
            </span>
          ) : (
            <span className="h-5 w-5 shrink-0" />
          )}
          <span>{item.name}</span>
        </div>
      </td>
      {showSlug && <td className="px-4 py-4 text-primary/50">{item.slug}</td>}
      {columns.map((c) => (
        <td key={c.key} className="px-4 py-4 text-primary/70">
          {c.render ? c.render(item, items) : (item[c.key] ?? '—')}
        </td>
      ))}
      {statusField && (
        <td className="px-4 py-4">
          <button
            type="button"
            onClick={toggleDisabled ? undefined : onToggleActive}
            disabled={toggleDisabled}
            role="switch"
            aria-checked={!!item[statusField]}
            aria-label={
              item[statusField] ? `Deactivate ${item.name}` : `Activate ${item.name}`
            }
            title={toggleDisabled ? 'Activate the parent category first' : undefined}
            className={cn(
              'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors',
              item[statusField] ? 'bg-emerald-500' : 'bg-red-400',
              toggleDisabled && 'cursor-not-allowed opacity-40'
            )}
          >
            <span
              className={cn(
                'inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow transition-transform',
                item[statusField] ? 'translate-x-6' : 'translate-x-1'
              )}
            />
          </button>
        </td>
      )}
      <td className="px-6 py-4 text-right">
        <RowActionsMenu onEdit={onEdit} onDelete={onDelete} itemName={item.name} />
      </td>
    </tr>
  );
}

/** Three-dot "more actions" trigger + a portaled dropdown with Edit/Delete. */
function RowActionsMenu({ onEdit, onDelete, itemName }) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [coords, setCoords] = useState(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  function closeMenu() {
    setOpen(false);
    setConfirming(false);
  }

  function openMenu() {
    const rect = triggerRef.current.getBoundingClientRect();
    setCoords({ top: rect.bottom + 6, left: rect.right - 176 });
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(e) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target)
      ) {
        closeMenu();
      }
    }
    // Closing on scroll/resize is simpler than repositioning a fixed menu.
    document.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('scroll', closeMenu, true);
    window.addEventListener('resize', closeMenu);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('scroll', closeMenu, true);
      window.removeEventListener('resize', closeMenu);
    };
  }, [open]);

  async function handleConfirmDelete() {
    setDeleting(true);
    await onDelete();
    setDeleting(false);
    closeMenu();
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (open ? closeMenu() : openMenu())}
        aria-label={`Actions for ${itemName}`}
        aria-haspopup="menu"
        aria-expanded={open}
        className="rounded-full p-2 text-primary/40 transition-colors hover:bg-sand-100 hover:text-primary"
      >
        <DotsIcon className="h-4.5 w-4.5" />
      </button>

      {open &&
        coords &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{ position: 'fixed', top: coords.top, left: coords.left }}
            className="z-50 w-44 overflow-hidden rounded-2xl border border-black/5 bg-white py-1.5 shadow-luxe"
          >
            {confirming ? (
              <div className="px-3 py-2">
                <p className="px-1 text-xs text-primary/60">Delete “{itemName}”?</p>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirming(false)}
                    className="flex-1 rounded-lg border border-primary/15 py-1.5 text-xs font-medium text-primary transition-colors hover:border-primary"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDelete}
                    disabled={deleting}
                    className="flex-1 rounded-lg bg-red-600 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-60"
                  >
                    {deleting ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    closeMenu();
                    onEdit();
                  }}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-primary transition-colors hover:bg-sand-50"
                >
                  <EditIcon className="h-4 w-4 text-primary/50" />
                  Edit
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => setConfirming(true)}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50"
                >
                  <TrashIcon className="h-4 w-4" />
                  Delete
                </button>
              </>
            )}
          </div>,
          document.body,
        )}
    </>
  );
}

/**
 * The vertical stroke of a child row's tree line, drawn full-height so
 * consecutive rows join into one continuous line down to the last child,
 * which gets a half-height stroke instead — the "└" elbow closing the branch.
 * Positioned absolutely within the (relative) name cell so it reaches the
 * cell's full padded height and lines up under the parent's chevron above
 * (34px = the cell's px-6 padding + half of the chevron's own w-5 width).
 */
function TreeGuideLine({ isLast }) {
  return (
    <span
      className={cn(
        'pointer-events-none absolute left-[34px] w-px -translate-x-1/2 bg-primary/20',
        isLast ? 'top-0 h-1/2' : 'inset-y-0'
      )}
    />
  );
}

function ExtraField({ field, value, onChange, items, editing }) {
  if (field.type === 'toggle') {
    return (
      <Toggle
        id={field.key}
        checked={!!value}
        onChange={onChange}
        label={field.label}
        description={field.help}
      />
    );
  }

  if (field.type === 'select') {
    const options =
      typeof field.options === 'function' ? field.options(items, editing) : field.options || [];
    return (
      <div>
        <label className={labelClass}>{field.label}</label>
        <select value={value} onChange={(e) => onChange(e.target.value)} className={inputClass}>
          {options.map((o) => (
            <option key={String(o.value)} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {field.help && <p className="mt-1.5 text-xs text-primary/40">{field.help}</p>}
      </div>
    );
  }

  return (
    <div>
      <label className={labelClass}>{field.label}</label>
      <input
        type={field.type === 'number' ? 'number' : 'text'}
        min={field.type === 'number' ? 0 : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        className={inputClass}
      />
      {field.help && <p className="mt-1.5 text-xs text-primary/40">{field.help}</p>}
    </div>
  );
}

/* ---------- helpers ---------- */

/** "4, 5, 6" or one-per-line → ['4', '5', '6'], trimmed, deduped case-insensitively. */
function parseBulkNames(raw) {
  const seen = new Set();
  const names = [];
  for (const part of raw.split(/[,\n]+/)) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    names.push(trimmed);
  }
  return names;
}

function blankForm(extraFields) {
  const base = { name: '', slug: '', description: '' };
  for (const f of extraFields) {
    base[f.key] = f.type === 'toggle' ? f.default ?? false : f.default != null ? String(f.default) : '';
  }
  return base;
}

function toForm(item, extraFields) {
  const base = {
    name: item.name || '',
    slug: item.slug || '',
    description: item.description || '',
  };
  for (const f of extraFields) {
    const raw = item[f.key];
    if (f.type === 'toggle') base[f.key] = !!raw;
    else base[f.key] = raw == null ? '' : String(raw);
  }
  return base;
}

function buildPayload(form, extraFields, { showSlug, showDescription, isEdit }) {
  const p = { name: form.name.trim() };
  if (showSlug && form.slug?.trim()) p.slug = form.slug.trim();
  if (showDescription && form.description?.trim()) p.description = form.description.trim();

  for (const field of extraFields) {
    const v = form[field.key];
    if (field.type === 'toggle') {
      p[field.key] = !!v;
    } else if (field.type === 'number') {
      if (v !== '' && v != null) p[field.key] = Number(v);
    } else if (field.type === 'select') {
      if (v !== '' && v != null) p[field.key] = field.numeric ? Number(v) : v;
      else if (isEdit && field.clearable) p[field.key] = null;
    } else if (typeof v === 'string' && v.trim()) {
      p[field.key] = v.trim();
    }
  }
  return p;
}

// Export shared input styles so pages can stay visually consistent if needed.
export { inputClass, labelClass };

// Re-export Badge so callers can render status pills in custom columns.
export { Badge };
