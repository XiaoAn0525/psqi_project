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
    basicData: Array<{
        label: string;
        value: string;
    }>;
    habits: Array<{
        label: string;
        value: string;
    }>;
    factors: string[];
    recommendations: string[];
    priorities: Array<{
        title: string;
        detail: string;
    }>;
    exercisePlan: {
        goal: string;
        activities: string[];
        strength: string[];
        reduce: string[];
        safety: string[];
    } | null;
    nutritionPlan: {
        cards: Array<{
            title: string;
            text: string;
            tone: "mint" | "warm" | "neutral";
        }>;
        reduce: string[];
        actionExample: string;
    } | null;
    lifestylePlan: Array<{
        title: string;
        detail: string;
    }>;
    platforms: Array<{
        name: string;
        purpose: string;
        url: string;
    }>;
    disclaimer: string;
    branding?: Partial<PdfBranding>;
};
export declare function createRiskPdfBlob(report: PdfReportData): Promise<Blob>;
export declare function downloadRiskPdf(report: PdfReportData): Promise<void>;
/** 與原網站相容的舊函式名稱。 */
export declare const downloadMetabolicRiskPdf: typeof downloadRiskPdf;
