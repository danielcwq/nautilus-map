import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";

const MapComponent = ({ data }) => {
    const mapRef = useRef(null);
    useEffect(() => {
        console.log("Data received:", data);
    }, [data]);
    useEffect(() => {
        if (!mapRef.current) {
            mapRef.current = L.map("map").setView([0, 0], 2);

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: "© OpenStreetMap contributors",
            }).addTo(mapRef.current);
        }

        // Remove existing clusters to prevent duplication
        mapRef.current.eachLayer((layer) => {
            if (layer instanceof L.MarkerClusterGroup) {
                mapRef.current.removeLayer(layer);
            }
        });

        const markers = L.markerClusterGroup();

        data.forEach((item) => {
            const lat = parseFloat(item.lat);
            const lng = parseFloat(item.lng);

            if (!isNaN(lat) && !isNaN(lng)) {
                const popupContent = `
  <div>
    <h3>${item.Name || 'Unknown'}</h3>
    <p>Age: ${item.Age || 'N/A'}</p>
    ${item["Which city?"] || item["city"] || item.location ?
                        `<p>Location: ${[
                            item["Which city?"] || item["city"],
                            item["Which state?"] || item["state"],
                            item["Which country are you based in right now?"] || item["country"]
                        ].filter(Boolean).join(", ")}</p>`
                        : ''
                    }
  </div>
        `;

                L.marker([lat, lng])
                    .bindPopup(popupContent)
                    .addTo(markers);
            }
        });

        mapRef.current.addLayer(markers);

        return () => {
            mapRef.current.eachLayer((layer) => {
                if (layer instanceof L.MarkerClusterGroup) {
                    mapRef.current.removeLayer(layer);
                }
            });
        };
    }, [data]);

    return <div id="map" className="h-96 w-full border rounded-lg"></div>;
};

export default MapComponent;
