import React, { useEffect } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useDispatch, useSelector } from 'react-redux';
import { ActivityIndicator, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { bootstrapAuth } from '../store/slices/authSlice';
import { colors } from '../theme';
import SplashScreen from '../screens/SplashScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import OTPScreen from '../screens/OTPScreen';
import HomeScreen from '../screens/HomeScreen';
import ExploreScreen from '../screens/ExploreScreen';
import SearchScreen from '../screens/SearchScreen';
import EventDetailsScreen from '../screens/EventDetailsScreen';
import TicketSelectScreen from '../screens/TicketSelectScreen';
import BookingConfirmScreen from '../screens/BookingConfirmScreen';
import PaymentScreen from '../screens/PaymentScreen';
import MyTicketsScreen from '../screens/MyTicketsScreen';
import QRTicketScreen from '../screens/QRTicketScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.navy, card: colors.navySoft, text: colors.white, primary: colors.purple, border: '#1C2740' },
};

function Tabs() {
  const unreadCount = useSelector((s) => s.notifications.unreadCount);
  const icons = { Home: 'home-variant', Explore: 'compass', Tickets: 'ticket-confirmation', Alerts: 'bell', Profile: 'account-circle' };
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: colors.navySoft, borderTopColor: '#1C2740', height: 62, paddingBottom: 8, paddingTop: 6 },
        tabBarActiveTintColor: colors.purple,
        tabBarInactiveTintColor: colors.muted,
        tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name={icons[route.name] || 'circle'} size={size} color={color} />,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Tickets" component={MyTicketsScreen} />
      <Tab.Screen name="Alerts" component={NotificationsScreen} options={unreadCount > 0 ? { tabBarBadge: unreadCount } : undefined} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const dispatch = useDispatch();
  const { user, bootstrapping } = useSelector((s) => s.auth);

  useEffect(() => { dispatch(bootstrapAuth()); }, []);

  if (bootstrapping) {
    return <View style={{ flex: 1, backgroundColor: colors.navy, justifyContent: 'center' }}><ActivityIndicator color={colors.purple} /></View>;
  }

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="OTP" component={OTPScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={Tabs} />
            <Stack.Screen name="Search" component={SearchScreen} />
            <Stack.Screen name="EventDetails" component={EventDetailsScreen} />
            <Stack.Screen name="TicketSelect" component={TicketSelectScreen} />
            <Stack.Screen name="BookingConfirm" component={BookingConfirmScreen} />
            <Stack.Screen name="Payment" component={PaymentScreen} />
            <Stack.Screen name="QRTicket" component={QRTicketScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
