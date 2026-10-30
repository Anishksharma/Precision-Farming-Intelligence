import React from 'react';
import { useFarmingStore } from '../../../store/farmingStore';
import { ChartWrapper } from '../../../components/charts/ChartWrapper';
import { LineChart } from '../../../components/charts/LineChart';
import { BarChart } from '../../../components/charts/BarChart';
import { DonutChart } from '../../../components/charts/DonutChart';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Download, Printer, BarChart3, TrendingDown, Layers, FileSpreadsheet } from 'lucide-react';
import { exportToCsv } from '../../../utils/exportUtils';

const Analytics: React.FC = () => {
  const { farms, cropProfiles, alerts } = useFarmingStore();
  const allFields = farms.flatMap((f) => f.fields);

  // Crop water requirement comparison
  const cropWaterData = cropProfiles.map((c) => ({
    name: c.name.split(' ')[0],
    waterReq: c.waterRequirement,
  }));

  // Farm risk ranking
  const farmRiskRanking = farms.map((farm) => {
    const farmFields = farm.fields;
    const avgM = farmFields.reduce((a, b) => a + b.currentMoisture, 0) / farmFields.length;
    const farmAlerts = alerts.filter((a) => a.farmId === farm.id && !a.resolved);
    const riskLevel = farmAlerts.some((a) => a.severity === 'critical')
      ? 'CRITICAL'
      : avgM < 35
      ? 'ELEVATED'
      : 'NORMAL';

    return {
      name: farm.name,
      region: farm.region,
      area: farm.totalArea,
      avgMoisture: Number(avgM.toFixed(1)),
      activeAlerts: farmAlerts.length,
      riskLevel,
    };
  });

  const handleExportCSV = () => {
    const rows = allFields.map((f) => ({
      Field: f.name,
      Crop: f.crop,
      SoilType: f.soilType,
      AreaHa: f.area,
      CurrentMoisture: f.currentMoisture,
      ForecastMoisture: f.forecastMoisture,
      IrrigationStatus: f.irrigationStatus,
    }));
    exportToCsv(rows, 'agricultural_field_analytics.csv');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl tracking-wide text-[#F4F1E9]">
            AGRICULTURAL INTELLIGENCE & ANALYTICS
          </h1>
          <p className="text-xs font-mono text-[#A6A69A] mt-0.5">
            Cross-zonal water requirements, historical rainfall correlation, and macro-portfolio risk matrices
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<FileSpreadsheet size={14} />}
            onClick={handleExportCSV}
          >
            Export Field Data (CSV)
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={<Printer size={14} />}
            onClick={() => window.print()}
          >
            Print Executive Report
          </Button>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Crop-wise Water Requirements */}
        <ChartWrapper
          title="Crop Evapotranspiration Demand (mm/day)"
          subtitle="Baseline agronomic consumption rates across crop varieties"
        >
          <BarChart
            data={cropWaterData}
            xAxisKey="name"
            series={[{ key: 'waterReq', name: 'Water Requirement (mm/day)', color: '#FF8A24' }]}
            yAxisLabel="mm/day"
            height={260}
          />
        </ChartWrapper>

        {/* Moisture Depletion Trends */}
        <ChartWrapper
          title="Moisture Depletion Rates by Soil Texture"
          subtitle="Relative permeability and percolation velocity"
        >
          <BarChart
            data={[
              { soil: 'Sandy', rate: 1.85 },
              { soil: 'Sandy Loam', rate: 1.35 },
              { soil: 'Loam', rate: 0.95 },
              { soil: 'Clay Loam', rate: 0.65 },
              { soil: 'Clay', rate: 0.45 },
            ]}
            xAxisKey="soil"
            series={[{ key: 'rate', name: 'Depletion (%/hr)', color: '#B6F23A' }]}
            yAxisLabel="%/hr"
            height={260}
          />
        </ChartWrapper>
      </div>

      {/* Farm-Wise Risk Ranking Table */}
      <Card className="space-y-3">
        <h3 className="font-heading font-semibold text-sm text-[#F4F1E9] border-b border-[#34342B] pb-2">
          Installation Risk Ranking & Priority Index
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#34342B] text-[#A6A69A]">
                <th className="py-2.5">Installation</th>
                <th>Region</th>
                <th>Hectares</th>
                <th>Mean Moisture</th>
                <th>Active Alerts</th>
                <th>Risk Priority</th>
              </tr>
            </thead>
            <tbody>
              {farmRiskRanking.map((item, idx) => (
                <tr key={idx} className="border-b border-[#282820] hover:bg-[#20201B]">
                  <td className="py-2.5 font-bold text-[#F4F1E9]">{item.name}</td>
                  <td className="text-[#A6A69A]">{item.region}</td>
                  <td className="text-[#A6A69A]">{item.area} Ha</td>
                  <td className="font-bold text-[#FF8A24]">{item.avgMoisture}%</td>
                  <td className="text-[#FFB547]">{item.activeAlerts} flags</td>
                  <td>
                    <Badge
                      variant={item.riskLevel === 'CRITICAL' ? 'red' : item.riskLevel === 'ELEVATED' ? 'amber' : 'green'}
                      size="sm"
                    >
                      {item.riskLevel}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Analytics;
