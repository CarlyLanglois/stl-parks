import {apply} from 'ol-mapbox-style';

import VectorLayer from 'ol/layer/vector';
import VectorSource from 'ol/source/vector';

import WFS from 'ol/format/wfs';
import GeoJSON from 'ol/format/geojson';

import Fill from 'ol/style/fill';
import Stroke from 'ol/style/stroke';
import Style from 'ol/style/style';
import sphere from 'ol/sphere';

//import colormap from 'colormap';

import proj from 'ol/proj';
import Overlay from 'ol/overlay';
import coordinate from 'ol/coordinate';

// add a basemap of the st louis area w/ osm bright styling. data from json file in app.
const map = apply('map-container', './data/osm-basemap.json');

// add the parks vector layer to the map
let parksSource = new VectorSource();
let parksLayer = new VectorLayer({
  source: parksSource,
  style:  new Style({
      fill: new Fill({
        color: 'rgba(213,238,210,.8)'
      }),
      stroke: new Stroke({
        color: 'rgba(109,196,100,.8)'
      })
    })
});
parksLayer.setZIndex(50);
map.addLayer(parksLayer);

// generate a GetFeature request
let featureRequest = new WFS().writeGetFeature({
  srsName: 'EPSG:3857',
  featureNS: 'http://launchcode.org',
  featurePrefix: 'lc',
  featureTypes: ['parks'],
  outputFormat: 'application/json'
});

//let areas = [];
//let maxArea, minArea;
// then post the request and add the received features to a layer
fetch('http://localhost:8080/geoserver/wfs', {
  method: 'POST',
  body: new XMLSerializer().serializeToString(featureRequest)
}).then(function(response) {
  return response.json();
})
.then(function(json) {
  let features = new GeoJSON().readFeatures(json);
  parksSource.addFeatures(features);
  // features.forEach(function(f){
  //   areas.push(sphere.getArea(f.getGeometry()));
  // });
});

var overlay = new Overlay({
  element: document.getElementById('popup-container'),
  positioning: 'bottom-center',
  offset: [0, -10]
});
map.addOverlay(overlay);

map.on('click', function(e) {
  overlay.setPosition();
  var features = map.getFeaturesAtPixel(e.pixel);
  if (features) {
    var coords = features[0].getGeometry().getCoordinates();
    var feature = features[0];
    var properties = feature.getProperties();
    var geometry = feature.getGeometry();
    var extent = geometry.getExtent();
    var closestPoint = geometry.getClosestPoint([extent[0], extent[3]])
    console.log(extent)
    //console.log(properties.TEXT_)
    //var hdms = coordinate.toStringHDMS(proj.toLonLat(coords));
    overlay.getElement().innerHTML = properties.TEXT_;
    //overlay.setPosition([extent[0], extent[3]]);
    overlay.setPosition(closestPoint);
  }
});
