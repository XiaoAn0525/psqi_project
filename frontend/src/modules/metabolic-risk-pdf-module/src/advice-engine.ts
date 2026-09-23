import type { PdfReportData } from "./pdf-report";

export type RiskKey = "low" | "intermediate" | "high";
export type Sex = "female" | "male";
export type SmokingStatus = "never" | "passive" | "former" | "occasional" | "daily";
export type DrinkingStatus = "never_or_lt_weekly" | "former" | "weekly_1_2" | "weekly_3_4" | "weekly_5_6" | "daily";
export type BetelStatus = "never" | "former" | "weekly_1_3" | "weekly_4_5" | "weekly_6_or_daily";
export type ExerciseFrequency = "daily_or_more" | "weekly_4_6" | "weekly_2_3" | "weekly_once" | "rare_or_none";
export type VegetableIntake = "lt_half_bowl" | "half_to_one_bowl" | "one_to_1_5_bowls" | "one_5_to_two_bowls" | "gte_two_bowls";
export type FruitIntake = "never" | "occasionally" | "often" | "always";
export type FriedFoodFrequency = "lt_weekly" | "weekly_2_3" | "weekly_4_5" | "weekly_6_or_daily";
export type SaltySauceHabit = "never" | "occasionally" | "often" | "always";

export type MetabolicQuestionnaireData = {
  age: number;
  sex: Sex;
  heightCm: number;
  weightKg: number;
  waistCm?: number;
  sleepHours: number;
  smokingStatus: SmokingStatus;
  drinkingStatus: DrinkingStatus;
  betelStatus: BetelStatus;
  exerciseFrequency: ExerciseFrequency;
  vegetableIntake: VegetableIntake;
  fruitIntake: FruitIntake;
  friedProcessedFood: FriedFoodFrequency;
  saltySauceHabit: SaltySauceHabit;
};

export type RiskResult = {
  index: number;
  group: RiskKey;
  bmi: number;
  sleepCategory: string;
  factors: string[];
};

export type GuidanceRules = {
  adequateExercise: ExerciseFrequency[];
  adequateVegetables: VegetableIntake[];
  adequateFruit: FruitIntake[];
  adequateFriedFood: FriedFoodFrequency[];
  adequateSaltySauce: SaltySauceHabit[];
  minSleepHours: number;
  maxSleepHoursExclusive: number;
  maleWaistCm: number;
  femaleWaistCm: number;
  bmiThreshold: number;
};

export type ConditionalGuidance = Pick<
  PdfReportData,
  "priorities" | "exercisePlan" | "nutritionPlan" | "lifestylePlan" | "platforms"
>;

export type GuidanceOptions = {
  useWaist?: boolean;
  variant?: number;
  rules?: Partial<GuidanceRules>;
};

export const defaultGuidanceRules: GuidanceRules = {
  adequateExercise: ["daily_or_more", "weekly_4_6"],
  adequateVegetables: ["one_5_to_two_bowls", "gte_two_bowls"],
  adequateFruit: ["often", "always"],
  adequateFriedFood: ["lt_weekly"],
  adequateSaltySauce: ["never", "occasionally"],
  minSleepHours: 6,
  maxSleepHoursExclusive: 9,
  maleWaistCm: 90,
  femaleWaistCm: 80,
  bmiThreshold: 24,
};

function pick<T>(items: readonly T[], variant: number, salt: number) {
  return items[(Math.abs(variant) * 7 + salt * 11) % items.length];
}

function rotate<T>(items: readonly T[], count: number, variant: number, salt: number) {
  const start = (Math.abs(variant) * 7 + salt * 11) % items.length;
  return Array.from({ length: Math.min(count, items.length) }, (_, index) => items[(start + index) % items.length]);
}

