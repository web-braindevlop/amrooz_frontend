/**
 * Lightweight, dependency-free SVG icon set (24x24, currentColor).
 * Thin strokes give a refined, editorial feel.
 */
const base = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

const make = (paths, baseOverride = {}) =>
  function Icon({ className = 'w-5 h-5', strokeWidth, ...rest }) {
    const mergedBase = { ...base, ...baseOverride };
    return (
      <svg
        {...mergedBase}
        strokeWidth={strokeWidth ?? mergedBase.strokeWidth}
        className={className}
        aria-hidden="true"
        {...rest}
      >
        {paths}
      </svg>
    );
  };

export const CartIcon = make(
  <>
    <path d="M3 4h2l1.6 11.2a2 2 0 0 0 2 1.8h7.9a2 2 0 0 0 2-1.6L20 8H6" />
    <circle cx="9.5" cy="20" r="1.2" />
    <circle cx="17" cy="20" r="1.2" />
  </>
);

export const HeartIcon = make(
  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" />,
  { strokeWidth: 2.0 }
);

export const SearchIcon = make(
  <>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.2-3.2" />
  </>
);

export const UserIcon = make(
  <>
    <circle cx="12" cy="8" r="3.4" />
    <path d="M5 20a7 7 0 0 1 14 0" />
  </>
);

export const MenuIcon = make(
  <>
    <path d="M4 7h16" />
    <path d="M4 12h16" />
    <path d="M4 17h16" />
  </>
);

export const CloseIcon = make(
  <>
    <path d="M6 6l12 12" />
    <path d="M18 6 6 18" />
  </>
);

export const StarIcon = make(
  <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17l-5.2 2.6 1-5.8-4.3-4.1 5.9-.9L12 3.5Z" />
);

export const ArrowRightIcon = make(
  <>
    <path d="M4 12h15" />
    <path d="m13 6 6 6-6 6" />
  </>
);

export const TruckIcon = make(
  <>
    <path d="M3 6h11v9H3z" />
    <path d="M14 9h4l3 3v3h-7z" />
    <circle cx="7" cy="18" r="1.6" />
    <circle cx="17" cy="18" r="1.6" />
  </>
);

export const ShieldIcon = make(
  <>
    <path d="M12 3l7 3v5c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6l7-3Z" />
    <path d="m9 12 2 2 4-4" />
  </>
);

export const RefreshIcon = make(
  <>
    <path d="M4 11a8 8 0 0 1 14-4.5L20 8" />
    <path d="M20 4v4h-4" />
    <path d="M20 13a8 8 0 0 1-14 4.5L4 16" />
    <path d="M4 20v-4h4" />
  </>
);

export const HeadsetIcon = make(
  <>
    <path d="M5 13v-1a7 7 0 0 1 14 0v1" />
    <path d="M4 14a2 2 0 0 1 2-2h1v5H6a2 2 0 0 1-2-2v-1Z" />
    <path d="M20 14a2 2 0 0 0-2-2h-1v5h1a2 2 0 0 0 2-2v-1Z" />
    <path d="M19 17v1a3 3 0 0 1-3 3h-3" />
  </>
);

export const PlusIcon = make(
  <>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </>
);

export const MinusIcon = make(<path d="M5 12h14" />);

export const CheckIcon = make(<path d="m5 12 4.5 4.5L19 7" />);

export const ChevronDownIcon = make(<path d="m6 9 6 6 6-6" />);

export const DotsIcon = make(
  <>
    <circle cx="12" cy="5" r="1.3" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" />
    <circle cx="12" cy="19" r="1.3" fill="currentColor" stroke="none" />
  </>
);

export const EditIcon = make(
  <>
    <path d="M4 20h4.2L18.8 9.4a2 2 0 0 0 0-2.8l-1.4-1.4a2 2 0 0 0-2.8 0L4 15.8V20Z" />
    <path d="m13.5 6.5 4 4" />
  </>
);

