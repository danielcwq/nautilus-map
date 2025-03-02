import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";
import { useAnalytics } from './hooks/useAnalytics';


delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapComponent = ({ data, searchQuery }) => {
    const { trackEvent } = useAnalytics();
    const mapRef = useRef(null);
    const markersRef = useRef(null);

    const handleMarkerClick = (item) => {
        trackEvent('marker_clicked', {
            user_name: item.Name,
            location: `${item["Which city?"] || ''}, ${item["Which country are you based in right now?"] || ''}`
        });
    };
    //useEffect(() => {
    //    if (data && data.length > 0) {
    //        console.log("Sample data item:", data[0]);  // Add this line to see data structure
    //        console.log("All data:", data);  // Add this to see all entries
    //    }
    //}, [data]);

    useEffect(() => {
        if (searchQuery && searchQuery.length >= 3 && mapRef.current) {
            const searchTerm = searchQuery.toLowerCase();
            console.log("Searching for:", searchTerm);

            const matchingLocations = data.filter(item => {
                const country = (item["Which country are you based in right now? "] || '').toLowerCase(); // Note the space at the end
                const city = (item["Which city? "] || '').toLowerCase(); // Note the space at the end
                const hasMatch = country.includes(searchTerm) || city.includes(searchTerm);

                if (hasMatch) {
                    console.log("Found match:", item);
                }
                return hasMatch;
            });

            if (matchingLocations.length > 0) {
                const validLocations = matchingLocations.filter(item => {
                    const lat = parseFloat(item.lat);
                    const lng = parseFloat(item.lng);
                    return !isNaN(lat) && !isNaN(lng);
                });

                if (validLocations.length > 0) {
                    const bounds = L.latLngBounds(
                        validLocations.map(item => [
                            parseFloat(item.lat),
                            parseFloat(item.lng)
                        ])
                    );
                    mapRef.current.fitBounds(bounds, {
                        padding: [50, 50],
                        maxZoom: 6,  // Limit the maximum zoom level
                        animate: true,
                        duration: 1.5  // Animation duration in seconds
                    });
                }
            }
        }
    }, [searchQuery, data]);

    useEffect(() => {
        if (data && data.length > 0) {
            console.log("Sample data item:", data[0]);
            console.log("Available columns:", Object.keys(data[0]));
        }
    }, [data]);

    useEffect(() => {
        if (!mapRef.current) {
            mapRef.current = L.map("map", {
                maxBounds: [
                    [-90, -180], // Southwest coordinates
                    [90, 180]    // Northeast coordinates
                ],
                maxBoundsViscosity: 1.0,
                minZoom: 2,
                worldCopyJump: false
            }).setView([0, 0], 2);

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: "© OpenStreetMap contributors",
                noWrap: true,
                bounds: [
                    [-90, -180],
                    [90, 180]
                ]
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
            console.log('Processing item:', item);
            console.log('Coordinates:', { lat, lng });
            if (!isNaN(lat) && !isNaN(lng)) {
                // Format the URL to ensure it has http:// or https://
                const formatUrl = (url) => {
                    if (!url) return '';
                    if (url.startsWith('http://') || url.startsWith('https://')) {
                        return url;
                    }
                    return `https://${url}`;
                };

                //const socialLink = formatUrl(item["1 social link (website / X / Insta / LinkedIn)"]);

                // ... existing code ...

                // ... existing code ...

                const popupContent = `
<div class="popup-content" style="min-width: 250px; padding: 8px;">
  <h3 style="font-weight: bold; margin-bottom: 8px;">${(item["1 social link (website / X / Insta / LinkedIn)"] && item["1 social link (website / X / Insta / LinkedIn)"].trim()) ?
                        `<a href="${formatUrl(item["1 social link (website / X / Insta / LinkedIn)"].trim())}" target="_blank" rel="noopener noreferrer" style="color: #3B82F6; text-decoration: underline;">${item["Name"]?.trim() || 'Unknown'}</a>` :
                        item["Name"]?.trim() || 'Unknown'
                    }</h3>
  ${(item["What's your discord username?"] && item["What's your discord username?"].trim()) ?
                        `<p style="margin: 4px 0;"><span style="color: #5865F2;">Discord:</span> @${item["What's your discord username?"].trim()}</p>` :
                        ''
                    }
  ${item["Age"] ? `<p style="margin: 4px 0;">Age: ${item["Age"]}</p>` : ''}
  ${(() => {
                        const location = [
                            item["Which city?"]?.trim(),
                            item["Which state?"]?.trim(),
                            item["Which country are you based in right now?"]?.trim()
                        ].filter(Boolean).join(", ");
                        return location ? `<p style="margin: 4px 0;">Location: ${location}</p>` : '';
                    })()}
  ${(item["What’s one fun fact about you that might make someone want to reach out?"] &&
                        item["What’s one fun fact about you that might make someone want to reach out?"].trim()) ?
                        `<p style="margin: 8px 0;"><em>Fun fact: ${item["What’s one fun fact about you that might make someone want to reach out?"].trim()}</em></p>` :
                        ''
                    }
</div>
`;

                // For debugging
                console.log('Creating marker with data:', {
                    name: item["Name"],
                    discord: item["What's your discord username?"],
                    age: item["Age"],
                    city: item["Which city?"],
                    state: item["Which state?"],
                    country: item["Which country are you based in right now?"],
                    funFact: item["What's one fun fact about you that might make someone want to reach out?"],
                    socialLink: item["1 social link (website / X / Insta / LinkedIn)"]
                });

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
