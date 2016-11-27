/*
 * TileLayer for Bing Maps.
 */
L.TileLayer.QuadKeyTileLayer = L.TileLayer.extend({
    getTileUrl: function (tilePoint) {
        this._adjustTilePoint(tilePoint);
        return L.Util.template(this._url, {
            s: this._getSubdomain(tilePoint),
            q: this._quadKey(tilePoint.x, tilePoint.y, this._getZoomForUrl())
        });
    },
    _quadKey: function (x, y, z) {
        var quadKey = [];
        for (var i = z; i > 0; i--) {
            var digit = '0';
            var mask = 1 << (i - 1);
            if ((x & mask) != 0) {
                digit++;
            }
            if ((y & mask) != 0) {
                digit++;
                digit++;
            }
            quadKey.push(digit);
        }
        return quadKey.join('');
    }
});

/*
 * A layer without content. When enabled, it adds a border to all visible tiles.
 */
var TileBorderLayer = L.Class.extend({
    onAdd: function (map) {
        $(map.getContainer()).addClass('show-tile-borders');
    },

    onRemove: function (map) {
        $(map.getContainer()).removeClass('show-tile-borders');
    },
});

/*
 * Convert decimal degree to decimal minutes.
 */
function convertDDtoDM(lat, lon) {
    function helper(x, lon) {
        return [
            x<0?lon?'W':'S':lon?'E':'N',
            ' ',
            0|Math.abs(x),
            '° ',
            (0|Math.abs(x)%1*60000)/1000
        ].join('');
    }

    return helper(lat, false) + ' ' + helper(lon, true);
}

/*
 * Layer definitions.
 */
var osmMapnik = new L.TileLayer(
    'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
        minZoom: 3,
        maxZoom: 20,
        maxNativeZoom: 19,
        attribution: 'Map data © OpenStreetMap contributors'
    }
);

// Just a quick way to add an OSM overlay. Idea for the future: All layers as overlays with independent opacity sliders.
var osmMapnikOverlay = new L.TileLayer(
    'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
        minZoom: 3,
        maxZoom: 20,
        maxNativeZoom: 19,
        opacity: 0.5,
        attribution: 'Map data © OpenStreetMap contributors'
    }
);

var osmOpenTopoMap = new L.TileLayer(
    'http://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    {
        minZoom: 3,
        maxZoom: 20,
        maxNativeZoom: 17,
        attribution: 'Kartendaten: &copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>-Mitwirkende, <a href="http://viewfinderpanoramas.org">SRTM</a> | Kartendarstellung: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    }
);

var googleMaps = new L.TileLayer(
    'http://mt.google.com/vt?&x={x}&y={y}&z={z}',
    {
        attribution: "<a href=\'http://maps.google.com/\'>Google</a> Maps",
        subdomains: "1234",
        tileSize: 256,
        minZoom: 3,
        maxZoom: 20,
        maxNativeZoom: 20
    }
);

var googleSatellite = new L.TileLayer(
    'http://mt.google.com/vt?lyrs=s&x={x}&y={y}&z={z}',
    {
        attribution:"<a href=\'http://maps.google.com/\'>Google</a> Maps Satellite",
        subdomains:"1234",
        tileSize:256,
        minZoom:3,
        maxZoom: 20,
        maxNativeZoom:20
    }
);

var googleHybrid = new L.TileLayer(
    'http://mt.google.com/vt?lyrs=y&x={x}&y={y}&z={z}',
    {
        attribution:"<a href=\'http://maps.google.com/\'>Google</a> Maps Satellite",
        subdomains:"1234",
        tileSize:256,
        minZoom:3,
        maxZoom: 20,
        maxNativeZoom:20
    }
);

var bingMaps = new L.TileLayer.QuadKeyTileLayer(
    'http://ecn.t{s}.tiles.virtualearth.net/tiles/r{q}?g=864&mkt=en-gb&lbl=l1&stl=h&shading=hill&n=z',
    {
        subdomains: "0123",
        minZoom: 3,
        maxZoom: 20,
        maxNativeZoom: 19,
        attribution: "<a href=\'http://maps.bing.com/\'>Bing</a> map data copyright Microsoft and its suppliers"
    }
);

var bingAerial = new L.TileLayer.QuadKeyTileLayer(
    'http://ecn.t{s}.tiles.virtualearth.net/tiles/a{q}?g=737&n=z',
    {
        subdomains: "0123",
        minZoom: 3,
        maxZoom: 20,
        maxNativeZoom: 19,
        attribution: "<a href=\'http://maps.bing.com/\'>Bing</a> map data copyright Microsoft and its suppliers"
    }
);

var hillshading = new L.TileLayer(
        'http://{s}.tiles.wmflabs.org/hillshading/{z}/{x}/{y}.png',
    {
        attribution: "Hillshading by ??? from NASA SRTM data",
        minZoom: 3,
        maxNativeZoom: 16,
        overlay: true
    }
);

var baseLayers = {
    "OpenStreetMap": osmMapnik,
    "OpenTopoMap": osmOpenTopoMap,
    "Google Maps": googleMaps,
    "Google Maps Satellite": googleSatellite,
    "Google Maps Hybrid": googleHybrid,
    "Bing Maps": bingMaps,
    "Bing Aerial View": bingAerial,
};

var overlayLayers = {
    "Hillshading": hillshading,
    "OpenStreetMap (opacity=0.5)": osmMapnikOverlay,
    "Tile Borders": new TileBorderLayer(),
};

/*
 * Set path to default marker images
 */
