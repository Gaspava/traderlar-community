'use client';

import { ProfessionalMetrics } from '@/lib/professional-metrics';
import { ModernAnalysisLayout } from './modern-analysis-cards';
import { ExtendedAnalysisLayout } from './modern-analysis-cards-extended';
import { AdvancedAnalysisLayout, RollingMetricsCard, PerformanceRadarCard } from './modern-analysis-cards-advanced';

interface ModernDetailedAnalysisProps {
  metrics: ProfessionalMetrics;
}

export function ModernDetailedAnalysis({ metrics }: ModernDetailedAnalysisProps) {
  return (
    <div className="space-y-6">{/* Header removed - only keep the cards */}

      {/* Top Priority: Rolling Metrics & Performance Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RollingMetricsCard metrics={metrics} />
        </div>
        <div className="lg:col-span-1">
          <PerformanceRadarCard metrics={metrics} />
        </div>
      </div>

      {/* Rest of the Analysis Cards */}
      <ModernAnalysisLayout metrics={metrics} />
      <ExtendedAnalysisLayout metrics={metrics} />
      <AdvancedAnalysisLayout metrics={metrics} />
    </div>
  );
}