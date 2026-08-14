import React, { useEffect, useRef } from "react";

import {
    MapContainer,
    TileLayer,
    Marker,
    useMapEvents,
    useMap
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./DeliveryMap.css";

// Fix Leaflet marker icon
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",

    iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",

    shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});


// --------------------------------------------------
// Move map only when location comes from INPUT
// --------------------------------------------------

const MoveMap = ({ position, locationSource }) => {

    const map = useMap();

    useEffect(() => {

        if (!position) {
            return;
        }

        // لو الموقع جاي من الخريطة
        // لا نحرك الخريطة
        if (locationSource !== "search") {
            return;
        }

        map.flyTo(
            [position.lat, position.lng],
            17,
            {
                duration: 1
            }
        );

    }, [position, locationSource, map]);

    return null;
};


// --------------------------------------------------
// Marker + map click
// --------------------------------------------------

const LocationMarker = ({position, setLocation}) => {
    useMapEvents({

        click(event) {

            const { lat, lng } = event.latlng;

            setLocation({
                lat,
                lng
            });
        }

    });

    return position ? (
        <Marker
            position={[
                position.lat,
                position.lng
            ]}
        />
    ) : null;
};


// --------------------------------------------------
// Delivery Map
// --------------------------------------------------

const DeliveryMap = ({location, setLocation, locationSource}) => {

    const defaultPosition = [
        30.7865,
        31.6257
    ];

    return (

        <div className="delivery-map-container">

            <MapContainer
                center={defaultPosition}
                zoom={12}
                scrollWheelZoom={true}
                className="delivery-map"
            >

                <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />


                {/* Move map only after address search */}

                <MoveMap
                    position={location}
                    locationSource={locationSource}
                />


                {/* Customer can click anywhere on map */}

                <LocationMarker
                    position={location}
                    setLocation={setLocation}
                />

            </MapContainer>

        </div>
    );
};

export default DeliveryMap;