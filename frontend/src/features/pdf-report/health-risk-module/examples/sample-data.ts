import type { MetabolicQuestionnaireData, RiskResult } from "../src";

export const sampleQuestionnaire: MetabolicQuestionnaireData = {
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

export const sampleRiskResult: RiskResult = {
  index: 52,
  group: "intermediate",
  bmi: 27.7,
  sleepCategory: "少於六小時",
  factors: [
    "BMI 27.7，屬偏高範圍",
    "腰圍 94 cm，高於此問卷的提醒門檻",
    "運動與蔬果攝取仍有改善空間",
  ],
};