export const TrashIcon = make(
  <>
    <path d="M4.5 7h15" />
    <path d="M9.5 7V5.5a1.5 1.5 0 0 1 1.5-1.5h2a1.5 1.5 0 0 1 1.5 1.5V7" />
    <path d="M6.5 7 7.3 19a2 2 0 0 0 2 1.9h5.4a2 2 0 0 0 2-1.9L17.5 7" />
    <path d="M10 11v6M14 11v6" />
  </>
);

export const EyeIcon = make(
  <>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="2.6" />
  </>
);

export const SparkleIcon = make(
  <path d="M12 3l1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6L12 3Z" />
);

export const InstagramIcon = make(
  <>
    <rect x="4" y="4" width="16" height="16" rx="4.5" />
    <circle cx="12" cy="12" r="3.4" />
    <circle cx="16.6" cy="7.4" r="0.6" fill="currentColor" />
  </>
);

export const FacebookIcon = make(
  <path d="M14.5 8.5H16V6h-2c-1.9 0-3 1.2-3 3v1.5H9V13h2v6h2.5v-6H15l.5-2.5h-2V9c0-.4.2-.5.6-.5Z" />
);

export const TwitterIcon = make(
  <path d="M4 4l7 8.5M20 20l-7-8.5M4 4h3l13 16h-3L4 4Z" />
);

export const LockIcon = make(
  <>
    <rect x="4.5" y="10.5" width="15" height="9.5" rx="2.2" />
    <path d="M7.5 10.5V7.8a4.5 4.5 0 0 1 9 0v2.7" />
  </>
);

export const MailIcon = make(
  <>
    <rect x="3" y="5.5" width="18" height="13" rx="2.2" />
    <path d="m4 7 8 6 8-6" />
  </>
);

export const EyeOffIcon = make(
  <>
    <path d="M3 3l18 18" />
    <path d="M10.6 5.6A10.8 10.8 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a13.5 13.5 0 0 1-3 3.6M6.2 6.9C3.7 8.6 2.5 12 2.5 12s3.5 6.5 9.5 6.5c1.3 0 2.5-.3 3.5-.8" />
    <path d="M9.7 9.8a2.6 2.6 0 0 0 3.6 3.6" />
  </>
);

export const LogoutIcon = make(
  <>
    <path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3" />
    <path d="M15 8l4 4-4 4" />
    <path d="M19 12H9" />
  </>
);

export const GridIcon = make(
  <>
    <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1.5" />
    <rect x="13" y="3.5" width="7.5" height="7.5" rx="1.5" />
    <rect x="3.5" y="13" width="7.5" height="7.5" rx="1.5" />
    <rect x="13" y="13" width="7.5" height="7.5" rx="1.5" />
  </>
);

export const BoxIcon = make(
  <>
    <path d="M3.5 7.5 12 3l8.5 4.5V16L12 20.5 3.5 16Z" />
    <path d="M3.5 7.5 12 12l8.5-4.5" />
    <path d="M12 12v8.5" />
  </>
);

export const TagIcon = make(
  <>
    <path d="M11.5 3.5H5a1.5 1.5 0 0 0-1.5 1.5v6.5a2 2 0 0 0 .6 1.4l9 9a2 2 0 0 0 2.8 0l6-6a2 2 0 0 0 0-2.8l-9-9a2 2 0 0 0-1.4-.6Z" />
    <circle cx="8.2" cy="8.2" r="1.2" fill="currentColor" stroke="none" />
  </>
);

export const ReceiptIcon = make(
  <>
    <path d="M6 3.5h12v17l-2.5-1.5L13 20.5l-2.5-1.5L8 20.5 6 19V3.5Z" />
    <path d="M9 8h6M9 12h6" />
  </>
);

export const CashIcon = make(
  <>
    <rect x="2.5" y="6.5" width="19" height="11" rx="2" />
    <circle cx="12" cy="12" r="2.6" />
    <path d="M6 9v0M18 15v0" />
  </>
);

export const AlertIcon = make(
  <>
    <path d="M12 3.5 21.5 20h-19L12 3.5Z" />
    <path d="M12 9.5v4.5" />
    <circle cx="12" cy="17" r="0.2" fill="currentColor" />
  </>
);

