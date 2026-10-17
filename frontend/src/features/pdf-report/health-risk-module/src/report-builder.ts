import { buildConditionalGuidance, type GuidanceRules, type MetabolicQuestionnaireData, type RiskKey, type RiskResult } from "./advice-engine";
import type { PdfBranding, PdfReportData } from "./pdf-report";

const answerLabels: Record<string, string> = {
  never: "從來沒有／不使用",
  passive: "不抽菸，但經常吸二手菸",
  former: "以前使用，現在已停止",
  occasional: "偶爾",
  occasionally: "偶爾",
  daily: "每天",
  never_or_lt_weekly: "不喝或每週少於一次",
  weekly_1_2: "每週一至二次",
  weekly_3_4: "每週三至四次",
  weekly_5_6: "每週五至六次",
  weekly_1_3: "每週一至三次",
  weekly_4_5: "每週四至五次",
  weekly_6_or_daily: "每週六次或每天",
  daily_or_more: "每天一次以上",
  weekly_4_6: "每週四至六次",
  weekly_2_3: "每週二至三次",
  weekly_once: "每週一次",
  rare_or_none: "不運動或每週少於一次",
  lt_half_bowl: "不吃或每天少於半碗",
  half_to_one_bowl: "每天半碗至一碗以內",
  one_to_1_5_bowls: "每天一碗至一碗半以內",
  one_5_to_two_bowls: "每天一碗半至兩碗以內",
  gte_two_bowls: "每天兩碗或以上",
  often: "經常",
  always: "總是",
  lt_weekly: "不吃或每週少於一次",
};

function label(value: string) {
  return answerLabels[value] ?? value;
}

export type BuildMetabolicReportInput = {
  data: MetabolicQuestionnaireData;
  result: RiskResult;
  modelName: string;
  modelRoute: string;
  useWaist?: boolean;
  generatedAt?: Date;
  variant?: number;
  rules?: Partial<GuidanceRules>;
  branding?: Partial<PdfBranding>;
  riskLabels?: Partial<Record<RiskKey, string>>;
  disclaimer?: string;
};

const defaultRiskLabels: Record<RiskKey, string> = {
  low: "較低風險",
  intermediate: "中等風險",
  high: "較高風險",
};

export function buildMetabolicRiskReport(input: BuildMetabolicReportInput): PdfReportData {
  const { data, result } = input;
  const guidance = buildConditionalGuidance(data, result, {
    useWaist: input.useWaist,
    variant: input.variant,
    rules: input.rules,
  });
  const riskLabels = { ...defaultRiskLabels, ...input.riskLabels };
  const useWaist = input.useWaist ?? typeof data.waistCm === "number";

  return {
    generatedAt: input.generatedAt ?? new Date(),
    modelName: input.modelName,
    modelRoute: input.modelRoute,
    riskKey: result.group,
    riskLabel: riskLabels[result.group],
    riskIndex: result.index,
    basicData: [
      { label: "年齡", value: `${data.age} 歲` },
      { label: "生理性別", value: data.sex === "male" ? "男性" : "女性" },
      { label: "身高", value: `${data.heightCm} cm` },
      { label: "體重", value: `${data.weightKg} kg` },
      { label: "腰圍", value: useWaist && typeof data.waistCm === "number" ? `${data.waistCm} cm` : "未提供" },
      { label: "BMI", value: result.bmi.toFixed(1) },
      { label: "每日睡眠", value: `${data.sleepHours} 小時` },
      { label: "睡眠分類", value: result.sleepCategory },
      { label: "使用模型", value: input.modelName },
      { label: "風險指數", value: `${result.index}／100` },
    ],
    habits: [
      { label: "抽菸狀況", value: label(data.smokingStatus) },
      { label: "飲酒狀況", value: label(data.drinkingStatus) },
      { label: "檳榔使用", value: label(data.betelStatus) },
      { label: "運動頻率", value: label(data.exerciseFrequency) },
      { label: "蔬菜攝取", value: label(data.vegetableIntake) },
      { label: "水果攝取", value: label(data.fruitIntake) },
      { label: "炸物與加工食品", value: label(data.friedProcessedFood) },
      { label: "重鹹醬料習慣", value: label(data.saltySauceHabit) },
    ],
    factors: result.factors,
    recommendations: [],
    ...guidance,
    branding: input.branding,
    disclaimer: input.disclaimer
      ?? "重要說明：本報告僅供風險教育，不構成診斷、處方或個別醫療建議，也不能取代健康檢查或醫療專業人員評估。",
  };
}
