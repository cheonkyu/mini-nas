# Design System Specification: The Precision Canvas

This document serves as the foundational guide for junior designers to implement a high-end, editorial-inspired digital experience. While the functional DNA is rooted in technical cloud infrastructures, the visual execution must transcend "utility" to achieve a "signature" feel through intentional tonal layering, sophisticated typography, and the rejection of standard structural crutches.

## 1. Overview & Creative North Star

### Creative North Star: "The Logical Architect"
This design system is built on the philosophy of **The Logical Architect**. It treats the UI not as a collection of widgets, but as a structured environment where information density meets breathing room. We move beyond the "template" look by using intentional asymmetry—placing high-density data tables against expansive, airy headers—and using tonal depth rather than lines to define space.

**The signature look:** A pristine, high-contrast environment that feels like a premium technical journal. It is functional enough for a developer, but elegant enough for an executive.

---

## 2. Colors & Surface Logic

The palette is anchored in a clinical white background, activated by a spectrum of functional blues and sophisticated neutrals.

### The "No-Line" Rule
Standard UI relies on 1px solid borders to separate content. **This design system prohibits 1px solid borders for sectioning.** Boundaries must be defined solely through background color shifts. Use `surface-container-low` (#f2f4f5) to set off a sidebar from a `surface` (#f8fafb) workspace. Visual separation is achieved through "Tonal Anchoring" rather than "Physical Containment."

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. We use a "Nested Depth" model:
*   **Base:** `surface` (#f8fafb)
*   **Sectioning:** `surface-container-low` (#f2f4f5) for large layout blocks.
*   **Interaction Hubs:** `surface-container-highest` (#e1e3e4) for inactive states or subtle wells.
*   **The Elevated Sheet:** `surface-container-lowest` (#ffffff) for the highest-priority cards or modals sitting atop darker containers.

### The "Glass & Gradient" Rule
To inject "soul" into the system:
*   **Gradients:** For primary CTAs or high-impact hero sections, use a subtle linear gradient from `primary` (#005bbf) to `primary-container` (#1a73e8). This adds a three-dimensional "lens" effect that flat color cannot replicate.
*   **Glassmorphism:** Navigation bars and floating utility panels should use a semi-transparent `surface` color with a `20px` backdrop-blur. This ensures the UI feels integrated into the environment rather than pasted on top.

---

## 3. Typography: The Editorial Voice

We utilize a dual-typeface strategy to balance authority with utility.

*   **The Display Voice (Plus Jakarta Sans):** Used for `display-` and `headline-` scales. This typeface provides a modern, geometric precision that feels high-end and intentional. Use it for page titles and major data points to command attention.
*   **The Functional Voice (Inter):** Used for `title-`, `body-`, and `label-` scales. Inter provides maximum legibility for dense cloud configurations and technical metadata.

**Hierarchy Note:** Always pair a `display-md` (Plus Jakarta Sans) headline with a `label-md` (Inter) eyebrow in all-caps with 0.05em letter spacing. This "High-Low" pairing is the hallmark of editorial design.

---

## 4. Elevation & Depth

We avoid the "card-heavy" look of generic material design in favor of **Tonal Layering.**

*   **The Layering Principle:** Instead of shadows, stack containers. Place a `surface-container-lowest` card on a `surface-container-low` background. The 2% shift in brightness is enough to signal hierarchy to the human eye without adding visual noise.
*   **Ambient Shadows:** If a floating element (like a dropdown) is required, use a "Cloud Shadow": 
    *   `box-shadow: 0px 12px 32px rgba(25, 28, 29, 0.04);`
    *   The shadow must be tinted with the `on-surface` color, never pure black.
*   **The Ghost Border Fallback:** If a border is required for accessibility (e.g., input fields), use the `outline-variant` (#c1c6d6) at 20% opacity. **Forbid 100% opaque borders.**

---

## 5. Components

### Buttons
*   **Primary:** Gradient fill (`primary` to `primary-container`), `DEFAULT` (0.25rem) radius. High-contrast `on-primary` text.
*   **Secondary:** `surface-container-highest` fill with `primary` text. No border.
*   **Tertiary:** Ghost style. No background, `primary` text, shifts to `surface-container-low` on hover.

### Input Fields
*   Style: "The Inset Well." 
*   Use `surface-container-highest` as the background fill. Use a 1px `outline-variant` at 10% opacity. 
*   On focus, transition the background to `surface-container-lowest` and the border to `primary`.

### Cards & Lists
*   **Strict Rule:** No dividers (`<hr>`). 
*   Separate list items using `12px` of vertical white space. 
*   For cards, use a subtle `surface-container-low` background shift on hover to indicate interactivity.

### The Navigation Rail (Sidebar)
*   Consistent with GCP, but elevated. 
*   Width: `256px`. 
*   Background: `surface-container-low`. 
*   Active state: A `4px` vertical "intent bar" using the `primary` color on the left edge, with the menu item text shifting to `primary`.

---

## 6. Do’s and Don’ts

### Do:
*   **Embrace Asymmetry:** Align high-density data tables to the left and leave large "White Space Silences" on the right of headers.
*   **Use Tonal Shifts:** Use the difference between `surface-container-low` and `surface-container-high` to guide the eye.
*   **Standardize Radii:** Use `DEFAULT` (0.25rem) for most components to maintain a "professional/sharp" feel. Use `full` (9999px) only for status tags.

### Don’t:
*   **Don't use dividers:** If you feel the need for a line, try adding `24px` of padding instead.
*   **Don't use pure black text:** Always use `on-surface` (#191c1d) to maintain a soft, premium contrast.
*   **Don't overcrowd:** If a view feels busy, increase the container-tier contrast rather than adding borders or shadows.