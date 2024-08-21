export interface OnboardingFormValues {
    companyName: string;
    website: string;
    industry: string;
    adSpend: number;
    adChannels: string[];
    otherAdChannel?: string;
    primaryGoal: string;
    targetAudience: string;
    audienceDescription: string;
    mainKPI: string;
    otherKPI?: string;
    currentPerformance: string;
    targetPerformance: string;
    mainChallenge: string;
    otherChallenge?: string;
    primaryAdPlatform: string;
    otherAdPlatform?: string;
    primaryAnalyticsTool: string;
    otherAnalyticsTool?: string;
    coreOnboardingCompleted?: boolean;
    extendedOnboardingCompleted?: boolean;
}

export interface QuestionConfig {
    name: keyof OnboardingFormValues;
    label: string;
    component: React.ComponentType<any>;
    options?: { value: string; label: string }[];
    condition?: (values: OnboardingFormValues) => boolean;
}