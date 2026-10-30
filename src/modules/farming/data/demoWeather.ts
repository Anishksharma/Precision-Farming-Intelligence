// Demo Weather Data Generator — Simulated Indian climate patterns
import type { WeatherData } from '../../../types/farming';

/**
 * Simplified Penman-Monteith ET₀ (mm/hr)
 * Using the FAO-56 simplified formula adapted for hourly time steps.
 */
function calculateET(temp: number, humidity: number, windSpeed: number, solarRadiation: number): number {
  // Net radiation approximation (MJ/m²/hr from W/m² → MJ)
  const Rn = solarRadiation * 0.0036; // W/m² to MJ/m²/hr

  // Saturation vapor pressure (kPa)
  const es = 0.6108 * Math.exp((17.27 * temp) / (temp + 237.3));
  const ea = es * (humidity / 100);
  const vpd = es - ea;

  // Slope of saturation vapor pressure curve
  const delta = (4098 * es) / Math.pow(temp + 237.3, 2);

  // Psychrometric constant
  const gamma = 0.0665; // kPa/°C at standard pressure

  // Simplified Penman-Monteith (hourly)
  const numerator = 0.408 * delta * Rn + gamma * (37 / (temp + 273)) * windSpeed * vpd;
  const denominator = delta + gamma * (1 + 0.34 * windSpeed);

  const et = Math.max(0, numerator / denominator);
  return Math.round(et * 1000) / 1000;
}

/**
 * Generate hourly weather data for a given time range.
 */
function generateHourlyWeather(
  startDate: Date,
  hours: number,
  isHistorical: boolean,
): WeatherData[] {
  const data: WeatherData[] = [];
  const baseTemp = 30; // Indian average warm season

  for (let h = 0; h < hours; h++) {
    const ts = new Date(startDate.getTime() + h * 3600000);
    const hourOfDay = ts.getHours();
    const dayOfWeek = Math.floor(h / 24);

    // Diurnal temperature cycle
    const diurnalFactor = Math.sin(((hourOfDay - 6) * Math.PI) / 12);
    const temp = baseTemp + diurnalFactor * 6 + (Math.random() - 0.5) * 3
      - dayOfWeek * 0.3; // slight cooling trend

    // Humidity inversely correlated with temperature
    const humidity = Math.max(25, Math.min(95,
      60 - diurnalFactor * 15 + (Math.random() - 0.5) * 10
      + (dayOfWeek % 3 === 0 ? 10 : 0) // humid spells
    ));

    // Rainfall: clustered events
    let rainfall = 0;
    const isRainyDay = dayOfWeek % 3 === 0 || dayOfWeek === 5;
    if (isRainyDay && hourOfDay >= 14 && hourOfDay <= 20) {
      rainfall = Math.random() < 0.5 ? 0 : Math.round((2 + Math.random() * 12) * 10) / 10;
    }

    // Wind speed — lighter at night
    const windSpeed = Math.max(0.5, 2 + diurnalFactor * 2 + (Math.random() - 0.5) * 2);

    // Solar radiation — bell curve during day
    const solarRadiation = hourOfDay >= 6 && hourOfDay <= 18
      ? Math.max(0, 800 * Math.sin(((hourOfDay - 6) * Math.PI) / 12) + (Math.random() - 0.5) * 100)
      : 0;

    // Pressure
    const pressure = 1012 + (Math.random() - 0.5) * 6 - (rainfall > 0 ? 3 : 0);

    // ET calculation
    const et = calculateET(temp, humidity, windSpeed, solarRadiation);

    data.push({
      timestamp: ts,
      temperature: Math.round(temp * 10) / 10,
      humidity: Math.round(humidity * 10) / 10,
      rainfall: Math.round(rainfall * 10) / 10,
      windSpeed: Math.round(windSpeed * 10) / 10,
      solarRadiation: Math.round(solarRadiation),
      pressure: Math.round(pressure * 10) / 10,
      evapotranspiration: et,
      isSimulated: true,
    });
  }

  return data;
}

/**
 * Generates demo weather data: 7 days historical + 7 days forecast.
 * All data is marked as simulated.
 */
export function generateDemoWeather(): { current: WeatherData[]; forecast: WeatherData[] } {
  const now = new Date();
  const histStart = new Date(now.getTime() - 7 * 24 * 3600000);

  const current = generateHourlyWeather(histStart, 168, true);
  const forecast = generateHourlyWeather(now, 168, false);

  return { current, forecast };
}
