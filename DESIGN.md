# Visual Design System Specification

## 1. Design Style & Aesthetic Classification

- **Holographic Glassmorphism:** Layered frosted glass panels (`backdrop-filter: blur()`), high translucency, and soft diffusion overlays combined with spectral iridescence.
- **Soft Minimalist / Neo-Clean:** High-key, luminous white space paired with ultra-smooth pill geometry, squircle corners, and subtle ambient shadows.
- **Cyber-Pastel / Anime Modern:** A futuristic, ethereal aesthetic centered around chromatic dispersion, iridescent character art, and clean cybernetic-inspired badges.

---

## 2. Color Palette & Token System

### Core Canvas & Surfaces

- **Base Canvas (`#FFFFFF`):** Luminous, ultra-clean white backdrop providing maximum negative space.
- **Frosted Surface (`rgba(255, 255, 255, 0.65 - 0.85)`):** Semi-transparent white containers with diffused light transmission.
- **Muted Neutral (`#F1F3F9`):** Soft cool-gray/ice-white for inactive badge backgrounds and subtle surface elevation.

### Typography & High-Contrast Elements

- **Obsidian Black (`#0C0E14`):** High-contrast, near-black for primary display headings, major numerical data, search controls, and dark-mode pill chips.
- **Subtle Slate (`#7E8494`):** Low-contrast neutral for secondary metadata, subtitles, units, and trailing indicator labels.

### Functional Accent Colors

- **Vibrant Mint / Cyber Lime (`#A3F788` / `#98EE2C`):** High-energy primary action color used for growth metrics, trend arrows, and conversion elements (e.g., "Upgrade" button).
- **Deep Ink (`#1E1F24`):** Used for solid pill buttons, toggle indicators, and progress tracking bars.

### Holographic / Iridescent Gradient Spectrum

Used across focal illustrations, ambient refractions, and glow highlights:

- **Prism Cyan:** `#A5F3FC`
- **Soft Lavender:** `#DDD6FE`
- **Pastel Blush:** `#FBCFE8`
- **Spectral Pale Yellow:** `#FEF08A`

---

## 3. Visual Treatment & Material Properties

- **Glass & Transparency:**
    - Multi-layered alpha channels layered directly over graphic artwork.
    - Border treatments use subtle light strokes (`1px solid rgba(255, 255, 255, 0.4)`) to simulate light catching glass edges.
- **Shadows & Depth:**
    - Ultra-diffuse, low-opacity drop shadows (`0 8px 32px rgba(15, 23, 42, 0.04)`) to create a weightless, floating sensation without harsh cutoffs.
- **Gradients & Reflections:**
    - Dynamic multi-stop linear/conic pastel gradients simulating metallic and pearlescent finishes.
