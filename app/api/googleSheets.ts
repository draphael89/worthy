import axios from 'axios';
import { memoize } from 'lodash';
import { AdData } from '../../app/types/AdData';

const SPREADSHEET_ID = '1GxiFy92X3Zy7plTfl1dkKwy2g5qCoNauFu7xywtG7qY';
const API_KEY = 'AIzaSyBnIRQKwbGzKypv5tE2DaOsvJG0amKQ0Ww';
const BATCH_SIZE = 10000;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

class GoogleSheetsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GoogleSheetsError';
  }
}

const memoizedCalculateCPM = memoize(calculateCPM);
const memoizedCalculateCTR = memoize(calculateCTR);
const memoizedCalculateCostPerMetric = memoize(calculateCostPerMetric);
const memoizedCalculateRatio = memoize(calculateRatio);

export const fetchAdData = async (): Promise<AdData[]> => {
  try {
    let allData: string[][] = [];
    let range = 'A1:K50000';
    let totalRowsFetched = 0;
    
    while (true) {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}?key=${API_KEY}`;
      const response = await axios.get<{ values: string[][], range: string }>(url);
      
      if (!response.data.values || response.data.values.length === 0) {
        break;
      }
      
      const newRows = response.data.values.slice(totalRowsFetched ? 1 : 0);
      allData = allData.concat(newRows);
      totalRowsFetched += newRows.length;
      
      if (newRows.length < 50000) {
        break;
      }
      
      const lastRowMatch = response.data.range?.split(':')[1]?.match(/\d+/);
      if (!lastRowMatch) {
        throw new Error('Unable to parse last row number from range');
      }
      const lastRow = parseInt(lastRowMatch[0], 10);
      range = `A${lastRow + 1}:K${lastRow + 50000}`;
    }

    console.log(`Total rows fetched: ${totalRowsFetched}`);

    const processedData = processRawData(allData);
    logSampleData(processedData);
    return processedData;
  } catch (error) {
    console.error('Error fetching Google Sheets data:', error);
    throw new GoogleSheetsError('Failed to fetch data from Google Sheets');
  }
};

const processRawData = (rawData: string[][]): AdData[] => {
  if (rawData.length === 0) {
    return [];
  }
  const headers = rawData[0];
  if (!headers) {
    throw new Error('No headers found in raw data');
  }
  const rows = rawData.slice(1);
  const processedData: AdData[] = [];

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const batchData = processBatch(headers, batch);
    processedData.push(...batchData);
  }

  return processedData;
};

const processBatch = (headers: string[], batch: string[][]): AdData[] => {
  return batch.map((row, index) => {
    const rowData = Object.fromEntries(headers.map((header, i) => [header, row[i] || '']));
    return createAdDataRecord(rowData, index);
  });
};

const createAdDataRecord = (rowData: Record<string, string>, index: number): AdData => {
  const parseNumber = (value: string): number => {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  const parseInteger = (value: string): number => {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? 0 : parsed;
  };

  const spend = parseNumber(rowData['Amount Spent (USD)'] || '0');
  const impressions = parseInteger(rowData['Impressions'] || '0');
  const clicks = parseInteger(rowData['Link Clicks'] || '0');
  const installs = parseInteger(rowData['App Installs'] || '0');
  const registrations = parseInteger(rowData['Registrations Completed'] || '0');
  const purchases = parseInteger(rowData['Purchases'] || '0');

  return {
    id: `${rowData['Date'] || 'unknown'}-${index}`,
    date: rowData['Date'] || 'unknown',
    dataSourceTypeName: rowData['Data Source type name'] || 'unknown',
    campaignName: rowData['Campaign Name'] || 'unknown',
    adSetName: rowData['Ad Set Name'] || 'unknown',
    adName: rowData['Ad Name'] || 'unknown',
    amountSpent: spend,
    spend,
    impressions,
    linkClicks: clicks,
    clicks,
    appInstalls: installs,
    installs,
    registrationsCompleted: registrations,
    registrations,
    purchases,
    cpm: memoizedCalculateCPM(spend, impressions),
    clickThroughRate: memoizedCalculateCTR(clicks, impressions),
    costPerLinkClick: memoizedCalculateCostPerMetric(spend, clicks),
    costPerAppInstall: memoizedCalculateCostPerMetric(spend, installs),
    clickToInstall: memoizedCalculateRatio(installs, clicks),
    costPerRegistration: memoizedCalculateCostPerMetric(spend, registrations),
    costPerPurchase: memoizedCalculateCostPerMetric(spend, purchases),
    installToPurchase: memoizedCalculateRatio(purchases, installs),
  };
};

function calculateCPM(spend: number, impressions: number): number {
  return impressions > 0 ? (spend / impressions) * 1000 : 0;
}

function calculateCTR(clicks: number, impressions: number): number {
  return impressions > 0 ? clicks / impressions : 0;
}

function calculateCostPerMetric(spend: number, metric: number): number {
  return metric > 0 ? spend / metric : 0;
}

function calculateRatio(numerator: number, denominator: number): number {
  return denominator > 0 ? numerator / denominator : 0;
}

function logSampleData(data: AdData[]): void {
  if (data.length > 0) {
    console.log('Sample data:', {
      totalRecords: data.length,
      firstRecord: data[0],
      lastRecord: data[data.length - 1],
      totalSpend: data.reduce((sum, item) => sum + item.spend, 0).toFixed(2),
      totalImpressions: data.reduce((sum, item) => sum + item.impressions, 0),
      totalClicks: data.reduce((sum, item) => sum + item.clicks, 0),
      totalInstalls: data.reduce((sum, item) => sum + item.installs, 0),
      totalRegistrations: data.reduce((sum, item) => sum + item.registrations, 0),
      totalPurchases: data.reduce((sum, item) => sum + item.purchases, 0),
    });
  } else {
    console.log('No data fetched');
  }
}

let cachedData: AdData[] | null = null;
let lastFetchTime: number | null = null;

export const fetchAdDataWithCache = async (): Promise<AdData[]> => {
  const now = Date.now();
  if (cachedData && lastFetchTime && now - lastFetchTime < CACHE_DURATION) {
    return cachedData;
  }

  const data = await fetchAdData();
  cachedData = data;
  lastFetchTime = now;
  return data;
};

export const validateDataStructure = (data: AdData[]): boolean => {
  if (data.length === 0) {
    console.error('Data array is empty');
    return false;
  }

  const requiredFields: (keyof AdData)[] = [
    'date', 'dataSourceTypeName', 'campaignName', 'adSetName', 'adName',
    'spend', 'impressions', 'clicks', 'installs', 
    'registrations', 'purchases'
  ];

  const sampleRecord = data[0];
  if (!sampleRecord) {
    console.error('Sample record is undefined');
    return false;
  }

  const missingFields = requiredFields.filter(field => !(field in sampleRecord));

  if (missingFields.length > 0) {
    console.error('Missing required fields in data:', missingFields);
    return false;
  }

  return true;
};

export const fetchAndValidateAdData = async (): Promise<AdData[]> => {
  const data = await fetchAdDataWithCache();
  if (!validateDataStructure(data)) {
    throw new Error('Invalid data structure');
  }
  return data;
};