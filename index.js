/**
 * @format
 */

import {AppRegistry, ToastAndroid} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import HMSLocation from '@hmscore/react-native-hms-location';


const showActivity = (data) => {
    console.log('Activity Identification Headless Task, data:', data)
    if (data && data.mostActivityIdentification) {
      switch (data.mostActivityIdentification.identificationActivity) {
        case HMSLocation.ActivityIdentification.Activities.STILL:
          ToastAndroid.show(
            `You are still with ${data.mostActivityIdentification.possibility} possibility`,
            ToastAndroid.SHORT
          );
          break;
  
        default:
          ToastAndroid.show(`You are not still`, ToastAndroid.SHORT);
          break;
      }
    }
  };

  
HMSLocation.ActivityIdentification.Events.registerActivityIdentificationHeadlessTask(showActivity);
HMSLocation.FusedLocation.Events.registerFusedLocationHeadlessTask((data) =>
    console.log('Fused Location Headless Task, data:', data)
  );

AppRegistry.registerComponent(appName, () => App);
  
  /* This is method using for 2 other fuctions: activity conversion and geofence */
  /* HMSLocation.ActivityIdentification.Events.registerActivityConversionHeadlessTask((data) =>
    console.log('Activity Conversion Headless Task, data:', data)
  ); */
  
 /*  HMSLocation.Geofence.Events.registerGeofenceHeadlessTask((data) =>
    console.log('Geofence Headless Task, data:', data)
  );
 */

