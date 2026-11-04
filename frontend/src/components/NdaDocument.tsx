import type { Block, TextRun } from "@/lib/documentBlocks";

function Runs({ runs }: { runs: TextRun[] }) {
  return runs.map((run, i) => (run.bold ? <strong key={i}>{run.text}</strong> : <span key={i}>{run.text}</span>));
}

const HEADING_CLASSES: Record<number, string> = {
  1: "mb-6 text-center text-2xl font-bold",
  2: "mt-6 mb-2 text-lg font-bold",
};

/** On-screen rendering of a filled-in document. */
export function NdaDocument({ blocks }: { blocks: Block[] }) {
  return (
    <article className="font-serif text-[15px] leading-relaxed text-neutral-900">
      {blocks.map((block, i) => {
        if (block.type === "rule") return <hr key={i} className="my-6 border-neutral-300" />;
        if (block.type === "heading") {
          const Tag = block.level === 1 ? "h1" : block.level === 2 ? "h2" : "h3";
          return (
            <Tag key={i} className={HEADING_CLASSES[block.level] ?? "mt-4 mb-2 font-bold"}>
              <Runs runs={block.runs} />
            </Tag>
          );
        }
        return (
          <p key={i} className="mb-3">
            {block.lines.map((line, j) => (
              <span key={j}>
                {j > 0 && <br />}
                <Runs runs={line} />
              </span>
            ))}
          </p>
        );
      })}
    </article>
  );
}