export const GripIcon = make(
  <>
    <circle cx="9" cy="6" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="15" cy="6" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="9" cy="12" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="15" cy="12" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="9" cy="18" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="15" cy="18" r="1.1" fill="currentColor" stroke="none" />
  </>
);

export const PinterestIcon = make(
  <>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M9.5 20c-.4-1.4-.2-2.6.1-4l1-4.2c-.2-.4-.3-1-.3-1.5 0-1.4.8-2.4 1.9-2.4.9 0 1.3.7 1.3 1.5 0 .9-.6 2.2-.9 3.5-.2 1 .5 1.9 1.5 1.9 1.9 0 3.1-2.4 3.1-5.2 0-2.2-1.5-3.8-4.1-3.8-3 0-4.8 2.2-4.8 4.6 0 .8.2 1.4.6 1.9.2.2.2.3.1.5l-.2.9" />
  </>
);

/* ---------------------------------------------------------------------- *
 *  Editor toolbar icons (classic-WordPress style, drawn on the same grid) *
 * ---------------------------------------------------------------------- */

export const BoldIcon = make(
  <path d="M7 5h5.5a3.5 3.5 0 0 1 0 7H7Zm0 7h6.2a3.5 3.5 0 0 1 0 7H7Z" />,
  { strokeWidth: 2 }
);

export const ItalicIcon = make(
  <>
    <path d="M15 5H9.5" />
    <path d="M14.5 19H9" />
    <path d="M13.5 5 10.5 19" />
  </>
);

export const StrikethroughIcon = make(
  <>
    <path d="M5 12h14" />
    <path d="M16.5 8.2A3.6 3.6 0 0 0 13 6c-2 0-3.6 1.1-3.6 2.7 0 1.3 1 2.1 2.6 2.6" />
    <path d="M8 15.4c.4 1.6 2 2.6 4.2 2.6 2.3 0 3.9-1.1 3.9-2.8 0-.7-.2-1.3-.7-1.8" />
  </>
);

export const BulletListIcon = make(
  <>
    <path d="M9 6h11M9 12h11M9 18h11" />
    <circle cx="5" cy="6" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="5" cy="12" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="5" cy="18" r="1.2" fill="currentColor" stroke="none" />
  </>
);

export const NumberListIcon = make(
  <>
    <path d="M10 6h10M10 12h10M10 18h10" />
    <path d="M4 5.2 5.3 4.5V8" />
    <path d="M3.7 10.9c.2-.5.7-.8 1.3-.8.7 0 1.2.4 1.2 1 0 1.1-2.4 1.4-2.4 2.9h2.6" />
    <path d="M3.8 16.2c.2-.4.7-.7 1.3-.7.7 0 1.2.4 1.2.9 0 .6-.5.9-1.1.9.7 0 1.2.4 1.2 1s-.6 1-1.3 1c-.6 0-1.1-.2-1.4-.7" />
  </>
);

export const QuoteIcon = make(
  <>
    <path d="M10 8.5c-2 .4-3.2 1.9-3.2 3.8H9a1.6 1.6 0 0 1 1.6 1.6v1.5A1.6 1.6 0 0 1 9 17H7.4a1.6 1.6 0 0 1-1.6-1.6v-2.4C5.8 9.6 7.4 7.4 10 7Z" />
    <path d="M19 8.5c-2 .4-3.2 1.9-3.2 3.8H18a1.6 1.6 0 0 1 1.6 1.6v1.5A1.6 1.6 0 0 1 18 17h-1.6a1.6 1.6 0 0 1-1.6-1.6v-2.4C14.8 9.6 16.4 7.4 19 7Z" />
  </>
);

export const AlignLeftIcon = make(<path d="M4 6h16M4 10.7h10M4 15.3h16M4 20h10" />);
export const AlignCenterIcon = make(<path d="M4 6h16M7 10.7h10M4 15.3h16M7 20h10" />);
export const AlignRightIcon = make(<path d="M4 6h16M10 10.7h10M4 15.3h16M10 20h10" />);

