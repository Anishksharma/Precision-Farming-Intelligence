import React, { useState, useEffect } from 'react';
import { useFarmingStore } from '../../../store/farmingStore';
import { ChartWrapper } from '../../../components/charts/ChartWrapper';
import { LineChart } from '../../../components/charts/LineChart';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  BookOpen,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Award,
} from 'lucide-react';

const CaseStudies: React.FC = () => {
  const { caseStudies, startCaseStudy, pauseCaseStudy, resetCaseStudy, advanceCaseStudy } = useFarmingStore();
  const [selectedCaseId, setSelectedCaseId] = useState<string>(caseStudies[0]?.id || 'case-drought');

  const currentCase = caseStudies.find((cs) => cs.id === selectedCaseId) || caseStudies[0];

  // Auto-step timer when running
  useEffect(() => {
    let interval: any = null;
    if (currentCase.status === 'running') {
      interval = setInterval(() => {
        advanceCaseStudy(currentCase.id);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [currentCase.status, currentCase.id, advanceCaseStudy]);

  // Timeline events sliced up to current step
  const visibleTimeline = currentCase.timeline.slice(0, Math.max(1, currentCase.currentStep));

  // Sliced chart data up to current step
  const visibleChartData = currentCase.chartData.slice(
    0,
    Math.max(2, Math.floor((currentCase.currentStep / currentCase.totalSteps) * currentCase.chartData.length))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl tracking-wide text-[#F4F1E9]">
            INTERACTIVE AGRONOMIC CASE STUDIES
          </h1>
          <p className="text-xs font-mono text-[#A6A69A] mt-0.5">
            Empirical simulations of critical agricultural risk vectors, sensor failures, and smart water management
          </p>
        </div>

        <Badge variant="orange" size="md">
          SIMULATED VALIDATION SCENARIOS
        </Badge>
      </div>

      {/* Case Study Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto p-1 rounded-xl border bg-[#10100E] border-[#34342B] font-mono text-xs">
        {caseStudies.map((cs) => {
          const isSelected = cs.id === selectedCaseId;
          return (
            <button
              key={cs.id}
              onClick={() => setSelectedCaseId(cs.id)}
              className="px-3.5 py-2 rounded-lg whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer"
              style={{
                backgroundColor: isSelected ? '#FF8A24' : 'transparent',
                color: isSelected ? '#0B0B0A' : '#A6A69A',
                fontWeight: isSelected ? 600 : 400,
              }}
            >
              <BookOpen size={13} />
              <span>{cs.title.split(':')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Active Case Header & Interactive Playback Controls */}
      <Card className="p-4 space-y-4 border-l-4 border-l-[#FF8A24]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1 max-w-2xl">
            <h2 className="font-heading font-bold text-lg text-[#F4F1E9]">
              {currentCase.title}
            </h2>
            <p className="text-xs font-mono text-[#A6A69A] leading-relaxed">
              {currentCase.description}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 font-mono text-xs">
            {currentCase.status === 'running' ? (
              <Button
                variant="secondary"
                size="sm"
                icon={<Pause size={14} />}
                onClick={() => pauseCaseStudy(currentCase.id)}
              >
                Pause
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                icon={<Play size={14} />}
                onClick={() => startCaseStudy(currentCase.id)}
                disabled={currentCase.status === 'completed'}
              >
                {currentCase.currentStep === 0 ? 'Start Scenario' : 'Resume'}
              </Button>
            )}

            <Button
              variant="secondary"
              size="sm"
              icon={<FastForward size={14} />}
              onClick={() => advanceCaseStudy(currentCase.id)}
              disabled={currentCase.status === 'completed'}
            >
              Step
            </Button>

            <Button
              variant="outline"
              size="sm"
              icon={<RotateCcw size={14} />}
              onClick={() => resetCaseStudy(currentCase.id)}
            >
              Reset
            </Button>
          </div>
        </div>

        {/* Progress Step Bar */}
        <div className="space-y-1 font-mono text-xs pt-2 border-t border-[#34342B]">
          <div className="flex justify-between text-[#A6A69A]">
            <span>Scenario Progress: Step {currentCase.currentStep} of {currentCase.totalSteps}</span>
            <span className="font-bold text-[#FF8A24]">
              {Math.round((currentCase.currentStep / currentCase.totalSteps) * 100)}%
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#20201B] overflow-hidden">
            <div
              className="h-full bg-[#FF8A24] transition-all duration-300 rounded-full"
              style={{ width: `${(currentCase.currentStep / currentCase.totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Main Simulation Chart & Before/After Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Dynamic Simulation Chart */}
        <div className="lg:col-span-2">
          <ChartWrapper
            title="Real-Time Hydrology Simulation Curve"
            subtitle="Live tracking of soil water response across scenario step progression"
          >
            <LineChart
              data={visibleChartData}
              xAxisKey="time"
              series={[
                { key: 'value', name: 'Simulated Soil Moisture (%)', color: '#FF8A24', strokeWidth: 2.5 },
                { key: 'baseline', name: 'Baseline Schedule (%)', color: '#A6A69A', strokeDasharray: '4 4' },
              ]}
              yAxisLabel="Vol %"
              height={280}
            />
          </ChartWrapper>
        </div>

        {/* Before vs After Quantitative Matrix */}
        <Card className="space-y-4">
          <h3 className="font-heading font-semibold text-sm text-[#F4F1E9] border-b border-[#34342B] pb-2">
            Quantitative Impact Analysis
          </h3>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-3 rounded-lg bg-[#10100E] border border-[#282820] space-y-1">
              <span className="text-[10px] text-[#A6A69A] block uppercase font-bold">Initial State</span>
              <div className="text-sm font-bold text-[#F4F1E9]">
                {currentCase.beforeState.soilMoisture}% Moist
              </div>
              <div className="text-[10px] text-[#6B6B60]">
                Temp: {currentCase.beforeState.tempCelsius}°C
              </div>
              <div className="text-[10px] text-[#54E38E]">
                Yield Loss: 0%
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#10100E] border border-[#282820] space-y-1">
              <span className="text-[10px] text-[#FF8A24] block uppercase font-bold">Projected Outcome</span>
              <div className="text-sm font-bold text-[#FF8A24]">
                {currentCase.afterState.soilMoisture}% Moist
              </div>
              <div className="text-[10px] text-[#6B6B60]">
                Temp: {currentCase.afterState.tempCelsius}°C
              </div>
              <div className="text-[10px] text-[#FF4545]">
                Risk: {currentCase.afterState.projectedYieldLoss}% Impact
              </div>
            </div>
          </div>

          {/* Recommendation Box */}
          <div className="p-3 rounded-lg bg-[#20201B] border border-[#34342B] text-xs font-mono space-y-1.5">
            <div className="flex items-center gap-1.5 text-[#54E38E] font-bold">
              <Lightbulb size={14} />
              <span>Recommended Directives:</span>
            </div>
            <p className="text-[11px] text-[#F4F1E9] leading-relaxed">
              {currentCase.recommendation}
            </p>
          </div>

          {/* Measurable Outcome */}
          <div className="p-3 rounded-lg bg-[#54E38E]/10 border border-[#54E38E]/30 text-xs font-mono space-y-1">
            <div className="flex items-center gap-1.5 text-[#54E38E] font-bold">
              <Award size={14} />
              <span>Measurable Result:</span>
            </div>
            <p className="text-[11px] text-[#F4F1E9] leading-relaxed">
              {currentCase.outcome}
            </p>
          </div>
        </Card>
      </div>

      {/* Step Event Timeline */}
      <Card className="space-y-3">
        <h3 className="font-heading font-semibold text-sm text-[#F4F1E9] border-b border-[#34342B] pb-2">
          Scenario Chronology & Event Log
        </h3>

        <div className="space-y-2 font-mono text-xs">
          {visibleTimeline.map((evt, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-lg border bg-[#10100E] border-[#282820] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#FF8A24] font-bold px-2 py-0.5 rounded bg-[#FF8A24]/10">
                  {evt.timestamp}
                </span>
                <span className="font-semibold text-[#F4F1E9]">{evt.event}</span>
              </div>
              <span className="text-[11px] text-[#A6A69A]">{evt.impact}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default CaseStudies;
