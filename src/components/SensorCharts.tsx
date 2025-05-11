
import { useState } from "react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { SensorData } from "@/types/sensorData";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart";

interface SensorChartsProps {
  data: SensorData[];
}

type ChartType = "temperature" | "humidity" | "current" | "acceleration" | "gyroscope";

const chartConfig = {
  temperature: { 
    label: "Temperature (°C)",
    color: "theme.chart.temperature",
    dataKey: "temp",
    domain: [0, 50]
  },
  humidity: { 
    label: "Humidity (%)", 
    color: "theme.chart.humidity",
    dataKey: "hum",
    domain: [0, 100] 
  },
  current: { 
    label: "Current (mA)", 
    color: "theme.chart.current",
    dataKey: "current",
    domain: ['dataMin - 10', 'dataMax + 10']
  },
  acceleration: { 
    label: "Acceleration", 
    color: undefined,
    dataKey: ["accX", "accY", "accZ"],
    domain: [-12, 12]
  },
  gyroscope: { 
    label: "Gyroscope", 
    color: undefined,
    dataKey: ["gyroX", "gyroY", "gyroZ"],
    domain: [-2, 2]
  }
};

const formatTime = (timestamp: string) => {
  try {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch (e) {
    return "";
  }
};

const SensorCharts = ({ data }: SensorChartsProps) => {
  const [activeChart, setActiveChart] = useState<ChartType>("temperature");

  const formattedData = data.map(item => ({
    ...item,
    time: formatTime(item.timestamp),
  }));
  
  const renderChart = () => {
    const config = chartConfig[activeChart];
    
    // For multi-line charts (acceleration and gyroscope)
    if (Array.isArray(config.dataKey)) {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 12 }} 
              tickMargin={10}
            />
            <YAxis 
              domain={config.domain} 
              tick={{ fontSize: 12 }}
              tickMargin={10}
            />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-md">
                      <div className="grid grid-cols-2 gap-2">
                        {payload.map((entry, index) => (
                          <div key={`item-${index}`} className="flex items-center gap-1">
                            <div 
                              className="h-2 w-2 rounded-full" 
                              style={{ backgroundColor: entry.color }} 
                            />
                            <span className="text-sm font-medium">{entry.name}: </span>
                            <span className="text-sm">{Number(entry.value).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            <Line 
              dataKey={config.dataKey[0]} 
              stroke="#ff4d6d" 
              dot={false} 
              activeDot={{ r: 4 }} 
              strokeWidth={2}
              name="X"
            />
            <Line 
              dataKey={config.dataKey[1]} 
              stroke="#4cc9f0" 
              dot={false} 
              activeDot={{ r: 4 }} 
              strokeWidth={2}
              name="Y"
            />
            <Line 
              dataKey={config.dataKey[2]} 
              stroke="#06d6a0" 
              dot={false} 
              activeDot={{ r: 4 }} 
              strokeWidth={2}
              name="Z"
            />
          </LineChart>
        </ResponsiveContainer>
      );
    }
    
    // For single-line charts
    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 12 }} 
            tickMargin={10}
          />
          <YAxis 
            domain={config.domain} 
            tick={{ fontSize: 12 }}
            tickMargin={10}
          />
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-md">
                    <p className="text-sm font-medium">{`${config.label}: ${Number(payload[0].value).toFixed(2)}`}</p>
                    <p className="text-xs text-muted-foreground">{payload[0].payload.time}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Line 
            type="monotone" 
            dataKey={config.dataKey} 
            stroke={
              activeChart === "temperature" ? "#ff6b6b" : 
              activeChart === "humidity" ? "#4b7bec" :
              "#20bf6b"
            } 
            dot={false} 
            activeDot={{ r: 4 }} 
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(Object.keys(chartConfig) as ChartType[]).map((chartType) => (
          <button
            key={chartType}
            onClick={() => setActiveChart(chartType)}
            className={`px-3 py-1.5 text-sm font-medium rounded-full ${
              activeChart === chartType 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary text-secondary-foreground'
            }`}
          >
            {chartConfig[chartType].label}
          </button>
        ))}
      </div>
      
      <div className="border rounded-md p-4">
        <h3 className="text-lg font-medium mb-4">{chartConfig[activeChart].label}</h3>
        {data.length > 0 ? (
          renderChart()
        ) : (
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-muted-foreground">No data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SensorCharts;
