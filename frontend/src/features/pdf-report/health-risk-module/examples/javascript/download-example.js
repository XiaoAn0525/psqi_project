import {
  buildMetabolicRiskReport,
  downloadRiskPdf,
} from "../../dist/metabolic-risk-pdf.js";

const questionnaire = {
  age: 48,
  sex: "male",
  heightCm: 172,
  weightKg: 82,
  waistCm: 94,
  sleepHours: 5.5,
  smokingStatus: "former",
  drinkingStatus: "weekly_1_2",
  betelStatus: "never",
  exerciseFrequency: "weekly_2_3",
  vegetableIntake: "half_to_one_bowl",
  fruitIntake: "occasionally",
  friedProcessedFood: "weekly_2_3",
  saltySauceHabit: "often",
};

const result = {
  index: 52,
  group: "intermediate",
  bmi: 27.7,
  sleepCategory: "少於六小時",
  factors: ["BMI 偏高", "腰圍偏高", "部分生活習慣仍可改善"],
};

document.querySelector("#download-pdf").addEventListener("click", async () => {
  const report = buildMetabolicRiskReport({
    data: questionnaire,
    result,
    modelName: "Model C",
    modelRoute: "已提供腰圍，使用含腰圍的風險模型。",
    variant: Date.now(),
    branding: {
      mark: "H",
      name: "Your Health Site",
      subtitle: "個人健康風險報告",
      footerRight: "Your Health Site",
      fileNamePrefix: "個人健康風險報告",
    },
  });

  await downloadRiskPdf(report);
});
