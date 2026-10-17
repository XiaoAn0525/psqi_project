import {
  buildMetabolicRiskReport,
} from "./health-risk-module/dist/metabolic-risk-pdf.js";


export function createMetabolicPdfReport({
  data,
  result,
  modelName,
  modelRoute,
  useWaist,
}) {
  if (!data) {
    throw new Error("缺少問卷資料");
  }

  if (!result) {
    throw new Error("缺少模型結果");
  }

  return buildMetabolicRiskReport({
    data,
    result,

    modelName,
    modelRoute,

    useWaist,

    // 先固定，避免每次 render 建議文字一直變
    variant: 0,

    branding: {
      mark: "H",
      name: "睡眠模式與代謝健康",
      subtitle: "個人健康風險報告",
      footerLeft:
        "本報告由系統依本次問卷與模型結果產生。",
      footerRight:
        "睡眠模式與代謝健康",
      fileNamePrefix:
        "代謝症候群風險報告",
    },

    riskLabels: {
      low: "較低風險",
      intermediate: "中等風險",
      high: "較高風險",
    },

    disclaimer:
      "本工具僅供代謝症候群目前風險篩檢與健康教育使用，"
      + "不是醫療診斷，也不能取代正式健康檢查或醫療專業人員評估。",
  });
}