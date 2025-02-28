    import React from 'react';
    import { Text, View, Animated, Keyboard, Platform } from 'react-native';
    import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
    import { Home, PlusCircle, Bell, User } from 'lucide-react-native';

    import HomeScreen from '../components/HomeScreen';
    import CreatePostScreen from '../components/CreatePostScreen';
    import UpdateScreen from '../components/UpdateScreen';
    import ProfileScreen from '../components/ProfileScreen';

    const Tab = createBottomTabNavigator();

    function BottomTabs() {
      const [keyboardVisible, setKeyboardVisible] = React.useState(false);

      React.useEffect(() => {
        const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
          setKeyboardVisible(true);
        });
        const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
          setKeyboardVisible(false);
        });

        return () => {
          showSubscription.remove();
          hideSubscription.remove();
        };
      }, []);

      return (
        <Tab.Navigator
          screenOptions={{
            sceneContainerStyle: {
              backgroundColor: '#E5E9F2',
            },
            tabBarStyle: {
              display: keyboardVisible ? 'none' : 'flex',
              backgroundColor: '#235DFF',
              height: 64,
              borderTopWidth: 0,
              borderTopLeftRadius: 50,
              borderTopRightRadius: 50,
              borderBottomLeftRadius: 50,
              borderBottomRightRadius: 50,
              position: 'absolute',
              bottom: 16,
              marginLeft: 10,
              marginRight: 10,
              elevation: 3,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: -4,
              },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              paddingHorizontal: 16,
              marginHorizontal: 16,
            },
            tabBarActiveTintColor: 'white',
            tabBarInactiveTintColor: '#E5E9F2',
            headerShown: false,
            tabBarShowLabel: false,
            tabBarItemStyle: {
              padding: 0,
              marginVertical: 10,
              height: 44,
              alignItems: 'center',
              justifyContent: 'center',
            },
          }}
        >
          <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{
              tabBarIcon: ({ color, size, focused }) => (
                <View style={styles.iconContainer}>
                  <View style={[styles.iconBackground, focused && styles.focusedBackground]}>
                    <Home size={32} color={color} strokeWidth={2} />
                  </View>
                </View>
              ),
            }}
          />
          <Tab.Screen
            name="Create Post"
            component={CreatePostScreen}
            options={{
              tabBarIcon: ({ color, size, focused }) => (
                <View style={styles.iconContainer}>
                  <View style={[styles.iconBackground, focused && styles.focusedBackground]}>
                    <PlusCircle size={32} color={color} strokeWidth={2} />
                  </View>
                </View>
              ),
            }}
          />
          <Tab.Screen
            name="Updates"
            component={UpdateScreen}
            options={{
              tabBarIcon: ({ color, size, focused }) => (
                <View style={styles.iconContainer}>
                  <View style={[styles.iconBackground, focused && styles.focusedBackground]}>
                    <Bell size={32} color={color} strokeWidth={2} />
                  </View>
                </View>
              ),
            }}
          />
          <Tab.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
              tabBarIcon: ({ color, size, focused }) => (
                <View style={styles.iconContainer}>
                  <View style={[styles.iconBackground, focused && styles.focusedBackground]}>
                    <User size={32} color={color} strokeWidth={2} />
                  </View>
                </View>
              ),
            }}
          />
        </Tab.Navigator>
      );
    }

    const styles = {
      iconContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
      },
      iconBackground: {
        padding: 8,
        borderRadius: 50,
      },
      focusedBackground: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
      },
    };

    export default BottomTabs; 