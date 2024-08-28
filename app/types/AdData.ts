// Define the main AdData interface
export interface AdData {
    id: string;
    date: string;
    dataSourceTypeName: string;
    campaignName: string;
    adSetName: string;
    adName: string;
    amountSpent: number;
    spend: number;
    clicks: number;
    installs: number;
    registrations: number;
    impressions: number;
    linkClicks: number;
    appInstalls: number;
    registrationsCompleted: number;
    purchases: number;
    cpm: number;
    clickThroughRate: number;
    costPerLinkClick: number;
    costPerAppInstall: number;
    clickToInstall: number;
    costPerRegistration: number;
    costPerPurchase: number;
    installToPurchase: number;
}

// Define the DateRange type
export type DateRange = {
    start: string;
    end: string;
};

// Define the ViewMode type
export type ViewMode = 'daily' | 'weekly' | 'monthly';

// Define constants related to AdData
export const AD_DATA_METRICS = [
    'amountSpent',
    'impressions',
    'linkClicks',
    'appInstalls',
    'registrationsCompleted',
    'purchases',
    'cpm',
    'clickThroughRate',
    'costPerLinkClick',
    'costPerAppInstall',
    'clickToInstall',
    'costPerRegistration',
    'costPerPurchase',
    'installToPurchase'
] as const;

// Define the AdDataMetric type
export type AdDataMetric = typeof AD_DATA_METRICS[number];

// Define props for chart components
export interface ChartComponentProps {
    resource: string;
}

// Define a type for numeric keys of AdData
export type NumericAdDataKey = {
    [K in keyof AdData]: AdData[K] extends number ? K : never
}[keyof AdData];

// Define a type for aggregated AdData
export type AggregatedAdData = {
    [key: string]: AdData;
};

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  metadata: {
    creationTime: string;
    lastSignInTime: string;
  };
}