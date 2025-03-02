import { useState, useEffect } from "react";
import MapComponent from "./MapComponent";
import { useAnalytics } from './hooks/useAnalytics';

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
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
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-blue-600">
          Nautilus Map Viewer
        </h1>
        <p className="text-xl text-center mb-8 text-blue-600">
          Find your friends! Built with ❤️ by <a href="https://danielching.me" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-800">Daniel</a>
        </p>
        <p className="text-xl text-center mb-8 text-blue-600">
          We encourage you to reach out, but be careful!
        </p>
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by country or city..."
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {error && (
          <div className="text-red-500 text-center mb-6">
            {error}
          </div>
        )}
        {loading ? (
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
          </div>
        ) : (
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <MapComponent data={data} searchQuery={searchQuery} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;