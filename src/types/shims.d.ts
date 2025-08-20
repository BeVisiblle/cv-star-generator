/* Empty on purpose: PDF height is managed via generators; these styles focus on page-break hygiene and consistent wrappers. */

declare global {
  interface Window {
    cvAutoFitSmart?: (options?: {
      safetyMm?: number;
      headerMin?: number;
      contentMin?: number;
      step?: number;
      growStep?: number;
      maxGrow?: number;
      maxIter?: number;
      pagesPrimary?: number;
      pagesFallback?: number;
    }) => Promise<{ pages: number }>;
  }
}

export {};
