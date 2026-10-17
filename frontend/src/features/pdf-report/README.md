# 可移植 PDF 報告模組

## 網頁同風格版

已依原網站 MetabolicResult.css 套用薄荷綠背景、青綠色標籤、深藍灰文字、
23px 白色圓角卡片，以及綠／金／紅風險色。個人資料與建議邏輯不變。
整個 pdf-report 資料夾覆蓋原模組即可；新增的 reportTheme.js 必須一併複製。
所有報告 CSS 都限定於報告內，不會改動網站的同名元件。
PDF 上下保留分頁邊界。字型採用使用者裝置可用的微軟正黑體／Noto Sans TC。

這個資料夾把 PDF 功能拆成三個可替換的拼塊：

- `generatePdfReport.js`：與框架無關的 PDF 核心及版面。
- `PdfDownloadButton.jsx`：React 專案可直接使用的下載按鈕。
- `PdfDownloadButton.css`：按鈕的獨立樣式，不依賴原網站 CSS。
- `metabolicReportAdapter.js`：此網站的欄位轉接器；換網站時通常只需替換這一檔。

## 放到另一個 React 網站

1. 複製整個 `pdf-report` 資料夾到新專案。
2. 執行 `npm install html2pdf.js`。
3. 依新網站資料格式修改 adapter，讓它回傳與本模組相同的 report 物件。
4. 在結果頁加入：

```jsx
import {
  createMetabolicPdfReport,
  PdfDownloadButton,
} from "./features/pdf-report";

const pdfReport = createMetabolicPdfReport(
  riskResult,
  personalData,
);

<PdfDownloadButton
  report={pdfReport}
  className="your-button-class"
/>
```

其中 `riskResult` 是後端回傳的風險結果，`personalData` 是使用者填寫的
基本資料與生活習慣。若新網站欄位名稱不同，只需修改
`metabolicReportAdapter.js`，不必更動 PDF 產生器。

## 放到非 React 網站

保留 `generatePdfReport.js`，直接呼叫：

```js
import { downloadPdfReport } from "./pdf-report/generatePdfReport";

await downloadPdfReport(yourReportObject);
```

`yourReportObject` 只需要提供 `title`、`sections`、`risk`、
`recommendations` 等標準欄位，不需改動 PDF 核心。
