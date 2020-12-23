
import React, { useState, useCallback, useEffect } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    ScrollView,
    View,
    Text,
    Image,
    Button,
    TextInput
} from 'react-native';

import { Colors } from 'react-native/Libraries/NewAppScreen';

import HMSLocation from '@hmscore/react-native-hms-location';


const App = () => {
  console.log("App initialized")
    return (
        <>
          <SafeAreaView>
            <ScrollView
              contentInsetAdjustmentBehavior="automatic"
              style={styles.scrollView}>
              <Header />
              <View style={styles.body}>
                <Permissions />
                <View style={styles.divider} />
                <LocationResult />
                <View style={styles.divider} />
                <ActivityIdentification />
                <View style={styles.divider} />
              </View>
            </ScrollView>
          </SafeAreaView>
        </>
    );
};


const Header = () => {
    // Initialize Location Kit
    useEffect(() => {
        HMSLocation.LocationKit.Native.init()
            .then(_ => console.log("Done loading"))
            .catch(ex => console.log("Error while initializing." + ex));
    }, []);

    return (
        <>
          <View style={styles.header}>
            <View style={styles.headerTitleWrapper}>
              <Text style={styles.headerTitle}>HMS Location Kit with services running when app is killed.</Text>
            </View>
            
          </View>
        </>
    )};


const Permissions = () => {
    const [hasLocationPermission, setHasLocationPermission] = useState(false);
    const [hasActivityIdentificationPermission, setHasActivityIdentificationPermission] = useState(false);

    useEffect(() => {
        // Check location permissions
        HMSLocation.FusedLocation.Native.hasPermission()
            .then(result => setHasLocationPermission(result.hasPermission))
            .catch(ex => console.log("Error while getting location permission info: " + ex));

        // Check ActivityIdentification permissions
        HMSLocation.ActivityIdentification.Native.hasPermission()
            .then(result => setHasActivityIdentificationPermission(result.hasPermission))
            .catch(ex => console.log("Error while getting activity identification permission info: " + ex));
    }, []);

    const requestLocationPermisson = useCallback(() => {
        HMSLocation.FusedLocation.Native.requestPermission()
        .then(result => setHasLocationPermission(result.granted));
    }, []);

    const requestActivityIdentificationPermisson = useCallback(() => {
        HMSLocation.ActivityIdentification.Native.requestPermission()
        .then(result => setHasActivityIdentificationPermission(result.granted));
    }, []);

    return (
        <>
          <View style={styles.sectionContainer}>
            <View style={styles.spaceBetweenRow}>
              <Text style={styles.sectionTitle}>Permissions</Text>
            </View>
          </View>
          <View style={styles.sectionContainer}>
            <View style={styles.spaceBetweenRow}>
              <Text style={styles.sectionTitle}>Location</Text>
              <Button
                title="Request Permission"
                onPress={requestLocationPermisson}
                />
            </View>
            <View style={styles.spaceBetweenRow}>
              <Text style={styles.monospaced}>{JSON.stringify(hasLocationPermission, null, 2)}</Text>
            </View>
          </View>

          <View style={styles.sectionContainer}>
            <View style={styles.spaceBetweenRow}>
              <Text style={styles.sectionTitle}>ActivityIdentification</Text>
              <Button
                title="Request Permission"
                onPress={requestActivityIdentificationPermisson}
                />
            </View>
            <View style={styles.spaceBetweenRow}>
              <Text style={styles.monospaced}>{JSON.stringify(hasActivityIdentificationPermission, null, 2)}</Text>
            </View>
          </View>
        </>
    )
};



const LocationResult = () => {
    const [locationResult, setLocationResult] = useState();
    const [reqCode, setReqCode] = useState(2);
    const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(false);

    const requestLocationUpdate = useCallback(() => {
        const LocationRequest = {
            priority: HMSLocation.FusedLocation.PriorityConstants.PRIORITY_HIGH_ACCURACY,
            interval: 2000,
            numUpdates: 90,
            fastestInterval: 2000.0,
            expirationTime: 100000.0,
            expirationTimeDuration: 100000.0,
            smallestDisplacement: 0.0,
            maxWaitTime: 2000.0,
            needAddress: true,
            language: 'en',
            countryCode: 'en',
        };

        HMSLocation.FusedLocation.Native.requestLocationUpdates(reqCode, LocationRequest)
            .then((res) => console.log(res))
            .catch(ex => console.log("Exception while requestLocationUpdates " + ex))
    }, []);

    const handleLocationUpdate = locationResult => {
        console.log(locationResult.lastLocation);
        setLocationResult(locationResult.lastLocation);
    };

    const addFusedLocationEventListener = useCallback(() => {
        requestLocationUpdate();
        HMSLocation.FusedLocation.Events.addFusedLocationEventListener(
            handleLocationUpdate,
        );
        setAutoUpdateEnabled(true);
    }, []);

    const removeFusedLocationEventListener = useCallback(() => {
        HMSLocation.FusedLocation.Events.removeFusedLocationEventListener(
            reqCode,
            handleLocationUpdate,
        );
        setAutoUpdateEnabled(false);
    }, [reqCode]);

    return (
        <>
          <View style={styles.sectionContainer}>
            <View style={styles.spaceBetweenRow}>
              <Text style={styles.sectionTitle}>Location Update</Text>
            </View>
            <View style={styles.spaceBetweenRow}>
              <Text style={styles.monospaced}>
                {JSON.stringify(locationResult, null, 2)}
              </Text>
            </View>
            <View style={styles.centralizeContent}>
              <Button
                title={
                    autoUpdateEnabled
                        ? 'Disable auto-update'
                        : 'Enable auto-update'
                }
                onPress={() => {
                    if (autoUpdateEnabled) {
                        removeFusedLocationEventListener();
                    } else {
                        addFusedLocationEventListener();
                    }
                }}
                />
            </View>
          </View>
        </>
    )
}



