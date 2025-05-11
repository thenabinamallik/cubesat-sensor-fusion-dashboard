
import { Thermometer, Droplet, Battery, Compass, RefreshCw } from "lucide-react";
import { SensorData } from "@/types/sensorData";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface StatusCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

const StatusCard = ({ title, value, icon, color }: StatusCardProps) => (
  <div className="bg-card rounded-lg p-4 flex items-center gap-4 shadow-sm">
    <div className={`p-3 rounded-full ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </div>
);

interface DashboardHeaderProps {
  latestData: SensorData | null;
}

const DashboardHeader = ({ latestData }: DashboardHeaderProps) => {
  const [imageKey, setImageKey] = useState<number>(Date.now());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString();
    } catch (e) {
      return "Unknown";
    }
  };

  const refreshImage = () => {
    setIsRefreshing(true);
    setImageKey(Date.now());
    setTimeout(() => setIsRefreshing(false), 500);
  };

  useEffect(() => {
    // Auto refresh image every 30 seconds
    const interval = setInterval(refreshImage, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">CubeSat Monitoring Dashboard</h1>
          <p className="text-muted-foreground">
            {latestData 
              ? `Last updated: ${formatTimestamp(latestData.timestamp)}` 
              : "Waiting for data..."}
          </p>
        </div>
        <div className="bg-card rounded-lg p-4 shadow-sm w-full md:w-auto">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">Live Camera Feed</h3>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={refreshImage}
              disabled={isRefreshing}
              className="flex items-center gap-1"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          <div className="relative aspect-video bg-muted rounded-md overflow-hidden w-full md:w-64 lg:w-96">
            <img
              key={imageKey}
              src={`http://192.168.137.86/cam-lo.jpg?t=${imageKey}`}
              alt="Satellite Camera"
              className={`w-full h-full object-cover ${isRefreshing ? 'opacity-50' : ''}`}
              onError={(e) => {
                // Handle image load error
                const target = e.target as HTMLImageElement;
                target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect width='18' height='18' x='3' y='3' rx='2' ry='2'%3E%3C/rect%3E%3Ccircle cx='9' cy='9' r='2'%3E%3C/circle%3E%3Cpath d='m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21'%3E%3C/path%3E%3C/svg%3E";
                target.classList.add("p-8");
              }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusCard 
          title="Temperature" 
          value={latestData ? `${latestData.temp}°C` : "--"} 
          icon={<Thermometer className="h-6 w-6 text-white" />} 
          color="bg-red-500"
        />
        <StatusCard 
          title="Humidity" 
          value={latestData ? `${latestData.hum}%` : "--"} 
          icon={<Droplet className="h-6 w-6 text-white" />} 
          color="bg-blue-500"
        />
        <StatusCard 
          title="Current" 
          value={latestData ? `${latestData.current}mA` : "--"} 
          icon={<Battery className="h-6 w-6 text-white" />} 
          color="bg-green-500"
        />
        <StatusCard 
          title="Orientation" 
          value={latestData ? "Active" : "--"} 
          icon={<Compass className="h-6 w-6 text-white" />} 
          color="bg-purple-500"
        />
      </div>
    </div>
  );
};

export default DashboardHeader;
