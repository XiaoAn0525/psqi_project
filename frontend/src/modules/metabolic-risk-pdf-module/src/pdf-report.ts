export type PdfBranding = {
  mark: string;
  name: string;
  subtitle: string;
  footerLeft: string;
  footerRight: string;
  fileNamePrefix: string;
};

export type PdfReportData = {
  generatedAt: Date;
  modelName: string;
  modelRoute: string;
  riskKey: "low" | "intermediate" | "high";
  riskLabel: string;
  riskIndex: number;
  basicData: Array<{ label: string; value: string }>;
  habits: Array<{ label: string; value: string }>;
  factors: string[];
  recommendations: string[];
  priorities: Array<{ title: string; detail: string }>;
  exercisePlan: {
    goal: string;
    activities: string[];
    strength: string[];
    reduce: string[];
    safety: string[];
  } | null;
  nutritionPlan: {
    cards: Array<{ title: string; text: string; tone: "mint" | "warm" | "neutral" }>;
    reduce: string[];
    actionExample: string;
  } | null;
  lifestylePlan: Array<{ title: string; detail: string }>;
  platforms: Array<{ name: string; purpose: string; url: string }>;
  disclaimer: string;
  branding?: Partial<PdfBranding>;
};

type PdfLink = { url: string; x: number; y: number; width: number; height: number };
type RenderedPage = { canvas: HTMLCanvasElement; links: PdfLink[] };

const PAGE_WIDTH = 1240;
const PAGE_HEIGHT = 1754;
const PDF_WIDTH = 595.28;
const PDF_HEIGHT = 841.89;
const MARGIN = 82;
const FONT_STACK = '"Noto Sans TC", "PingFang TC", "Microsoft JhengHei", sans-serif';

const defaultBranding: PdfBranding = {
  mark: "M",
  name: "Health Report",
  subtitle: "個人健康風險報告",
  footerLeft: "本報告由瀏覽器即時產生，填寫資料未上傳或儲存。",
  footerRight: "健康風險報告",
  fileNamePrefix: "健康風險報告",
};

function getBranding(report: PdfReportData): PdfBranding {
  return { ...defaultBranding, ...report.branding };
}

const colors = {
  ink: "#17342f",
  muted: "#63736f",
  line: "#dbe4df",
  canvas: "#f2f6f3",
  mint: "#e7f3ed",
  teal: "#16836f",
  lime: "#cce86d",
  low: "#4d9f70",
  intermediate: "#e19e35",
  high: "#d9614d",
};

function roundedRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.arcTo(x + width, y, x + width, y + height, safeRadius);
  context.arcTo(x + width, y + height, x, y + height, safeRadius);
  context.arcTo(x, y + height, x, y, safeRadius);
  context.arcTo(x, y, x + width, y, safeRadius);
  context.closePath();
}

function fillRoundedRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number, fill: string) {
  context.fillStyle = fill;
  roundedRect(context, x, y, width, height, radius);
  context.fill();
}

function wrapText(context: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const lines: string[] = [];
  for (const paragraph of text.split("\n")) {
    let line = "";
    for (const character of Array.from(paragraph)) {
      const candidate = line + character;
      if (line && context.measureText(candidate).width > maxWidth) {
        lines.push(line);
        line = character;
      } else {
        line = candidate;
      }
    }
    lines.push(line || " ");
  }
  return lines;
}

function drawWrappedText(context: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const lines = wrapText(context, text, maxWidth);
  lines.forEach((line, index) => context.fillText(line, x, y + index * lineHeight));
  return y + lines.length * lineHeight;
}

