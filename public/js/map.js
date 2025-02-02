mapboxgl.accessToken = mapToken;

// console.log("Coordinates:", listing.geometry.coordinates, "Type:", typeof listing.geometry.coordinates);
const map = new mapboxgl.Map({
    container: 'map', // container ID
    center: listing.geometry.coordinates, // starting position [lng, lat]. Note that lat must be set between -90 and 90
    zoom: 9 // starting zoom
});

// // console.log(listing.geometry.coordinates);
// // Create a default Marker and add it to the map.
// const marker = new mapboxgl.Marker({ color: 'none' })
// .setLngLat(listing.geometry.coordinates) //Listing.geometry.coordinates
// .setPopup(new mapboxgl.Popup({offset: 25})
//     .setHTML(`<h4>${listing.title}</h4><p>Exact Location will be provided after booking!</p>`))
// .addTo(map);

//add a image instead of marker
map.on('load', () => {
    // Load an image from an external URL.
    map.loadImage(
        'https://cdn-icons-png.flaticon.com/512/5973/5973800.png',
        (error, image) => {
            if (error) throw error;

            // Add the image to the map style.
            map.addImage('custom-icon', image);

            // Add a data source containing one point feature.
            map.addSource('point', {
                'type': 'geojson',
                'data': {
                    'type': 'FeatureCollection',
                    'features': [
                        {
                            'type': 'Feature',
                            'geometry': {
                                'type': 'Point',
                                'coordinates': listing.geometry.coordinates
                            },
                            'properties': {
                                'title': listing.title
                            }
                        }
                    ]
                }
            });

            // Add a layer to use the image to represent the data.
            map.addLayer({
                'id': 'points',
                'type': 'symbol',
                'source': 'point',
                'layout': {
                    'icon-image': 'custom-icon',
                    'icon-size': 0.1
                }
            });

            // Add click event to show the popup when clicking on the image
            map.on('click', 'points', (e) => {
                new mapboxgl.Popup({ offset: 25 })
                    .setLngLat(e.lngLat)
                    .setHTML(`<h4>${listing.title}</h4><p>Exact Location will be provided after booking!</p>`)
                    .addTo(map);
            });

            // Change cursor to pointer when hovering over the image
            map.on('mouseenter', 'points', () => {
                map.getCanvas().style.cursor = 'pointer';
            });

            map.on('mouseleave', 'points', () => {
                map.getCanvas().style.cursor = '';
            });
        }
    );
});