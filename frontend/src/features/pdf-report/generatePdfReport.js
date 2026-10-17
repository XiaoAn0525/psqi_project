/**
 * Framework-agnostic PDF report generator.
 *
 * The page using this module only needs to provide normalized report data.
 * The PDF layout, file download, Chinese text rendering and page breaks live
 * here, so the whole folder can be moved to another web project as one block.
 */

import { reportTheme } from "./reportTheme.js";

const PDF_ROOT_CLASS = "portable-pdf-report";

const text = (value, fallback = "-") => {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  return String(value);
};

const appendText = (parent, tag, value, className) => {
  const node = document.createElement(tag);
  node.textContent = text(value);

  if (className) {
    node.className = className;
  }

  parent.appendChild(node);
  return node;
};

const createFieldGrid = (fields = []) => {
  const grid = document.createElement("div");
  grid.className = "pdf-field-grid";

  fields.forEach(({ label, value }) => {
    const item = document.createElement("div");
    item.className = "pdf-field";

    appendText(item, "span", label, "pdf-field-label");
    appendText(item, "strong", value, "pdf-field-value");
    grid.appendChild(item);
  });

  return grid;
};

const createList = (items = [], emptyText = "無") => {
  const list = document.createElement("ul");
  list.className = "pdf-list";

  const safeItems = items.length > 0 ? items : [emptyText];

  safeItems.forEach((item) => {
    appendText(list, "li", item);
  });

  return list;
};

const REPORT_STYLES = `
  .${PDF_ROOT_CLASS} {
    box-sizing: border-box;
    width: 794px;
    min-height: 1123px;
    padding: 52px 58px;
    color: #20343a;
    background: #ffffff;
    font-family: "Noto Sans TC", "Microsoft JhengHei", "PingFang TC", sans-serif;
    font-size: 15px;
    line-height: 1.65;
  }
  .${PDF_ROOT_CLASS} * { box-sizing: border-box; }
  .pdf-header {
    padding-bottom: 22px;
    border-bottom: 3px solid #16858a;
  }
  .pdf-kicker {
    margin: 0 0 5px;
    color: #16858a;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 1.6px;
  }
  .pdf-title {
    margin: 0;
    color: #17373d;
    font-size: 30px;
    line-height: 1.25;
  }
  .pdf-subtitle { margin: 6px 0 0; color: #65777c; }
  .pdf-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 22px;
    margin-top: 16px;
    color: #6a7b80;
    font-size: 12px;
  }
  .pdf-section {
    margin-top: 26px;
    break-inside: avoid;
    page-break-inside: avoid;
  }
  .pdf-section h2 {
    margin: 0 0 12px;
    color: #17373d;
    font-size: 18px;
  }
  .pdf-field-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  .pdf-field {
    min-height: 62px;
    padding: 10px 13px;
    border: 1px solid #d9e7e8;
    border-radius: 8px;
    background: #f7fbfb;
  }
  .pdf-field-label { display: block; color: #6c7d82; font-size: 12px; }
  .pdf-field-value { display: block; margin-top: 2px; color: #213b40; font-size: 15px; }
  .pdf-risk-card {
    padding: 18px 20px;
    border: 1px solid #b9dedd;
    border-left: 6px solid #16858a;
    border-radius: 10px;
    background: #eff9f8;
  }
  .pdf-risk-card[data-level="high"] { border-left-color: #d44b4b; background: #fff4f3; }
  .pdf-risk-card[data-level="medium"] { border-left-color: #d39028; background: #fff9ed; }
  .pdf-risk-label { display: block; color: #65777c; font-size: 12px; font-weight: 700; }
  .pdf-risk-value { display: block; margin: 2px 0 6px; color: #17373d; font-size: 25px; }
  .pdf-risk-description { margin: 0; }
  .pdf-list { margin: 0; padding-left: 23px; }
  .pdf-list li { margin: 7px 0; padding-left: 4px; }
  .pdf-note {
    margin: 0;
    padding: 14px 16px;
    border-radius: 8px;
    color: #596b70;
    background: #f2f5f5;
    font-size: 12px;
  }
  .pdf-footer {
    margin-top: 30px;
    padding-top: 13px;
    border-top: 1px solid #dce5e6;
    color: #829095;
    font-size: 11px;
    text-align: center;
  }
`;