function drawPageFrame(
  context: CanvasRenderingContext2D,
  report: PdfReportData,
  pageNumber: number,
  totalPages: number,
  pageTitle: string,
) {
  const branding = getBranding(report);
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT);
  context.fillStyle = colors.ink;
  context.fillRect(0, 0, PAGE_WIDTH, 18);

  fillRoundedRect(context, MARGIN, 72, 62, 62, 18, colors.ink);
  context.fillStyle = colors.lime;
  context.font = "700 35px Georgia, serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(branding.mark.slice(0, 2), MARGIN + 31, 103);

  context.textAlign = "left";
  context.textBaseline = "alphabetic";
  context.fillStyle = colors.ink;
  context.font = `700 28px ${FONT_STACK}`;
  context.fillText(branding.name, MARGIN + 82, 100);
  context.fillStyle = colors.muted;
  context.font = `500 18px ${FONT_STACK}`;
  context.fillText(branding.subtitle, MARGIN + 82, 128);

  context.textAlign = "right";
  context.fillStyle = colors.muted;
  context.font = `500 18px ${FONT_STACK}`;
  context.fillText(`第 ${pageNumber}／${totalPages} 頁`, PAGE_WIDTH - MARGIN, 91);
  context.fillText(new Intl.DateTimeFormat("zh-TW", {
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
  }).format(report.generatedAt), PAGE_WIDTH - MARGIN, 122);
  context.textAlign = "left";

  context.strokeStyle = colors.line;
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(MARGIN, 164);
  context.lineTo(PAGE_WIDTH - MARGIN, 164);
  context.stroke();

  context.fillStyle = colors.teal;
  context.font = `800 17px ${FONT_STACK}`;
  context.fillText(`0${pageNumber} — PERSONAL REPORT`, MARGIN, 210);
  context.fillStyle = colors.ink;
  context.font = `700 42px ${FONT_STACK}`;
  context.fillText(pageTitle, MARGIN, 260);

  context.strokeStyle = colors.line;
  context.beginPath();
  context.moveTo(MARGIN, PAGE_HEIGHT - 82);
  context.lineTo(PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 82);
  context.stroke();
  context.fillStyle = colors.muted;
  context.font = `500 16px ${FONT_STACK}`;
  context.fillText(branding.footerLeft, MARGIN, PAGE_HEIGHT - 48);
  context.textAlign = "right";
  context.fillText(branding.footerRight, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 48);
  context.textAlign = "left";
}

function drawSectionTitle(context: CanvasRenderingContext2D, number: string, title: string, y: number) {
  fillRoundedRect(context, MARGIN, y - 28, 42, 42, 12, colors.ink);
  context.fillStyle = colors.lime;
  context.font = `800 17px ${FONT_STACK}`;
  context.textAlign = "center";
  context.fillText(number, MARGIN + 21, y);
  context.textAlign = "left";
  context.fillStyle = colors.ink;
  context.font = `700 27px ${FONT_STACK}`;
  context.fillText(title, MARGIN + 58, y + 1);
}

function drawBulletList(
  context: CanvasRenderingContext2D,
  items: string[],
  x: number,
  y: number,
  maxWidth: number,
  options: { fontSize?: number; lineHeight?: number; gap?: number; accent?: string } = {},
) {
  const fontSize = options.fontSize ?? 19;
  const lineHeight = options.lineHeight ?? 29;
  const gap = options.gap ?? 18;
  const accent = options.accent ?? colors.teal;
  let currentY = y;
  context.font = `600 ${fontSize}px ${FONT_STACK}`;
  items.forEach((item) => {
    const lines = wrapText(context, item, maxWidth - 46);
    fillRoundedRect(context, x, currentY - 17, 26, 26, 8, accent);
    context.fillStyle = "#ffffff";
    context.font = `800 16px ${FONT_STACK}`;
    context.textAlign = "center";
    context.fillText("✓", x + 13, currentY + 3);
    context.textAlign = "left";
    context.fillStyle = colors.ink;
    context.font = `600 ${fontSize}px ${FONT_STACK}`;
    lines.forEach((line, index) => context.fillText(line, x + 43, currentY + index * lineHeight));
    currentY += lines.length * lineHeight + gap;
  });
  return currentY;
}

function createCanvas() {
  const canvas = document.createElement("canvas");
  canvas.width = PAGE_WIDTH;
  canvas.height = PAGE_HEIGHT;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("無法建立 PDF 畫布");
  return { canvas, context };
}

