import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography } from '../theme';
import { useAppStore, Contact, ManagedProfile } from '../store/useAppStore';
import { OnboardingScreen } from '../features/onboarding/OnboardingScreen';
import { MitIDScreen } from '../features/onboarding/MitIDScreen';
import { MitIDUserInfo } from '../services/mitidService';
import { HomeScreen } from '../features/home/HomeScreen';
import { ContactDetailScreen } from '../features/contacts/ContactDetailScreen';
import { AddContactScreen } from '../features/contacts/AddContactScreen';
import { CodeSetupScreen } from '../features/contacts/CodeSetupScreen';
import { ScamInfoScreen } from '../features/scaminfo/ScamInfoScreen';
import { SettingsScreen } from '../features/settings/SettingsScreen';
import { FamilyAdminScreen } from '../features/settings/FamilyAdminScreen';
import { ManagedProfileScreen } from '../features/settings/ManagedProfileScreen';

const Tab = createBottomTabNavigator();

function HomeStack() {
  const [screen, setScreen] = useState<'home' | 'detail' | 'add' | 'codeSetup'>('home');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const contacts = useAppStore((s) => s.contacts);

  if (screen === 'codeSetup' && selectedContact) {
    const freshContact = contacts.find((c) => c.id === selectedContact.id) || selectedContact;
    return (
      <CodeSetupScreen
        contact={freshContact}
        onBack={() => { setScreen('detail'); }}
        onComplete={() => { setScreen('home'); setSelectedContact(null); }}
      />
    );
  }

  if (screen === 'detail' && selectedContact) {
    const freshContact = contacts.find((c) => c.id === selectedContact.id) || selectedContact;
    return (
      <ContactDetailScreen
        contact={freshContact}
        onBack={() => { setScreen('home'); setSelectedContact(null); }}
        onSetupCode={(contact) => { setSelectedContact(contact); setScreen('codeSetup'); }}
      />
    );
  }

  if (screen === 'add') {
    return (
      <AddContactScreen
        onBack={() => setScreen('home')}
        onAdded={() => setScreen('home')}
      />
    );
  }

  return (
    <HomeScreen
      onContactPress={(contact) => { setSelectedContact(contact); setScreen('detail'); }}
      onAddContact={() => setScreen('add')}
    />
  );
}

function SettingsStack() {
  const [screen, setScreen] = useState<'settings' | 'familyAdmin' | 'managedProfile'>('settings');
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);

  if (screen === 'managedProfile' && selectedProfileId) {
    return (
      <ManagedProfileScreen
        profileId={selectedProfileId}
        onBack={() => { setScreen('familyAdmin'); setSelectedProfileId(null); }}
      />
    );
  }

  if (screen === 'familyAdmin') {
    return (
      <FamilyAdminScreen
        onBack={() => setScreen('settings')}
        onSelectProfile={(profile) => { setSelectedProfileId(profile.id); setScreen('managedProfile'); }}
      />
    );
  }

  return (
    <SettingsScreen
      onNavigateToFamilyAdmin={() => setScreen('familyAdmin')}
    />
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;
          if (route.name === 'Hjem') {
            iconName = focused ? 'shield-checkmark' : 'shield-checkmark-outline';
          } else if (route.name === 'Svindelinfo') {
            iconName = focused ? 'newspaper' : 'newspaper-outline';
          } else {
            iconName = focused ? 'settings' : 'settings-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.borderLight,
          paddingBottom: 8,
          paddingTop: 8,
          height: 88,
        },
        tabBarLabelStyle: {
          ...typography.small,
          fontWeight: '600',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Hjem" component={HomeStack} />
      <Tab.Screen name="Svindelinfo" component={ScamInfoScreen} />
      <Tab.Screen name="Indstillinger" component={SettingsStack} />
    </Tab.Navigator>
  );
}

export const AppNavigator: React.FC = () => {
  const { isOnboarded, isAuthenticated, setOnboarded, setAuthenticated, setUser } = useAppStore();
  const [onboardingDone, setOnboardingDone] = useState(false);

  if (!isOnboarded && !onboardingDone) {
    return (
      <NavigationContainer>
        <OnboardingScreen onComplete={() => setOnboardingDone(true)} />
      </NavigationContainer>
    );
  }

  if (!isAuthenticated) {
    return (
      <NavigationContainer>
        <MitIDScreen
          onVerified={(userInfo?: MitIDUserInfo) => {
            setOnboarded(true);
            setAuthenticated(true);
            setUser({
              id: userInfo?.sub || 'local-user',
              name: userInfo?.name || 'Bruger',
              phone: '',
              mitIdVerified: userInfo?.mitidVerified ?? false,
              mitIdSub: userInfo?.sub || 'demo',
              biometricsEnabled: true,
              createdAt: new Date().toISOString(),
            });
          }}
        />
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <MainTabs />
    </NavigationContainer>
  );
};
