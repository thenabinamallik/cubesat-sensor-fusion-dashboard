
export interface SensorData {
  _id: string;
  accX: number;
  accY: number;
  accZ: number;
  gyroX: number;
  gyroY: number;
  gyroZ: number;
  temp: number;
  hum: number;
  lat: number;
  lon: number;
  current: number;
  timestamp: string;
}

export interface Location {
  lat: number;
  lon: number;
}