function renderOverviewPage(report: PdfReportData, pageNumber: number, totalPages: number): RenderedPage {
  const { canvas, context } = createCanvas();
  drawPageFrame(context, report, pageNumber, totalPages, "基本資料與風險結果");
  const accent = colors[report.riskKey];
  fillRoundedRect(context, MARGIN, 306, PAGE_WIDTH - MARGIN * 2, 270, 28, colors.canvas);
  context.fillStyle = accent;
  context.fillRect(MARGIN, 306, 16, 270);
  context.fillStyle = colors.muted;
  context.font = `700 18px ${FONT_STACK}`;
  context.fillText("前端示範風險指數", MARGIN + 58, 360);
  context.fillStyle = colors.ink;
  context.font = `700 64px ${FONT_STACK}`;
  context.fillText(report.riskLabel, MARGIN + 58, 438);
  context.fillStyle = accent;
  context.font = "700 98px Georgia, serif";
  context.fillText(String(report.riskIndex), MARGIN + 58, 535);
  context.fillStyle = colors.muted;
  context.font = `700 21px ${FONT_STACK}`;
  context.fillText("／100", MARGIN + 185, 528);

  context.fillStyle = "#ffffff";
  roundedRect(context, 660, 344, 424, 194, 20);
  context.fill();
  context.fillStyle = colors.muted;
  context.font = `600 17px ${FONT_STACK}`;
  context.fillText("模型路由", 704, 391);
  context.fillStyle = colors.ink;
  context.font = `700 31px ${FONT_STACK}`;
  context.fillText(report.modelName, 704, 431);
  context.fillStyle = colors.muted;
  context.font = `500 17px ${FONT_STACK}`;
  drawWrappedText(context, report.modelRoute, 704, 472, 330, 28);

  drawSectionTitle(context, "01", "基本資料", 644);
  const cellWidth = (PAGE_WIDTH - MARGIN * 2 - 18) / 2;
  const cellHeight = 102;
  report.basicData.forEach((item, index) => {
    const column = index % 2;
    const row = Math.floor(index / 2);
    const x = MARGIN + column * (cellWidth + 18);
    const y = 688 + row * (cellHeight + 14);
    fillRoundedRect(context, x, y, cellWidth, cellHeight, 17, "#f7f9f8");
    context.fillStyle = colors.muted;
    context.font = `600 16px ${FONT_STACK}`;
    context.fillText(item.label, x + 24, y + 34);
    context.fillStyle = colors.ink;
    context.font = `700 23px ${FONT_STACK}`;
    context.fillText(item.value, x + 24, y + 72);
  });

  const factorY = 688 + Math.ceil(report.basicData.length / 2) * (cellHeight + 14) + 48;
  drawSectionTitle(context, "02", "主要觀察項目", factorY);
  report.factors.forEach((factor, index) => {
    const y = factorY + 50 + index * 58;
    fillRoundedRect(context, MARGIN, y - 25, 34, 34, 10, accent);
    context.fillStyle = "#ffffff";
    context.font = `800 17px ${FONT_STACK}`;
    context.textAlign = "center";
    context.fillText(String(index + 1), MARGIN + 17, y - 1);
    context.textAlign = "left";
    context.fillStyle = colors.ink;
    context.font = `600 20px ${FONT_STACK}`;
    context.fillText(factor, MARGIN + 53, y);
  });
  return { canvas, links: [] };
}

