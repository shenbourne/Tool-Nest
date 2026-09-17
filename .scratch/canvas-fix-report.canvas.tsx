import {
  Callout,
  Code,
  H1,
  MetricsGrid,
  ReportSection,
  ReportShell,
  Stack,
  Table,
  Tag,
  Text,
} from "qoder/canvas";

const apiChanges = [
  {
    component: "Timeline",
    oldApi: 'items: { label, content }[]',
    newApi: 'events: { id, timestamp, title, state? }[]',
    impact: "Required fields changed; missing events caused findIndex crash",
  },
  {
    component: "BarChart",
    oldApi: "data + categoryKey + series=[{dataKey}]",
    newApi: "categories: string[] + series=[{ name, data: number[] }]",
    impact: "Data mapping changed from key-based to index-aligned",
  },
];

const verificationSteps = [
  { step: "Read SDK index.d.ts", result: "PASS", detail: "Confirmed all exports" },
  { step: "Read patterns.d.ts", result: "PASS", detail: "Timeline events API verified" },
  { step: "Read chart-primitives.d.ts", result: "PASS", detail: "BarChart categories/series API verified" },
  { step: "Read report-primitives.d.ts", result: "PASS", detail: "ReportShell/ReportSection compatible" },
  { step: "Read core-primitives.d.ts", result: "PASS", detail: "Table LegacyTableProps confirmed" },
  { step: "Apply Timeline fix", result: "PASS", detail: "items -> events with id/timestamp/title" },
  { step: "Apply BarChart fix", result: "PASS", detail: "data/categoryKey -> categories + series.data" },
  { step: "Final file review", result: "PASS", detail: "All 196 lines verified against SDK" },
];

export default function CanvasFixReport() {
  return (
    <ReportShell width="wide" ariaLabel="Canvas SDK Fix Report">
      <Stack gap="section">
        <Stack gap="component">
          <H1>Canvas SDK Migration Report</H1>
          <Text tone="secondary">
            Fixed TypeError: Cannot read properties of undefined (reading 'findIndex')
            in toolnest-completion-report.canvas.tsx by updating to latest Canvas SDK APIs.
          </Text>
          <MetricsGrid
            variant="header"
            columns={4}
            items={[
              { label: "Components Fixed", value: "2" },
              { label: "API Changes", value: "2" },
              { label: "Files Modified", value: "1" },
              { label: "Verification Steps", value: "8/8" },
            ]}
          />
        </Stack>

        <ReportSection title="Root Cause" divided>
          <Callout tone="info">
            <Text>
              Canvas SDK was updated after the original file was created. The Timeline component
              changed from <Tag>items</Tag> prop to <Tag>events</Tag> prop. When the old{" "}
              <Tag>items</Tag> was passed, the component internally tried to call{" "}
              <Code>findIndex</Code> on undefined <Code>events</Code>, causing the TypeError.
            </Text>
          </Callout>
        </ReportSection>

        <ReportSection title="API Changes Applied" divided>
          <Table
            headers={["Component", "Old API", "New API", "Impact"]}
            rows={apiChanges.map((c) => [c.component, c.oldApi, c.newApi, c.impact])}
          />
        </ReportSection>

        <ReportSection title="Verification Steps" divided>
          <Table
            headers={["Step", "Result", "Detail"]}
            rows={verificationSteps.map((v) => [v.step, v.result, v.detail])}
            rowTone={verificationSteps.map(() => "success")}
          />
        </ReportSection>

        <ReportSection title="Files Modified" divided>
          <Table
            headers={["File", "Change Type", "Description"]}
            rows={[
              [
                ".scratch/toolnest-completion-report.canvas.tsx",
                "Modified",
                "Timeline: items->events; BarChart: data->categories+series.data",
              ],
            ]}
          />
        </ReportSection>

        <ReportSection title="Key Learnings">
          <Stack gap="component">
            <Callout tone="warning">
              <Text>
                <Tag tone="warning">SDK Evolution</Tag> Canvas SDK APIs may change between versions.
                Always check ~/.qoder/canvas/sdk/ declarations before writing or fixing canvas files.
              </Text>
            </Callout>
            <Callout tone="info">
              <Text>
                <Tag>Timeline API</Tag> Now requires events with id, timestamp, title. Optional
                state field supports "completed" | "current" | "upcoming".
              </Text>
            </Callout>
            <Callout tone="info">
              <Text>
                <Tag>BarChart API</Tag> Now uses categories: string[] + series: {"{ name, data }"}[]
                instead of data + categoryKey + dataKey mapping.
              </Text>
            </Callout>
          </Stack>
        </ReportSection>

        <Text tone="secondary" size="small">
          Canvas SDK Migration Report - 2 components fixed, 8 verification steps passed.
        </Text>
      </Stack>
    </ReportShell>
  );
}
