// Matches MetabolicResult.css. Scoped so the host website is not restyled.
export const reportTheme = `
.portable-pdf-report {
  padding: 30px 32px;
  min-height: 0;
  color: #1d2939;
  background: linear-gradient(180deg, #f4fbfa 0%, #ffffff 45%, #f7fafc 100%);
  font-family: "Microsoft JhengHei", "Noto Sans TC", Arial, sans-serif;
  line-height: 1.8;
}
.portable-pdf-report .pdf-header {
  text-align: center; padding: 0 0 22px; border-bottom: 1px solid #e5ecef;
}
.portable-pdf-report .pdf-brand-icon {
  width: 40px; height: 40px; margin: 0 auto 12px; border-radius: 12px;
  color: #17897f; background: #e2f6f2; font-size: 22px; line-height: 40px;
}
.portable-pdf-report .pdf-kicker {
  display: inline-block; padding: 5px 12px; margin: 0 0 12px;
  border-radius: 999px; border: 1px solid #d2eee9;
  color: #16877d; background: #e6f7f4; font-size: 11px; letter-spacing: 1px;
}
.portable-pdf-report .pdf-title { color: #202d3e; font-size: 28px; font-weight: 800; line-height: 1.5; }
.portable-pdf-report .pdf-subtitle { color: #7b8898; font-size: 13px; margin-top: 8px; }
.portable-pdf-report .pdf-meta { justify-content: center; color: #748293; font-size: 11px; margin-top: 12px; }
.portable-pdf-report .pdf-section {
  padding: 20px; margin-top: 18px; border: 1px solid #dfe8e9; border-radius: 23px;
  background: #ffffff; box-shadow: 0 8px 20px rgba(34,55,70,0.05);
}
.portable-pdf-report .pdf-section h2 {
  margin: 0 0 14px; color: #263345; font-size: 18px; font-weight: 750;
  border-left: 4px solid #28aa9e; padding-left: 10px; line-height: 1.5;
}
.portable-pdf-report .pdf-field-grid { gap: 10px; }
.portable-pdf-report .pdf-field {
  border-radius: 15px; padding: 12px 16px; border: 1px solid #d9ebe7;
  background: linear-gradient(135deg,#eef9f6,#f7fcfb);
}
.portable-pdf-report .pdf-field:nth-child(even) {
  background: linear-gradient(135deg,#f3f5fb,#fafbfe); border-color: #e1e5f0;
}
.portable-pdf-report .pdf-field-label { color: #748293; font-size: 12px; }
.portable-pdf-report .pdf-field-value { color: #344153; font-size: 16px; overflow-wrap: anywhere; }
.portable-pdf-report .pdf-risk-card {
  text-align: center; border: 1px solid #d9ebe7; border-radius: 15px;
  padding: 18px; background: linear-gradient(135deg,#eef9f6,#f7fcfb);
}
.portable-pdf-report .pdf-risk-value { color: #268b71; font-size: 34px; font-weight: 800; }
.portable-pdf-report .pdf-risk-card[data-level="medium"] { border-color: #eee2c7; background: #fff9ed; }
.portable-pdf-report .pdf-risk-card[data-level="medium"] .pdf-risk-value { color: #b6822c; }
.portable-pdf-report .pdf-risk-card[data-level="high"] { border-color: #efd6d6; background: #fff4f3; }
.portable-pdf-report .pdf-risk-card[data-level="high"] .pdf-risk-value { color: #cc5e5e; }
.portable-pdf-report .pdf-risk-label { color: #748293; }
.portable-pdf-report .pdf-risk-description { color: #657487; font-size: 13px; }
.portable-pdf-report .pdf-list { padding-left: 22px; color: #526274; font-size: 14px; }
.portable-pdf-report .pdf-list li { margin: 9px 0; padding-left: 4px; break-inside: avoid; overflow-wrap: anywhere; }
.portable-pdf-report .pdf-list li::marker { color: #17897f; }
.portable-pdf-report .pdf-note { border-radius: 12px; color: #657487; background: #f7fafc; font-size: 12px; }
.portable-pdf-report .pdf-footer { color: #748293; border-color: #e5ecef; font-size: 11px; margin-top: 22px; }
`;