export function buildConditionalGuidance(
  data: MetabolicQuestionnaireData,
  result: RiskResult,
  options: GuidanceOptions = {},
): ConditionalGuidance {
  const rules = { ...defaultGuidanceRules, ...options.rules };
  const variant = options.variant ?? Date.now();
  const useWaist = options.useWaist ?? typeof data.waistCm === "number";
  const waistReference = data.sex === "male" ? rules.maleWaistCm : rules.femaleWaistCm;

  const bodyNeedsAttention = result.bmi >= rules.bmiThreshold
    || (useWaist && typeof data.waistCm === "number" && data.waistCm >= waistReference);
  const activityNeedsAttention = !rules.adequateExercise.includes(data.exerciseFrequency);
  const vegetablesNeedAttention = !rules.adequateVegetables.includes(data.vegetableIntake);
  const fruitNeedsAttention = !rules.adequateFruit.includes(data.fruitIntake);
  const friedNeedsAttention = !rules.adequateFriedFood.includes(data.friedProcessedFood);
  const saltyNeedsAttention = !rules.adequateSaltySauce.includes(data.saltySauceHabit);
  const smokingNeedsAttention = ["passive", "occasional", "daily"].includes(data.smokingStatus);
  const drinkingNeedsAttention = ["weekly_3_4", "weekly_5_6", "daily"].includes(data.drinkingStatus);
  const betelNeedsAttention = ["weekly_1_3", "weekly_4_5", "weekly_6_or_daily"].includes(data.betelStatus);
  const sleepNeedsAttention = data.sleepHours < rules.minSleepHours || data.sleepHours >= rules.maxSleepHoursExclusive;

  const priorities: Array<{ title: string; detail: string }> = [];
  if (result.group === "high") {
    priorities.push(pick([
      { title: "先確認真實健康數值", detail: "風險結果屬篩檢提醒，不是診斷。建議近期安排正式健康檢查，確認血壓、血糖、血脂與腰圍。" },
      { title: "近期安排完整健康檢查", detail: "可攜帶這份生活習慣紀錄就醫，再由醫療人員依檢驗數值、病史與用藥狀況綜合判讀。" },
      { title: "把專業評估排進近期計畫", detail: "請以正式健檢或門診評估確認實際風險，不要只依靠本報告中的風險分級。" },
    ], variant, 1));
  } else if (result.group === "intermediate") {
    priorities.push(pick([
      { title: "選一至兩項先做四週", detail: "從本報告列出的項目中挑最容易持續的一項，設定固定時段並記錄四週完成率。" },
      { title: "先做最容易持續的改變", detail: "不必一次改完所有習慣；先完成一個可追蹤的小目標，再依紀錄增加下一項。" },
      { title: "配合例行健康檢查", detail: "生活調整之外，也建議依個人年齡、病史與醫療建議安排健康檢查。" },
    ], variant, 1));
  }

  if (activityNeedsAttention) {
    priorities.push(pick([
      { title: "先建立每週活動節奏", detail: "本週先安排三次、每次 10 至 20 分鐘的快走或低衝擊活動，適應後再增加時間。" },
      { title: "把運動拆成容易開始的小段", detail: "可從飯後走路 10 分鐘開始，每週三至五天，穩定完成後再逐步拉長。" },
      { title: "先增加日常走動量", detail: "選兩個固定時段起身走動或散步，不必一開始就做高強度運動。" },
    ], variant, 2));
  }

  const dietTargets = [
    vegetablesNeedAttention ? "增加蔬菜" : null,
    fruitNeedsAttention ? "補足原型水果" : null,
    friedNeedsAttention ? "減少炸物與加工食品" : null,
    saltyNeedsAttention ? "減少重鹹醬料" : null,
  ].filter((item): item is string => Boolean(item));
  if (dietTargets.length > 0) {
    const targetText = dietTargets.join("、");
    priorities.push(pick([
      { title: "先改一個飲食項目", detail: `本次需要調整的是：${targetText}。先選其中一項連續做一週，再增加下一項。` },
      { title: "只處理尚未達標的飲食習慣", detail: `依本次填答，優先目標為${targetText}；已達提醒門檻的項目不另外列建議。` },
      { title: "從下一餐開始調整", detail: `下一餐先完成「${dietTargets[0]}」，並記錄一週的實際完成天數。` },
    ], variant, 3));
  }

  const exposureTargets = [
    smokingNeedsAttention ? "菸品或二手菸" : null,
    drinkingNeedsAttention ? "飲酒" : null,
    betelNeedsAttention ? "檳榔" : null,
  ].filter((item): item is string => Boolean(item));
  if (exposureTargets.length > 0) {
    const targetText = exposureTargets.join("、");
    priorities.push(pick([
      { title: `降低${targetText}暴露`, detail: `先記錄一週與${targetText}相關的情境及頻率，再設定減量或停止目標。` },
      { title: "找出最容易發生的情境", detail: `記下接觸${targetText}的時間、地點或情緒，再準備替代行動與專業支援。` },
      { title: "用紀錄與支援一起進行", detail: `本次只針對${targetText}提供提醒；若自行調整困難，可尋求醫療專業協助。` },
    ], variant, 4));
  }

  if (sleepNeedsAttention) {
    priorities.push(pick([
      { title: "固定睡眠與起床時間", detail: "連續兩週固定作息，睡前減少咖啡因、酒精與螢幕刺激；異常嗜睡或嚴重打鼾時請就醫。" },
      { title: "建立睡前降速流程", detail: "睡前可改做伸展、洗澡或閱讀，下午後減少咖啡因，也不要使用酒精助眠。" },
      { title: "用兩週睡眠紀錄找問題", detail: "記錄上床、入睡、起床與白天精神狀況，持續異常時請諮詢醫療人員。" },
    ], variant, 5));
  }

  if (bodyNeedsAttention && priorities.length < 4) {
    priorities.push(pick([
      { title: "追蹤體重與腰圍趨勢", detail: "每週在相近時段量測並記錄，觀察長期趨勢；避免極端節食或追求快速下降。" },
      { title: "建立簡單的身體紀錄", detail: "固定每週同一天記錄體重與腰圍，搭配活動與飲食紀錄觀察四週變化。" },
      { title: "採取可持續的體位管理", detail: "以均衡餐盤和規律活動逐步調整，不使用來路不明的減重產品。" },
    ], variant, 6));
  }

  const exercisePlan: PdfReportData["exercisePlan"] = activityNeedsAttention ? {
    goal: pick([
      "先從可交談但呼吸稍加快的活動開始，逐步朝每週累積 150 分鐘前進；可以分段完成。",
      "本週先完成三次、每次 10 至 20 分鐘，適應後每週增加一次或每次增加約五分鐘。",
      "把運動排進固定時段，先求規律再增加強度，長期目標為每週約 150 分鐘中等強度活動。",
    ], variant, 7),
    activities: rotate([
      "快走：選平坦路線走 10 至 30 分鐘，可拆成早晚兩段。",
      "平地腳踏車：調整到輕至中等阻力，以能穩定踩踏為主。",
      "游泳或水中走路：利用水的浮力降低膝踝與腰部負擔。",
      "低衝擊有氧操：避開大幅跳躍，先跟著初階節奏進行。",
      "飯後散步：餐後休息片刻再走 10 至 15 分鐘，累積每日活動量。",
      "日常走動：久坐時每 30 至 60 分鐘起身走動或伸展。",
    ], 3, variant, 8),
    strength: rotate([
      "椅子坐站：坐穩後起立再坐下，依能力做 8 至 12 次。",
      "牆壁伏地挺身：雙手撐牆、身體保持一直線，做 8 至 12 次。",
      "彈力帶划船：夾背並慢慢回到起始位置，依能力做 8 至 12 次。",
      "站姿抬腿：扶穩桌椅後向側邊抬腿，左右各做 8 至 12 次。",
      "提踵：扶著椅背慢慢踮腳再放下，依能力做 8 至 12 次。",
    ], 3, variant, 9),
    reduce: rotate([
      "減少連續久坐；工作、看電視或使用手機時，固定起身走動。",
      "不要一開始就做爆發衝刺、過重負荷或超出能力的長時間運動。",
      "避免只在週末一次補足整週運動量，盡量平均分散到不同天。",
    ], 2, variant, 10),
    safety: rotate([
      "活動前後各留 5 至 10 分鐘暖身與緩和；穿合腳鞋並補充水分。",
      "若有胸痛、暈眩、異常喘、心悸或不適加劇，立即停止並尋求醫療協助。",
      "已有慢性病、近期不適或久未運動者，可先確認適合的活動強度。",
      "運動時保持正常呼吸，不要憋氣；動作以穩定、可控制為原則。",
    ], 3, variant, 11),
  } : null;

  const nutritionCards: NonNullable<PdfReportData["nutritionPlan"]>["cards"] = [];
  if (vegetablesNeedAttention) {
    nutritionCards.push({
      title: "蔬菜",
      tone: "mint",
      text: pick([
        "每餐至少安排一種蔬菜並輪替顏色，例如地瓜葉、菠菜、青江菜、花椰菜、高麗菜、菇類、甜椒與番茄。",
        "外食可加點燙青菜或選兩種蔬菜配菜；醬料另外放，深色蔬菜至少占一部分。",
        "家中可準備冷凍花椰菜、青江菜、高麗菜、番茄與菇類，忙碌時也能快速補足。",
      ], variant, 12),
    });
  }
  if (fruitNeedsAttention) {
    nutritionCards.push({
      title: "水果",
      tone: "warm",
      text: pick([
        "選當季原型水果，例如芭樂、蘋果、柳橙、奇異果、木瓜或火龍果，避免用果汁、果乾或糖水罐頭代替。",
        "把原型水果安排在餐後或點心時段，含糖飲料與果汁不算水果。",
        "可先準備容易攜帶的蘋果、芭樂或橘子，取代餅乾與甜點。",
      ], variant, 13),
    });
  }
  if (bodyNeedsAttention || friedNeedsAttention) {
    nutritionCards.push({
      title: "主食與蛋白質",
      tone: "neutral",
      text: pick([
        "主食可用糙米、燕麥、玉米或地瓜取代部分白飯、白麵；蛋白質輪替豆腐、魚、蛋與去皮雞肉。",
        "便當主食可減少部分白飯並搭配全穀雜糧；主菜優先選豆腐、蒸魚、蛋或瘦肉。",
        "用玉米、地瓜、燕麥或糙米增加全穀來源，並減少加工肉品。",
      ], variant, 14),
    });
  }
  if (friedNeedsAttention || saltyNeedsAttention) {
    nutritionCards.push({
      title: "烹調與調味",
      tone: "neutral",
      text: pick([
        "優先蒸、煮、燉、烤或少油快炒；醬料另外放，並用蔥、薑、蒜、香草或檸檬增加風味。",
        "把油炸改成清蒸、烘烤或汆燙，逐步降低對重鹹醬料的依賴。",
        "外食可主動說少油、少鹽、醬汁分開；湯汁不必全部喝完。",
      ], variant, 15),
    });
  }

  const nutritionReduce: string[] = [];
  if (friedNeedsAttention) nutritionReduce.push(pick([
    "把炸物、煎炸碳烤與煙燻品的頻率先減半，改選清蒸、烤或滷製品。",
    "先取消一次固定炸物或宵夜，主菜改成蒸魚、烤雞或滷豆腐。",
    "點餐時用烤、蒸、煮取代炸排與加工肉品，每週逐步減少次數。",
  ], variant, 16));
  if (saltyNeedsAttention) nutritionReduce.push(pick([
    "減少辣椒醬、醬油膏、沙茶、滷汁、湯底與醃漬物；火鍋湯、泡麵湯少喝。",
    "醬料先減半並另外放，少喝湯底，避免泡麵、火鍋料與醃漬物集中在同一餐。",
    "先嘗原味再決定是否加醬，逐步減少沙茶、醬油膏與滷汁。",
  ], variant, 17));
  if (bodyNeedsAttention) nutritionReduce.push(pick([
    "避免用不吃正餐、單一食物法或來路不明的減重產品追求快速下降。",
    "不要因短期體重波動而大幅節食，以份量、頻率與烹調方式逐步調整。",
    "不必完全禁止某一類食物；規律三餐與可長期維持的調整更重要。",
  ], variant, 18));

  const nutritionActionExample = vegetablesNeedAttention
    ? "下一餐多加一份燙青菜或兩種蔬菜配菜，醬料另外放；連續記錄七天是否完成。"
    : fruitNeedsAttention
      ? "明天準備一份原型水果作為點心，例如芭樂、蘋果或橘子，不以果汁代替。"
      : friedNeedsAttention
        ? "下一次點餐把炸主菜換成蒸、烤、煮或滷的豆腐、魚或去皮雞肉。"
        : saltyNeedsAttention
          ? "下一餐先把醬料另外放並減半，先嘗原味，湯汁不要喝完。"
          : "本週固定同一天、相近時段記錄體重與腰圍，餐點維持規律。";

  const nutritionPlan: PdfReportData["nutritionPlan"] = nutritionCards.length > 0 || nutritionReduce.length > 0
    ? { cards: nutritionCards, reduce: nutritionReduce, actionExample: nutritionActionExample }
    : null;

  const lifestylePlan: PdfReportData["lifestylePlan"] = [];
  if (sleepNeedsAttention) lifestylePlan.push({
    title: "睡眠",
    detail: pick([
      "固定上床與起床時間；下午後減少咖啡因，睡前一小時降低螢幕與強光刺激。",
      "先固定每天起床時間，睡前改做伸展、洗澡或閱讀；異常持續時請就醫。",
      "連續兩週記錄睡眠時段與白天精神，也不要使用酒精助眠。",
    ], variant, 19),
  });
  if (bodyNeedsAttention) lifestylePlan.push({
    title: "體重與腰圍紀錄",
    detail: pick([
      "每週一次在相近時段、相近衣著下量測體重；腰圍在吐氣後水平量測。",
      "固定每週同一天早上記錄體重與腰圍，搭配活動和飲食紀錄看四週趨勢。",
      "把體重、腰圍、運動分鐘與外食次數放在同一張紀錄表。",
    ], variant, 20),
  });
  if (smokingNeedsAttention) lifestylePlan.push({
    title: "菸品與二手菸",
    detail: data.smokingStatus === "passive"
      ? "和家人或同事約定室內與車內全面無菸，並優先選擇無菸環境。"
      : "設定停止日期、移除菸品與菸具，辨識最常想抽菸的情境，並使用戒菸服務。",
  });
  if (drinkingNeedsAttention) lifestylePlan.push({
    title: "飲酒",
    detail: "先設定每週無酒日並記錄飲用量，避免使用酒精助眠、空腹飲酒或一次大量飲酒。",
  });
  if (betelNeedsAttention) lifestylePlan.push({
    title: "檳榔",
    detail: "設定停止日期並避開容易嚼檳榔的情境，可至醫療院所尋求戒檳與口腔檢查協助。",
  });

  const platforms: PdfReportData["platforms"] = [
    { name: "慢性疾病風險評估平台", purpose: "使用國健署公開工具進一步理解個人健康風險。", url: "https://cdrc.hpa.gov.tw/hra-openservice-menupage.jsp?all=" },
    { name: "成人預防保健", purpose: "了解政府成人健康檢查服務與相關資格。", url: "https://www.hpa.gov.tw/Pages/List.aspx?nodeid=189" },
    { name: "健康存摺", purpose: "查閱個人就醫、檢驗與健康資料。", url: "https://www.nhi.gov.tw/ch/np-2702-1.html" },
    { name: "健保特約醫事機構查詢", purpose: "依地區查詢可就醫或接受健康服務的院所。", url: "https://info.nhi.gov.tw/INAE1000/INAE1000S01" },
  ];
  if (activityNeedsAttention) platforms.unshift({ name: "i 運動資訊平台", purpose: "查找運動知識、體適能與可參與的運動資源。", url: "https://isports.sa.gov.tw/" });
  if (nutritionPlan) platforms.unshift({ name: "營養及健康飲食促進資源平台", purpose: "查詢我的餐盤、均衡飲食與外食選擇。", url: "https://healthydiet.hpa.gov.tw/" });
  if (smokingNeedsAttention) platforms.push({ name: "免費戒菸專線 0800-636363", purpose: "由專業人員提供戒菸諮詢。", url: "https://www.mohw.gov.tw/cp-2704-76938-1.html" });
  if (betelNeedsAttention) platforms.push({ name: "健康九九戒檳專區", purpose: "取得戒檳、口腔黏膜檢查與相關衛教資訊。", url: "https://health99.hpa.gov.tw/health99/Subject/Detail/10644?nodeId=10" });

  return {
    priorities: priorities.slice(0, 4),
    exercisePlan,
    nutritionPlan,
    lifestylePlan,
    platforms,
  };
}
