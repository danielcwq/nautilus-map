import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapComponent = ({ data }) => {
    const { trackEvent } = useAnalytics();
    const mapRef = useRef(null);
    const handleMarkerClick = (item) => {
        trackEvent('marker_clicked', {
            user_name: item.Name,
            location: `${item["Which city?"] || ''}, ${item["Which country are you based in right now?"] || ''}`
        });
    };
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
                // Format the URL to ensure it has http:// or https://
                const formatUrl = (url) => {
                    if (!url) return '';
                    if (url.startsWith('http://') || url.startsWith('https://')) {
                        return url;
                    }
                    return `https://${url}`;
                };

                const socialLink = formatUrl(item["1 social link (website / X / Insta / LinkedIn)"]);

                const popupContent = `
          <div>
            <h3>${socialLink ?
                        `<a href="${socialLink}" target="_blank" rel="noopener noreferrer" style="color: #3B82F6; text-decoration: underline;">${item.Name || 'Unknown'}</a>` :
                        item.Name || 'Unknown'
                    }</h3>
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
                    .on('click', () => handleMarkerClick(item))
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
