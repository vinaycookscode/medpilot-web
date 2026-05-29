# medpilot-web — agent + contributor guide

## The one hard rule

**Every UI element added or refactored in this app uses the `gw-*` component library at [src/app/shared/ui/](src/app/shared/ui/). No exceptions.**

This applies to all new pages, all new components, all refactors, all bug fixes that touch markup. Do not write new code using the legacy global CSS classes (`.input`, `.select`, `.btn`, `.btn--*`, `.card`, `.modal`, `.modal-backdrop`, `.badge`, `.tab-btn`, `.spinner`, `.empty-state`, `<app-toast-container>`, etc.). Those classes remain in [src/styles/_components.scss](src/styles/_components.scss) only to keep un-migrated existing pages working while the adoption sweep finishes.

If a primitive you need does not exist in `shared/ui/`:
1. Add it to the appropriate sub-folder (forms / buttons / feedback / overlays / display / data / navigation / ai / enterprise).
2. Give it a Storybook story.
3. Then use it. Do not work around the missing primitive with inline markup.

If the visual you need does not exist as a token in [src/styles/_tokens.scss](src/styles/_tokens.scss):
1. Add the token.
2. Reference it via `var(--token-name)` in component SCSS.
3. Never hardcode hex colors, shadows, radii, or spacing values inside a component.

## What to import — quick lookup

| You need… | Import from |
|---|---|
| Form field with label/hint/error | `gw-form-field` from [shared/ui/forms/form-field/form-field.component](src/app/shared/ui/forms/form-field/form-field.component.ts) |
| Text / email / password / number input | `gw-input`, `gw-password-input`, `gw-number-input`, `gw-currency-input`, `gw-phone-input`, `gw-search-input`, `gw-otp-input` |
| Textarea / select / checkbox / radio / toggle / segmented | `gw-textarea`, `gw-select`, `gw-checkbox`, `gw-radio-group`, `gw-toggle`, `gw-segmented` |
| Combobox / multi-select / tags / file | `gw-combobox`, `gw-multi-select`, `gw-tags-input`, `gw-file-input` |
| Date / time / datetime | `gw-date-input`, `gw-time-input`, `gw-datetime-input` |
| Button / icon button | `gw-button`, `gw-icon-button` from [shared/ui/buttons/](src/app/shared/ui/buttons/) |
| Inline alert / banner | `gw-alert`, `gw-banner` from [shared/ui/feedback/](src/app/shared/ui/feedback/) and [shared/ui/display/banner/](src/app/shared/ui/display/banner/) |
| Transient notification | `GwToastService` + `<gw-toast-outlet />` already mounted at app root |
| Tooltip / popover / dialog / drawer | `[gwTooltip]`, `gw-popover`, `gw-dialog`, `gw-drawer` from [shared/ui/overlays/](src/app/shared/ui/overlays/) |
| Badge / tag / avatar / card / skeleton / progress / spinner / empty state | `gw-badge`, `gw-tag`, `gw-avatar`, `gw-card`, `gw-skeleton`, `gw-progress`, `gw-spinner`, `gw-empty-state` from [shared/ui/display/](src/app/shared/ui/display/) |
| Table / accordion / stat card / timeline / description list / tree / activity | `gw-table` (+ `gwCell` directive), `gw-accordion`, `gw-stat-card`, `gw-timeline`, `gw-description-list`, `gw-tree-view`, `gw-activity-feed` from [shared/ui/data/](src/app/shared/ui/data/) |
| Tabs / breadcrumbs / stepper / pagination / sidebar / topnav | `gw-tabs` + `gw-tab`, `gw-breadcrumbs`, `gw-stepper`, `gw-pagination`, `gw-sidebar`, `gw-top-nav` from [shared/ui/navigation/](src/app/shared/ui/navigation/) |
| AI prompt / message / suggestion / chat panel | `gw-prompt-input`, `gw-message-bubble`, `gw-suggestion-chips`, `gw-chat-panel` from [shared/ui/ai/](src/app/shared/ui/ai/) |
| Enterprise filter / audit row / KPI grid | `gw-filter-builder`, `gw-audit-row`, `gw-kpi-grid` from [shared/ui/enterprise/](src/app/shared/ui/enterprise/) |

Forms — bind every clinic-configurable select (specialization, blood group, gender, appointment type, leave type, etc.) to `AppMetaService` via the `[options]` input. Never hardcode option arrays for clinic master data.

## Visual rules baked into the library

- Inter typography loaded from Google Fonts, 13 px body base, `letter-spacing: -0.005em` on labels and buttons
- Brand color is `#2563EB` (`--color-primary`). Never reintroduce `#007AFF`.
- All corners tile to `--radius-xs` (4 px). Larger containers (`lg` / `xl`) ease up to 6–8 px only when justified. Round avatars / pills use `--radius-full`.
- Restrained shadow scale. `--shadow-xl` is reserved for dialogs / drawers / popovers. Day-to-day cards stay on `--shadow-xs` / `--shadow-sm` / `--shadow-md`.
- Focus state is a 2 px ring at 20 % opacity via `--shadow-focus`. No glowing halos.
- 36 px default control height, sm = 28 px, lg = 44 px.
- Dark mode supported via `[data-theme="dark"]` on `<html>` or any container.

If something looks wrong, the answer is almost always to switch to a different `gw-*` variant or tweak a token — not to override styles inside the consuming component.

## When in doubt

1. Look at how an already-migrated page solves the same problem ([pages/branches](src/app/pages/branches), [pages/insurance](src/app/pages/insurance), [pages/settings](src/app/pages/settings), [pages/login](src/app/pages/login) are good references).
2. Open the corresponding Storybook story (`npm run storybook`) — every gw-* has at least one.
3. If still stuck, extend the library before you reach for inline CSS or legacy classes.
