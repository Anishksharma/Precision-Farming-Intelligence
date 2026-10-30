import React, { useState, useEffect } from 'react';
import { runAll127Tests, type TestExecutionSummary } from '../test/testRunner';
import { TEST_MODULES, type TestCase } from '../test/testData';
import { ChartWrapper } from '../components/charts/ChartWrapper';
import { BarChart } from '../components/charts/BarChart';
import { DonutChart } from '../components/charts/DonutChart';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  RotateCw,
  Search,
  Filter,
  ShieldCheck,
  Clock,
  Layers,
  Terminal,
} from 'lucide-react';
import { formatDate } from '../utils/formatUtils';

const TestResults: React.FC = () => {
  const [summary, setSummary] = useState<TestExecutionSummary | null>(null);
  const [running, setRunning] = useState<boolean>(false);
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [history, setHistory] = useState<{ timestamp: Date; passPercentage: number; durationMs: number }[]>([]);

  const executeTests = async () => {
    setRunning(true);
    try {
      const res = await runAll127Tests();
      setSummary(res);
      setHistory((prev) => [
        {
          timestamp: res.executionTimestamp,
          passPercentage: res.passPercentage,
          durationMs: res.totalDurationMs,
        },
        ...prev.slice(0, 4),
      ]);
    } catch (e) {
      console.error(e);
    } finally {
      setRunning(false);
    }
  };

  useEffect(() => {
    executeTests();
  }, []);

  if (!summary) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-3 font-mono text-xs">
        <RotateCw size={28} className="animate-spin text-[#FF8A24]" />
        <span className="text-[#A6A69A]">Executing 127 Automated Test Assertions...</span>
      </div>
    );
  }

  // Filtered test case list
  const filteredCases = summary.results.filter((tc) => {
    if (selectedModule !== 'all' && tc.module !== selectedModule) return false;
    if (selectedStatus !== 'all' && tc.status !== selectedStatus) return false;
    if (
      searchQuery &&
      !tc.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !tc.id.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  // Module distribution bar chart data
  const moduleChartData = Object.entries(summary.moduleBreakdown).map(([mod, stats]) => ({
    module: mod.split(' ')[0] + '..',
    passed: stats.passed,
    failed: stats.failed,
  }));

  // Status donut data
  const donutData = [
    { name: 'Passed', value: summary.passed, color: '#54E38E' },
    { name: 'Failed', value: summary.failed, color: '#FF4545' },
    { name: 'Blocked', value: summary.blocked, color: '#FFB547' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl tracking-wide text-[#F4F1E9]">
            TEST EXECUTION MATRIX & QA DASHBOARD
          </h1>
          <p className="text-xs font-mono text-[#A6A69A] mt-0.5">
            Strict empirical validation across 127 automated test cases for Universal Engine & Precision Farming
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<RotateCw size={14} className={running ? 'animate-spin' : ''} />}
          onClick={executeTests}
          disabled={running}
        >
          {running ? 'Executing...' : 'Re-Run All 127 Tests'}
        </Button>
      </div>

      {/* Top Level Summary Statistics (4 Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        <Card padding="sm" className="space-y-1">
          <span className="text-[10px] text-[#A6A69A] block uppercase">Total Test Suite</span>
          <span className="font-heading text-3xl font-bold text-[#F4F1E9] block">
            {summary.total}
          </span>
          <span className="text-[10px] text-[#A6A69A]">12 Modules Covered</span>
        </Card>

        <Card padding="sm" className="space-y-1">
          <span className="text-[10px] text-[#54E38E] block uppercase font-bold">Passed Assertions</span>
          <span className="font-heading text-3xl font-bold text-[#54E38E] block">
            {summary.passed}
          </span>
          <span className="text-[10px] text-[#A6A69A]">Passed verification</span>
        </Card>

        <Card padding="sm" className="space-y-1">
          <span className="text-[10px] text-[#FF4545] block uppercase font-bold">Failed / Blocked</span>
          <span className="font-heading text-3xl font-bold text-[#FF4545] block">
            {summary.failed + summary.blocked}
          </span>
          <span className="text-[10px] text-[#A6A69A]">Zero regressions</span>
        </Card>

        <Card padding="sm" className="space-y-1">
          <span className="text-[10px] text-[#FF8A24] block uppercase font-bold">Calculated Pass %</span>
          <span className="font-heading text-3xl font-bold text-[#FF8A24] block">
            {summary.passPercentage}%
          </span>
          <span className="text-[10px] text-[#A6A69A]">
            Duration: {summary.totalDurationMs} ms
          </span>
        </Card>
      </div>

      {/* Charts Row: Module Breakdown & Execution Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartWrapper
          title="Module-Wise Test Distribution"
          subtitle="Pass / fail counts across all 12 architectural functional domains"
          className="lg:col-span-2"
        >
          <BarChart
            data={moduleChartData}
            xAxisKey="module"
            series={[
              { key: 'passed', name: 'Passed', color: '#54E38E' },
              { key: 'failed', name: 'Failed', color: '#FF4545' },
            ]}
            yAxisLabel="Tests"
            height={260}
          />
        </ChartWrapper>

        <ChartWrapper
          title="Overall Test Status Distribution"
          subtitle="Relative ratio of completed test states"
        >
          <DonutChart data={donutData} innerRadius={50} outerRadius={75} />
        </ChartWrapper>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border bg-[#171714] border-[#34342B] text-xs font-mono">
        <div className="flex items-center gap-2 min-w-[200px]">
          <Search size={14} className="text-[#A6A69A]" />
          <input
            type="text"
            placeholder="Search by ID or test name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#10100E] border border-[#34342B] rounded px-2.5 py-1 text-[#F4F1E9] outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[#A6A69A]">Module:</span>
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="rounded border px-2 py-1 bg-[#10100E] border-[#34342B] text-[#F4F1E9] outline-none max-w-[200px]"
          >
            <option value="all">All Modules ({summary.total})</option>
            {TEST_MODULES.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          <span className="text-[#A6A69A] ml-2">Status:</span>
          {['all', 'passed', 'failed'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className="px-2.5 py-1 rounded capitalize transition-colors"
              style={{
                backgroundColor: selectedStatus === st ? '#FF8A24' : '#20201B',
                color: selectedStatus === st ? '#0B0B0A' : '#A6A69A',
                fontWeight: selectedStatus === st ? 600 : 400,
              }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Detailed Test Cases Table */}
      <Card className="space-y-3">
        <div className="flex items-center justify-between border-b border-[#34342B] pb-2">
          <h3 className="font-heading font-semibold text-sm text-[#F4F1E9]">
            Individual Test Case Logs ({filteredCases.length} of 127)
          </h3>
          <span className="text-[10px] font-mono text-[#A6A69A]">
            Timestamp: {formatDate(summary.executionTimestamp, 'datetime')}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#34342B] text-[#A6A69A]">
                <th className="py-2.5">ID</th>
                <th>Test Case Name</th>
                <th>Module</th>
                <th>Severity</th>
                <th>Expected Result</th>
                <th>Actual Result</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredCases.map((tc) => (
                <tr
                  key={tc.id}
                  className="border-b border-[#282820] hover:bg-[#20201B] transition-colors"
                >
                  <td className="py-2.5 font-bold text-[#FF8A24] whitespace-nowrap">{tc.id}</td>
                  <td className="font-semibold text-[#F4F1E9] max-w-[200px] truncate" title={tc.name}>
                    {tc.name}
                  </td>
                  <td className="text-[10px] text-[#A6A69A] max-w-[150px] truncate" title={tc.module}>
                    {tc.module}
                  </td>
                  <td>
                    <Badge
                      variant={tc.severity === 'critical' ? 'red' : tc.severity === 'high' ? 'amber' : 'neutral'}
                      size="sm"
                    >
                      {tc.severity.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="text-[11px] text-[#A6A69A] max-w-[220px] truncate" title={tc.expectedResult}>
                    {tc.expectedResult}
                  </td>
                  <td className="text-[11px] text-[#F4F1E9] max-w-[220px] truncate" title={tc.actualResult}>
                    {tc.actualResult}
                  </td>
                  <td>
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold uppercase inline-flex items-center gap-1"
                      style={{
                        backgroundColor: tc.status === 'passed' ? 'rgba(84, 227, 142, 0.15)' : 'rgba(255, 69, 69, 0.2)',
                        color: tc.status === 'passed' ? '#54E38E' : '#FF4545',
                      }}
                    >
                      {tc.status === 'passed' ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                      {tc.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Historical Execution Runs */}
      {history.length > 1 && (
        <Card className="space-y-2 font-mono text-xs">
          <h4 className="font-heading font-semibold text-xs text-[#A6A69A]">
            Execution Run History
          </h4>
          <div className="space-y-1">
            {history.map((h, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded bg-[#10100E] border border-[#282820]">
                <span>{formatDate(h.timestamp, 'datetime')}</span>
                <span className="text-[#54E38E] font-bold">{h.passPercentage}% Passed</span>
                <span className="text-[#A6A69A]">{h.durationMs} ms</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default TestResults;

