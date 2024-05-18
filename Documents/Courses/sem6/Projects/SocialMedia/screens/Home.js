import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { createStackNavigator } from "@react-navigation/stack";
import Calls from './Calls';
import Settings from './Settings';
import Story from './Story';
import Chat from './Chat';
import Feed from './Feed';
import Post from './Post';
import SingleChat from './SingleChat';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
function MyTabs() {
  return (
    <Tab.Navigator initialRouteName="Chat" screenOptions={{headerShown: false}}>
      <Tab.Screen
        name="Feed"
        component={Feed}
        options={{
          tabBarLabel: 'Feed',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
        }} />
      <Tab.Screen
        name="Story"
        component={Story}
        options={{
          tabBarLabel: 'Story',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="history" color={color} size={size} />
          ),
        }} />
      <Tab.Screen
        name="Post"
        component={Post}
        options={{
          tabBarLabel: 'Post',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="plus" color={color} size={size} />
          ),
        }} />
      {/* <Tab.Screen
        name="Chat"
        component={Chat}
        options={{
          tabBarLabel: 'Chat',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="chat" color={color} size={size} />
          ),
        }} /> */}
      <Tab.Screen
        name="Settings"
        component={Settings}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cogs" color={color} size={size} />
          ),
        }} />
    </Tab.Navigator>
  );
}

export default function Home() {
  return (
    <NavigationContainer independent={true} >
      <Stack.Navigator headerMode="none">
        <Stack.Screen name="Main" component={MyTabs} />
        <Stack.Screen name="Chat" component={Chat} />
        <Stack.Screen name="SingleChat" component={SingleChat} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
