
import { useState } from "react";
import { SensorData } from "@/types/sensorData";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from "@/components/ui/table";

interface SensorDataTableProps {
  data: SensorData[];
}

const SensorDataTable = ({ data }: SensorDataTableProps) => {
  const [page, setPage] = useState(0);
  const rowsPerPage = 5;

  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString();
    } catch (e) {
      return "Invalid Date";
    }
  };

  // Get the current page's data
  const currentPageData = data
    .slice()
    .reverse()
    .slice(page * rowsPerPage, (page + 1) * rowsPerPage);

  const totalPages = Math.ceil(data.length / rowsPerPage);

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>AccX</TableHead>
              <TableHead>AccY</TableHead>
              <TableHead>AccZ</TableHead>
              <TableHead>GyroX</TableHead>
              <TableHead>GyroY</TableHead>
              <TableHead>GyroZ</TableHead>
              <TableHead>Temp</TableHead>
              <TableHead>Humidity</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Current</TableHead>
              <TableHead>Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentPageData.length > 0 ? (
              currentPageData.map((row) => (
                <TableRow key={row._id}>
                  <TableCell>{row.accX.toFixed(2)}</TableCell>
                  <TableCell>{row.accY.toFixed(2)}</TableCell>
                  <TableCell>{row.accZ.toFixed(2)}</TableCell>
                  <TableCell>{row.gyroX.toFixed(2)}</TableCell>
                  <TableCell>{row.gyroY.toFixed(2)}</TableCell>
                  <TableCell>{row.gyroZ.toFixed(2)}</TableCell>
                  <TableCell>{row.temp.toFixed(1)}°C</TableCell>
                  <TableCell>{row.hum.toFixed(1)}%</TableCell>
                  <TableCell>
                    {row.lat !== 0 || row.lon !== 0 
                      ? `${row.lat.toFixed(4)}, ${row.lon.toFixed(4)}`
                      : "N/A"
                    }
                  </TableCell>
                  <TableCell>{row.current.toFixed(2)}mA</TableCell>
                  <TableCell>{formatTimestamp(row.timestamp)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={11} className="text-center h-24">
                  No data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-1 rounded bg-secondary disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="px-3 py-1 rounded bg-secondary disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default SensorDataTable;
