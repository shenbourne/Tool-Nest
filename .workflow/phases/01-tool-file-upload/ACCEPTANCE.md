# Acceptance verification

| Requirement | Scenario / expected behavior | Actual evidence | Status |
| --- | --- | --- | --- |
| R-002 | Open `/convert-to-pdf`. A visible file-import control is rendered (non-zero bounding box, readable label). | PENDING | PENDING |
| R-002 | Open `/convert-to-jpg`. Same as above. | PENDING | PENDING |
| R-002 | Select a JPG/PNG through the control; the file name appears and the convert button becomes enabled. | PENDING | PENDING |
| R-002 | Click convert on `/convert-to-jpg` with a real image; a preview and a download button appear; the download is a valid JPEG. | PENDING | PENDING |
| R-002 | Click convert on `/convert-to-pdf` with a real image; a download button appears; the download is a valid PDF. | PENDING | PENDING |
| R-002 | Re-selecting a file replaces the previous selection (single-file tools). | PENDING | PENDING |
| R-002 | `/pdf-merge` accepts multiple PDFs and lists them. | PENDING | PENDING |
| R-002 | Control label renders in zh-CN and in en-US (English fallback). | PENDING | PENDING |
| R-002 | No `NUpload` site remains without a trigger slot. | PENDING | PENDING |

Status values: `PENDING`, `PASS`, `FAIL`, or `BLOCKED`. An untested criterion remains `PENDING`. Record who performed manual checks and when.

Manual browser checks performed by the agent via Chrome DevTools MCP against the local dev server.
