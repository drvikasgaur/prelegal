import { NdaCreator } from "@/components/NdaCreator";
import { loadTemplate } from "@/lib/loadTemplate";

export default async function Home() {
  const template = await loadTemplate("mutual-nda");

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <p className="text-sm font-semibold tracking-wide text-indigo-600 uppercase">Prelegal</p>
        <h1 className="mt-1 text-3xl font-bold text-neutral-900">{template.entry.title} creator</h1>
        <p className="mt-2 text-neutral-600">
          Fill in the details below to generate a mutual NDA, then download it as a PDF.
        </p>
      </header>

      <NdaCreator template={template} />

      <p className="mt-8 text-xs text-neutral-500">
        This document is a general template, not legal advice. Have it reviewed by a qualified lawyer before use.
      </p>
    </main>
  );
}
