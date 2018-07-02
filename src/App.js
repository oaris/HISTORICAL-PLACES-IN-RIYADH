import React, { Component } from 'react';
import { InfoWindow} from 'google-maps-react';
import Map from "./main.js"
import {wrapper as GoogleApiWrapper} from './GoogleApiComponent';
import { riyadhLocations } from './locations.js';
import './App.css';
import fetchJsonp from 'fetch-jsonp';
import Marker from "./Marker";
import escapeRegExp from 'escape-string-regexp';

class App extends Component {
  constructor(props) {
   super(props);
   this.state = {
    showingInfoWindow: false,
    activeMarker: {},
    selectedPlace: "",
    locations: riyadhLocations,
    info:"",
    link:"",
    matchlocation:[],
    query:"",
    position:{  lat: 24.7135517,
      lng: 46.6752957},
    markers: [],
    locationResult:riyadhLocations
    }

 }
 // to display InfoWindow and animation when marker clicked
 onMarkerClick = (props, marker, e) =>{

    this.setState({
      selectedPlace: marker.name,
      activeMarker: marker,
      showingInfoWindow: true,
      info: "loding...",
      position: marker.position

    })
    this.infoToInfoWindow(marker.name);
    marker.setAnimation(this.props.google.maps.Animation.BOUNCE);
    setTimeout(function(){ marker.setAnimation(null); }, 750);


};
// to fetch information from wikipedia

     infoToInfoWindow = (name) => {
      return fetchJsonp(`https://en.wikipedia.org/w/api.php?action=opensearch&search=${name}&format=json&callback=wikiCallback`)
     .then(response => response.json()).then((responseJson) => {
       this.setState({
         info: responseJson[2][0],
         link: responseJson[3][0]
       })
     }).catch(error =>
       this.setState({
         info: "Error try again please",
         link: "https://en.wikipedia.org/"
       })
     )

     }
// to hide InfoWindow if ite opend and map clicked
  onMapClicked = (props) => {
    if (this.state.showingInfoWindow) {
      this.setState({
        showingInfoWindow: false,
        activeMarker: null
      })
    }
  };
// to display InfoWindow and animation when item list cliked
  onPopulateInfoWindow = (e,i) =>{
    i = e.target.dataset.id;
   var marker = this.state.markers[i];

   this.props.google.maps.event.trigger(marker, 'click');

  }
// to update item's and markers list when search bar used
  updateQuery = (query) => {

    if (query){
     const match = new RegExp(escapeRegExp(query),'i')
     var filterdLocations = this.state.locations.filter((location)=> match.test(location.title));
     this.setState({

      showingInfoWindow:false,
     locationResult :filterdLocations
   })
   }
   else{
     this.setState({
       showingInfoWindow:false,
     locationResult: this.state.locations
   })
   }

  }
  componentDidMount() {
    var loadGoogleMapsApi = require('load-google-maps-api-2');

loadGoogleMapsApi().then(function (Map) {
}).catch(function (err) {
  console.error(err);
});
  }

  render() {
    return (
    <div id="main">
      <nav className="title">
        <span tabIndex='0'>historical places in riyadh</span>
        </nav>




        <div className="sidemain-main"  >
            <div className="sidemain-input" >
              <label className="sidemain-header">Search</label>
              <input
                aria-labelledby="search landmark"
                role="search"
                type="text"
                placeholder="Landmark name"
               onChange={(event) => this.updateQuery(event.target.value)}
              />
            </div>
          <ul className="sidemain-list">
            {this.state.locationResult.map((location,index) => (
              <li
                data-id={index}
                key={index}
                role="button"
                tabIndex="0"
                onClick={this.onPopulateInfoWindow.bind(this)}

              >
                {location.title}
              </li>
            ))}
          </ul>
  			</div>


      <div id="map-container" role="application" tabIndex="-1">
        <Map google={this.props.google} className="map"
        zoom={12}
        initialCenter={{
            lat: 24.7135517,
            lng: 46.6752957
          }}
          onClick={this.onMapClicked}
          tabIndex={"-1"}>


          {
            this.state.locationResult.map((lib, index)=>
            <Marker
              markers={this.state.markers}
              query={this.state.query}
              key={index}
              data-markernumber={index}
              name={lib.title}
              address={lib.address}
              position={lib.location}
              onClick={this.onMarkerClick}

              />
          )
        }
        <InfoWindow
          position={this.state.position}
          visible={this.state.showingInfoWindow}>
            <div>
            <h2 className="infowindow" tabIndex="0">{this.state.selectedPlace} </h2>
            <h5 className="infowindow" tabIndex="0">{this.state.info}</h5>
            <a href={this.state.link}>Click Here For More Info</a>

            </div>
        </InfoWindow>
        </Map>
        </div>
      </div>

    )
  }
}

export default GoogleApiWrapper({
  apiKey: "AIzaSyCj4MeAXB-lg_OYt4GU8eXBcOLZ6sYUYno"
})(App)
