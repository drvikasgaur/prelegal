import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

import type { Block, TextRun } from "@/lib/documentBlocks";

const styles = StyleSheet.create({
  page: { paddingVertical: 56, paddingHorizontal: 64, fontFamily: "Times-Roman", fontSize: 11, lineHeight: 1.45 },
  h1: { fontFamily: "Times-Bold", fontSize: 18, textAlign: "center", marginBottom: 18 },
  h2: { fontFamily: "Times-Bold", fontSize: 13, marginTop: 14, marginBottom: 6 },
  h3: { fontFamily: "Times-Bold", fontSize: 11, marginTop: 10, marginBottom: 4 },
  paragraph: { marginBottom: 8 },
  bold: { fontFamily: "Times-Bold" },
  rule: { borderBottomWidth: 0.5, borderBottomColor: "#999999", marginVertical: 12 },
  pageNumber: { position: "absolute", bottom: 28, left: 0, right: 0, textAlign: "center", fontSize: 9, color: "#666666" },
});

function Runs({ runs }: { runs: TextRun[] }) {
  return runs.map((run, i) => (
    <Text key={i} style={run.bold ? styles.bold : undefined}>
      {run.text}
    </Text>
  ));
}

/** PDF rendering of a filled-in document, mirroring NdaDocument. */
export function NdaPdf({ blocks, title }: { blocks: Block[]; title: string }) {
  return (
    <Document title={title} creator="Prelegal" producer="Prelegal">
      <Page size="A4" style={styles.page}>
        {blocks.map((block, i) => {
          if (block.type === "rule") return <View key={i} style={styles.rule} />;
          if (block.type === "heading") {
            const style = block.level === 1 ? styles.h1 : block.level === 2 ? styles.h2 : styles.h3;
            return (
              <Text key={i} style={style} minPresenceAhead={40}>
                <Runs runs={block.runs} />
              </Text>
            );
          }
          return (
            <Text key={i} style={styles.paragraph}>
              {block.lines.map((line, j) => (
                <Text key={j}>
                  {j > 0 && "\n"}
                  <Runs runs={line} />
                </Text>
              ))}
            </Text>
          );
        })}
        <Text
          style={styles.pageNumber}
          fixed
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
        />
      </Page>
    </Document>
  );
}
