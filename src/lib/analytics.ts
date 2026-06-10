import {
  type AnalyticsPeriod,
} from "@/lib/analytics-period";

export type ChartSeries = { bucket: string; total: number }[];

export type Demographics = {
  total_users: number;
  deleted_users: number;
  avg_age: number | null;
  gender: Record<string, number>;
  cities: { name: string; count: number }[];
  countries: { name: string; count: number }[];
};

export type AnalyticsSnapshot = {
  period: AnalyticsPeriod;
  userSignups: ChartSeries;
  userDeletions: ChartSeries;
  productCreated: ChartSeries;
  productDeleted: ChartSeries;
  demographics: Demographics;
  rpcAvailable: boolean;
};