function renderHabitsAndPrioritiesPage(report: PdfReportData, pageNumber: number, totalPages: number): RenderedPage {
  const { canvas, context } = createCanvas();
  drawPageFrame(context, report, pageNumber, totalPages, "生活習慣與建議");
  drawSectionTitle(context, "03", "生活習慣填答", 326);
  const cardWidth = (PAGE_WIDTH - MARGIN * 2 - 18) / 2;
  const cardHeight = 104;
  report.habits.forEach((item, index) => {
    const column = index % 2;
    const row = Math.floor(index / 2);
    const x = MARGIN + column * (cardWidth + 18);
    const y = 368 + row * (cardHeight + 14);
    fillRoundedRect(context, x, y, cardWidth, cardHeight, 17, "#f7f9f8");
    context.fillStyle = colors.muted;
    context.font = `600 15px ${FONT_STACK}`;
    context.fillText(item.label, x + 22, y + 31);
    context.fillStyle = colors.ink;
    context.font = `700 19px ${FONT_STACK}`;
    drawWrappedText(context, item.value, x + 22, y + 66, cardWidth - 44, 25);
  });

  drawSectionTitle(context, "04", "接下來先做什麼", 895);
  let currentY = 936;
  if (report.priorities.length === 0) {
    fillRoundedRect(context, MARGIN, currentY, PAGE_WIDTH - MARGIN * 2, 158, 20, colors.mint);
    context.fillStyle = colors.teal;
    context.font = `800 21px ${FONT_STACK}`;
    context.fillText("目前沒有觸發額外的生活習慣建議", MARGIN + 28, currentY + 49);
    context.fillStyle = colors.ink;
    context.font = `500 18px ${FONT_STACK}`;
    drawWrappedText(
      context,
      "依本次填答，運動、飲食、睡眠與菸酒檳等項目均未達提醒門檻。請維持現有習慣，並依個人病史與健檢結果持續追蹤。",
      MARGIN + 28,
      currentY + 91,
      PAGE_WIDTH - MARGIN * 2 - 56,
      28,
    );
    currentY += 178;
  }
  report.priorities.forEach((priority, index) => {
    context.font = `600 18px ${FONT_STACK}`;
    const lines = wrapText(context, priority.detail, PAGE_WIDTH - MARGIN * 2 - 112);
    const height = Math.max(105, 66 + lines.length * 26);
    fillRoundedRect(context, MARGIN, currentY, PAGE_WIDTH - MARGIN * 2, height, 18, colors.mint);
    fillRoundedRect(context, MARGIN + 20, currentY + 21, 48, 48, 14, colors.teal);
    context.fillStyle = "#ffffff";
    context.font = `800 20px ${FONT_STACK}`;
    context.textAlign = "center";
    context.fillText(String(index + 1), MARGIN + 44, currentY + 53);
    context.textAlign = "left";
    context.fillStyle = colors.ink;
    context.font = `700 21px ${FONT_STACK}`;
    context.fillText(priority.title, MARGIN + 86, currentY + 42);
    context.font = `500 18px ${FONT_STACK}`;
    lines.forEach((line, lineIndex) => context.fillText(line, MARGIN + 86, currentY + 76 + lineIndex * 26));
    currentY += height + 12;
  });

  fillRoundedRect(context, MARGIN, Math.min(currentY + 24, 1510), PAGE_WIDTH - MARGIN * 2, 92, 16, colors.canvas);
  context.fillStyle = colors.muted;
  context.font = `500 16px ${FONT_STACK}`;
  drawWrappedText(
    context,
    "未列出的建議代表該項目風險較低，但不代表醫療診斷，也不保證沒有健康風險。",
    MARGIN + 24,
    Math.min(currentY + 58, 1544),
    PAGE_WIDTH - MARGIN * 2 - 48,
    24,
  );
  return { canvas, links: [] };
}

