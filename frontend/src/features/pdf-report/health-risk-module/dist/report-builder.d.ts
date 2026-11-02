import { type GuidanceRules, type MetabolicQuestionnaireData, type RiskKey, type RiskResult } from "./advice-engine";
import type { PdfBranding, PdfReportData } from "./pdf-report";
export type BuildMetabolicReportInput = {
    data: MetabolicQuestionnaireData;
    result: RiskResult;
    modelName: string;
    modelRoute: string;
    useWaist?: boolean;
    generatedAt?: Date;
    variant?: number;
    rules?: Partial<GuidanceRules>;
    branding?: Partial<PdfBranding>;
    riskLabels?: Partial<Record<RiskKey, string>>;
    disclaimer?: string;
};
export declare function buildMetabolicRiskReport(input: BuildMetabolicReportInput): PdfReportData;
