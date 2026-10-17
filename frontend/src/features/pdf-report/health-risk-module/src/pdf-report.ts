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
  riskIndex: number | null;
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
const FONT_STACK = '"Microsoft JhengHei UI", "Microsoft JhengHei", "Noto Sans TC", "PingFang TC", Arial, sans-serif';

const defaultBranding: PdfBranding = {
  mark: "♥",
  name: "代謝症候群風險篩檢",
  subtitle: "個人健康風險報告",
  footerLeft: "本報告由瀏覽器產生，僅供初步健康風險篩檢。",
  footerRight: "健康風險報告",
  fileNamePrefix: "健康風險報告",
};

function getBranding(report: PdfReportData): PdfBranding {
  return { ...defaultBranding, ...report.branding };
}

const colors = {
  ink: "#263345",
  muted: "#748293",
  line: "#dfe8e9",
  canvas: "#f4fbfa",
  mint: "#e6f7f4",
  teal: "#17897f",
  lime: "#e2f6f2",
  low: "#268b71",
  intermediate: "#b6822c",
  high: "#cc5e5e",
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

function iconGlyphForText(text: string) {
  const rules: Array<[string[], string]> = [
    [["睡眠", "睡覺"], "眠"], [["菸", "抽菸", "吸菸", "二手菸"], "菸"],
    [["飲酒", "酒"], "酒"], [["檳榔", "檳"], "檳"], [["運動", "活動"], "動"],
    [["蔬菜"], "菜"], [["水果"], "果"], [["炸物", "加工"], "炸"],
    [["重鹹", "烹調", "調味", "醬", "鹽"], "鹽"], [["體重", "腰圍", "BMI"], "量"],
    [["主食"], "穀"], [["蛋白"], "蛋"],
  ];
  return rules.find(([keywords]) => keywords.some((keyword) => text.includes(keyword)))?.[1] ?? "健";
}

function drawIconBadge(context: CanvasRenderingContext2D, text: string, x: number, y: number, fill = colors.teal) {
  fillRoundedRect(context, x, y, 38, 38, 11, fill);
  context.fillStyle = "#ffffff";
  context.font = `800 18px ${FONT_STACK}`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(iconGlyphForText(text), x + 19, y + 20);
  context.textAlign = "left";
  context.textBaseline = "alphabetic";
}

// Vector icons remain sharp and do not depend on emoji fonts.
function drawHabitIcon(context: CanvasRenderingContext2D, label: string, x: number, y: number) {
  context.save();
  context.translate(x, y);
  fillRoundedRect(context, 0, 0, 38, 38, 11, colors.mint);
  context.strokeStyle = colors.teal;
  context.fillStyle = colors.teal;
  context.lineWidth = 2;
  context.lineCap = "round";
  context.lineJoin = "round";
  const path = (points: number[][]) => {
    context.beginPath();
    points.forEach(([px, py], i) => i ? context.lineTo(px, py) : context.moveTo(px, py));
    context.stroke();
  };
  if (/睡眠/.test(label)) {
    context.beginPath(); context.arc(19, 19, 11, 0, Math.PI * 2); context.stroke();
    context.fillStyle = colors.mint;
    context.beginPath(); context.arc(24, 14, 10, 0, Math.PI * 2); context.fill();
    context.fillStyle = colors.teal;
    path([[27, 7], [27, 13]]); path([[24, 10], [30, 10]]);
  } else if (/腰圍/.test(label)) {
    roundedRect(context, 7, 12, 24, 15, 4); context.stroke();
    for (const px of [12, 17, 22, 27]) path([[px, 13], [px, px === 17 || px === 27 ? 20 : 17]]);
  } else if (/運動|活動/.test(label)) {
    context.beginPath(); context.arc(23, 10, 3, 0, Math.PI * 2); context.fill();
    path([[12, 18], [19, 15], [24, 20], [29, 20]]);
    path([[19, 15], [17, 24], [11, 29]]);
    path([[17, 24], [24, 26], [26, 31]]);
  } else if (/菸/.test(label)) {
    context.strokeRect(8, 23, 22, 6); path([[24, 23], [24, 29]]);
    path([[13, 19], [11, 15], [14, 11]]);
    path([[21, 19], [19, 15], [22, 10]]);
  } else if (/酒/.test(label)) {
    path([[11, 9], [27, 9], [25, 21], [19, 25], [13, 21], [11, 9]]);
    path([[12, 16], [26, 16]]); path([[19, 25], [19, 31]]); path([[13, 31], [25, 31]]);
  } else if (/檳/.test(label)) {
    context.beginPath(); context.ellipse(19, 23, 8, 10, -0.2, 0, Math.PI * 2); context.stroke();
    path([[19, 17], [19, 30]]);
    path([[19, 13], [20, 7], [27, 9], [23, 13], [19, 13]]);
  } else if (/蔬菜|水果/.test(label)) {
    path([[19, 30], [19, 14]]);
    path([[19, 22], [11, 20], [8, 12], [16, 14], [19, 22]]);
    path([[19, 17], [23, 10], [30, 8], [28, 16], [19, 20]]);
  } else if (/鹽|醬/.test(label)) {
    roundedRect(context, 12, 13, 15, 18, 4); context.stroke();
    path([[13, 13], [14, 8], [25, 8], [26, 13]]);
    for (const px of [17, 22]) { context.beginPath(); context.arc(px, 11, 0.8, 0, Math.PI * 2); context.fill(); }
  } else {
    path([[8, 20], [30, 20], [26, 29], [12, 29], [8, 20]]);
    path([[13, 16], [12, 12], [14, 8]]);
    path([[20, 16], [19, 12], [21, 8]]);
    path([[27, 16], [26, 12], [28, 8]]);
  }
  context.restore();
}

function wrapText(context: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const lines: string[] = [];
  const closingPunctuation = "，。！？；：、）】》」』％…";
  for (const paragraph of text.split("\n")) {
    let line = "";
    for (const character of Array.from(paragraph)) {
      const candidate = line + character;
      if (line && context.measureText(candidate).width > maxWidth) {
        if (closingPunctuation.includes(character)) {
          line = candidate;
        } else {
          lines.push(line);
          line = character;
        }
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
  const background = context.createLinearGradient(0, 0, 0, PAGE_HEIGHT);
  background.addColorStop(0, "#f4fbfa");
  background.addColorStop(0.45, "#ffffff");
  background.addColorStop(1, "#f7fafc");
  context.fillStyle = background;
  context.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT);
  fillRoundedRect(context, 54, 284, PAGE_WIDTH - 108, PAGE_HEIGHT - 400, 36, "#ffffff");
  context.fillStyle = colors.teal;
  context.fillRect(0, 0, PAGE_WIDTH, 18);

  fillRoundedRect(context, MARGIN, 72, 62, 62, 18, colors.lime);
  context.fillStyle = colors.teal;
  context.font = "700 35px ${FONT_STACK}";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(branding.mark.slice(0, 2), MARGIN + 31, 103);

  context.textAlign = "left";
  context.textBaseline = "alphabetic";
  context.fillStyle = colors.ink;
  context.font = `700 28px ${FONT_STACK}`;
  context.fillText(branding.name, MARGIN + 82, 100);
  context.fillStyle = colors.muted;
  context.font = `500 22px ${FONT_STACK}`;
  context.fillText(branding.subtitle, MARGIN + 82, 128);

  context.textAlign = "right";
  context.fillStyle = colors.muted;
  context.font = `500 22px ${FONT_STACK}`;
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
  context.font = `500 20px ${FONT_STACK}`;
  context.fillText(branding.footerLeft, MARGIN, PAGE_HEIGHT - 48);
  context.textAlign = "right";
  context.fillText(branding.footerRight, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 48);
  context.textAlign = "left";
}

function drawSectionTitle(context: CanvasRenderingContext2D, number: string, title: string, y: number) {
  fillRoundedRect(context, MARGIN, y - 28, 42, 42, 12, colors.mint);
  context.fillStyle = colors.teal;
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
  const fontSize = options.fontSize ?? 25;
  const lineHeight = options.lineHeight ?? 35;
  const gap = options.gap ?? 18;
  const accent = options.accent ?? colors.teal;
  let currentY = y;
  context.font = `600 ${fontSize}px ${FONT_STACK}`;
  items.forEach((item) => {
    const lines = wrapText(context, item, maxWidth - 46);
    fillRoundedRect(context, x, currentY - 17, 26, 26, 8, accent);
    context.fillStyle = "#ffffff";
    context.font = `800 18px ${FONT_STACK}`;
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
  context.font = `700 21px ${FONT_STACK}`;
  context.fillText("本次初步風險評估", MARGIN + 58, 360);
  context.fillStyle = colors.ink;
  const riskValueX = MARGIN + 58;
  let riskValueWidth = 0;

  context.fillStyle = accent;
  context.font = `700 98px ${FONT_STACK}`;

  if (report.riskIndex !== null) {
    const riskText =
      String(report.riskIndex);

    context.fillText(
      riskText,
      riskValueX,
      535
    );

    riskValueWidth =
      context.measureText(riskText).width;
  }

  context.fillStyle = colors.muted;
  context.font = `700 21px ${FONT_STACK}`;

  if (report.riskIndex === null) {
    context.fillText(
      "依本次填答進行分層",
      riskValueX,
      528
    );
  } else {
    context.fillText(
      "／100",
      riskValueX + riskValueWidth + 12,
      528
    );
  }

  context.fillStyle = "#ffffff";
  roundedRect(context, 660, 344, 424, 194, 20);
  context.fill();
  context.fillStyle = colors.muted;
  context.font = `600 20px ${FONT_STACK}`;
  context.fillText("評估方式", 704, 391);
  context.fillStyle = colors.ink;
  context.font = `700 31px ${FONT_STACK}`;
  context.fillText(report.modelName, 704, 431);
  context.fillStyle = colors.muted;
  context.font = `500 23px ${FONT_STACK}`;
  drawWrappedText(context, report.modelRoute, 704, 472, 330, 34);

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
    context.font = `600 21px ${FONT_STACK}`;
    context.fillText(item.label, x + 24, y + 34);
    context.fillStyle = colors.ink;
    context.font = `700 27px ${FONT_STACK}`;
    context.fillText(item.value, x + 24, y + 72);
  });

  return { canvas, links: [] };
}

function renderFactorsPage(report: PdfReportData, pageNumber: number, totalPages: number): RenderedPage {
  const { canvas, context } = createCanvas();
  drawPageFrame(context, report, pageNumber, totalPages, "主要觀察項目");
  const accent = colors[report.riskKey];
  const factorY = 326;
  drawSectionTitle(context, "02", "主要觀察項目", factorY);
  let cursorY = factorY + 58;
  report.factors.forEach((factor, index) => {
    const y = cursorY;
    fillRoundedRect(context, MARGIN, y - 25, 34, 34, 10, accent);
    context.fillStyle = "#ffffff";
    context.font = `800 17px ${FONT_STACK}`;
    context.textAlign = "center";
    context.fillText(String(index + 1), MARGIN + 17, y - 1);
    context.textAlign = "left";
    context.fillStyle = colors.ink;
    context.font = `600 25px ${FONT_STACK}`;
    const lines = wrapText(context, factor, PAGE_WIDTH - MARGIN * 2 - 60);
    lines.forEach((line, i) => context.fillText(line, MARGIN + 53, y + i * 38));
    cursorY += lines.length * 38 + 24;
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
    drawHabitIcon(context, item.label, x + 20, y + 19);
    context.fillStyle = colors.muted;
    context.font = `600 20px ${FONT_STACK}`;
    context.fillText(item.label, x + 70, y + 32);
    context.fillStyle = colors.ink;
    context.font = `700 25px ${FONT_STACK}`;
    drawWrappedText(context, item.value, x + 70, y + 68, cardWidth - 92, 33);
  });

  const habitRows = Math.ceil(report.habits.length / 2);
  const habitsBottomY = 368 + habitRows * (cardHeight + 14) - 14;
  const prioritiesTitleY = habitsBottomY + 40;
  drawSectionTitle(context, "04", "接下來先做什麼", prioritiesTitleY);
  let currentY = prioritiesTitleY + 42;
  if (report.priorities.length === 0) {
    fillRoundedRect(context, MARGIN, currentY, PAGE_WIDTH - MARGIN * 2, 158, 20, colors.mint);
    context.fillStyle = colors.teal;
    context.font = `800 25px ${FONT_STACK}`;
    context.fillText("目前沒有觸發額外的生活習慣建議", MARGIN + 28, currentY + 49);
    context.fillStyle = colors.ink;
    context.font = `500 24px ${FONT_STACK}`;
    drawWrappedText(
      context,
      "依本次已提供的資料，未觸發額外建議；未詢問或未提供的項目無法判斷。請依個人病史與健檢結果持續追蹤。",
      MARGIN + 28,
      currentY + 91,
      PAGE_WIDTH - MARGIN * 2 - 56,
      35,
    );
    currentY += 178;
  }
  report.priorities.forEach((priority, index) => {
    context.font = `600 22px ${FONT_STACK}`;
    const lines = wrapText(context, priority.detail, PAGE_WIDTH - MARGIN * 2 - 112);
    const height = Math.max(114, 70 + lines.length * 32);
    fillRoundedRect(context, MARGIN, currentY, PAGE_WIDTH - MARGIN * 2, height, 18, colors.mint);
    fillRoundedRect(context, MARGIN + 20, currentY + 21, 48, 48, 14, colors.teal);
    context.fillStyle = "#ffffff";
    context.font = `800 20px ${FONT_STACK}`;
    context.textAlign = "center";
    context.fillText(String(index + 1), MARGIN + 44, currentY + 53);
    context.textAlign = "left";
    context.fillStyle = colors.ink;
    context.font = `700 25px ${FONT_STACK}`;
    context.fillText(priority.title, MARGIN + 86, currentY + 42);
    context.font = `500 22px ${FONT_STACK}`;
    lines.forEach((line, lineIndex) => context.fillText(line, MARGIN + 86, currentY + 78 + lineIndex * 32));
    currentY += height + 8;
  });

  const noteY = currentY + 18;
  fillRoundedRect(context, MARGIN, noteY, PAGE_WIDTH - MARGIN * 2, 98, 16, colors.canvas);
  context.fillStyle = colors.muted;
  context.font = `500 22px ${FONT_STACK}`;
  drawWrappedText(
    context,
    "未列出建議可能因資料不足或未達提醒條件，不代表沒有健康風險。本報告不取代醫療診斷。",
    MARGIN + 24,
    noteY + 38,
    PAGE_WIDTH - MARGIN * 2 - 48,
    31,
  );
  return { canvas, links: [] };
}

function renderExercisePage(report: PdfReportData, pageNumber: number, totalPages: number): RenderedPage {
  const { canvas, context } = createCanvas();
  drawPageFrame(context, report, pageNumber, totalPages, "具體運動建議方案");
  if (!report.exercisePlan) throw new Error("缺少運動建議資料");
  fillRoundedRect(context, MARGIN, 306, PAGE_WIDTH - MARGIN * 2, 150, 22, colors.mint);
  context.fillStyle = colors.teal;
  context.font = `800 21px ${FONT_STACK}`;
  context.fillText("本週活動目標", MARGIN + 30, 348);
  context.fillStyle = colors.ink;
  context.font = `700 27px ${FONT_STACK}`;
  drawWrappedText(context, report.exercisePlan.goal, MARGIN + 30, 392, PAGE_WIDTH - MARGIN * 2 - 60, 38);

  const activitiesTitleY = 486;
  drawSectionTitle(context, "05", "可以做哪些運動", activitiesTitleY);
  const activitiesEndY = drawBulletList(context, report.exercisePlan.activities, MARGIN, activitiesTitleY + 50, PAGE_WIDTH - MARGIN * 2, { fontSize: 25, lineHeight: 36, gap: 17 });
  const strengthTitleY = activitiesEndY + 38;
  drawSectionTitle(context, "06", "每週兩天簡單肌力", strengthTitleY);
  const strengthEndY = drawBulletList(context, report.exercisePlan.strength, MARGIN, strengthTitleY + 50, PAGE_WIDTH - MARGIN * 2, { fontSize: 24, lineHeight: 35, gap: 16, accent: colors.ink });

  const safetyTitleY = strengthEndY + 38;
  drawSectionTitle(context, "07", "少做什麼／安全提醒", safetyTitleY);
  const columnGap = 30;
  const columnWidth = (PAGE_WIDTH - MARGIN * 2 - columnGap) / 2;
  const safetyPanelY = safetyTitleY + 38;
  fillRoundedRect(context, MARGIN, safetyPanelY, columnWidth, 380, 18, "#fff8ed");
  fillRoundedRect(context, MARGIN + columnWidth + columnGap, safetyPanelY, columnWidth, 380, 18, "#f7f9f8");
  context.fillStyle = colors.intermediate;
  context.font = `800 21px ${FONT_STACK}`;
  context.fillText("先避免", MARGIN + 24, safetyPanelY + 40);
  drawBulletList(context, report.exercisePlan.reduce, MARGIN + 24, safetyPanelY + 81, columnWidth - 48, { fontSize: 22, lineHeight: 32, gap: 13, accent: colors.intermediate });
  const safetyX = MARGIN + columnWidth + columnGap + 24;
  context.fillStyle = colors.teal;
  context.font = `800 21px ${FONT_STACK}`;
  context.fillText("安全原則", safetyX, safetyPanelY + 40);
  drawBulletList(context, report.exercisePlan.safety, safetyX, safetyPanelY + 81, columnWidth - 48, { fontSize: 22, lineHeight: 32, gap: 11 });
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
  const cardHeight = 248;
  cards.forEach((card, index) => {
    const x = MARGIN + (index % 2) * (cardWidth + gap);
    const y = 365 + Math.floor(index / 2) * (cardHeight + gap);
    fillRoundedRect(context, x, y, cardWidth, cardHeight, 18, card.fill);
    context.fillStyle = colors.teal;
    context.font = `800 23px ${FONT_STACK}`;
    context.fillText(card.title, x + 24, y + 45);
    context.fillStyle = colors.ink;
    context.font = `500 23px ${FONT_STACK}`;
    drawWrappedText(context, card.text, x + 24, y + 84, cardWidth - 48, 34);
  });

  const rows = Math.ceil(cards.length / 2);
  const cardsBottomY = 365 + rows * (cardHeight + gap) - gap;
  let contentEndY = cardsBottomY;
  if (report.nutritionPlan.reduce.length > 0) {
    const reduceTitleY = cardsBottomY + 40;
    drawSectionTitle(context, "09", "優先減少的食物與做法", reduceTitleY);
    contentEndY = drawBulletList(context, report.nutritionPlan.reduce, MARGIN, reduceTitleY + 50, PAGE_WIDTH - MARGIN * 2, { fontSize: 24, lineHeight: 35, gap: 15, accent: colors.intermediate });
  }
  const exampleY = contentEndY + 24;
  fillRoundedRect(context, MARGIN, exampleY, PAGE_WIDTH - MARGIN * 2, 220, 20, colors.canvas);
  context.fillStyle = colors.teal;
  context.font = `800 22px ${FONT_STACK}`;
  context.fillText("本週先做", MARGIN + 28, exampleY + 43);
  context.fillStyle = colors.ink;
  context.font = `600 24px ${FONT_STACK}`;
  drawWrappedText(context, report.nutritionPlan.actionExample, MARGIN + 28, exampleY + 91, PAGE_WIDTH - MARGIN * 2 - 56, 39);
  return { canvas, links: [] };
}

function renderLifestylePage(report: PdfReportData, pageNumber: number, totalPages: number): RenderedPage {
  const { canvas, context } = createCanvas();
  drawPageFrame(context, report, pageNumber, totalPages, "需要調整的生活行為");
  drawSectionTitle(context, "10", "依填答需要調整的行為", 326);
  let currentY = 365;
  report.lifestylePlan.forEach((item, index) => {
    context.font = `500 23px ${FONT_STACK}`;
    const lines = wrapText(context, item.detail, PAGE_WIDTH - MARGIN * 2 - 52);
    const height = Math.max(140, 94 + lines.length * 34);
    fillRoundedRect(context, MARGIN, currentY, PAGE_WIDTH - MARGIN * 2, height, 18, index % 2 ? "#f7f9f8" : colors.mint);
    context.fillStyle = colors.teal;
    context.font = `800 23px ${FONT_STACK}`;
    context.fillText(item.title, MARGIN + 26, currentY + 43);
    context.fillStyle = colors.ink;
    context.font = `500 23px ${FONT_STACK}`;
    lines.forEach((line, lineIndex) => context.fillText(line, MARGIN + 26, currentY + 82 + lineIndex * 34));
    currentY += height + 12;
  });

  const trackerY = currentY + 34;
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
    const y = trackerY + 42 + Math.floor(index / 2) * 128;
    fillRoundedRect(context, x, y, trackerWidth, 110, 16, colors.canvas);
    context.save();
    context.strokeStyle = colors.teal;
    context.lineWidth = 2.5;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.beginPath();
    context.arc(x + 35, y + 43, 15, 0, Math.PI * 2);
    context.stroke();
    context.beginPath();
    context.moveTo(x + 28, y + 43);
    context.lineTo(x + 33, y + 48);
    context.lineTo(x + 42, y + 38);
    context.stroke();
    context.restore();
    context.fillStyle = colors.ink;
    context.font = `600 23px ${FONT_STACK}`;
    drawWrappedText(context, item, x + 66, y + 39, trackerWidth - 88, 33);
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
  context.font = `500 24px ${FONT_STACK}`;
  context.fillText("點選任一卡片即可開啟對應網站；服務內容與資格以各平台最新公告為準。", MARGIN, 306);

  const gap = 18;
  const cardWidth = (PAGE_WIDTH - MARGIN * 2 - gap) / 2;
  const cardHeight = 250;
  const top = 338;
  report.platforms.slice(0, 8).forEach((platform, index) => {
    const x = MARGIN + (index % 2) * (cardWidth + gap);
    const y = top + Math.floor(index / 2) * (cardHeight + 15);
    fillRoundedRect(context, x, y, cardWidth, cardHeight, 18, index % 2 ? "#f7f9f8" : colors.mint);
    context.fillStyle = colors.teal;
    context.font = `800 23px ${FONT_STACK}`;
    drawWrappedText(context, platform.name, x + 24, y + 42, cardWidth - 72, 33);
    context.fillStyle = colors.ink;
    context.font = `500 22px ${FONT_STACK}`;
    drawWrappedText(context, platform.purpose, x + 24, y + 98, cardWidth - 48, 32);
    context.fillStyle = colors.teal;
    context.font = `600 19px ${FONT_STACK}`;
    drawWrappedText(context, displayUrl(platform.url), x + 24, y + 202, cardWidth - 72, 27);
    context.font = `800 28px ${FONT_STACK}`;
    context.textAlign = "right";
    context.fillText("↗", x + cardWidth - 24, y + 48);
    context.textAlign = "left";
    links.push({ url: platform.url, x, y, width: cardWidth, height: cardHeight });
  });

  const rows = Math.ceil(Math.min(report.platforms.length, 8) / 2);
  const noteY = top + rows * (cardHeight + 15) + 16;
  fillRoundedRect(context, MARGIN, noteY, PAGE_WIDTH - MARGIN * 2, 190, 18, "#fff8ed");
  context.fillStyle = colors.intermediate;
  context.font = `800 22px ${FONT_STACK}`;
  context.fillText("使用提醒", MARGIN + 26, noteY + 42);
  context.fillStyle = colors.ink;
  context.font = `500 22px ${FONT_STACK}`;
  drawWrappedText(context, report.disclaimer, MARGIN + 26, noteY + 82, PAGE_WIDTH - MARGIN * 2 - 52, 32);
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
  ];
  const factors = report.factors.length ? report.factors : ["本次未列出明顯風險因素；仍請依健檢結果追蹤。"];
  for (let i = 0; i < factors.length; i += 8) {
    const part = { ...report, factors: factors.slice(i, i + 8) };
    pageRenderers.push((pageNumber, totalPages) => renderFactorsPage(part, pageNumber, totalPages));
  }
  pageRenderers.push((pageNumber, totalPages) => renderHabitsAndPrioritiesPage(report, pageNumber, totalPages));
  if (report.exercisePlan) {
    pageRenderers.push((pageNumber, totalPages) => renderExercisePage(report, pageNumber, totalPages));
  }
  if (report.nutritionPlan) {
    pageRenderers.push((pageNumber, totalPages) => renderNutritionPage(report, pageNumber, totalPages));
  }
  for (let i = 0; i < report.lifestylePlan.length; i += 3) {
    const part = { ...report, lifestylePlan: report.lifestylePlan.slice(i, i + 3) };
    pageRenderers.push((pageNumber, totalPages) => renderLifestylePage(part, pageNumber, totalPages));
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
