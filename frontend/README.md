# Prelegal frontend

Prototype mutual NDA creator (PL-3), built with Next.js. The user fills in a form, sees the mutual NDA with their details filled in, and downloads it as a PDF.

The NDA text and form fields come from the template dataset at the repository root: `templates/mutual-nda.md` and its entry in `templates/catalog.json`. Editing either updates the app on the next build.

## Running locally

```
npm install
npm run dev
```

Then open http://localhost:3000.

## How it works

- `src/lib/loadTemplate.ts` reads the template and its catalog entry from `../templates` on the server.
- `src/components/NdaCreator.tsx` renders a form field for each catalog variable and, on submit, fills the template (`src/lib/template.ts`).
- `src/lib/documentBlocks.ts` parses the filled Markdown into a small block model used by both the on-screen view (`NdaDocument.tsx`) and the PDF (`NdaPdf.tsx`), so they match.
- The PDF is generated in the browser with `@react-pdf/renderer`, loaded only when the user clicks **Download PDF**.
