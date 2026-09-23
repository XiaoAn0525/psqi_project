// src/pdf-report.ts
var PAGE_WIDTH = 1240;
var PAGE_HEIGHT = 1754;
var PDF_WIDTH = 595.28;
var PDF_HEIGHT = 841.89;
var MARGIN = 82;
var FONT_STACK = '"Noto Sans TC", "PingFang TC", "Microsoft JhengHei", sans-serif';
var defaultBranding = {
  mark: "M",
  name: "Health Report",
  subtitle: "\u500B\u4EBA\u5065\u5EB7\u98A8\u96AA\u5831\u544A",
  footerLeft: "\u672C\u5831\u544A\u7531\u700F\u89BD\u5668\u5373\u6642\u7522\u751F\uFF0C\u586B\u5BEB\u8CC7\u6599\u672A\u4E0A\u50B3\u6216\u5132\u5B58\u3002",
  footerRight: "\u5065\u5EB7\u98A8\u96AA\u5831\u544A",
  fileNamePrefix: "\u5065\u5EB7\u98A8\u96AA\u5831\u544A"
};
function getBranding(report) {
  return { ...defaultBranding, ...report.branding };
}
var colors = {
  ink: "#17342f",
  muted: "#63736f",
  line: "#dbe4df",
  canvas: "#f2f6f3",
  mint: "#e7f3ed",
  teal: "#16836f",
  lime: "#cce86d",
  low: "#4d9f70",
  intermediate: "#e19e35",
  high: "#d9614d"
};
function roundedRect(context, x, y, width, height, radius) {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.arcTo(x + width, y, x + width, y + height, safeRadius);
  context.arcTo(x + width, y + height, x, y + height, safeRadius);
  context.arcTo(x, y + height, x, y, safeRadius);
  context.arcTo(x, y, x + width, y, safeRadius);
  context.closePath();
}
function fillRoundedRect(context, x, y, width, height, radius, fill) {
  context.fillStyle = fill;
  roundedRect(context, x, y, width, height, radius);
  context.fill();
}
function wrapText(context, text, maxWidth) {
  const lines = [];
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
function drawWrappedText(context, text, x, y, maxWidth, lineHeight) {
  const lines = wrapText(context, text, maxWidth);
  lines.forEach((line, index) => context.fillText(line, x, y + index * lineHeight));
  return y + lines.length * lineHeight;
}
function drawPageFrame(context, report, pageNumber, totalPages, pageTitle) {
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
  context.fillText(`\u7B2C ${pageNumber}\uFF0F${totalPages} \u9801`, PAGE_WIDTH - MARGIN, 91);
  context.fillText(new Intl.DateTimeFormat("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
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
  context.fillText(`0${pageNumber} \u2014 PERSONAL REPORT`, MARGIN, 210);
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
function drawSectionTitle(context, number, title, y) {
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
function drawBulletList(context, items, x, y, maxWidth, options = {}) {
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
    context.fillText("\u2713", x + 13, currentY + 3);
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
  if (!context) throw new Error("\u7121\u6CD5\u5EFA\u7ACB PDF \u756B\u5E03");
  return { canvas, context };
}
function renderOverviewPage(report, pageNumber, totalPages) {
  const { canvas, context } = createCanvas();
  drawPageFrame(context, report, pageNumber, totalPages, "\u57FA\u672C\u8CC7\u6599\u8207\u98A8\u96AA\u7D50\u679C");
  const accent = colors[report.riskKey];
  fillRoundedRect(context, MARGIN, 306, PAGE_WIDTH - MARGIN * 2, 270, 28, colors.canvas);
  context.fillStyle = accent;
  context.fillRect(MARGIN, 306, 16, 270);
  context.fillStyle = colors.muted;
  context.font = `700 18px ${FONT_STACK}`;
  context.fillText("\u524D\u7AEF\u793A\u7BC4\u98A8\u96AA\u6307\u6578", MARGIN + 58, 360);
  context.fillStyle = colors.ink;
  context.font = `700 64px ${FONT_STACK}`;
  context.fillText(report.riskLabel, MARGIN + 58, 438);
  context.fillStyle = accent;
  context.font = "700 98px Georgia, serif";
  context.fillText(String(report.riskIndex), MARGIN + 58, 535);
  context.fillStyle = colors.muted;
  context.font = `700 21px ${FONT_STACK}`;
  context.fillText("\uFF0F100", MARGIN + 185, 528);
  context.fillStyle = "#ffffff";
  roundedRect(context, 660, 344, 424, 194, 20);
  context.fill();
  context.fillStyle = colors.muted;
  context.font = `600 17px ${FONT_STACK}`;
  context.fillText("\u6A21\u578B\u8DEF\u7531", 704, 391);
  context.fillStyle = colors.ink;
  context.font = `700 31px ${FONT_STACK}`;
  context.fillText(report.modelName, 704, 431);
  context.fillStyle = colors.muted;
  context.font = `500 17px ${FONT_STACK}`;
  drawWrappedText(context, report.modelRoute, 704, 472, 330, 28);
  drawSectionTitle(context, "01", "\u57FA\u672C\u8CC7\u6599", 644);
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
  drawSectionTitle(context, "02", "\u4E3B\u8981\u89C0\u5BDF\u9805\u76EE", factorY);
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
function renderHabitsAndPrioritiesPage(report, pageNumber, totalPages) {
  const { canvas, context } = createCanvas();
  drawPageFrame(context, report, pageNumber, totalPages, "\u751F\u6D3B\u7FD2\u6163\u8207\u5EFA\u8B70");
  drawSectionTitle(context, "03", "\u751F\u6D3B\u7FD2\u6163\u586B\u7B54", 326);
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
  drawSectionTitle(context, "04", "\u63A5\u4E0B\u4F86\u5148\u505A\u4EC0\u9EBC", 895);
  let currentY = 936;
  if (report.priorities.length === 0) {
    fillRoundedRect(context, MARGIN, currentY, PAGE_WIDTH - MARGIN * 2, 158, 20, colors.mint);
    context.fillStyle = colors.teal;
    context.font = `800 21px ${FONT_STACK}`;
    context.fillText("\u76EE\u524D\u6C92\u6709\u89F8\u767C\u984D\u5916\u7684\u751F\u6D3B\u7FD2\u6163\u5EFA\u8B70", MARGIN + 28, currentY + 49);
    context.fillStyle = colors.ink;
    context.font = `500 18px ${FONT_STACK}`;
    drawWrappedText(
      context,
      "\u4F9D\u672C\u6B21\u586B\u7B54\uFF0C\u904B\u52D5\u3001\u98F2\u98DF\u3001\u7761\u7720\u8207\u83F8\u9152\u6AB3\u7B49\u9805\u76EE\u5747\u672A\u9054\u63D0\u9192\u9580\u6ABB\u3002\u8ACB\u7DAD\u6301\u73FE\u6709\u7FD2\u6163\uFF0C\u4E26\u4F9D\u500B\u4EBA\u75C5\u53F2\u8207\u5065\u6AA2\u7D50\u679C\u6301\u7E8C\u8FFD\u8E64\u3002",
      MARGIN + 28,
      currentY + 91,
      PAGE_WIDTH - MARGIN * 2 - 56,
      28
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
    "\u672A\u5217\u51FA\u7684\u5EFA\u8B70\u4EE3\u8868\u8A72\u9805\u76EE\u98A8\u96AA\u8F03\u4F4E\uFF0C\u4F46\u4E0D\u4EE3\u8868\u91AB\u7642\u8A3A\u65B7\uFF0C\u4E5F\u4E0D\u4FDD\u8B49\u6C92\u6709\u5065\u5EB7\u98A8\u96AA\u3002",
    MARGIN + 24,
    Math.min(currentY + 58, 1544),
    PAGE_WIDTH - MARGIN * 2 - 48,
    24
  );
  return { canvas, links: [] };
}
function renderExercisePage(report, pageNumber, totalPages) {
  const { canvas, context } = createCanvas();
  drawPageFrame(context, report, pageNumber, totalPages, "\u5177\u9AD4\u904B\u52D5\u5EFA\u8B70\u65B9\u6848");
  if (!report.exercisePlan) throw new Error("\u7F3A\u5C11\u904B\u52D5\u5EFA\u8B70\u8CC7\u6599");
  fillRoundedRect(context, MARGIN, 306, PAGE_WIDTH - MARGIN * 2, 142, 22, colors.mint);
  context.fillStyle = colors.teal;
  context.font = `800 17px ${FONT_STACK}`;
  context.fillText("\u672C\u9031\u6D3B\u52D5\u76EE\u6A19", MARGIN + 30, 348);
  context.fillStyle = colors.ink;
  context.font = `700 22px ${FONT_STACK}`;
  drawWrappedText(context, report.exercisePlan.goal, MARGIN + 30, 388, PAGE_WIDTH - MARGIN * 2 - 60, 32);
  drawSectionTitle(context, "05", "\u53EF\u4EE5\u505A\u54EA\u4E9B\u904B\u52D5", 520);
  drawBulletList(context, report.exercisePlan.activities, MARGIN, 570, PAGE_WIDTH - MARGIN * 2, { fontSize: 19, lineHeight: 30, gap: 17 });
  drawSectionTitle(context, "06", "\u6BCF\u9031\u5169\u5929\u7C21\u55AE\u808C\u529B", 880);
  drawBulletList(context, report.exercisePlan.strength, MARGIN, 930, PAGE_WIDTH - MARGIN * 2, { fontSize: 18, lineHeight: 28, gap: 16, accent: colors.ink });
  drawSectionTitle(context, "07", "\u5C11\u505A\u4EC0\u9EBC\uFF0F\u5B89\u5168\u63D0\u9192", 1218);
  const columnGap = 30;
  const columnWidth = (PAGE_WIDTH - MARGIN * 2 - columnGap) / 2;
  fillRoundedRect(context, MARGIN, 1255, columnWidth, 340, 18, "#fff8ed");
  fillRoundedRect(context, MARGIN + columnWidth + columnGap, 1255, columnWidth, 340, 18, "#f7f9f8");
  context.fillStyle = colors.intermediate;
  context.font = `800 18px ${FONT_STACK}`;
  context.fillText("\u5148\u907F\u514D", MARGIN + 24, 1295);
  drawBulletList(context, report.exercisePlan.reduce, MARGIN + 24, 1336, columnWidth - 48, { fontSize: 16, lineHeight: 25, gap: 13, accent: colors.intermediate });
  const safetyX = MARGIN + columnWidth + columnGap + 24;
  context.fillStyle = colors.teal;
  context.font = `800 18px ${FONT_STACK}`;
  context.fillText("\u5B89\u5168\u539F\u5247", safetyX, 1295);
  drawBulletList(context, report.exercisePlan.safety, safetyX, 1336, columnWidth - 48, { fontSize: 16, lineHeight: 24, gap: 11 });
  return { canvas, links: [] };
}
function renderNutritionPage(report, pageNumber, totalPages) {
  const { canvas, context } = createCanvas();
  drawPageFrame(context, report, pageNumber, totalPages, "\u98F2\u98DF\u5EFA\u8B70");
  if (!report.nutritionPlan) throw new Error("\u7F3A\u5C11\u98F2\u98DF\u5EFA\u8B70\u8CC7\u6599");
  drawSectionTitle(context, "08", "\u9700\u8981\u8ABF\u6574\u7684\u98F2\u98DF\u9805\u76EE", 326);
  const toneColors = { mint: colors.mint, warm: "#fff8ed", neutral: "#f7f9f8" };
  const cards = report.nutritionPlan.cards.map((card) => ({ ...card, fill: toneColors[card.tone] }));
  const gap = 18;
  const cardWidth = (PAGE_WIDTH - MARGIN * 2 - gap) / 2;
  const cardHeight = 220;
  cards.forEach((card, index) => {
    const x = MARGIN + index % 2 * (cardWidth + gap);
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
    drawSectionTitle(context, "09", "\u512A\u5148\u6E1B\u5C11\u7684\u98DF\u7269\u8207\u505A\u6CD5", reduceTitleY);
    contentEndY = drawBulletList(context, report.nutritionPlan.reduce, MARGIN, reduceTitleY + 50, PAGE_WIDTH - MARGIN * 2, { fontSize: 18, lineHeight: 28, gap: 15, accent: colors.intermediate });
  }
  const exampleY = Math.max(contentEndY + 44, 760);
  fillRoundedRect(context, MARGIN, exampleY, PAGE_WIDTH - MARGIN * 2, 210, 20, colors.canvas);
  context.fillStyle = colors.teal;
  context.font = `800 18px ${FONT_STACK}`;
  context.fillText("\u672C\u9031\u5148\u505A", MARGIN + 28, exampleY + 43);
  context.fillStyle = colors.ink;
  context.font = `600 18px ${FONT_STACK}`;
  drawWrappedText(context, report.nutritionPlan.actionExample, MARGIN + 28, exampleY + 87, PAGE_WIDTH - MARGIN * 2 - 56, 32);
  return { canvas, links: [] };
}
function renderLifestylePage(report, pageNumber, totalPages) {
  const { canvas, context } = createCanvas();
  drawPageFrame(context, report, pageNumber, totalPages, "\u9700\u8981\u8ABF\u6574\u7684\u751F\u6D3B\u884C\u70BA");
  drawSectionTitle(context, "10", "\u4F9D\u586B\u7B54\u9700\u8981\u8ABF\u6574\u7684\u884C\u70BA", 326);
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
  drawSectionTitle(context, "11", "\u56DB\u9031\u8FFD\u8E64\u6E05\u55AE", trackerY);
  const trackerText = {
    \u7761\u7720: "\u8A18\u9304\u7761\u7720\u6642\u6BB5\u8207\u767D\u5929\u7CBE\u795E\u72C0\u6CC1",
    \u9AD4\u91CD\u8207\u8170\u570D\u7D00\u9304: "\u6BCF\u9031\u76F8\u8FD1\u6642\u6BB5\u8A18\u9304\u9AD4\u91CD\uFF0F\u8170\u570D\u8DA8\u52E2",
    \u83F8\u54C1\u8207\u4E8C\u624B\u83F8: "\u8A18\u9304\u5438\u83F8\u6216\u4E8C\u624B\u83F8\u66B4\u9732\u7684\u6642\u9593\u8207\u60C5\u5883",
    \u98F2\u9152: "\u8A18\u9304\u98F2\u9152\u65E5\u671F\u3001\u4EFD\u91CF\u8207\u7121\u9152\u65E5",
    \u6AB3\u6994: "\u8A18\u9304\u56BC\u6AB3\u6994\u983B\u7387\u3001\u60C5\u5883\u8207\u505C\u6B62\u9032\u5EA6"
  };
  const trackerItems = report.lifestylePlan.map((item) => trackerText[item.title] ?? `\u8A18\u9304\u300C${item.title}\u300D\u7684\u6BCF\u9031\u8B8A\u5316`);
  const trackerWidth = (PAGE_WIDTH - MARGIN * 2 - 18) / 2;
  trackerItems.forEach((item, index) => {
    const x = MARGIN + index % 2 * (trackerWidth + 18);
    const y = trackerY + 42 + Math.floor(index / 2) * 112;
    fillRoundedRect(context, x, y, trackerWidth, 94, 16, colors.canvas);
    fillRoundedRect(context, x + 20, y + 28, 30, 30, 9, colors.ink);
    context.fillStyle = colors.lime;
    context.font = `800 16px ${FONT_STACK}`;
    context.textAlign = "center";
    context.fillText("\u25A1", x + 35, y + 49);
    context.textAlign = "left";
    context.fillStyle = colors.ink;
    context.font = `600 17px ${FONT_STACK}`;
    drawWrappedText(context, item, x + 66, y + 37, trackerWidth - 88, 25);
  });
  return { canvas, links: [] };
}
function displayUrl(url) {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}
function renderPlatformsPage(report, pageNumber, totalPages) {
  const { canvas, context } = createCanvas();
  const links = [];
  drawPageFrame(context, report, pageNumber, totalPages, "\u76F8\u95DC\u5B98\u65B9\u8CC7\u6E90");
  context.fillStyle = colors.muted;
  context.font = `500 18px ${FONT_STACK}`;
  context.fillText("\u9EDE\u9078\u4EFB\u4E00\u5361\u7247\u5373\u53EF\u958B\u555F\u5C0D\u61C9\u7DB2\u7AD9\uFF1B\u670D\u52D9\u5167\u5BB9\u8207\u8CC7\u683C\u4EE5\u5404\u5E73\u53F0\u6700\u65B0\u516C\u544A\u70BA\u6E96\u3002", MARGIN, 306);
  const gap = 18;
  const cardWidth = (PAGE_WIDTH - MARGIN * 2 - gap) / 2;
  const cardHeight = 224;
  const top = 338;
  report.platforms.slice(0, 8).forEach((platform, index) => {
    const x = MARGIN + index % 2 * (cardWidth + gap);
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
    context.fillText("\u2197", x + cardWidth - 24, y + 48);
    context.textAlign = "left";
    links.push({ url: platform.url, x, y, width: cardWidth, height: cardHeight });
  });
  const rows = Math.ceil(Math.min(report.platforms.length, 8) / 2);
  const noteY = top + rows * (cardHeight + 15) + 32;
  fillRoundedRect(context, MARGIN, noteY, PAGE_WIDTH - MARGIN * 2, 190, 18, "#fff8ed");
  context.fillStyle = colors.intermediate;
  context.font = `800 18px ${FONT_STACK}`;
  context.fillText("\u4F7F\u7528\u63D0\u9192", MARGIN + 26, noteY + 42);
  context.fillStyle = colors.ink;
  context.font = `500 16px ${FONT_STACK}`;
  drawWrappedText(context, report.disclaimer, MARGIN + 26, noteY + 78, PAGE_WIDTH - MARGIN * 2 - 52, 25);
  return { canvas, links };
}
async function canvasToJpeg(canvas) {
  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob((value) => value ? resolve(value) : reject(new Error("\u7121\u6CD5\u7522\u751F PDF \u9801\u9762")), "image/jpeg", 0.92);
  });
  return new Uint8Array(await blob.arrayBuffer());
}
function escapePdfString(value) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}
function createPdf(pages) {
  const encoder = new TextEncoder();
  const chunks = [];
  const offsets = [0];
  let byteLength = 0;
  const push = (value) => {
    const bytes = typeof value === "string" ? encoder.encode(value) : value;
    chunks.push(bytes);
    byteLength += bytes.length;
  };
  push(new Uint8Array([37, 80, 68, 70, 45, 49, 46, 52, 10, 37, 226, 227, 207, 211, 10]));
  let nextObjectId = 3;
  const pageObjects = pages.map((page, index) => {
    const pageId = nextObjectId++;
    const imageId = nextObjectId++;
    const contentId = nextObjectId++;
    const annotationIds = page.links.map(() => nextObjectId++);
    return { ...page, index, pageId, imageId, contentId, annotationIds };
  });
  const maxObjectId = nextObjectId - 1;
  const objects = /* @__PURE__ */ new Map();
  objects.set(1, () => push("<< /Type /Catalog /Pages 2 0 R >>"));
  objects.set(2, () => push(`<< /Type /Pages /Kids [${pageObjects.map((page) => `${page.pageId} 0 R`).join(" ")}] /Count ${pages.length} >>`));
  pageObjects.forEach((page) => {
    const imageName = `Im${page.index + 1}`;
    const content = `q
${PDF_WIDTH} 0 0 ${PDF_HEIGHT} 0 0 cm
/${imageName} Do
Q
`;
    const annotations = page.annotationIds.length ? ` /Annots [${page.annotationIds.map((id) => `${id} 0 R`).join(" ")}]` : "";
    objects.set(page.pageId, () => push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PDF_WIDTH} ${PDF_HEIGHT}] /Resources << /XObject << /${imageName} ${page.imageId} 0 R >> >> /Contents ${page.contentId} 0 R${annotations} >>`));
    objects.set(page.imageId, () => {
      push(`<< /Type /XObject /Subtype /Image /Width ${PAGE_WIDTH} /Height ${PAGE_HEIGHT} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${page.image.length} >>
stream
`);
      push(page.image);
      push("\nendstream");
    });
    objects.set(page.contentId, () => {
      const contentBytes = encoder.encode(content);
      push(`<< /Length ${contentBytes.length} >>
stream
`);
      push(contentBytes);
      push("endstream");
    });
    page.links.forEach((link, index) => {
      const x1 = link.x / PAGE_WIDTH * PDF_WIDTH;
      const x2 = (link.x + link.width) / PAGE_WIDTH * PDF_WIDTH;
      const y1 = PDF_HEIGHT - (link.y + link.height) / PAGE_HEIGHT * PDF_HEIGHT;
      const y2 = PDF_HEIGHT - link.y / PAGE_HEIGHT * PDF_HEIGHT;
      objects.set(page.annotationIds[index], () => push(`<< /Type /Annot /Subtype /Link /Rect [${x1.toFixed(2)} ${y1.toFixed(2)} ${x2.toFixed(2)} ${y2.toFixed(2)}] /Border [0 0 0] /A << /S /URI /URI (${escapePdfString(link.url)}) >> >>`));
    });
  });
  for (let objectId = 1; objectId <= maxObjectId; objectId += 1) {
    offsets[objectId] = byteLength;
    push(`${objectId} 0 obj
`);
    objects.get(objectId)?.();
    push("\nendobj\n");
  }
  const xrefOffset = byteLength;
  push(`xref
0 ${maxObjectId + 1}
`);
  push("0000000000 65535 f \n");
  for (let objectId = 1; objectId <= maxObjectId; objectId += 1) push(`${String(offsets[objectId]).padStart(10, "0")} 00000 n 
`);
  push(`trailer
<< /Size ${maxObjectId + 1} /Root 1 0 R >>
startxref
${xrefOffset}
%%EOF`);
  const blobParts = chunks.map((chunk) => {
    const copy = new Uint8Array(chunk.length);
    copy.set(chunk);
    return copy.buffer;
  });
  return new Blob(blobParts, { type: "application/pdf" });
}
function fileTimestamp(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}_${pad(date.getHours())}${pad(date.getMinutes())}`;
}
async function createRiskPdfBlob(report) {
  if ("fonts" in document) await document.fonts.ready;
  const pageRenderers = [
    (pageNumber, totalPages2) => renderOverviewPage(report, pageNumber, totalPages2),
    (pageNumber, totalPages2) => renderHabitsAndPrioritiesPage(report, pageNumber, totalPages2)
  ];
  if (report.exercisePlan) {
    pageRenderers.push((pageNumber, totalPages2) => renderExercisePage(report, pageNumber, totalPages2));
  }
  if (report.nutritionPlan) {
    pageRenderers.push((pageNumber, totalPages2) => renderNutritionPage(report, pageNumber, totalPages2));
  }
  if (report.lifestylePlan.length > 0) {
    pageRenderers.push((pageNumber, totalPages2) => renderLifestylePage(report, pageNumber, totalPages2));
  }
  pageRenderers.push((pageNumber, totalPages2) => renderPlatformsPage(report, pageNumber, totalPages2));
  const totalPages = pageRenderers.length;
  const renderedPages = pageRenderers.map((renderPage, index) => renderPage(index + 1, totalPages));
  const images = await Promise.all(renderedPages.map((page) => canvasToJpeg(page.canvas)));
  return createPdf(renderedPages.map((page, index) => ({ image: images[index], links: page.links })));
}
async function downloadRiskPdf(report) {
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
var downloadMetabolicRiskPdf = downloadRiskPdf;

// src/advice-engine.ts
var defaultGuidanceRules = {
  adequateExercise: ["daily_or_more", "weekly_4_6"],
  adequateVegetables: ["one_5_to_two_bowls", "gte_two_bowls"],
  adequateFruit: ["often", "always"],
  adequateFriedFood: ["lt_weekly"],
  adequateSaltySauce: ["never", "occasionally"],
  minSleepHours: 6,
  maxSleepHoursExclusive: 9,
  maleWaistCm: 90,
  femaleWaistCm: 80,
  bmiThreshold: 24
};
function pick(items, variant, salt) {
  return items[(Math.abs(variant) * 7 + salt * 11) % items.length];
}
function rotate(items, count, variant, salt) {
  const start = (Math.abs(variant) * 7 + salt * 11) % items.length;
  return Array.from({ length: Math.min(count, items.length) }, (_, index) => items[(start + index) % items.length]);
}
function buildConditionalGuidance(data, result, options = {}) {
  const rules = { ...defaultGuidanceRules, ...options.rules };
  const variant = options.variant ?? Date.now();
  const useWaist = options.useWaist ?? typeof data.waistCm === "number";
  const waistReference = data.sex === "male" ? rules.maleWaistCm : rules.femaleWaistCm;
  const bodyNeedsAttention = result.bmi >= rules.bmiThreshold || useWaist && typeof data.waistCm === "number" && data.waistCm >= waistReference;
  const activityNeedsAttention = !rules.adequateExercise.includes(data.exerciseFrequency);
  const vegetablesNeedAttention = !rules.adequateVegetables.includes(data.vegetableIntake);
  const fruitNeedsAttention = !rules.adequateFruit.includes(data.fruitIntake);
  const friedNeedsAttention = !rules.adequateFriedFood.includes(data.friedProcessedFood);
  const saltyNeedsAttention = !rules.adequateSaltySauce.includes(data.saltySauceHabit);
  const smokingNeedsAttention = ["passive", "occasional", "daily"].includes(data.smokingStatus);
  const drinkingNeedsAttention = ["weekly_3_4", "weekly_5_6", "daily"].includes(data.drinkingStatus);
  const betelNeedsAttention = ["weekly_1_3", "weekly_4_5", "weekly_6_or_daily"].includes(data.betelStatus);
  const sleepNeedsAttention = data.sleepHours < rules.minSleepHours || data.sleepHours >= rules.maxSleepHoursExclusive;
  const priorities = [];
  if (result.group === "high") {
    priorities.push(pick([
      { title: "\u5148\u78BA\u8A8D\u771F\u5BE6\u5065\u5EB7\u6578\u503C", detail: "\u98A8\u96AA\u7D50\u679C\u5C6C\u7BE9\u6AA2\u63D0\u9192\uFF0C\u4E0D\u662F\u8A3A\u65B7\u3002\u5EFA\u8B70\u8FD1\u671F\u5B89\u6392\u6B63\u5F0F\u5065\u5EB7\u6AA2\u67E5\uFF0C\u78BA\u8A8D\u8840\u58D3\u3001\u8840\u7CD6\u3001\u8840\u8102\u8207\u8170\u570D\u3002" },
      { title: "\u8FD1\u671F\u5B89\u6392\u5B8C\u6574\u5065\u5EB7\u6AA2\u67E5", detail: "\u53EF\u651C\u5E36\u9019\u4EFD\u751F\u6D3B\u7FD2\u6163\u7D00\u9304\u5C31\u91AB\uFF0C\u518D\u7531\u91AB\u7642\u4EBA\u54E1\u4F9D\u6AA2\u9A57\u6578\u503C\u3001\u75C5\u53F2\u8207\u7528\u85E5\u72C0\u6CC1\u7D9C\u5408\u5224\u8B80\u3002" },
      { title: "\u628A\u5C08\u696D\u8A55\u4F30\u6392\u9032\u8FD1\u671F\u8A08\u756B", detail: "\u8ACB\u4EE5\u6B63\u5F0F\u5065\u6AA2\u6216\u9580\u8A3A\u8A55\u4F30\u78BA\u8A8D\u5BE6\u969B\u98A8\u96AA\uFF0C\u4E0D\u8981\u53EA\u4F9D\u9760\u672C\u5831\u544A\u4E2D\u7684\u98A8\u96AA\u5206\u7D1A\u3002" }
    ], variant, 1));
  } else if (result.group === "intermediate") {
    priorities.push(pick([
      { title: "\u9078\u4E00\u81F3\u5169\u9805\u5148\u505A\u56DB\u9031", detail: "\u5F9E\u672C\u5831\u544A\u5217\u51FA\u7684\u9805\u76EE\u4E2D\u6311\u6700\u5BB9\u6613\u6301\u7E8C\u7684\u4E00\u9805\uFF0C\u8A2D\u5B9A\u56FA\u5B9A\u6642\u6BB5\u4E26\u8A18\u9304\u56DB\u9031\u5B8C\u6210\u7387\u3002" },
      { title: "\u5148\u505A\u6700\u5BB9\u6613\u6301\u7E8C\u7684\u6539\u8B8A", detail: "\u4E0D\u5FC5\u4E00\u6B21\u6539\u5B8C\u6240\u6709\u7FD2\u6163\uFF1B\u5148\u5B8C\u6210\u4E00\u500B\u53EF\u8FFD\u8E64\u7684\u5C0F\u76EE\u6A19\uFF0C\u518D\u4F9D\u7D00\u9304\u589E\u52A0\u4E0B\u4E00\u9805\u3002" },
      { title: "\u914D\u5408\u4F8B\u884C\u5065\u5EB7\u6AA2\u67E5", detail: "\u751F\u6D3B\u8ABF\u6574\u4E4B\u5916\uFF0C\u4E5F\u5EFA\u8B70\u4F9D\u500B\u4EBA\u5E74\u9F61\u3001\u75C5\u53F2\u8207\u91AB\u7642\u5EFA\u8B70\u5B89\u6392\u5065\u5EB7\u6AA2\u67E5\u3002" }
    ], variant, 1));
  }
  if (activityNeedsAttention) {
    priorities.push(pick([
      { title: "\u5148\u5EFA\u7ACB\u6BCF\u9031\u6D3B\u52D5\u7BC0\u594F", detail: "\u672C\u9031\u5148\u5B89\u6392\u4E09\u6B21\u3001\u6BCF\u6B21 10 \u81F3 20 \u5206\u9418\u7684\u5FEB\u8D70\u6216\u4F4E\u885D\u64CA\u6D3B\u52D5\uFF0C\u9069\u61C9\u5F8C\u518D\u589E\u52A0\u6642\u9593\u3002" },
      { title: "\u628A\u904B\u52D5\u62C6\u6210\u5BB9\u6613\u958B\u59CB\u7684\u5C0F\u6BB5", detail: "\u53EF\u5F9E\u98EF\u5F8C\u8D70\u8DEF 10 \u5206\u9418\u958B\u59CB\uFF0C\u6BCF\u9031\u4E09\u81F3\u4E94\u5929\uFF0C\u7A69\u5B9A\u5B8C\u6210\u5F8C\u518D\u9010\u6B65\u62C9\u9577\u3002" },
      { title: "\u5148\u589E\u52A0\u65E5\u5E38\u8D70\u52D5\u91CF", detail: "\u9078\u5169\u500B\u56FA\u5B9A\u6642\u6BB5\u8D77\u8EAB\u8D70\u52D5\u6216\u6563\u6B65\uFF0C\u4E0D\u5FC5\u4E00\u958B\u59CB\u5C31\u505A\u9AD8\u5F37\u5EA6\u904B\u52D5\u3002" }
    ], variant, 2));
  }
  const dietTargets = [
    vegetablesNeedAttention ? "\u589E\u52A0\u852C\u83DC" : null,
    fruitNeedsAttention ? "\u88DC\u8DB3\u539F\u578B\u6C34\u679C" : null,
    friedNeedsAttention ? "\u6E1B\u5C11\u70B8\u7269\u8207\u52A0\u5DE5\u98DF\u54C1" : null,
    saltyNeedsAttention ? "\u6E1B\u5C11\u91CD\u9E79\u91AC\u6599" : null
  ].filter((item) => Boolean(item));
  if (dietTargets.length > 0) {
    const targetText = dietTargets.join("\u3001");
    priorities.push(pick([
      { title: "\u5148\u6539\u4E00\u500B\u98F2\u98DF\u9805\u76EE", detail: `\u672C\u6B21\u9700\u8981\u8ABF\u6574\u7684\u662F\uFF1A${targetText}\u3002\u5148\u9078\u5176\u4E2D\u4E00\u9805\u9023\u7E8C\u505A\u4E00\u9031\uFF0C\u518D\u589E\u52A0\u4E0B\u4E00\u9805\u3002` },
      { title: "\u53EA\u8655\u7406\u5C1A\u672A\u9054\u6A19\u7684\u98F2\u98DF\u7FD2\u6163", detail: `\u4F9D\u672C\u6B21\u586B\u7B54\uFF0C\u512A\u5148\u76EE\u6A19\u70BA${targetText}\uFF1B\u5DF2\u9054\u63D0\u9192\u9580\u6ABB\u7684\u9805\u76EE\u4E0D\u53E6\u5916\u5217\u5EFA\u8B70\u3002` },
      { title: "\u5F9E\u4E0B\u4E00\u9910\u958B\u59CB\u8ABF\u6574", detail: `\u4E0B\u4E00\u9910\u5148\u5B8C\u6210\u300C${dietTargets[0]}\u300D\uFF0C\u4E26\u8A18\u9304\u4E00\u9031\u7684\u5BE6\u969B\u5B8C\u6210\u5929\u6578\u3002` }
    ], variant, 3));
  }
  const exposureTargets = [
    smokingNeedsAttention ? "\u83F8\u54C1\u6216\u4E8C\u624B\u83F8" : null,
    drinkingNeedsAttention ? "\u98F2\u9152" : null,
    betelNeedsAttention ? "\u6AB3\u6994" : null
  ].filter((item) => Boolean(item));
  if (exposureTargets.length > 0) {
    const targetText = exposureTargets.join("\u3001");
    priorities.push(pick([
      { title: `\u964D\u4F4E${targetText}\u66B4\u9732`, detail: `\u5148\u8A18\u9304\u4E00\u9031\u8207${targetText}\u76F8\u95DC\u7684\u60C5\u5883\u53CA\u983B\u7387\uFF0C\u518D\u8A2D\u5B9A\u6E1B\u91CF\u6216\u505C\u6B62\u76EE\u6A19\u3002` },
      { title: "\u627E\u51FA\u6700\u5BB9\u6613\u767C\u751F\u7684\u60C5\u5883", detail: `\u8A18\u4E0B\u63A5\u89F8${targetText}\u7684\u6642\u9593\u3001\u5730\u9EDE\u6216\u60C5\u7DD2\uFF0C\u518D\u6E96\u5099\u66FF\u4EE3\u884C\u52D5\u8207\u5C08\u696D\u652F\u63F4\u3002` },
      { title: "\u7528\u7D00\u9304\u8207\u652F\u63F4\u4E00\u8D77\u9032\u884C", detail: `\u672C\u6B21\u53EA\u91DD\u5C0D${targetText}\u63D0\u4F9B\u63D0\u9192\uFF1B\u82E5\u81EA\u884C\u8ABF\u6574\u56F0\u96E3\uFF0C\u53EF\u5C0B\u6C42\u91AB\u7642\u5C08\u696D\u5354\u52A9\u3002` }
    ], variant, 4));
  }
  if (sleepNeedsAttention) {
    priorities.push(pick([
      { title: "\u56FA\u5B9A\u7761\u7720\u8207\u8D77\u5E8A\u6642\u9593", detail: "\u9023\u7E8C\u5169\u9031\u56FA\u5B9A\u4F5C\u606F\uFF0C\u7761\u524D\u6E1B\u5C11\u5496\u5561\u56E0\u3001\u9152\u7CBE\u8207\u87A2\u5E55\u523A\u6FC0\uFF1B\u7570\u5E38\u55DC\u7761\u6216\u56B4\u91CD\u6253\u9F3E\u6642\u8ACB\u5C31\u91AB\u3002" },
      { title: "\u5EFA\u7ACB\u7761\u524D\u964D\u901F\u6D41\u7A0B", detail: "\u7761\u524D\u53EF\u6539\u505A\u4F38\u5C55\u3001\u6D17\u6FA1\u6216\u95B1\u8B80\uFF0C\u4E0B\u5348\u5F8C\u6E1B\u5C11\u5496\u5561\u56E0\uFF0C\u4E5F\u4E0D\u8981\u4F7F\u7528\u9152\u7CBE\u52A9\u7720\u3002" },
      { title: "\u7528\u5169\u9031\u7761\u7720\u7D00\u9304\u627E\u554F\u984C", detail: "\u8A18\u9304\u4E0A\u5E8A\u3001\u5165\u7761\u3001\u8D77\u5E8A\u8207\u767D\u5929\u7CBE\u795E\u72C0\u6CC1\uFF0C\u6301\u7E8C\u7570\u5E38\u6642\u8ACB\u8AEE\u8A62\u91AB\u7642\u4EBA\u54E1\u3002" }
    ], variant, 5));
  }
  if (bodyNeedsAttention && priorities.length < 4) {
    priorities.push(pick([
      { title: "\u8FFD\u8E64\u9AD4\u91CD\u8207\u8170\u570D\u8DA8\u52E2", detail: "\u6BCF\u9031\u5728\u76F8\u8FD1\u6642\u6BB5\u91CF\u6E2C\u4E26\u8A18\u9304\uFF0C\u89C0\u5BDF\u9577\u671F\u8DA8\u52E2\uFF1B\u907F\u514D\u6975\u7AEF\u7BC0\u98DF\u6216\u8FFD\u6C42\u5FEB\u901F\u4E0B\u964D\u3002" },
      { title: "\u5EFA\u7ACB\u7C21\u55AE\u7684\u8EAB\u9AD4\u7D00\u9304", detail: "\u56FA\u5B9A\u6BCF\u9031\u540C\u4E00\u5929\u8A18\u9304\u9AD4\u91CD\u8207\u8170\u570D\uFF0C\u642D\u914D\u6D3B\u52D5\u8207\u98F2\u98DF\u7D00\u9304\u89C0\u5BDF\u56DB\u9031\u8B8A\u5316\u3002" },
      { title: "\u63A1\u53D6\u53EF\u6301\u7E8C\u7684\u9AD4\u4F4D\u7BA1\u7406", detail: "\u4EE5\u5747\u8861\u9910\u76E4\u548C\u898F\u5F8B\u6D3B\u52D5\u9010\u6B65\u8ABF\u6574\uFF0C\u4E0D\u4F7F\u7528\u4F86\u8DEF\u4E0D\u660E\u7684\u6E1B\u91CD\u7522\u54C1\u3002" }
    ], variant, 6));
  }
  const exercisePlan = activityNeedsAttention ? {
    goal: pick([
      "\u5148\u5F9E\u53EF\u4EA4\u8AC7\u4F46\u547C\u5438\u7A0D\u52A0\u5FEB\u7684\u6D3B\u52D5\u958B\u59CB\uFF0C\u9010\u6B65\u671D\u6BCF\u9031\u7D2F\u7A4D 150 \u5206\u9418\u524D\u9032\uFF1B\u53EF\u4EE5\u5206\u6BB5\u5B8C\u6210\u3002",
      "\u672C\u9031\u5148\u5B8C\u6210\u4E09\u6B21\u3001\u6BCF\u6B21 10 \u81F3 20 \u5206\u9418\uFF0C\u9069\u61C9\u5F8C\u6BCF\u9031\u589E\u52A0\u4E00\u6B21\u6216\u6BCF\u6B21\u589E\u52A0\u7D04\u4E94\u5206\u9418\u3002",
      "\u628A\u904B\u52D5\u6392\u9032\u56FA\u5B9A\u6642\u6BB5\uFF0C\u5148\u6C42\u898F\u5F8B\u518D\u589E\u52A0\u5F37\u5EA6\uFF0C\u9577\u671F\u76EE\u6A19\u70BA\u6BCF\u9031\u7D04 150 \u5206\u9418\u4E2D\u7B49\u5F37\u5EA6\u6D3B\u52D5\u3002"
    ], variant, 7),
    activities: rotate([
      "\u5FEB\u8D70\uFF1A\u9078\u5E73\u5766\u8DEF\u7DDA\u8D70 10 \u81F3 30 \u5206\u9418\uFF0C\u53EF\u62C6\u6210\u65E9\u665A\u5169\u6BB5\u3002",
      "\u5E73\u5730\u8173\u8E0F\u8ECA\uFF1A\u8ABF\u6574\u5230\u8F15\u81F3\u4E2D\u7B49\u963B\u529B\uFF0C\u4EE5\u80FD\u7A69\u5B9A\u8E29\u8E0F\u70BA\u4E3B\u3002",
      "\u6E38\u6CF3\u6216\u6C34\u4E2D\u8D70\u8DEF\uFF1A\u5229\u7528\u6C34\u7684\u6D6E\u529B\u964D\u4F4E\u819D\u8E1D\u8207\u8170\u90E8\u8CA0\u64D4\u3002",
      "\u4F4E\u885D\u64CA\u6709\u6C27\u64CD\uFF1A\u907F\u958B\u5927\u5E45\u8DF3\u8E8D\uFF0C\u5148\u8DDF\u8457\u521D\u968E\u7BC0\u594F\u9032\u884C\u3002",
      "\u98EF\u5F8C\u6563\u6B65\uFF1A\u9910\u5F8C\u4F11\u606F\u7247\u523B\u518D\u8D70 10 \u81F3 15 \u5206\u9418\uFF0C\u7D2F\u7A4D\u6BCF\u65E5\u6D3B\u52D5\u91CF\u3002",
      "\u65E5\u5E38\u8D70\u52D5\uFF1A\u4E45\u5750\u6642\u6BCF 30 \u81F3 60 \u5206\u9418\u8D77\u8EAB\u8D70\u52D5\u6216\u4F38\u5C55\u3002"
    ], 3, variant, 8),
    strength: rotate([
      "\u6905\u5B50\u5750\u7AD9\uFF1A\u5750\u7A69\u5F8C\u8D77\u7ACB\u518D\u5750\u4E0B\uFF0C\u4F9D\u80FD\u529B\u505A 8 \u81F3 12 \u6B21\u3002",
      "\u7246\u58C1\u4F0F\u5730\u633A\u8EAB\uFF1A\u96D9\u624B\u6490\u7246\u3001\u8EAB\u9AD4\u4FDD\u6301\u4E00\u76F4\u7DDA\uFF0C\u505A 8 \u81F3 12 \u6B21\u3002",
      "\u5F48\u529B\u5E36\u5212\u8239\uFF1A\u593E\u80CC\u4E26\u6162\u6162\u56DE\u5230\u8D77\u59CB\u4F4D\u7F6E\uFF0C\u4F9D\u80FD\u529B\u505A 8 \u81F3 12 \u6B21\u3002",
      "\u7AD9\u59FF\u62AC\u817F\uFF1A\u6276\u7A69\u684C\u6905\u5F8C\u5411\u5074\u908A\u62AC\u817F\uFF0C\u5DE6\u53F3\u5404\u505A 8 \u81F3 12 \u6B21\u3002",
      "\u63D0\u8E35\uFF1A\u6276\u8457\u6905\u80CC\u6162\u6162\u8E2E\u8173\u518D\u653E\u4E0B\uFF0C\u4F9D\u80FD\u529B\u505A 8 \u81F3 12 \u6B21\u3002"
    ], 3, variant, 9),
    reduce: rotate([
      "\u6E1B\u5C11\u9023\u7E8C\u4E45\u5750\uFF1B\u5DE5\u4F5C\u3001\u770B\u96FB\u8996\u6216\u4F7F\u7528\u624B\u6A5F\u6642\uFF0C\u56FA\u5B9A\u8D77\u8EAB\u8D70\u52D5\u3002",
      "\u4E0D\u8981\u4E00\u958B\u59CB\u5C31\u505A\u7206\u767C\u885D\u523A\u3001\u904E\u91CD\u8CA0\u8377\u6216\u8D85\u51FA\u80FD\u529B\u7684\u9577\u6642\u9593\u904B\u52D5\u3002",
      "\u907F\u514D\u53EA\u5728\u9031\u672B\u4E00\u6B21\u88DC\u8DB3\u6574\u9031\u904B\u52D5\u91CF\uFF0C\u76E1\u91CF\u5E73\u5747\u5206\u6563\u5230\u4E0D\u540C\u5929\u3002"
    ], 2, variant, 10),
    safety: rotate([
      "\u6D3B\u52D5\u524D\u5F8C\u5404\u7559 5 \u81F3 10 \u5206\u9418\u6696\u8EAB\u8207\u7DE9\u548C\uFF1B\u7A7F\u5408\u8173\u978B\u4E26\u88DC\u5145\u6C34\u5206\u3002",
      "\u82E5\u6709\u80F8\u75DB\u3001\u6688\u7729\u3001\u7570\u5E38\u5598\u3001\u5FC3\u60B8\u6216\u4E0D\u9069\u52A0\u5287\uFF0C\u7ACB\u5373\u505C\u6B62\u4E26\u5C0B\u6C42\u91AB\u7642\u5354\u52A9\u3002",
      "\u5DF2\u6709\u6162\u6027\u75C5\u3001\u8FD1\u671F\u4E0D\u9069\u6216\u4E45\u672A\u904B\u52D5\u8005\uFF0C\u53EF\u5148\u78BA\u8A8D\u9069\u5408\u7684\u6D3B\u52D5\u5F37\u5EA6\u3002",
      "\u904B\u52D5\u6642\u4FDD\u6301\u6B63\u5E38\u547C\u5438\uFF0C\u4E0D\u8981\u618B\u6C23\uFF1B\u52D5\u4F5C\u4EE5\u7A69\u5B9A\u3001\u53EF\u63A7\u5236\u70BA\u539F\u5247\u3002"
    ], 3, variant, 11)
  } : null;
  const nutritionCards = [];
  if (vegetablesNeedAttention) {
    nutritionCards.push({
      title: "\u852C\u83DC",
      tone: "mint",
      text: pick([
        "\u6BCF\u9910\u81F3\u5C11\u5B89\u6392\u4E00\u7A2E\u852C\u83DC\u4E26\u8F2A\u66FF\u984F\u8272\uFF0C\u4F8B\u5982\u5730\u74DC\u8449\u3001\u83E0\u83DC\u3001\u9752\u6C5F\u83DC\u3001\u82B1\u6930\u83DC\u3001\u9AD8\u9E97\u83DC\u3001\u83C7\u985E\u3001\u751C\u6912\u8207\u756A\u8304\u3002",
        "\u5916\u98DF\u53EF\u52A0\u9EDE\u71D9\u9752\u83DC\u6216\u9078\u5169\u7A2E\u852C\u83DC\u914D\u83DC\uFF1B\u91AC\u6599\u53E6\u5916\u653E\uFF0C\u6DF1\u8272\u852C\u83DC\u81F3\u5C11\u5360\u4E00\u90E8\u5206\u3002",
        "\u5BB6\u4E2D\u53EF\u6E96\u5099\u51B7\u51CD\u82B1\u6930\u83DC\u3001\u9752\u6C5F\u83DC\u3001\u9AD8\u9E97\u83DC\u3001\u756A\u8304\u8207\u83C7\u985E\uFF0C\u5FD9\u788C\u6642\u4E5F\u80FD\u5FEB\u901F\u88DC\u8DB3\u3002"
      ], variant, 12)
    });
  }
  if (fruitNeedsAttention) {
    nutritionCards.push({
      title: "\u6C34\u679C",
      tone: "warm",
      text: pick([
        "\u9078\u7576\u5B63\u539F\u578B\u6C34\u679C\uFF0C\u4F8B\u5982\u82AD\u6A02\u3001\u860B\u679C\u3001\u67F3\u6A59\u3001\u5947\u7570\u679C\u3001\u6728\u74DC\u6216\u706B\u9F8D\u679C\uFF0C\u907F\u514D\u7528\u679C\u6C41\u3001\u679C\u4E7E\u6216\u7CD6\u6C34\u7F50\u982D\u4EE3\u66FF\u3002",
        "\u628A\u539F\u578B\u6C34\u679C\u5B89\u6392\u5728\u9910\u5F8C\u6216\u9EDE\u5FC3\u6642\u6BB5\uFF0C\u542B\u7CD6\u98F2\u6599\u8207\u679C\u6C41\u4E0D\u7B97\u6C34\u679C\u3002",
        "\u53EF\u5148\u6E96\u5099\u5BB9\u6613\u651C\u5E36\u7684\u860B\u679C\u3001\u82AD\u6A02\u6216\u6A58\u5B50\uFF0C\u53D6\u4EE3\u9905\u4E7E\u8207\u751C\u9EDE\u3002"
      ], variant, 13)
    });
  }
  if (bodyNeedsAttention || friedNeedsAttention) {
    nutritionCards.push({
      title: "\u4E3B\u98DF\u8207\u86CB\u767D\u8CEA",
      tone: "neutral",
      text: pick([
        "\u4E3B\u98DF\u53EF\u7528\u7CD9\u7C73\u3001\u71D5\u9EA5\u3001\u7389\u7C73\u6216\u5730\u74DC\u53D6\u4EE3\u90E8\u5206\u767D\u98EF\u3001\u767D\u9EB5\uFF1B\u86CB\u767D\u8CEA\u8F2A\u66FF\u8C46\u8150\u3001\u9B5A\u3001\u86CB\u8207\u53BB\u76AE\u96DE\u8089\u3002",
        "\u4FBF\u7576\u4E3B\u98DF\u53EF\u6E1B\u5C11\u90E8\u5206\u767D\u98EF\u4E26\u642D\u914D\u5168\u7A40\u96DC\u7CE7\uFF1B\u4E3B\u83DC\u512A\u5148\u9078\u8C46\u8150\u3001\u84B8\u9B5A\u3001\u86CB\u6216\u7626\u8089\u3002",
        "\u7528\u7389\u7C73\u3001\u5730\u74DC\u3001\u71D5\u9EA5\u6216\u7CD9\u7C73\u589E\u52A0\u5168\u7A40\u4F86\u6E90\uFF0C\u4E26\u6E1B\u5C11\u52A0\u5DE5\u8089\u54C1\u3002"
      ], variant, 14)
    });
  }
  if (friedNeedsAttention || saltyNeedsAttention) {
    nutritionCards.push({
      title: "\u70F9\u8ABF\u8207\u8ABF\u5473",
      tone: "neutral",
      text: pick([
        "\u512A\u5148\u84B8\u3001\u716E\u3001\u71C9\u3001\u70E4\u6216\u5C11\u6CB9\u5FEB\u7092\uFF1B\u91AC\u6599\u53E6\u5916\u653E\uFF0C\u4E26\u7528\u8525\u3001\u8591\u3001\u849C\u3001\u9999\u8349\u6216\u6AB8\u6AAC\u589E\u52A0\u98A8\u5473\u3002",
        "\u628A\u6CB9\u70B8\u6539\u6210\u6E05\u84B8\u3001\u70D8\u70E4\u6216\u6C46\u71D9\uFF0C\u9010\u6B65\u964D\u4F4E\u5C0D\u91CD\u9E79\u91AC\u6599\u7684\u4F9D\u8CF4\u3002",
        "\u5916\u98DF\u53EF\u4E3B\u52D5\u8AAA\u5C11\u6CB9\u3001\u5C11\u9E7D\u3001\u91AC\u6C41\u5206\u958B\uFF1B\u6E6F\u6C41\u4E0D\u5FC5\u5168\u90E8\u559D\u5B8C\u3002"
      ], variant, 15)
    });
  }
  const nutritionReduce = [];
  if (friedNeedsAttention) nutritionReduce.push(pick([
    "\u628A\u70B8\u7269\u3001\u714E\u70B8\u78B3\u70E4\u8207\u7159\u71FB\u54C1\u7684\u983B\u7387\u5148\u6E1B\u534A\uFF0C\u6539\u9078\u6E05\u84B8\u3001\u70E4\u6216\u6EF7\u88FD\u54C1\u3002",
    "\u5148\u53D6\u6D88\u4E00\u6B21\u56FA\u5B9A\u70B8\u7269\u6216\u5BB5\u591C\uFF0C\u4E3B\u83DC\u6539\u6210\u84B8\u9B5A\u3001\u70E4\u96DE\u6216\u6EF7\u8C46\u8150\u3002",
    "\u9EDE\u9910\u6642\u7528\u70E4\u3001\u84B8\u3001\u716E\u53D6\u4EE3\u70B8\u6392\u8207\u52A0\u5DE5\u8089\u54C1\uFF0C\u6BCF\u9031\u9010\u6B65\u6E1B\u5C11\u6B21\u6578\u3002"
  ], variant, 16));
  if (saltyNeedsAttention) nutritionReduce.push(pick([
    "\u6E1B\u5C11\u8FA3\u6912\u91AC\u3001\u91AC\u6CB9\u818F\u3001\u6C99\u8336\u3001\u6EF7\u6C41\u3001\u6E6F\u5E95\u8207\u9183\u6F2C\u7269\uFF1B\u706B\u934B\u6E6F\u3001\u6CE1\u9EB5\u6E6F\u5C11\u559D\u3002",
    "\u91AC\u6599\u5148\u6E1B\u534A\u4E26\u53E6\u5916\u653E\uFF0C\u5C11\u559D\u6E6F\u5E95\uFF0C\u907F\u514D\u6CE1\u9EB5\u3001\u706B\u934B\u6599\u8207\u9183\u6F2C\u7269\u96C6\u4E2D\u5728\u540C\u4E00\u9910\u3002",
    "\u5148\u5617\u539F\u5473\u518D\u6C7A\u5B9A\u662F\u5426\u52A0\u91AC\uFF0C\u9010\u6B65\u6E1B\u5C11\u6C99\u8336\u3001\u91AC\u6CB9\u818F\u8207\u6EF7\u6C41\u3002"
  ], variant, 17));
  if (bodyNeedsAttention) nutritionReduce.push(pick([
    "\u907F\u514D\u7528\u4E0D\u5403\u6B63\u9910\u3001\u55AE\u4E00\u98DF\u7269\u6CD5\u6216\u4F86\u8DEF\u4E0D\u660E\u7684\u6E1B\u91CD\u7522\u54C1\u8FFD\u6C42\u5FEB\u901F\u4E0B\u964D\u3002",
    "\u4E0D\u8981\u56E0\u77ED\u671F\u9AD4\u91CD\u6CE2\u52D5\u800C\u5927\u5E45\u7BC0\u98DF\uFF0C\u4EE5\u4EFD\u91CF\u3001\u983B\u7387\u8207\u70F9\u8ABF\u65B9\u5F0F\u9010\u6B65\u8ABF\u6574\u3002",
    "\u4E0D\u5FC5\u5B8C\u5168\u7981\u6B62\u67D0\u4E00\u985E\u98DF\u7269\uFF1B\u898F\u5F8B\u4E09\u9910\u8207\u53EF\u9577\u671F\u7DAD\u6301\u7684\u8ABF\u6574\u66F4\u91CD\u8981\u3002"
  ], variant, 18));
  const nutritionActionExample = vegetablesNeedAttention ? "\u4E0B\u4E00\u9910\u591A\u52A0\u4E00\u4EFD\u71D9\u9752\u83DC\u6216\u5169\u7A2E\u852C\u83DC\u914D\u83DC\uFF0C\u91AC\u6599\u53E6\u5916\u653E\uFF1B\u9023\u7E8C\u8A18\u9304\u4E03\u5929\u662F\u5426\u5B8C\u6210\u3002" : fruitNeedsAttention ? "\u660E\u5929\u6E96\u5099\u4E00\u4EFD\u539F\u578B\u6C34\u679C\u4F5C\u70BA\u9EDE\u5FC3\uFF0C\u4F8B\u5982\u82AD\u6A02\u3001\u860B\u679C\u6216\u6A58\u5B50\uFF0C\u4E0D\u4EE5\u679C\u6C41\u4EE3\u66FF\u3002" : friedNeedsAttention ? "\u4E0B\u4E00\u6B21\u9EDE\u9910\u628A\u70B8\u4E3B\u83DC\u63DB\u6210\u84B8\u3001\u70E4\u3001\u716E\u6216\u6EF7\u7684\u8C46\u8150\u3001\u9B5A\u6216\u53BB\u76AE\u96DE\u8089\u3002" : saltyNeedsAttention ? "\u4E0B\u4E00\u9910\u5148\u628A\u91AC\u6599\u53E6\u5916\u653E\u4E26\u6E1B\u534A\uFF0C\u5148\u5617\u539F\u5473\uFF0C\u6E6F\u6C41\u4E0D\u8981\u559D\u5B8C\u3002" : "\u672C\u9031\u56FA\u5B9A\u540C\u4E00\u5929\u3001\u76F8\u8FD1\u6642\u6BB5\u8A18\u9304\u9AD4\u91CD\u8207\u8170\u570D\uFF0C\u9910\u9EDE\u7DAD\u6301\u898F\u5F8B\u3002";
  const nutritionPlan = nutritionCards.length > 0 || nutritionReduce.length > 0 ? { cards: nutritionCards, reduce: nutritionReduce, actionExample: nutritionActionExample } : null;
  const lifestylePlan = [];
  if (sleepNeedsAttention) lifestylePlan.push({
    title: "\u7761\u7720",
    detail: pick([
      "\u56FA\u5B9A\u4E0A\u5E8A\u8207\u8D77\u5E8A\u6642\u9593\uFF1B\u4E0B\u5348\u5F8C\u6E1B\u5C11\u5496\u5561\u56E0\uFF0C\u7761\u524D\u4E00\u5C0F\u6642\u964D\u4F4E\u87A2\u5E55\u8207\u5F37\u5149\u523A\u6FC0\u3002",
      "\u5148\u56FA\u5B9A\u6BCF\u5929\u8D77\u5E8A\u6642\u9593\uFF0C\u7761\u524D\u6539\u505A\u4F38\u5C55\u3001\u6D17\u6FA1\u6216\u95B1\u8B80\uFF1B\u7570\u5E38\u6301\u7E8C\u6642\u8ACB\u5C31\u91AB\u3002",
      "\u9023\u7E8C\u5169\u9031\u8A18\u9304\u7761\u7720\u6642\u6BB5\u8207\u767D\u5929\u7CBE\u795E\uFF0C\u4E5F\u4E0D\u8981\u4F7F\u7528\u9152\u7CBE\u52A9\u7720\u3002"
    ], variant, 19)
  });
  if (bodyNeedsAttention) lifestylePlan.push({
    title: "\u9AD4\u91CD\u8207\u8170\u570D\u7D00\u9304",
    detail: pick([
      "\u6BCF\u9031\u4E00\u6B21\u5728\u76F8\u8FD1\u6642\u6BB5\u3001\u76F8\u8FD1\u8863\u8457\u4E0B\u91CF\u6E2C\u9AD4\u91CD\uFF1B\u8170\u570D\u5728\u5410\u6C23\u5F8C\u6C34\u5E73\u91CF\u6E2C\u3002",
      "\u56FA\u5B9A\u6BCF\u9031\u540C\u4E00\u5929\u65E9\u4E0A\u8A18\u9304\u9AD4\u91CD\u8207\u8170\u570D\uFF0C\u642D\u914D\u6D3B\u52D5\u548C\u98F2\u98DF\u7D00\u9304\u770B\u56DB\u9031\u8DA8\u52E2\u3002",
      "\u628A\u9AD4\u91CD\u3001\u8170\u570D\u3001\u904B\u52D5\u5206\u9418\u8207\u5916\u98DF\u6B21\u6578\u653E\u5728\u540C\u4E00\u5F35\u7D00\u9304\u8868\u3002"
    ], variant, 20)
  });
  if (smokingNeedsAttention) lifestylePlan.push({
    title: "\u83F8\u54C1\u8207\u4E8C\u624B\u83F8",
    detail: data.smokingStatus === "passive" ? "\u548C\u5BB6\u4EBA\u6216\u540C\u4E8B\u7D04\u5B9A\u5BA4\u5167\u8207\u8ECA\u5167\u5168\u9762\u7121\u83F8\uFF0C\u4E26\u512A\u5148\u9078\u64C7\u7121\u83F8\u74B0\u5883\u3002" : "\u8A2D\u5B9A\u505C\u6B62\u65E5\u671F\u3001\u79FB\u9664\u83F8\u54C1\u8207\u83F8\u5177\uFF0C\u8FA8\u8B58\u6700\u5E38\u60F3\u62BD\u83F8\u7684\u60C5\u5883\uFF0C\u4E26\u4F7F\u7528\u6212\u83F8\u670D\u52D9\u3002"
  });
  if (drinkingNeedsAttention) lifestylePlan.push({
    title: "\u98F2\u9152",
    detail: "\u5148\u8A2D\u5B9A\u6BCF\u9031\u7121\u9152\u65E5\u4E26\u8A18\u9304\u98F2\u7528\u91CF\uFF0C\u907F\u514D\u4F7F\u7528\u9152\u7CBE\u52A9\u7720\u3001\u7A7A\u8179\u98F2\u9152\u6216\u4E00\u6B21\u5927\u91CF\u98F2\u9152\u3002"
  });
  if (betelNeedsAttention) lifestylePlan.push({
    title: "\u6AB3\u6994",
    detail: "\u8A2D\u5B9A\u505C\u6B62\u65E5\u671F\u4E26\u907F\u958B\u5BB9\u6613\u56BC\u6AB3\u6994\u7684\u60C5\u5883\uFF0C\u53EF\u81F3\u91AB\u7642\u9662\u6240\u5C0B\u6C42\u6212\u6AB3\u8207\u53E3\u8154\u6AA2\u67E5\u5354\u52A9\u3002"
  });
  const platforms = [
    { name: "\u6162\u6027\u75BE\u75C5\u98A8\u96AA\u8A55\u4F30\u5E73\u53F0", purpose: "\u4F7F\u7528\u570B\u5065\u7F72\u516C\u958B\u5DE5\u5177\u9032\u4E00\u6B65\u7406\u89E3\u500B\u4EBA\u5065\u5EB7\u98A8\u96AA\u3002", url: "https://cdrc.hpa.gov.tw/hra-openservice-menupage.jsp?all=" },
    { name: "\u6210\u4EBA\u9810\u9632\u4FDD\u5065", purpose: "\u4E86\u89E3\u653F\u5E9C\u6210\u4EBA\u5065\u5EB7\u6AA2\u67E5\u670D\u52D9\u8207\u76F8\u95DC\u8CC7\u683C\u3002", url: "https://www.hpa.gov.tw/Pages/List.aspx?nodeid=189" },
    { name: "\u5065\u5EB7\u5B58\u647A", purpose: "\u67E5\u95B1\u500B\u4EBA\u5C31\u91AB\u3001\u6AA2\u9A57\u8207\u5065\u5EB7\u8CC7\u6599\u3002", url: "https://www.nhi.gov.tw/ch/np-2702-1.html" },
    { name: "\u5065\u4FDD\u7279\u7D04\u91AB\u4E8B\u6A5F\u69CB\u67E5\u8A62", purpose: "\u4F9D\u5730\u5340\u67E5\u8A62\u53EF\u5C31\u91AB\u6216\u63A5\u53D7\u5065\u5EB7\u670D\u52D9\u7684\u9662\u6240\u3002", url: "https://info.nhi.gov.tw/INAE1000/INAE1000S01" }
  ];
  if (activityNeedsAttention) platforms.unshift({ name: "i \u904B\u52D5\u8CC7\u8A0A\u5E73\u53F0", purpose: "\u67E5\u627E\u904B\u52D5\u77E5\u8B58\u3001\u9AD4\u9069\u80FD\u8207\u53EF\u53C3\u8207\u7684\u904B\u52D5\u8CC7\u6E90\u3002", url: "https://isports.sa.gov.tw/" });
  if (nutritionPlan) platforms.unshift({ name: "\u71DF\u990A\u53CA\u5065\u5EB7\u98F2\u98DF\u4FC3\u9032\u8CC7\u6E90\u5E73\u53F0", purpose: "\u67E5\u8A62\u6211\u7684\u9910\u76E4\u3001\u5747\u8861\u98F2\u98DF\u8207\u5916\u98DF\u9078\u64C7\u3002", url: "https://healthydiet.hpa.gov.tw/" });
  if (smokingNeedsAttention) platforms.push({ name: "\u514D\u8CBB\u6212\u83F8\u5C08\u7DDA 0800-636363", purpose: "\u7531\u5C08\u696D\u4EBA\u54E1\u63D0\u4F9B\u6212\u83F8\u8AEE\u8A62\u3002", url: "https://www.mohw.gov.tw/cp-2704-76938-1.html" });
  if (betelNeedsAttention) platforms.push({ name: "\u5065\u5EB7\u4E5D\u4E5D\u6212\u6AB3\u5C08\u5340", purpose: "\u53D6\u5F97\u6212\u6AB3\u3001\u53E3\u8154\u9ECF\u819C\u6AA2\u67E5\u8207\u76F8\u95DC\u885B\u6559\u8CC7\u8A0A\u3002", url: "https://health99.hpa.gov.tw/health99/Subject/Detail/10644?nodeId=10" });
  return {
    priorities: priorities.slice(0, 4),
    exercisePlan,
    nutritionPlan,
    lifestylePlan,
    platforms
  };
}

// src/report-builder.ts
var answerLabels = {
  never: "\u5F9E\u4F86\u6C92\u6709\uFF0F\u4E0D\u4F7F\u7528",
  passive: "\u4E0D\u62BD\u83F8\uFF0C\u4F46\u7D93\u5E38\u5438\u4E8C\u624B\u83F8",
  former: "\u4EE5\u524D\u4F7F\u7528\uFF0C\u73FE\u5728\u5DF2\u505C\u6B62",
  occasional: "\u5076\u723E",
  occasionally: "\u5076\u723E",
  daily: "\u6BCF\u5929",
  never_or_lt_weekly: "\u4E0D\u559D\u6216\u6BCF\u9031\u5C11\u65BC\u4E00\u6B21",
  weekly_1_2: "\u6BCF\u9031\u4E00\u81F3\u4E8C\u6B21",
  weekly_3_4: "\u6BCF\u9031\u4E09\u81F3\u56DB\u6B21",
  weekly_5_6: "\u6BCF\u9031\u4E94\u81F3\u516D\u6B21",
  weekly_1_3: "\u6BCF\u9031\u4E00\u81F3\u4E09\u6B21",
  weekly_4_5: "\u6BCF\u9031\u56DB\u81F3\u4E94\u6B21",
  weekly_6_or_daily: "\u6BCF\u9031\u516D\u6B21\u6216\u6BCF\u5929",
  daily_or_more: "\u6BCF\u5929\u4E00\u6B21\u4EE5\u4E0A",
  weekly_4_6: "\u6BCF\u9031\u56DB\u81F3\u516D\u6B21",
  weekly_2_3: "\u6BCF\u9031\u4E8C\u81F3\u4E09\u6B21",
  weekly_once: "\u6BCF\u9031\u4E00\u6B21",
  rare_or_none: "\u4E0D\u904B\u52D5\u6216\u6BCF\u9031\u5C11\u65BC\u4E00\u6B21",
  lt_half_bowl: "\u4E0D\u5403\u6216\u6BCF\u5929\u5C11\u65BC\u534A\u7897",
  half_to_one_bowl: "\u6BCF\u5929\u534A\u7897\u81F3\u4E00\u7897\u4EE5\u5167",
  one_to_1_5_bowls: "\u6BCF\u5929\u4E00\u7897\u81F3\u4E00\u7897\u534A\u4EE5\u5167",
  one_5_to_two_bowls: "\u6BCF\u5929\u4E00\u7897\u534A\u81F3\u5169\u7897\u4EE5\u5167",
  gte_two_bowls: "\u6BCF\u5929\u5169\u7897\u6216\u4EE5\u4E0A",
  often: "\u7D93\u5E38",
  always: "\u7E3D\u662F",
  lt_weekly: "\u4E0D\u5403\u6216\u6BCF\u9031\u5C11\u65BC\u4E00\u6B21"
};
function label(value) {
  return answerLabels[value] ?? value;
}
var defaultRiskLabels = {
  low: "\u8F03\u4F4E\u98A8\u96AA",
  intermediate: "\u4E2D\u7B49\u98A8\u96AA",
  high: "\u8F03\u9AD8\u98A8\u96AA"
};
function buildMetabolicRiskReport(input) {
  const { data, result } = input;
  const guidance = buildConditionalGuidance(data, result, {
    useWaist: input.useWaist,
    variant: input.variant,
    rules: input.rules
  });
  const riskLabels = { ...defaultRiskLabels, ...input.riskLabels };
  const useWaist = input.useWaist ?? typeof data.waistCm === "number";
  return {
    generatedAt: input.generatedAt ?? /* @__PURE__ */ new Date(),
    modelName: input.modelName,
    modelRoute: input.modelRoute,
    riskKey: result.group,
    riskLabel: riskLabels[result.group],
    riskIndex: result.index,
    basicData: [
      { label: "\u5E74\u9F61", value: `${data.age} \u6B72` },
      { label: "\u751F\u7406\u6027\u5225", value: data.sex === "male" ? "\u7537\u6027" : "\u5973\u6027" },
      { label: "\u8EAB\u9AD8", value: `${data.heightCm} cm` },
      { label: "\u9AD4\u91CD", value: `${data.weightKg} kg` },
      { label: "\u8170\u570D", value: useWaist && typeof data.waistCm === "number" ? `${data.waistCm} cm` : "\u672A\u63D0\u4F9B" },
      { label: "BMI", value: result.bmi.toFixed(1) },
      { label: "\u6BCF\u65E5\u7761\u7720", value: `${data.sleepHours} \u5C0F\u6642` },
      { label: "\u7761\u7720\u5206\u985E", value: result.sleepCategory },
      { label: "\u4F7F\u7528\u6A21\u578B", value: input.modelName },
      { label: "\u98A8\u96AA\u6307\u6578", value: `${result.index}\uFF0F100` }
    ],
    habits: [
      { label: "\u62BD\u83F8\u72C0\u6CC1", value: label(data.smokingStatus) },
      { label: "\u98F2\u9152\u72C0\u6CC1", value: label(data.drinkingStatus) },
      { label: "\u6AB3\u6994\u4F7F\u7528", value: label(data.betelStatus) },
      { label: "\u904B\u52D5\u983B\u7387", value: label(data.exerciseFrequency) },
      { label: "\u852C\u83DC\u651D\u53D6", value: label(data.vegetableIntake) },
      { label: "\u6C34\u679C\u651D\u53D6", value: label(data.fruitIntake) },
      { label: "\u70B8\u7269\u8207\u52A0\u5DE5\u98DF\u54C1", value: label(data.friedProcessedFood) },
      { label: "\u91CD\u9E79\u91AC\u6599\u7FD2\u6163", value: label(data.saltySauceHabit) }
    ],
    factors: result.factors,
    recommendations: [],
    ...guidance,
    branding: input.branding,
    disclaimer: input.disclaimer ?? "\u91CD\u8981\u8AAA\u660E\uFF1A\u672C\u5831\u544A\u50C5\u4F9B\u98A8\u96AA\u6559\u80B2\uFF0C\u4E0D\u69CB\u6210\u8A3A\u65B7\u3001\u8655\u65B9\u6216\u500B\u5225\u91AB\u7642\u5EFA\u8B70\uFF0C\u4E5F\u4E0D\u80FD\u53D6\u4EE3\u5065\u5EB7\u6AA2\u67E5\u6216\u91AB\u7642\u5C08\u696D\u4EBA\u54E1\u8A55\u4F30\u3002"
  };
}
export {
  buildConditionalGuidance,
  buildMetabolicRiskReport,
  createRiskPdfBlob,
  defaultGuidanceRules,
  downloadMetabolicRiskPdf,
  downloadRiskPdf
};