function renderExercisePage(report: PdfReportData, pageNumber: number, totalPages: number): RenderedPage {
  const { canvas, context } = createCanvas();
  drawPageFrame(context, report, pageNumber, totalPages, "具體運動建議方案");
  if (!report.exercisePlan) throw new Error("缺少運動建議資料");
  fillRoundedRect(context, MARGIN, 306, PAGE_WIDTH - MARGIN * 2, 142, 22, colors.mint);
  context.fillStyle = colors.teal;
  context.font = `800 17px ${FONT_STACK}`;
  context.fillText("本週活動目標", MARGIN + 30, 348);
  context.fillStyle = colors.ink;
  context.font = `700 22px ${FONT_STACK}`;
  drawWrappedText(context, report.exercisePlan.goal, MARGIN + 30, 388, PAGE_WIDTH - MARGIN * 2 - 60, 32);

  drawSectionTitle(context, "05", "可以做哪些運動", 520);
  drawBulletList(context, report.exercisePlan.activities, MARGIN, 570, PAGE_WIDTH - MARGIN * 2, { fontSize: 19, lineHeight: 30, gap: 17 });
  drawSectionTitle(context, "06", "每週兩天簡單肌力", 880);
  drawBulletList(context, report.exercisePlan.strength, MARGIN, 930, PAGE_WIDTH - MARGIN * 2, { fontSize: 18, lineHeight: 28, gap: 16, accent: colors.ink });

  drawSectionTitle(context, "07", "少做什麼／安全提醒", 1218);
  const columnGap = 30;
  const columnWidth = (PAGE_WIDTH - MARGIN * 2 - columnGap) / 2;
  fillRoundedRect(context, MARGIN, 1255, columnWidth, 340, 18, "#fff8ed");
  fillRoundedRect(context, MARGIN + columnWidth + columnGap, 1255, columnWidth, 340, 18, "#f7f9f8");
  context.fillStyle = colors.intermediate;
  context.font = `800 18px ${FONT_STACK}`;
  context.fillText("先避免", MARGIN + 24, 1295);
  drawBulletList(context, report.exercisePlan.reduce, MARGIN + 24, 1336, columnWidth - 48, { fontSize: 16, lineHeight: 25, gap: 13, accent: colors.intermediate });
  const safetyX = MARGIN + columnWidth + columnGap + 24;
  context.fillStyle = colors.teal;
  context.font = `800 18px ${FONT_STACK}`;
  context.fillText("安全原則", safetyX, 1295);
  drawBulletList(context, report.exercisePlan.safety, safetyX, 1336, columnWidth - 48, { fontSize: 16, lineHeight: 24, gap: 11 });
  return { canvas, links: [] };
}

function renderNutritionPage(report: PdfReportData, pageNumber: number, totalPages: number): RenderedPage {
  const { canvas, context } = createCanvas();
  drawPageFrame(context, report, pageNumber, totalPages, "飲食建議");
  if (!report.nutritionPlan) throw new Error("缺少飲食建議資料");
  drawSectionTitle(context, "08", "需要調整的飲食項目", 326);
  const toneColors = { mint: colors.mint, warm: "#fff8ed", neutral: "#f7f9f8" };
  const cards = report.nutritionPlan.cards.map((card) => ({ ...card, fill: toneColors[card.tone] }));
  const gap = 18;
  const cardWidth = (PAGE_WIDTH - MARGIN * 2 - gap) / 2;
  const cardHeight = 220;
  cards.forEach((card, index) => {
    const x = MARGIN + (index % 2) * (cardWidth + gap);
    const y = 365 + Math.floor(index / 2) * (cardHeight + gap);
    fillRoundedRect(context, x, y, cardWidth, cardHeight, 18, card.fill);
    context.fillStyle = colors.teal;
    context.font = `800 19px ${FONT_STACK}`;
    context.fillText(card.title, x + 24, y + 42);
    context.fillStyle = colors.ink;
    context.font = `500 17px ${FONT_STACK}`;
    drawWrappedText(context, card.text, x + 24, y + 80, cardWidth - 48, 27);
  });

  const rows = Math.ceil(cards.length / 2);
  const cardsBottomY = 365 + rows * (cardHeight + gap) - gap;
  let contentEndY = cardsBottomY;
  if (report.nutritionPlan.reduce.length > 0) {
    const reduceTitleY = cardsBottomY + 58;
    drawSectionTitle(context, "09", "優先減少的食物與做法", reduceTitleY);
    contentEndY = drawBulletList(context, report.nutritionPlan.reduce, MARGIN, reduceTitleY + 50, PAGE_WIDTH - MARGIN * 2, { fontSize: 18, lineHeight: 28, gap: 15, accent: colors.intermediate });
  }
  const exampleY = Math.max(contentEndY + 44, 760);
  fillRoundedRect(context, MARGIN, exampleY, PAGE_WIDTH - MARGIN * 2, 210, 20, colors.canvas);
  context.fillStyle = colors.teal;
  context.font = `800 18px ${FONT_STACK}`;
  context.fillText("本週先做", MARGIN + 28, exampleY + 43);
  context.fillStyle = colors.ink;
  context.font = `600 18px ${FONT_STACK}`;
  drawWrappedText(context, report.nutritionPlan.actionExample, MARGIN + 28, exampleY + 87, PAGE_WIDTH - MARGIN * 2 - 56, 32);
  return { canvas, links: [] };
}

