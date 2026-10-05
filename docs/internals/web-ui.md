# Web UI

## Primitives

Controls come from [`components/ui`](../../apps/web/src/components/ui), and each one owns its look.

- Pick a `variant` or `size`. A call site adds only layout classes (width, flex, margin, position);
  any other class is a restyle, and `shadcn/no-restyle` fails lint on it.
- When no variant or size fits and the look is a generic concept, add one to the primitive. A look
  that belongs to one feature stays in that feature's component.
- Don't style a raw `<button>`, `<input>`, `<select>`, or `<textarea>` to look like a control a
  primitive provides. Raw elements are right when the element isn't that control: semantic rows,
  tabs, resize handles, swatches, editor surfaces, anything whose behavior or geometry differs by
  design.

## Styles

Style with Tailwind classes in the component that renders the element.

- Global CSS, in [`index.css`](../../apps/web/src/index.css) or any other stylesheet, is only for
  what classes on the owning component can't express: generated Markdown or imperative DOM, custom
  elements and shadow roots, animations, runtime theme variables, and browser or Electron
  integration.
- No `style={{ ... }}` or inline `<style>` for static values a class covers. Values computed at
  runtime are fine.
- Theme-only rules use `@variant dark` and `@variant light`, not `.dark` selectors.

## Composition

The composer banners are the reference.

- [`ComposerBanner.tsx`](../../apps/web/src/components/chat/ComposerBanner.tsx) exports one object
  of small slots. Slots own their classes, take `className`, and spread the rest of their props,
  merging classes with `cn`. Variants and density are props on `Root`. A slot that needs a control
  renders `Button`.
- [`ComposerBannerStack.tsx`](../../apps/web/src/components/chat/ComposerBannerStack.tsx) composes
  the slots and owns only stack behavior: priority, expand and collapse, dismiss transitions.
- Consumers are a few lines of slots, and the slots carry the styling:
  [`ComposerActivityStatus.tsx`](../../apps/web/src/components/chat/ComposerActivityStatus.tsx).

Build new UI the same way. Compose or extend a component instead of copying its markup and classes.
When a call site repeats a treatment another one already uses, make it a variant or a slot on the
shared component. A new composer banner or notice uses the `ComposerBanner` slots.