export function createReportElement(report) {
  const root = document.createElement("article");
  root.className = PDF_ROOT_CLASS;

  const style = document.createElement("style");
  // Scope base rules as well: exporting a report must not restyle the website.
  style.textContent = REPORT_STYLES.replace(/(^|\n)(  \.pdf-)/g, "$1  .portable-pdf-report .pdf-") + reportTheme;
  root.appendChild(style);

  const header = document.createElement("header");
  header.className = "pdf-header";
  appendText(header, "div", "♥", "pdf-brand-icon");
  appendText(header, "p", report.kicker || "PERSONAL HEALTH REPORT", "pdf-kicker");
  appendText(header, "h1", report.title || "個人健康風險報告", "pdf-title");
  appendText(header, "p", report.subtitle || "評估結果與後續建議", "pdf-subtitle");

  const meta = document.createElement("div");
  meta.className = "pdf-meta";
  (report.metadata || []).forEach(({ label, value }) => {
    appendText(meta, "span", `${label}：${text(value)}`);
  });
  header.appendChild(meta);
  root.appendChild(header);

  (report.sections || []).forEach((section) => {
    const sectionNode = document.createElement("section");
    sectionNode.className = "pdf-section";
    appendText(sectionNode, "h2", section.title);
    sectionNode.appendChild(createFieldGrid(section.fields));
    root.appendChild(sectionNode);
  });

  const riskSection = document.createElement("section");
  riskSection.className = "pdf-section";
  appendText(riskSection, "h2", report.risk?.title || "風險結果");

  const riskCard = document.createElement("div");
  riskCard.className = "pdf-risk-card";
  riskCard.dataset.level = report.risk?.tone || "low";
  appendText(riskCard, "span", "本次評估", "pdf-risk-label");
  appendText(riskCard, "strong", report.risk?.level, "pdf-risk-value");
  appendText(riskCard, "p", report.risk?.description, "pdf-risk-description");
  riskSection.appendChild(riskCard);
  root.appendChild(riskSection);

  const factors = document.createElement("section");
  factors.className = "pdf-section";
  appendText(factors, "h2", "主要風險因素");
  factors.appendChild(createList(report.risk?.factors, "未發現較明顯的風險因素"));
  root.appendChild(factors);

  const recommendations = document.createElement("section");
  recommendations.className = "pdf-section";
  appendText(recommendations, "h2", "依風險結果提供的後續建議");
  recommendations.appendChild(
    createList(report.recommendations, "建議持續維持良好的生活與健康習慣。"),
  );
  root.appendChild(recommendations);

  if (report.disclaimer) {
    const notice = document.createElement("section");
    notice.className = "pdf-section";
    appendText(notice, "h2", "重要提醒");
    appendText(notice, "p", report.disclaimer, "pdf-note");
    root.appendChild(notice);
  }

  appendText(
    root,
    "footer",
    report.footer || "本報告由網站依使用者本次填寫內容自動產生。",
    "pdf-footer",
  );

  return root;
}

export async function downloadPdfReport(report) {
  const host = document.createElement("div");
  host.setAttribute("aria-hidden", "true");
  host.style.cssText = "position:fixed;left:-10000px;top:0;width:794px;z-index:-1;";

  const reportElement = createReportElement(report);
  host.appendChild(reportElement);
  document.body.appendChild(host);

  try {
    if (document.fonts?.ready) {
      await document.fonts.ready;
    }

    const { default: html2pdf } = await import("html2pdf.js");

    await html2pdf()
      .set({
        margin: [24, 0, 24, 0],
        filename: report.fileName || "health-risk-report.pdf",
        image: { type: "jpeg", quality: 0.96 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
        },
        jsPDF: {
          unit: "px",
          format: [794, 1123],
          orientation: "portrait",
          hotfixes: ["px_scaling"],
        },
        pagebreak: { mode: ["css", "legacy"] },
      })
      .from(reportElement)
      .save();
  } finally {
    host.remove();
  }
}

