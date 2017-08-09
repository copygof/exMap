/**
* Sample React Native App
* https://github.com/facebook/react-native
* @flow
*/
import React, { Component } from 'react';
import {
Text,
View,
StyleSheet,
Dimensions,
Button,
PanResponder,
Animated,
ScrollView,
AppRegistry,
TouchableNativeFeedback,
TouchableOpacity,
TextInput
} from 'react-native';
import MapView, { PROVIDER_GOOGLE, PROVIDER_DEFAULT } from 'react-native-maps';

const { width, height } = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const LATITUDE = 37.78825;
const LONGITUDE = -122.4324;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
let id = 0;

import RNGooglePlaces from 'react-native-google-places';
const SearchLocation = ({ value, placeholder, onChangeText, ...props }) => (
  <View
    style={{
      backgroundColor: '#ffffff',
      height: 60,
      marginHorizontal: 20,
      padding: 5,
      borderRadius: 3,
      elevation: 5
    }}
    >
    <TextInput
      underlineColorAndroid={"#f5f5f5"}
      style={{ backgroundColor: '#f5f5f5', height: 50 }}
      onChangeText={onChangeText}
      //autoFocus={true}
      placeholder={placeholder}
      value={value}
      {...props}
      />
  </View>
)
class GPlacesDemo extends Component {

  state = {
    textInput: '',
    locationValue: {},
    place: [],
    region: {
      latitude: LATITUDE,
      longitude: LONGITUDE,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    },
    isFocus: false,
    animScrollView: new Animated.Value(height - 100),
    markers: [],
  }

  

  componentDidMount() {
    this.watchID = navigator.geolocation.watchPosition((position) => {
       console.log('position', position)
    });
    this.watchIDs = navigator.geolocation.getCurrentPosition((position) => {
       console.log('position', position)
    });
    RNGooglePlaces.getCurrentPlace()
    .then((results) => {      
      const { latitude = '', longitude = '' } = results[0]
      console.log(latitude, longitude)
      this.setState({
        region: {
          ...this.state.region,
          latitude,
          longitude
        }
      })
    })
    .catch((error) => console.log(error.message));
    //  RNGooglePlaces.openPlacePickerModal({
    //    latitude: 53.544389,
	  // longitude: -113.490927,
	  // radius: 0.01 // 10 meters
    //  })
    // .then((place) => {
		// console.log(place);
		// // place represents user's selection from the
		// // suggestions and it is a simplified Google Place object.
    // })
    // .catch(error => console.log(error.message));  // error is a Jav
  }

  renderRow(data, i) {
  const { primaryText, secondaryText, fullText } = data
    return (
      <View style={{ flex: 1 }} key={i}>
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: '#ffffff', borderWidth: 0.5, borderColor: '#dfdfdf', height: 80, justifyContent: 'center', paddingHorizontal: 5 }}
          onPress={() => {
            RNGooglePlaces.lookUpPlaceByID(data.placeID)
            .then((results) => {          
              
              const {
                latitude,
                longitude,
                
              } = results
              this.setState({
                locationValue: results,
                region: {
                  ...this.state.region,
                  latitude,
                  longitude
                },
                textInput: fullText,
                markers: [
                   {
                    coordinate: { latitude, longitude },
                    key: id++,
                    color: 'red',
                  },
                ]
              })
              this.closeAnimScrollView()
            })
            .catch((error) => console.log(error.message));
          }}>
          <Text>{primaryText}</Text>
          <Text>{secondaryText}</Text>
        </TouchableOpacity>
    </View> 
    )
  }
  onMapPress(e) {
    this.setState({
      markers: [
       {
          coordinate: e.nativeEvent.coordinate,
          key: id++,
          color: 'red',
        },
      ],
    })
    RNGooglePlaces.getAutocompletePredictions('cities', {
      // type: 'cities',
      radius: 10,
      ...e.nativeEvent.coordinate
    })
      .then((place) => {
      console.log(place);
      })
      .catch(error => console.log(error.message));
  }
  render() {
             // console.log('place', this.state.place)
    return (
      <View style={{ }}>
          
         
           
          <View style ={styles.container}>
            {/* <MapView.Animated
              style={styles.map}
              region={this.state.region}
            >
            </MapView.Animated> */}
            <MapView
              style={styles.map}
              region={this.state.region}
              initialRegion={this.state.region}
              onPress={(e) => this.onMapPress(e)}
              showsUserLocation={true}
              
            >
              {this.state.markers.map(marker => (
                <MapView.Marker
                  key={marker.key}
                  coordinate={marker.coordinate}
                  pinColor={marker.color}
                />
              ))}
            </MapView>
          </View>
          <SearchLocation
          placeholder={'Where your go ?'}
          onChangeText={textInput => {
            this.setState({ textInput })
            RNGooglePlaces.getAutocompletePredictions(textInput, {
              // type: 'geocode'
            })
            .then((place) => {
              
              this.setState({ place })
            })
          }}
          onFocus={() => {
            this.setState({ isFocus: true })
            this.startAnimScrollView()
          }}
          onBlur={() => {
            this.setState({ isFocus: false })
            !this.state.textInput && this.closeAnimScrollView()
          }}
          value={this.state.textInput}
          />
        {this.renderScrollView()}
      </View>
    );
  }
  startAnimScrollView() {
    Animated.spring(this.state.animScrollView, {
      toValue: 0
    }).start()
  }
  closeAnimScrollView() {
    Animated.spring(this.state.animScrollView, {
      toValue: height - 100
    }).start()
  }
  renderScrollView() {
    return (
      <Animated.View
        style={{
          transform: [{
            translateY: this.state.animScrollView
          }],
          backgroundColor: '#f5f5f5',
          height,
          marginHorizontal: 20,
          elevation: 3
        }}
        >
        <ScrollView style={{  }}>
        {this.state.place.map((data, i) => this.renderRow(data, i))}
        </ScrollView>
      </Animated.View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  bubble: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
  },
  latlng: {
    width: 200,
    alignItems: 'stretch',
  },
  button: {
    width: 80,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginVertical: 20,
    backgroundColor: 'transparent',
  },
});

AppRegistry.registerComponent('exMap', () => GPlacesDemo);
