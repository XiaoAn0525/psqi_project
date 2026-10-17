# 健康風險 PDF 匯出模組

這是一份可獨立搬移的瀏覽器端 PDF 模組。解壓縮後可直接複製到 React、Next.js、Vite 或一般 JavaScript 網站中，不需要後端服務，也不會把使用者資料上傳到伺服器。

模組包含：

- 個人基本資料、生活習慣、風險結果與主要因素
- 依填答條件決定是否顯示運動、飲食、睡眠、體位與菸酒檳建議
- 達到提醒門檻的項目不額外顯示建議
- 相同風險原因可透過 `variant` 產生不同說法
- PDF 頁數依實際內容自動調整
- 官方資源卡片與可點擊連結
- 可替換網站名稱、縮寫、頁尾與下載檔名
- React/TypeScript 與一般 JavaScript 範例

## 資料夾內容

```text
metabolic-risk-pdf-module/
├─ dist/
│  ├─ metabolic-risk-pdf.js   # 已編譯，純 JavaScript 網站可直接使用
│  └─ *.d.ts                  # TypeScript 型別
├─ src/
│  ├─ pdf-report.ts           # PDF 版面與下載功能
│  ├─ advice-engine.ts        # 條件式建議與文字變化
│  ├─ report-builder.ts       # 將問卷資料整理成 PDF 資料
│  └─ index.ts                # 統一匯出入口
├─ examples/
│  ├─ react/PdfDownloadButton.tsx
│  ├─ javascript/index.html
│  ├─ javascript/download-example.js
│  └─ sample-data.ts
├─ package.json
├─ tsconfig.json
└─ 整合檢查表.md
```

## 最快整合方式：React／Next.js／Vite

1. 將整個 `metabolic-risk-pdf-module` 資料夾複製到網站，例如：

```text
your-project/src/modules/metabolic-risk-pdf-module/
```

2. 在使用者按下下載按鈕的事件中引入：

```ts
import {
  buildMetabolicRiskReport,
  downloadRiskPdf,
} from "@/modules/metabolic-risk-pdf-module/src";
```

3. 傳入問卷與風險結果：

```ts
async function exportPdf() {
  const report = buildMetabolicRiskReport({
    data: questionnaire,
    result: riskResult,
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
}
```

Next.js 使用者請在呼叫 PDF 的按鈕元件最上方加入：

```ts
"use client";
```

完整按鈕範例位於 `examples/react/PdfDownloadButton.tsx`。

## 一般 JavaScript 網站

將 `dist/metabolic-risk-pdf.js` 放進網站可公開讀取的資料夾，使用 ES Module 引入：

```html
<button id="download-pdf" type="button">下載 PDF 報告</button>

<script type="module">
  import {
    buildMetabolicRiskReport,
    downloadRiskPdf,
  } from "/modules/metabolic-risk-pdf.js";

  document.querySelector("#download-pdf").addEventListener("click", async () => {
    const report = buildMetabolicRiskReport({
      data: questionnaire,
      result: riskResult,
      modelName: "Model C",
      modelRoute: "已提供腰圍，使用含腰圍的風險模型。",
      variant: Date.now(),
    });

    await downloadRiskPdf(report);
  });
</script>
```

請透過網站開發伺服器或正式網址開啟，不建議直接用 `file://` 開啟 HTML。

## 問卷資料格式

```ts
type MetabolicQuestionnaireData = {
  age: number;
  sex: "female" | "male";
  heightCm: number;
  weightKg: number;
  waistCm?: number;
  sleepHours: number;
  smokingStatus: "never" | "passive" | "former" | "occasional" | "daily";
  drinkingStatus:
    | "never_or_lt_weekly"
    | "former"
    | "weekly_1_2"
    | "weekly_3_4"
    | "weekly_5_6"
    | "daily";
  betelStatus: "never" | "former" | "weekly_1_3" | "weekly_4_5" | "weekly_6_or_daily";
  exerciseFrequency: "daily_or_more" | "weekly_4_6" | "weekly_2_3" | "weekly_once" | "rare_or_none";
  vegetableIntake: "lt_half_bowl" | "half_to_one_bowl" | "one_to_1_5_bowls" | "one_5_to_two_bowls" | "gte_two_bowls";
  fruitIntake: "never" | "occasionally" | "often" | "always";
  friedProcessedFood: "lt_weekly" | "weekly_2_3" | "weekly_4_5" | "weekly_6_or_daily";
  saltySauceHabit: "never" | "occasionally" | "often" | "always";
};
```

