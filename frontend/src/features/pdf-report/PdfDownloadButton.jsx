import { useState } from "react";

import { downloadRiskPdf as downloadPdfReport } from "./health-risk-module/dist/metabolic-risk-pdf.js";
import "./PdfDownloadButton.css";


function PdfDownloadButton({
  report,
  className = "",
  children = "下載 PDF 報告",
}) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    if (isGenerating) {
      return;
    }

    try {
      setIsGenerating(true);
      await downloadPdfReport(report);
    } catch (error) {
      console.error("PDF 產生失敗：", error);
      window.alert("PDF 產生失敗，請稍後再試。");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      type="button"
      className={`pdf-download-button ${className}`.trim()}
      onClick={handleDownload}
      disabled={isGenerating}
    >
      {isGenerating ? "正在產生 PDF..." : children}
    </button>
  );
}


export default PdfDownloadButton;