const ActivityIdentification = () => {
    const [reqCode, setReqCode] = useState(1);

    const [activated, setActivated] = useState(false);
    const [subscribed, setSubscribed] = useState(false);

    const [identificationResponse, setIdentificationResponse] = useState();

    // Activity Identification
    const createActivityIdentification = useCallback(requestCode => {
        HMSLocation.ActivityIdentification.Native.createActivityIdentificationUpdates(requestCode, 20000)
            .then(res => {
                console.log(res);
                setActivated(true);
            })
            .catch(err => console.log('ERROR: Activity identification failed', err));
    }, []);
    const removeActivityIdentification = useCallback(requestCode => {
        HMSLocation.ActivityIdentification.Native.deleteActivityIdentificationUpdates(requestCode)
            .then(res => {
              console.log(res);
              setActivated(false);
            })
            .catch(err => console.log('ERROR: Activity identification deletion failed', err));
    }, []);

    const handleActivityIdentification = useCallback(act => {
        console.log('ACTIVITY : ', act);
        setIdentificationResponse(act);
    }, []);

    const addActivityIdentificationEventListener = useCallback(() => {
        HMSLocation.ActivityIdentification.Events.addActivityIdentificationEventListener(
            handleActivityIdentification,
        );
        setSubscribed(true);
    }, []);

    const removeActivityIdentificationEventListener = useCallback(() => {
        HMSLocation.ActivityIdentification.Events.removeActivityIdentificationEventListener(
            handleActivityIdentification,
        );
        setSubscribed(false);
    }, []);

    return (
        <>
          <View style={styles.sectionContainer}>
            <View style={styles.spaceBetweenRow}>
              <Text style={styles.sectionTitle}>Activity Identification</Text>
            </View>
            <View style={styles.centralizeContent}>
              <Button
                title={
                  activated ?
                        "Remove Identification" :
                        "Get Identification"
                }
                onPress={() => {
                    if (activated) {
                        removeActivityIdentification(reqCode)
                    } else {
                        createActivityIdentification(reqCode)
                    }
                }} />
                <Button
                  title={subscribed ? "Unsubscribe" : "Subscribe"}
                  onPress={() => {
                      if (subscribed) {
                          removeActivityIdentificationEventListener()
                      } else {
                          addActivityIdentificationEventListener()
                      }
                  }} />
            </View>
            <View style={styles.spaceBetweenRow}>
              <Text style={styles.sectionDescription}>
                <Text style={styles.boldText}>Activity Request Code</Text>:{' '}
                {`${reqCode || ''}`}
              </Text>
            </View>
            <View style={styles.spaceBetweenRow}>
              <Text style={styles.monospaced}>
                {JSON.stringify(identificationResponse, null, 2)}
              </Text>
            </View>
          </View>
        </>
    );
}




const styles = StyleSheet.create({
    scrollView: {
        backgroundColor: Colors.lighter,
    },
    engine: {
        position: 'absolute',
        right: 0,
    },
    body: {
        backgroundColor: Colors.white,
    },
    sectionContainer: {
        marginTop: 32,
        paddingHorizontal: 24,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '600',
        color: Colors.black,
    },
    sectionDescription: {
        marginTop: 8,
        fontSize: 18,
        fontWeight: '400',
        color: Colors.dark,
    },
    activityData: {
        marginTop: 8,
        marginLeft: 5,
        fontSize: 16,
        fontWeight: '400',
        color: Colors.dark,
    },
    highlight: {
        fontWeight: '700',
    },
    footer: {
        color: Colors.dark,
        fontSize: 12,
        fontWeight: '600',
        padding: 4,
        paddingRight: 12,
        textAlign: 'right',
    },
    header: {
        height: 180,
        width: '100%',
    },
    headerTitleWrapper: {
        position: 'absolute',
        justifyContent: 'center',
        top: 0,
        bottom: 0,
        right: 0,
        left: 20,
    },
    headerTitle: { fontSize: 17, fontWeight: '700', color: '#5FD8FF' },
    headerLogoWrapper: { alignItems: 'flex-end', justifyContent: 'center' },
    headerLogo: { height: 200, width: 200 },
    spaceBetweenRow: { flexDirection: 'row', justifyContent: 'space-between' },
    divider: {
        width: '90%',
        alignSelf: 'center',
        height: 1,
        backgroundColor: 'grey',
        marginTop: 20,
    },
    boldText: { fontWeight: 'bold' },
    centralizeSelf: { alignSelf: 'center' },
    centralizeContent: { flexDirection: 'row', justifyContent: 'center' },
    monospaced: { fontFamily: 'monospace' },
});

export default App;