export const LinkIcon = make(
  <>
    <path d="M10.2 13.8a3.6 3.6 0 0 0 5.1 0l2.6-2.6a3.6 3.6 0 0 0-5.1-5.1l-1.3 1.3" />
    <path d="M13.8 10.2a3.6 3.6 0 0 0-5.1 0l-2.6 2.6a3.6 3.6 0 0 0 5.1 5.1l1.3-1.3" />
  </>
);

export const UnlinkIcon = make(
  <>
    <path d="M14.5 9.5 17 7a3.6 3.6 0 0 1 5.1 5.1l-2 2" />
    <path d="M9.5 14.5 7 17a3.6 3.6 0 0 1-5.1-5.1l2-2" />
    <path d="m3 3 18 18" />
  </>
);

export const ReadMoreIcon = make(
  <>
    <path d="M3 8h18" strokeDasharray="3 2.5" />
    <path d="M3 16h18" strokeDasharray="3 2.5" />
    <path d="M8 12h8" />
  </>
);

export const KitchenSinkIcon = make(
  <>
    <rect x="3.2" y="4.4" width="17.6" height="6" rx="1.6" />
    <path d="M3.2 14.5h17.6" strokeDasharray="3 2.5" />
    <path d="M3.2 19h9" strokeDasharray="3 2.5" />
  </>
);

export const HorizontalRuleIcon = make(
  <>
    <path d="M3 12h18" strokeWidth="2.2" />
    <path d="M5 6.5h14M5 17.5h14" strokeOpacity="0.35" />
  </>
);

export const TextColorIcon = make(
  <>
    <path d="M6 15 11 4l5 11" />
    <path d="M7.6 11.6h6.8" />
    <rect x="4" y="18.2" width="16" height="3.2" rx="1" fill="currentColor" stroke="none" />
  </>
);

export const FontDecreaseIcon = make(
  <>
    <path d="M3 16 8 6l5 10" />
    <path d="M5.2 12.6h5.6" />
    <path d="M15.5 11.5h6" />
  </>
);

export const FontIncreaseIcon = make(
  <>
    <path d="M3 16 8 6l5 10" />
    <path d="M5.2 12.6h5.6" />
    <path d="M18.5 8.5v6" />
    <path d="M15.5 11.5h6" />
  </>
);

export const PasteTextIcon = make(
  <>
    <rect x="5" y="4.5" width="14" height="16" rx="2" />
    <path d="M9 4.5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 4.5v.8H9Z" />
    <path d="M8.6 11h6.8M8.6 14.4h6.8M8.6 17.6h4" />
  </>
);

export const ClearFormattingIcon = make(
  <>
    <path d="M7 6h11" />
    <path d="M11.6 6 9 18" />
    <path d="M6.5 18h5" />
    <path d="m15 14 5 5m0-5-5 5" strokeWidth="1.9" />
  </>
);

export const SpecialCharIcon = make(
  <path d="M8 19.5h-3v-.8c2.1-1.4 3-2.5 3-4a4.2 4.2 0 1 1 8 0c0 1.5.9 2.6 3 4v.8h-3" />
);

export const IndentIcon = make(
  <>
    <path d="M11 6h10M11 12h10M11 18h10M3 6h4M3 18h4" />
    <path d="m3 9.6 3 2.4-3 2.4Z" fill="currentColor" />
  </>
);

export const OutdentIcon = make(
  <>
    <path d="M11 6h10M11 12h10M11 18h10M3 6h4M3 18h4" />
    <path d="m7 9.6-3 2.4 3 2.4Z" fill="currentColor" />
  </>
);

export const UndoIcon = make(
  <>
    <path d="M4 9h7.5a5 5 0 0 1 0 10H8" />
    <path d="M7.2 5.5 3.6 9l3.6 3.5" />
  </>
);

export const RedoIcon = make(
  <>
    <path d="M20 9h-7.5a5 5 0 0 0 0 10H16" />
    <path d="M16.8 5.5 20.4 9l-3.6 3.5" />
  </>
);

export const VisualTabIcon = make(
  <>
    <circle cx="12" cy="12" r="3" />
    <path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12Z" />
  </>
);

export const CodeTabIcon = make(<path d="m8.5 8-4.5 4 4.5 4M15.5 8l4.5 4-4.5 4M13.6 5.5l-3.2 13" />);
