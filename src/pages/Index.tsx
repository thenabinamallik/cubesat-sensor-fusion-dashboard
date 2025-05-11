import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import DashboardHeader from "@/components/DashboardHeader";
import SensorDataTable from "@/components/SensorDataTable";
import SensorCharts from "@/components/SensorCharts";
import SatelliteModel from "@/components/SatelliteModel";
import SatelliteLocation from "@/components/SatelliteLocation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SensorData } from "@/types/sensorData";

const MAX_DATA_POINTS = 30;

const Index = () => {
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [latestData, setLatestData] = useState<SensorData | null>(null);
  const [lastTimestamp, setLastTimestamp] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/sensor-data");
      if (!response.ok) {
        throw new Error("Failed to fetch sensor data");
      }
      
      const dataArray: SensorData[] = await response.json();
      if (!dataArray.length) return;

      // Sort by timestamp ascending
      dataArray.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      
      // Filter only new data since last timestamp
      const newData = lastTimestamp
        ? dataArray.filter(d => new Date(d.timestamp) > new Date(lastTimestamp))
        : dataArray;

      if (newData.length > 0) {
        // Update the last timestamp
        setLastTimestamp(newData[newData.length - 1].timestamp);
        
        // Set the latest data point
        setLatestData(newData[newData.length - 1]);
        
        // Update all sensor data (keeping a maximum number of points)
        setSensorData(prevData => {
          const combined = [...prevData, ...newData];
          return combined.slice(Math.max(0, combined.length - MAX_DATA_POINTS));
        });
      }
    } catch (error) {
      console.error("Error fetching sensor data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch sensor data. Check your connection.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchData();
    
    // Set up polling interval (every second)
    const interval = setInterval(fetchData, 1000);
    
    return () => clearInterval(interval);
  }, [lastTimestamp]);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <DashboardHeader latestData={latestData} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 3D Visualization */}
        <Card className="col-span-1 md:row-span-2">
          <CardHeader>
            <CardTitle>CubeSat Orientation</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            <SatelliteModel sensorData={latestData} />
          </CardContent>
        </Card>
        
        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            <SatelliteLocation location={latestData ? { lat: latestData.lat, lon: latestData.lon } : null} />
          </CardContent>
        </Card>
        
        {/* Charts */}
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Sensor Readings</CardTitle>
          </CardHeader>
          <CardContent>
            <SensorCharts data={sensorData} />
          </CardContent>
        </Card>
        
        {/* Data Table */}
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Sensor Data Log</CardTitle>
          </CardHeader>
          <CardContent>
            <SensorDataTable data={sensorData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
