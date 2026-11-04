import { lexer, type Token, type Tokens } from "marked";

/**
 * A minimal document model shared by the on-screen view and the PDF, so both
 * render the same headings, paragraphs, line breaks and bold text.
 */
export interface TextRun {
  text: string;
  bold: boolean;
}

/** A paragraph is a list of lines; each line is a list of text runs. */
export type Block =
  | { type: "heading"; level: number; runs: TextRun[] }
  | { type: "paragraph"; lines: TextRun[][] }
  | { type: "rule" };

// Appends text to the current line, merging with the previous run when the
// style matches (escaped characters otherwise arrive as many tiny runs).
function pushText(lines: TextRun[][], text: string, bold: boolean) {
  const line = lines[lines.length - 1];
  const last = line[line.length - 1];
  if (last && last.bold === bold) last.text += text;
  else line.push({ text, bold });
}

function inlineToLines(tokens: Token[] | undefined, bold = false, lines: TextRun[][] = [[]]) {
  for (const token of tokens ?? []) {
    switch (token.type) {
      case "br":
        lines.push([]);
        break;
      case "strong":
        inlineToLines((token as Tokens.Strong).tokens, true, lines);
        break;
      case "em":
      case "del":
      case "link":
        inlineToLines((token as Tokens.Generic).tokens, bold, lines);
        break;
      case "text": {
        const text = token as Tokens.Text;
        if (text.tokens?.length) {
          inlineToLines(text.tokens, bold, lines);
        } else {
          pushText(lines, text.text, bold);
        }
        break;
      }
      default:
        // escape, codespan, html and anything else: show the literal text.
        pushText(lines, (token as Tokens.Generic).text ?? token.raw, bold);
    }
  }
  return lines;
}

function toBlocks(tokens: Token[], blocks: Block[]): Block[] {
  for (const token of tokens) {
    switch (token.type) {
      case "heading": {
        const heading = token as Tokens.Heading;
        blocks.push({ type: "heading", level: heading.depth, runs: inlineToLines(heading.tokens).flat() });
        break;
      }
      case "paragraph":
      case "text":
        blocks.push({ type: "paragraph", lines: inlineToLines((token as Tokens.Paragraph).tokens) });
        break;
      case "hr":
        blocks.push({ type: "rule" });
        break;
      case "list":
        for (const item of (token as Tokens.List).items) toBlocks(item.tokens, blocks);
        break;
      case "space":
        break;
      default:
        blocks.push({ type: "paragraph", lines: [[{ text: token.raw.trim(), bold: false }]] });
    }
  }
  return blocks;
}

export function parseDocument(markdown: string): Block[] {
  return toBlocks(lexer(markdown, { gfm: true, breaks: true }), []);
}