L.Icon.Default.imagePath = 'images';

/*
 * Initialization of map.
 *
 * - select shown layers
 * - limit bounds (TODO: do some modulo like stuff)
 * - configure edit link
 * - add contextmenu
 * - add fullscreen control
 */
let map = L.map('map', {
    layers: [osmMapnik],
    maxBounds: [[90,-180], [-90,180]],

    editInOSMControlOptions: {
        position: "bottomright",
        zoomThreshold: 16,
        widget: "attributionBox",
        editors: ["josm"],
    },

    contextmenu: true,
    contextmenuItems: [
        {
            text: 'Show coordinates',
            callback: function (e) {
                showCoordinates(e.latlng)
            }
        },
        {
            text: 'Share this location',
            callback: function (e) {
                shareCoordinates(e.latlng);
            }
        },
        {
            text: 'Add marker',
            callback: function (e) {
                createMarker(e.latlng).addTo(map);
            }
        },
        {
            separator: true
        },
        {
            text: 'Open OSM tile',
            callback: function (e) {
                window.open(getOsmMapnikUrl(e.latlng, map.getZoom()), '_blank');
            }
        },
        {
            text: 'Mark OSM tile as dirty',
            callback: function (e) {
                $.ajax({
                    url: getOsmMapnikUrl(e.latlng, map.getZoom()) + '/dirty',
                    success: function (response) {
                        alert(response);
                    }
                });
            }
        },
        {
            text: 'Show OSM tile status',
            callback: function (e) {
                $.ajax({
                    url: getOsmMapnikUrl(e.latlng, map.getZoom()) + '/status',
                    success: function (response) {
                        alert(response);
                    }
                });
            }
        },
    ],

    fullscreenControl: true,
});

function getOsmMapnikUrl(coordinates, zoom) {
    let lat = coordinates.lat;
    let lon = coordinates.lng;

    let x = Math.floor((lon+180)/360*Math.pow(2,zoom));
    let y = Math.floor((1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom));

    return 'http://a.tile.openstreetmap.org/' + zoom + '/' + x + '/' + y + '.png';
}

/*
 * Create universal marker with contextmenu.
 *
 * position
 *      The position of the marker
 * options
 *      An object with any of:
 *      title: Title for the node
 */
function createMarker(position, options = {}) {
    let marker = new L.Marker(position, {
        title: options.title,

        contextmenu: true,
        contextmenuInheritItems: false,
        contextmenuItems: [
            {
                text: 'Remove marker',
                callback: function (e) {
                    map.removeLayer(marker);
                }
            },
            {
                text: 'Unlock position',
                callback: function (e) {
                    marker.dragging.enable();
                    // TODO: lock again / modify contextmenu
                }
            },
            {
                separator: true
            },
            {
                text: 'Show coordinates',
                callback: function (e) {
                    showCoordinates(position)
                }
            },
            {
                text: 'Share marker',
                callback: function (e) {
                    shareCoordinates(position);
                }
            },
        ]
    });

    return marker;
}

/*
 * Share a location.
 */
function shareCoordinates(position) {
    let zoom = map.getZoom();

    let hash = '#' + [
        zoom,
        position.lat.toFixed(6),
        position.lng.toFixed(6),
        'm'
    ].join('/');

    let url = [
        window.location.href.split('#')[0],
        hash
    ].join('');

    alert("Warning: Experimental service, URL might change without warning!\n\n" + url);
}

/*
 * Display given coordinates.
 */
function showCoordinates(position) {
    alert([(0|position.lat*1000000)/1000000, ' ', (0|position.lng*1000000)/1000000, "\n\n", convertDDtoDM(position.lat, position.lng)].join(''));
}

/*
 * Restore last position or fallback to world.
 */
if (!map.restoreView()) {
    map.fitBounds([[75,-160], [-45,160]]); // almost full world
}

/*
 * Start auto update of URL and create marker.
 *
 * Format: #zoom/lat/lon[/m]
 *
 * TODO: Make hash configurable (e.g. objects for each part that handle parsing
 * and formatting of the hash; needs rewrite of hash plugin)
 *
 * TODO: Does only work if URL opened, not when hash changed
 */
let hash = location.hash;
let loc = L.Hash.parseHash(hash)
if (loc && hash.indexOf('/m', hash.length - 2) !== -1) {
    createMarker(loc.center).addTo(map);
}

new L.Hash(map);

/*
 * History control that allows the user to go back in movement history.
 */
new L.HistoryControl({
    maxMovesToSave: 100
}).addTo(map);

/*
 * Layer selector with base and overlay layers.
 */
L.control.layers(baseLayers, overlayLayers).addTo(map);

/*
 * A nice scale in the bottom left corner.
 */
L.control.scale().addTo(map);

/*
 * Locate control.
 */
L.control.locate({
    icon: 'fa fa-location-arrow',
    showPopup: false
}).addTo(map);

/*
 * Measure control with km as unit.
 */
new L.Control.Measure({
    position: 'topleft',
}).addTo(map);

/*
 * Initialize and configure geocoder.
 *
 * It uses an IDK geocoder and creates a node with the result in the popup.
 */
var geocoder = new L.Control.Geocoder({
    position: "topleft"
}).addTo(map);

geocoder.markGeocode = function(result) {
    this._map.fitBounds(result.bbox);

    let marker = createMarker(result.center, { title: result.name })
        .bindPopup(result.html || result.name)
        .addTo(this._map)
        .openPopup();

    this._geocodeMarker = marker;

    return this;
}
