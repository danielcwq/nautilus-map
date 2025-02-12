import { useState, useEffect } from "react";
import MapComponent from "./MapComponent";
import { useAnalytics } from './hooks/useAnalytics';

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL || '/api/sheet-data';
  const { trackPageView, trackEvent } = useAnalytics();
  useEffect(() => {
    // Track page view when component mounts
    trackPageView();
    // Track custom event for map load
    trackEvent('map_view_initialized');
  }, []);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const sheetData = await response.json();
        setData(sheetData);
        setError(null);
      } catch (error) {
        console.error("Error fetching the sheet data:", error);
        setError("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold text-center mb-6 text-blue-600">
        Nautilus Map Viewer
      </h1>
      {error && (
        <div className="text-red-500 text-center mb-4">
          {error}
        </div>
      )}
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg p-4">
          <MapComponent data={data} />
        </div>
      )}
    </div>
  );
}

export default App;