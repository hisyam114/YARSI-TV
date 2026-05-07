---
name: YARSI TV Portal
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#bdcabb'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#889487'
  outline-variant: '#3e4a3f'
  surface-tint: '#6cdd8a'
  primary: '#6cdd8a'
  on-primary: '#003918'
  primary-container: '#30a559'
  on-primary-container: '#003114'
  inverse-primary: '#006d34'
  secondary: '#ecffe3'
  on-secondary: '#003907'
  secondary-container: '#13ff43'
  on-secondary-container: '#007117'
  tertiary: '#c6c6c7'
  on-tertiary: '#2f3131'
  tertiary-container: '#909191'
  on-tertiary-container: '#282a2a'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#89faa4'
  primary-fixed-dim: '#6cdd8a'
  on-primary-fixed: '#00210b'
  on-primary-fixed-variant: '#005225'
  secondary-fixed: '#72ff70'
  secondary-fixed-dim: '#00e639'
  on-secondary-fixed: '#002203'
  on-secondary-fixed-variant: '#00530e'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c7'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#454747'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  title-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: '1.4'
  body-base:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 16px
  margin: 32px
---

## Brand & Style

The visual identity of this design system is rooted in the high-stakes, precision-driven environment of broadcast media. It evokes a "Control Room" atmosphere—authoritative, high-utility, and focused. By utilizing a pure black foundation, the system minimizes eye strain for operators working in dimly lit studio environments while allowing critical "On-Air" colors to command immediate attention.

The aesthetic follows a **High-Contrast Modern** approach. It shuns unnecessary decoration in favor of structural clarity and information density. The interface feels like a piece of professional rack-mounted equipment: sturdy, functional, and uncompromisingly clear. The target audience—production staff and equipment managers—requires a tool that prioritizes speed of recognition and data integrity over decorative trends.

## Colors

This design system utilizes a restricted, high-contrast palette to mirror the YARSI TV brand identity. 

*   **Foundation:** A true black (`#000000`) background provides the ultimate canvas for "On-Air" vibrancy.
*   **Primary Green:** Derived from the 'TV' badge, this represents stability and the brand core. It is used for primary actions and brand headers.
*   **Vibrant Green:** A high-frequency neon green used sparingly for active states, "Available" statuses, and success indicators. It provides the "glow" associated with live broadcast monitors.
*   **Functional Neutrals:** A hierarchy of dark greys creates depth without breaking the dark-mode immersion. Borders use a crisp `#333333` to define grids and forms against the void of the background.
*   **Typography:** Crisp white (`#FFFFFF`) is used for primary data, with a 70% opacity variant for secondary labels to maintain a clear information hierarchy.

## Typography

This design system uses **Inter** exclusively for its neutral, systematic, and highly legible characteristics. In a broadcast schedule or equipment list, clarity is paramount.

*   **Headlines:** Bold and tight-tracking, designed to look like television graphics.
*   **Monospaced Numbers:** While Inter is sans-serif, tabular figures should be enabled for all calendar grids and time-codes to ensure columns of data align perfectly.
*   **Labels:** All-caps styling for secondary metadata (like "SERIAL NO" or "DURATION") helps distinguish static labels from dynamic user data.
*   **Contrast:** Primary data is always pure white. Secondary data uses a dimmed alpha to ensure the user's eye gravitates toward the most critical information first.

## Layout & Spacing

The layout philosophy is built on an **8px grid system**, ensuring mathematical harmony across all components. 

*   **Grid Model:** A 12-column fluid grid is used for the main dashboard, but switches to a fixed sidebar for navigation to mimic a professional software suite.
*   **Density:** The spacing is intentionally compact ("Comfortable" to "Compact") to allow for maximum visibility of schedule blocks and equipment lists on a single screen.
*   **Calendar Rhythm:** The calendar grid uses 1px borders to maximize cell space. Gutter-less arrangements are preferred for timeline views to show continuous "Live" blocks.

## Elevation & Depth

In a high-contrast dark interface, shadows are often ineffective. This design system relies on **Tonal Layering** and **Stroke Definition** rather than soft shadows.

1.  **Level 0 (Background):** Pure `#000000`. Used for the global canvas.
2.  **Level 1 (Surfaces):** Dark grey `#1A1A1A` surfaces with a 1px `#333333` border. This is the default state for cards and containers.
3.  **Level 2 (Interaction):** When a card or list item is hovered, the border color shifts to the Primary Green, and the surface lightens slightly to `#222222`.
4.  **Floating Elements:** Modals and dropdowns use a "Glassmorphism Lite" effect—80% opacity surfaces with a heavy backdrop blur (20px) to maintain context of the underlying schedule while indicating depth.

## Shapes

The shape language is "Soft-Technical." Elements use a small **4px (0.25rem)** border radius. 

This subtle rounding prevents the interface from feeling "sharp" or aggressive while maintaining the geometric rigor expected of an industrial tool. Status badges (e.g., "ON AIR") may use a fully rounded/pill shape to distinguish them from functional buttons, drawing the eye through a change in geometry. Form inputs and card containers must remain strictly consistent with the base 4px radius.

## Components

*   **Buttons:** Primary buttons are solid Vibrant Green with black text for maximum punch. Secondary buttons are outlined in white or green.
*   **Status Badges:** Use a "Glow" effect. An "Active" badge should have a small 8px circle of Vibrant Green next to the text. "Maintenance" or "Off-Air" states use desaturated greys.
*   **Calendar Grids:** Cells should have thin `#333333` borders. Current time-indicator is a horizontal line in Vibrant Green.
*   **Equipment Cards:** High-density layout. Image on the left, vital stats (ID, Status) on the right. Status is indicated by a colored vertical bar on the left edge of the card.
*   **Management Forms:** Inputs use a solid `#121212` fill with a bottom-only border in the default state, shifting to a full green border on focus. Labels are always positioned above the input in all-caps.
*   **Data Lists:** Zebra-striping is avoided; instead, use 1px dividers to maintain the clean, "technical" look of the broadcast system.
