"use client";

import { useRef, useState } from "react";
import {
  buildMetabolicRiskReport,
  downloadRiskPdf,
  type MetabolicQuestionnaireData,
  type RiskResult,
} from "../../src";

type Props = {
  questionnaire: MetabolicQuestionnaireData;
  result: RiskResult;
  modelName: string;
  modelRoute: string;
};

export function PdfDownloadButton({ questionnaire, result, modelName, modelRoute }: Props) {
  const [isExporting, setIsExporting] = useState(false);
  const [message, setMessage] = useState("");
  const variantRef = useRef<number | null>(null);

  async function handleDownload() {
    setIsExporting(true);
    setMessage("");

    try {
      const variant = variantRef.current ?? Date.now();
      variantRef.current = variant + 1;

      const report = buildMetabolicRiskReport({
        data: questionnaire,
        result,
        modelName,
        modelRoute,
        variant,
        branding: {
          mark: "H",
          name: "Your Health Site",
          subtitle: "個人健康風險報告",
          footerRight: "Your Health Site",
          fileNamePrefix: "個人健康風險報告",
        },
      });

      await downloadRiskPdf(report);
      setMessage("PDF 已下載");
    } catch (error) {
      console.error(error);
      setMessage("PDF 產生失敗，請稍後再試");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div>
      <button type="button" disabled={isExporting} onClick={handleDownload}>
        {isExporting ? "正在產生 PDF…" : "下載 PDF 報告"}
      </button>
      {message && <p role="status">{message}</p>}
    </div>
  );
}