function renderLifestylePage(report: PdfReportData, pageNumber: number, totalPages: number): RenderedPage {
  const { canvas, context } = createCanvas();
  drawPageFrame(context, report, pageNumber, totalPages, "需要調整的生活行為");
  drawSectionTitle(context, "10", "依填答需要調整的行為", 326);
  let currentY = 365;
  report.lifestylePlan.forEach((item, index) => {
    context.font = `500 17px ${FONT_STACK}`;
    const lines = wrapText(context, item.detail, PAGE_WIDTH - MARGIN * 2 - 185);
    const height = Math.max(116, 48 + lines.length * 27);
    fillRoundedRect(context, MARGIN, currentY, PAGE_WIDTH - MARGIN * 2, height, 18, index % 2 ? "#f7f9f8" : colors.mint);
    context.fillStyle = colors.teal;
    context.font = `800 19px ${FONT_STACK}`;
    context.fillText(item.title, MARGIN + 26, currentY + 42);
    context.fillStyle = colors.ink;
    context.font = `500 17px ${FONT_STACK}`;
    lines.forEach((line, lineIndex) => context.fillText(line, MARGIN + 158, currentY + 42 + lineIndex * 27));
    currentY += height + 12;
  });

  const trackerY = Math.max(currentY + 34, 1170);
  drawSectionTitle(context, "11", "四週追蹤清單", trackerY);
  const trackerText: Record<string, string> = {
    睡眠: "記錄睡眠時段與白天精神狀況",
    體重與腰圍紀錄: "每週相近時段記錄體重／腰圍趨勢",
    菸品與二手菸: "記錄吸菸或二手菸暴露的時間與情境",
    飲酒: "記錄飲酒日期、份量與無酒日",
    檳榔: "記錄嚼檳榔頻率、情境與停止進度",
  };
  const trackerItems = report.lifestylePlan.map((item) => trackerText[item.title] ?? `記錄「${item.title}」的每週變化`);
  const trackerWidth = (PAGE_WIDTH - MARGIN * 2 - 18) / 2;
  trackerItems.forEach((item, index) => {
    const x = MARGIN + (index % 2) * (trackerWidth + 18);
    const y = trackerY + 42 + Math.floor(index / 2) * 112;
    fillRoundedRect(context, x, y, trackerWidth, 94, 16, colors.canvas);
    fillRoundedRect(context, x + 20, y + 28, 30, 30, 9, colors.ink);
    context.fillStyle = colors.lime;
    context.font = `800 16px ${FONT_STACK}`;
    context.textAlign = "center";
    context.fillText("□", x + 35, y + 49);
    context.textAlign = "left";
    context.fillStyle = colors.ink;
    context.font = `600 17px ${FONT_STACK}`;
    drawWrappedText(context, item, x + 66, y + 37, trackerWidth - 88, 25);
  });
  return { canvas, links: [] };
}

