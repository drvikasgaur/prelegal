"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";

import { NdaDocument } from "@/components/NdaDocument";
import { parseDocument } from "@/lib/documentBlocks";
import { fillTemplate, type LoadedTemplate, type TemplateVariable } from "@/lib/template";

const INPUT_TYPES: Record<TemplateVariable["type"], string> = {
  string: "text",
  text: "text",
  date: "date",
  number: "number",
  email: "email",
  url: "url",
};

const inputClass =
  "w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm " +
  "placeholder:text-neutral-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200";

function Field({
  variable,
  value,
  onChange,
}: {
  variable: TemplateVariable;
  value: string;
  onChange: (value: string) => void;
}) {
  const id = `field-${variable.name}`;
  const common = {
    id,
    name: variable.name,
    required: true,
    value,
    className: inputClass,
    placeholder: variable.type === "date" ? undefined : `e.g. ${variable.example}`,
  };

  return (
    <div className={variable.type === "text" ? "sm:col-span-2" : undefined}>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-neutral-700">
        {variable.label}
      </label>
      {variable.type === "text" ? (
        <textarea {...common} rows={3} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input
          {...common}
          type={INPUT_TYPES[variable.type]}
          min={variable.type === "number" ? 1 : undefined}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}

function pdfFileName(values: Record<string, string>): string {
  const slug = (s: string | undefined) =>
    (s ?? "").trim().replace(/[^A-Za-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const parties = [slug(values.party_a_name), slug(values.party_b_name)].filter(Boolean);
  return ["Mutual-NDA", ...parties].join("-") + ".pdf";
}

export function NdaCreator({ template }: { template: LoadedTemplate }) {
  const { entry, markdown } = template;
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(entry.variables.map((v) => [v.name, ""])),
  );
  const [submitted, setSubmitted] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  // Until React has hydrated, submitting would fall back to a native GET and
  // put the user's details in the URL, so the submit button starts disabled.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const blocks = useMemo(
    () => (submitted ? parseDocument(fillTemplate(markdown, entry.variables, values)) : []),
    [submitted, markdown, entry.variables, values],
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    window.scrollTo({ top: 0 });
  }

  async function handleDownload() {
    setDownloading(true);
    setDownloadError(null);
    try {
      // Loaded on demand: the PDF renderer is large and only needed here.
      const [{ pdf }, { NdaPdf }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/components/NdaPdf"),
      ]);
      const blob = await pdf(<NdaPdf blocks={blocks} title={entry.title} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = pdfFileName(values);
      link.click();
      // Revoking straight away can cancel the download in some browsers.
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error(error);
      setDownloadError("Sorry, the PDF could not be created. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  if (submitted) {
    return (
      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            ← Edit details
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:cursor-wait disabled:opacity-60"
          >
            {downloading ? "Preparing PDF…" : "Download PDF"}
          </button>
        </div>
        {downloadError && (
          <p role="alert" className="mb-4 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">
            {downloadError}
          </p>
        )}
        <div className="rounded-lg border border-neutral-200 bg-white px-6 py-10 shadow-sm sm:px-12">
          <NdaDocument blocks={blocks} />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        {entry.variables.map((variable) => (
          <Field
            key={variable.name}
            variable={variable}
            value={values[variable.name]}
            onChange={(value) => setValues((prev) => ({ ...prev, [variable.name]: value }))}
          />
        ))}
      </div>
      <div className="mt-8 flex justify-end">
        <button
          type="submit"
          disabled={!hydrated}
          className="rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-60"
        >
          Generate NDA
        </button>
      </div>
    </form>
  );
}
