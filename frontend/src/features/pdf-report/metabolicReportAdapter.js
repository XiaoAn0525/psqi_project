const displayMaps = {
  gender: {
    male: "男性",
    female: "女性",
  },
  smoking: {
    never: "沒有",
    current: "目前有抽菸",
    former: "已戒菸",
  },
  exercise: {
    rare: "幾乎沒有",
    "1_2": "每週 1–2 次",
    "3_plus": "每週 3 次以上",
  },
  alcohol: {
    never: "沒有",
    current: "目前有飲酒",
    former: "已戒酒",
  },
  betel_nut: {
    never: "沒有",
    current: "目前有嚼檳榔",
    former: "已戒檳榔",
  },
  diet: {
    rare: "很少",
    sometimes: "有時",
    often: "經常",
  },
};

const show = (group, value) => displayMaps[group]?.[value] || value || "未提供";

const getRiskDetails = (riskLevel) => {
  if (riskLevel === "高風險") {
    return {
      tone: "high",
      description: "本次填寫資料出現較多代謝健康風險因素，建議儘早安排完整健康檢查。",
      nextStep: "建議儘早安排血壓、血糖、血脂及腰圍等完整健康檢查，並攜帶本報告諮詢醫療專業人員。",
    };
  }

  if (riskLevel === "中度風險") {
    return {
      tone: "medium",
      description: "本次填寫資料出現部分代謝健康風險因素，建議優先改善可調整的生活習慣。",
      nextStep: "建議設定可執行的生活調整目標，持續觀察體重與腰圍變化，並依個人健康狀況安排健康檢查。",
    };
  }

  return {
    tone: "low",
    description: "本次填寫資料未出現較多明顯的代謝健康風險因素，仍建議持續維持良好習慣。",
    nextStep: "建議維持規律作息、均衡飲食與固定活動習慣，並依一般成人健檢建議定期追蹤健康狀況。",
  };
};

const getReportNumber = (result) => {
  if (result.record_id) {
    return `MS-${String(result.record_id).padStart(6, "0")}`;
  }

  return `MS-${Date.now()}`;
};

export function createMetabolicPdfReport(result, profile = {}) {
  const riskDetails = getRiskDetails(result.risk_level);
  const now = new Date();
  const dateTime = new Intl.DateTimeFormat("zh-TW", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(now);
  const localDate = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");

  const recommendations = [
    riskDetails.nextStep,
    ...(result.recommendations || []),
  ];

  return {
    title: "代謝症候群初步風險報告",
    subtitle: "個人資料、風險結果與後續健康建議",
    fileName: `代謝風險報告_${localDate}.pdf`,
    metadata: [
      { label: "報告編號", value: getReportNumber(result) },
      { label: "產生時間", value: dateTime },
    ],
    sections: [
      {
        title: "個人基本資料",
        fields: [
          { label: "年齡", value: profile.age ? `${profile.age} 歲` : "未提供" },
          { label: "性別", value: show("gender", profile.gender) },
          { label: "身高", value: profile.height ? `${profile.height} cm` : "未提供" },
          { label: "體重", value: profile.weight ? `${profile.weight} kg` : "未提供" },
          { label: "BMI", value: result.bmi ?? profile.bmi ?? "未提供" },
          { label: "BMI 分類", value: result.bmi_category || "未提供" },
        ],
      },
      {
        title: "睡眠與生活習慣",
        fields: [
          { label: "每日平均睡眠", value: result.sleep_hours ? `${result.sleep_hours} 小時` : "未提供" },
          { label: "睡眠分類", value: result.sleep_category || "未提供" },
          { label: "運動頻率", value: show("exercise", profile.exercise) },
          { label: "抽菸狀況", value: show("smoking", profile.smoking) },
          { label: "飲酒狀況", value: show("alcohol", profile.alcohol) },
          { label: "檳榔狀況", value: show("betel_nut", profile.betel_nut) },
          { label: "高油、高糖或高熱量飲食", value: show("diet", profile.diet) },
          { label: "腰圍", value: result.waist == null ? "未提供" : `${result.waist} cm` },
        ],
      },
    ],
    risk: {
      title: "風險結果",
      level: result.risk_level || "未提供",
      tone: riskDetails.tone,
      description: riskDetails.description,
      factors: result.risk_factors || [],
    },
    recommendations: [...new Set(recommendations)],
    disclaimer:
      result.disclaimer ||
      "本工具僅提供初步健康風險篩檢，不是醫療診斷。正式判定仍需搭配完整健檢資料，若有疑問請諮詢醫療專業人員。",
  };
}