function displayUrl(url: string) {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function renderPlatformsPage(report: PdfReportData, pageNumber: number, totalPages: number): RenderedPage {
  const { canvas, context } = createCanvas();
  const links: PdfLink[] = [];
  drawPageFrame(context, report, pageNumber, totalPages, "相關官方資源");
  context.fillStyle = colors.muted;
  context.font = `500 18px ${FONT_STACK}`;
  context.fillText("點選任一卡片即可開啟對應網站；服務內容與資格以各平台最新公告為準。", MARGIN, 306);

  const gap = 18;
  const cardWidth = (PAGE_WIDTH - MARGIN * 2 - gap) / 2;
  const cardHeight = 224;
  const top = 338;
  report.platforms.slice(0, 8).forEach((platform, index) => {
    const x = MARGIN + (index % 2) * (cardWidth + gap);
    const y = top + Math.floor(index / 2) * (cardHeight + 15);
    fillRoundedRect(context, x, y, cardWidth, cardHeight, 18, index % 2 ? "#f7f9f8" : colors.mint);
    context.fillStyle = colors.teal;
    context.font = `800 19px ${FONT_STACK}`;
    drawWrappedText(context, platform.name, x + 24, y + 42, cardWidth - 72, 27);
    context.fillStyle = colors.ink;
    context.font = `500 16px ${FONT_STACK}`;
    drawWrappedText(context, platform.purpose, x + 24, y + 94, cardWidth - 48, 25);
    context.fillStyle = colors.teal;
    context.font = `600 14px ${FONT_STACK}`;
    drawWrappedText(context, displayUrl(platform.url), x + 24, y + 181, cardWidth - 72, 21);
    context.font = `800 28px ${FONT_STACK}`;
    context.textAlign = "right";
    context.fillText("↗", x + cardWidth - 24, y + 48);
    context.textAlign = "left";
    links.push({ url: platform.url, x, y, width: cardWidth, height: cardHeight });
  });

  const rows = Math.ceil(Math.min(report.platforms.length, 8) / 2);
  const noteY = top + rows * (cardHeight + 15) + 32;
  fillRoundedRect(context, MARGIN, noteY, PAGE_WIDTH - MARGIN * 2, 190, 18, "#fff8ed");
  context.fillStyle = colors.intermediate;
  context.font = `800 18px ${FONT_STACK}`;
  context.fillText("使用提醒", MARGIN + 26, noteY + 42);
  context.fillStyle = colors.ink;
  context.font = `500 16px ${FONT_STACK}`;
  drawWrappedText(context, report.disclaimer, MARGIN + 26, noteY + 78, PAGE_WIDTH - MARGIN * 2 - 52, 25);
  return { canvas, links };
}

async function canvasToJpeg(canvas: HTMLCanvasElement) {
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((value) => (value ? resolve(value) : reject(new Error("無法產生 PDF 頁面"))), "image/jpeg", 0.92);
  });
  return new Uint8Array(await blob.arrayBuffer());
}