風險模型結果格式：

```ts
type RiskResult = {
  index: number; // 0 至 100
  group: "low" | "intermediate" | "high";
  bmi: number;
  sleepCategory: string;
  factors: string[];
};
```

此模組只負責接收風險結果並產生 PDF，不會自行取代網站原本的模型計算。

## 預設建議門檻

這些是 PDF 的「提醒規則」，不是醫療診斷標準。

| 項目 | 不額外顯示建議的預設條件 |
|---|---|
| 運動 | 每週四至六次或每天一次以上 |
| 蔬菜 | 每天一碗半以上 |
| 水果 | 經常或總是吃到至少兩份 |
| 炸物與加工食品 | 不吃或每週少於一次 |
| 重鹹醬料 | 從不或偶爾 |
| 睡眠 | 六小時以上且少於九小時 |
| 抽菸 | 不抽或已戒菸 |
| 飲酒 | 每週不超過一至二次或已戒酒 |
| 檳榔 | 不嚼或已戒檳 |
| 體位 | BMI 未達 24；有腰圍時，男性未達 90 cm、女性未達 80 cm |

## 自訂門檻

可只覆寫需要調整的欄位：

```ts
const report = buildMetabolicRiskReport({
  data: questionnaire,
  result: riskResult,
  modelName: "Model B",
  modelRoute: "未提供腰圍。",
  rules: {
    minSleepHours: 7,
    maxSleepHoursExclusive: 9,
    bmiThreshold: 25,
    adequateExercise: ["daily_or_more", "weekly_4_6", "weekly_2_3"],
  },
});
```

## 讓同類建議每次有不同說法

`variant` 控制文字組合。每次下載時傳入不同數字即可：

```ts
variant: Date.now()
```

如果需要可重現的固定報告，請傳入固定數字，例如 `variant: 100`。

## 使用自訂報告資料

若網站問卷欄位與範例完全不同，可略過 `buildMetabolicRiskReport`，直接建立 `PdfReportData`，再呼叫：

```ts
await downloadRiskPdf(customReport);
```

`PdfReportData` 的完整型別位於 `src/pdf-report.ts`。可將不需要的建議頁設為：

```ts
exercisePlan: null,
nutritionPlan: null,
lifestylePlan: [],
```

PDF 就不會產生這些頁面。

## 只取得 Blob，不立即下載

如果網站需要自行上傳、預覽或交給其他流程：

```ts
import { createRiskPdfBlob } from "./src";

const pdfBlob = await createRiskPdfBlob(report);
```

## 修改品牌

可用 `branding` 調整：

- `mark`：左上角一至兩個字元
- `name`：網站或系統名稱
- `subtitle`：報告副標題
- `footerLeft`：頁尾左側文字
- `footerRight`：頁尾右側文字
- `fileNamePrefix`：下載檔名前綴

## 技術限制

- 必須在瀏覽器環境執行，不能直接在伺服器端渲染流程中呼叫。
- 使用 Canvas 產生頁面，因此 PDF 內文主要為影像；官方資源連結仍可點擊。
- 建議使用支援 Canvas、Blob、`URL.createObjectURL` 的現代瀏覽器。
- 模組不包含風險模型，請傳入網站自己的風險分數與分層結果。
- 正式上線前，請由醫療或公衛專業人員確認門檻、建議文字、資源網址與免責聲明。

## 重新編譯

ZIP 已包含可直接使用的 `dist`，一般整合不需要重新編譯。如果修改了 `src`：

```bash
npm install
npm run build
```

最後可依 `整合檢查表.md` 逐項確認。