function escapePdfString(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function createPdf(pages: Array<{ image: Uint8Array; links: PdfLink[] }>) {
  const encoder = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const offsets: number[] = [0];
  let byteLength = 0;
  const push = (value: string | Uint8Array) => {
    const bytes = typeof value === "string" ? encoder.encode(value) : value;
    chunks.push(bytes);
    byteLength += bytes.length;
  };
  push(new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34, 0x0a, 0x25, 0xe2, 0xe3, 0xcf, 0xd3, 0x0a]));

  let nextObjectId = 3;
  const pageObjects = pages.map((page, index) => {
    const pageId = nextObjectId++;
    const imageId = nextObjectId++;
    const contentId = nextObjectId++;
    const annotationIds = page.links.map(() => nextObjectId++);
    return { ...page, index, pageId, imageId, contentId, annotationIds };
  });
  const maxObjectId = nextObjectId - 1;
  const objects = new Map<number, () => void>();
  objects.set(1, () => push("<< /Type /Catalog /Pages 2 0 R >>"));
  objects.set(2, () => push(`<< /Type /Pages /Kids [${pageObjects.map((page) => `${page.pageId} 0 R`).join(" ")}] /Count ${pages.length} >>`));

  pageObjects.forEach((page) => {
    const imageName = `Im${page.index + 1}`;
    const content = `q\n${PDF_WIDTH} 0 0 ${PDF_HEIGHT} 0 0 cm\n/${imageName} Do\nQ\n`;
    const annotations = page.annotationIds.length ? ` /Annots [${page.annotationIds.map((id) => `${id} 0 R`).join(" ")}]` : "";
    objects.set(page.pageId, () => push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PDF_WIDTH} ${PDF_HEIGHT}] /Resources << /XObject << /${imageName} ${page.imageId} 0 R >> >> /Contents ${page.contentId} 0 R${annotations} >>`));
    objects.set(page.imageId, () => {
      push(`<< /Type /XObject /Subtype /Image /Width ${PAGE_WIDTH} /Height ${PAGE_HEIGHT} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${page.image.length} >>\nstream\n`);
      push(page.image);
      push("\nendstream");
    });
    objects.set(page.contentId, () => {
      const contentBytes = encoder.encode(content);
      push(`<< /Length ${contentBytes.length} >>\nstream\n`);
      push(contentBytes);
      push("endstream");
    });
    page.links.forEach((link, index) => {
      const x1 = (link.x / PAGE_WIDTH) * PDF_WIDTH;
      const x2 = ((link.x + link.width) / PAGE_WIDTH) * PDF_WIDTH;
      const y1 = PDF_HEIGHT - ((link.y + link.height) / PAGE_HEIGHT) * PDF_HEIGHT;
      const y2 = PDF_HEIGHT - (link.y / PAGE_HEIGHT) * PDF_HEIGHT;
      objects.set(page.annotationIds[index], () => push(`<< /Type /Annot /Subtype /Link /Rect [${x1.toFixed(2)} ${y1.toFixed(2)} ${x2.toFixed(2)} ${y2.toFixed(2)}] /Border [0 0 0] /A << /S /URI /URI (${escapePdfString(link.url)}) >> >>`));
    });
  });

  for (let objectId = 1; objectId <= maxObjectId; objectId += 1) {
    offsets[objectId] = byteLength;
    push(`${objectId} 0 obj\n`);
    objects.get(objectId)?.();
    push("\nendobj\n");
  }
  const xrefOffset = byteLength;
  push(`xref\n0 ${maxObjectId + 1}\n`);
  push("0000000000 65535 f \n");
  for (let objectId = 1; objectId <= maxObjectId; objectId += 1) push(`${String(offsets[objectId]).padStart(10, "0")} 00000 n \n`);
  push(`trailer\n<< /Size ${maxObjectId + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);
  const blobParts = chunks.map((chunk) => {
    const copy = new Uint8Array(chunk.length);
    copy.set(chunk);
    return copy.buffer;
  });
  return new Blob(blobParts, { type: "application/pdf" });
}

function fileTimestamp(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}_${pad(date.getHours())}${pad(date.getMinutes())}`;
}

export async function createRiskPdfBlob(report: PdfReportData) {
  if ("fonts" in document) await document.fonts.ready;
  const pageRenderers: Array<(pageNumber: number, totalPages: number) => RenderedPage> = [
    (pageNumber, totalPages) => renderOverviewPage(report, pageNumber, totalPages),
    (pageNumber, totalPages) => renderHabitsAndPrioritiesPage(report, pageNumber, totalPages),
  ];
  if (report.exercisePlan) {
    pageRenderers.push((pageNumber, totalPages) => renderExercisePage(report, pageNumber, totalPages));
  }
  if (report.nutritionPlan) {
    pageRenderers.push((pageNumber, totalPages) => renderNutritionPage(report, pageNumber, totalPages));
  }
  if (report.lifestylePlan.length > 0) {
    pageRenderers.push((pageNumber, totalPages) => renderLifestylePage(report, pageNumber, totalPages));
  }
  pageRenderers.push((pageNumber, totalPages) => renderPlatformsPage(report, pageNumber, totalPages));

  const totalPages = pageRenderers.length;
  const renderedPages = pageRenderers.map((renderPage, index) => renderPage(index + 1, totalPages));
  const images = await Promise.all(renderedPages.map((page) => canvasToJpeg(page.canvas)));
  return createPdf(renderedPages.map((page, index) => ({ image: images[index], links: page.links })));
}

export async function downloadRiskPdf(report: PdfReportData) {
  const pdf = await createRiskPdfBlob(report);
  const url = URL.createObjectURL(pdf);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${getBranding(report).fileNamePrefix}_${fileTimestamp(report.generatedAt)}.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

/** 與原網站相容的舊函式名稱。 */
export const downloadMetabolicRiskPdf = downloadRiskPdf;
