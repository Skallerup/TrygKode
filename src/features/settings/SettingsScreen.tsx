import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Card, Avatar, ScreenHeader, Button } from '../../components';
import { useAppStore, LoginMethod } from '../../store/useAppStore';
import { confirmAction, showAlert } from '../../utils/alerts';

interface SettingsScreenProps {
  onNavigateToFamilyAdmin?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onNavigateToFamilyAdmin }) => {
  const { user, contacts, managedProfiles, setUser, resetStore } = useAppStore();
  const isDemo = !user?.mitIdVerified || user?.mitIdSub === 'demo';
  const acceptedCount = contacts.filter((c) => c.status === 'accepted').length;
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showLoginMethod, setShowLoginMethod] = useState(false);
  const [showSetPin, setShowSetPin] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinStep, setPinStep] = useState<'enter' | 'confirm'>('enter');

  const handleSaveProfile = () => {
    if (!editName.trim()) {
      showAlert('Mangler navn', 'Du skal have et navn.');
      return;
    }
    if (user) {
      setUser({ ...user, name: editName.trim(), phone: editPhone.trim() });
    }
    setShowEditProfile(false);
    showAlert('Gemt', 'Din profil er opdateret.');
  };

  const loginMethodLabels: Record<LoginMethod, string> = {
    faceid: 'Face ID',
    pin: 'Personlig kode',
    mitid: 'MitID',
  };

  const handleSelectLoginMethod = (method: LoginMethod) => {
    if (method === 'pin' && !user?.pinCode) {
      setShowLoginMethod(false);
      setNewPin('');
      setConfirmPin('');
      setPinStep('enter');
      setShowSetPin(true);
      return;
    }
    if (user) {
      setUser({ ...user, preferredLogin: method });
    }
    setShowLoginMethod(false);
    showAlert('Gemt', `Foretrukken loginmetode er nu ${loginMethodLabels[method]}.`);
  };

  const handleSavePin = () => {
    if (pinStep === 'enter') {
      if (newPin.length !== 4) {
        showAlert('Ugyldig kode', 'Koden skal være 4 cifre.');
        return;
      }
      setPinStep('confirm');
      return;
    }
    if (confirmPin !== newPin) {
      showAlert('Koder matcher ikke', 'De to koder var ikke ens. Prøv igen.');
      setConfirmPin('');
      setPinStep('enter');
      setNewPin('');
      return;
    }
    if (user) {
      setUser({ ...user, pinCode: newPin, preferredLogin: 'pin' });
    }
    setShowSetPin(false);
    showAlert('Gemt', 'Din personlige kode er oprettet og sat som foretrukken loginmetode.');
  };

  const handleDeleteAccount = () => {
    confirmAction(
      'Slet din konto',
      'Er du helt sikker? Alle dine kontakter og kodeord slettes permanent. Dette kan ikke fortrydes.',
      () => {
        resetStore();
      }
    );
  };

  const renderInfoModal = (
    visible: boolean,
    onClose: () => void,
    title: string,
    content: string
  ) => (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalContainer}>
        <ScreenHeader title={title} onBack={onClose} />
        <ScrollView contentContainerStyle={styles.modalContent}>
          <Text style={styles.modalText}>{content}</Text>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader title="Indstillinger" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <Card style={styles.profileCard}>
          <View style={styles.profileRow}>
            <Avatar name={user?.name || 'Bruger'} size={56} />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.name || 'Din profil'}</Text>
              <Text style={styles.profileSub}>
                {contacts.length} kontakt{contacts.length !== 1 ? 'er' : ''} forbundet
              </Text>
            </View>
            <TouchableOpacity
              style={styles.editProfile}
              onPress={() => {
                setEditName(user?.name || '');
                setEditPhone(user?.phone || '');
                setShowEditProfile(true);
              }}
            >
              <Ionicons name="pencil" size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </Card>

        {isDemo && (
          <Card style={styles.demoWarningCard}>
            <View style={styles.demoWarningRow}>
              <Ionicons name="warning" size={24} color={colors.warning} />
              <View style={{ flex: 1 }}>
                <Text style={styles.demoWarningTitle}>Demo-tilstand</Text>
                <Text style={styles.demoWarningText}>
                  Du er ikke logget ind med MitID. Nogle funktioner er begrænset.
                </Text>
              </View>
            </View>
          </Card>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sikkerhed</Text>
          <Card variant="outlined">
            <View style={[styles.settingsItem, styles.settingsItemBorder]}>
              <View style={styles.settingsIcon}>
                <Ionicons name="finger-print" size={22} color={colors.primary} />
              </View>
              <View style={styles.settingsContent}>
                <Text style={styles.settingsLabel}>Biometrisk lås</Text>
                <Text style={styles.settingsSubtitle}>Fingeraftryk eller Face ID</Text>
              </View>
              <Switch
                value={biometricsEnabled}
                onValueChange={setBiometricsEnabled}
                trackColor={{ true: colors.primary, false: colors.border }}
                thumbColor="#FFFFFF"
              />
            </View>
            <View style={[styles.settingsItem, styles.settingsItemBorder]}>
              <View style={styles.settingsIcon}>
                <Ionicons name="card" size={22} color={isDemo ? colors.warning : colors.secondary} />
              </View>
              <View style={styles.settingsContent}>
                <Text style={styles.settingsLabel}>MitID-verifikation</Text>
                <Text style={styles.settingsSubtitle}>
                  {isDemo ? 'Ikke verificeret — demo-tilstand' : 'Din identitet er bekræftet'}
                </Text>
              </View>
              <Text style={[styles.valueText, { color: isDemo ? colors.warning : colors.secondary }]}>
                {isDemo ? 'Demo' : 'Aktiv'}
              </Text>
            </View>
            <View style={[styles.settingsItem, styles.settingsItemBorder]}>
              <View style={styles.settingsIcon}>
                <Ionicons name="shield-checkmark-outline" size={22} color={colors.primary} />
              </View>
              <View style={styles.settingsContent}>
                <Text style={styles.settingsLabel}>Konto-ID</Text>
                <Text style={styles.settingsSubtitle}>
                  {isDemo ? 'demo' : (user?.mitIdSub || '').substring(0, 8) + '...'}
                </Text>
              </View>
            </View>
            <View style={styles.settingsItem}>
              <View style={styles.settingsIcon}>
                <Ionicons name="stats-chart-outline" size={22} color={colors.primary} />
              </View>
              <View style={styles.settingsContent}>
                <Text style={styles.settingsLabel}>Aktive forbindelser</Text>
                <Text style={styles.settingsSubtitle}>
                  {acceptedCount} godkendt{acceptedCount !== 1 ? 'e' : ''} kontakt{acceptedCount !== 1 ? 'er' : ''}
                </Text>
              </View>
              <Text style={styles.valueText}>{acceptedCount}</Text>
            </View>
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Loginmetode</Text>
          <Card variant="outlined">
            <TouchableOpacity style={[styles.settingsItem, styles.settingsItemBorder]} onPress={() => setShowLoginMethod(true)} activeOpacity={0.7}>
              <View style={styles.settingsIcon}>
                <Ionicons name="log-in" size={22} color={colors.primary} />
              </View>
              <View style={styles.settingsContent}>
                <Text style={styles.settingsLabel}>Foretrukken login</Text>
                <Text style={styles.settingsSubtitle}>
                  {loginMethodLabels[user?.preferredLogin || 'faceid']}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.settingsItem}
              onPress={() => {
                setNewPin('');
                setConfirmPin('');
                setPinStep('enter');
                setShowSetPin(true);
              }}
              activeOpacity={0.7}
            >
              <View style={styles.settingsIcon}>
                <Ionicons name="keypad" size={22} color={colors.primary} />
              </View>
              <View style={styles.settingsContent}>
                <Text style={styles.settingsLabel}>{user?.pinCode ? 'Skift personlig kode' : 'Opret personlig kode'}</Text>
                <Text style={styles.settingsSubtitle}>
                  {user?.pinCode ? 'Ændr din 4-cifrede kode' : 'Opret en 4-cifret login-kode'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
            </TouchableOpacity>
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifikationer</Text>
          <Card variant="outlined">
            <View style={styles.settingsItem}>
              <View style={styles.settingsIcon}>
                <Ionicons name="notifications" size={22} color={colors.primary} />
              </View>
              <View style={styles.settingsContent}>
                <Text style={styles.settingsLabel}>Push-notifikationer</Text>
                <Text style={styles.settingsSubtitle}>Kodeord-udløb og check-ins</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ true: colors.primary, false: colors.border }}
                thumbColor="#FFFFFF"
              />
            </View>
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Familieadministrator</Text>
          <Card variant="outlined">
            <TouchableOpacity style={styles.settingsItem} onPress={() => onNavigateToFamilyAdmin?.()} activeOpacity={0.7}>
              <View style={styles.settingsIcon}>
                <Ionicons name="people-circle" size={22} color={colors.primary} />
              </View>
              <View style={styles.settingsContent}>
                <Text style={styles.settingsLabel}>Administrer for andre</Text>
                <Text style={styles.settingsSubtitle}>
                  {managedProfiles.length > 0
                    ? `${managedProfiles.length} person${managedProfiles.length !== 1 ? 'er' : ''} administreret`
                    : 'Hjælp familiemedlemmer med deres kodeord'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
            </TouchableOpacity>
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Om appen</Text>
          <Card variant="outlined">
            <TouchableOpacity style={[styles.settingsItem, styles.settingsItemBorder]} onPress={() => setShowAbout(true)} activeOpacity={0.7}>
              <View style={styles.settingsIcon}>
                <Ionicons name="information-circle" size={22} color={colors.primary} />
              </View>
              <View style={styles.settingsContent}>
                <Text style={styles.settingsLabel}>Om TrygKode</Text>
                <Text style={styles.settingsSubtitle}>Version 1.0.0</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.settingsItem, styles.settingsItemBorder]} onPress={() => setShowPrivacy(true)} activeOpacity={0.7}>
              <View style={styles.settingsIcon}>
                <Ionicons name="document-text" size={22} color={colors.primary} />
              </View>
              <View style={styles.settingsContent}>
                <Text style={styles.settingsLabel}>Privatlivspolitik</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingsItem} onPress={() => setShowHelp(true)} activeOpacity={0.7}>
              <View style={styles.settingsIcon}>
                <Ionicons name="help-circle" size={22} color={colors.primary} />
              </View>
              <View style={styles.settingsContent}>
                <Text style={styles.settingsLabel}>Hjælp og support</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
            </TouchableOpacity>
          </Card>
        </View>

        <View style={styles.dangerSection}>
          <Button
            title="Slet min konto"
            onPress={handleDeleteAccount}
            variant="ghost"
            size="medium"
            icon={<Ionicons name="trash-outline" size={18} color={colors.danger} />}
          />
        </View>
      </ScrollView>

      {/* Rediger profil modal */}
      <Modal visible={showEditProfile} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowEditProfile(false)}>
        <SafeAreaView style={styles.modalContainer}>
          <ScreenHeader title="Rediger profil" onBack={() => setShowEditProfile(false)} />
          <View style={styles.modalContent}>
            <View style={styles.editCenter}>
              <Avatar name={editName || 'B'} size={80} />
            </View>
            <Text style={styles.inputLabel}>Navn</Text>
            <TextInput
              style={styles.input}
              value={editName}
              onChangeText={setEditName}
              placeholder="Dit navn"
              placeholderTextColor={colors.textLight}
            />
            <Text style={styles.inputLabel}>Telefonnummer</Text>
            <TextInput
              style={styles.input}
              value={editPhone}
              onChangeText={setEditPhone}
              placeholder="+45 12 34 56 78"
              placeholderTextColor={colors.textLight}
              keyboardType="phone-pad"
            />
            <View style={{ marginTop: spacing.lg }}>
              <Button title="Gem ændringer" onPress={handleSaveProfile} />
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Vælg loginmetode */}
      <Modal visible={showLoginMethod} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowLoginMethod(false)}>
        <SafeAreaView style={styles.modalContainer}>
          <ScreenHeader title="Vælg loginmetode" onBack={() => setShowLoginMethod(false)} />
          <View style={styles.modalContent}>
            <Text style={styles.loginMethodDescription}>
              Vælg hvilken metode du foretrækker til at logge ind i TrygKode. De andre metoder kan altid bruges som alternativ.
            </Text>
            {(['faceid', 'pin', 'mitid'] as LoginMethod[]).map((method) => {
              const isSelected = (user?.preferredLogin || 'faceid') === method;
              const iconMap: Record<LoginMethod, keyof typeof Ionicons.glyphMap> = {
                faceid: 'scan',
                pin: 'keypad',
                mitid: 'card',
              };
              const descMap: Record<LoginMethod, string> = {
                faceid: 'Hurtig og sikker biometrisk login',
                pin: user?.pinCode
                  ? 'Log ind med din 4-cifrede kode'
                  : 'Opret først en personlig kode',
                mitid: 'Brug MitID til at logge ind',
              };
              const isDisabled = method === 'pin' && !user?.pinCode;
              return (
                <TouchableOpacity
                  key={method}
                  style={[
                    styles.loginMethodOption,
                    isSelected && styles.loginMethodOptionSelected,
                    isDisabled && styles.loginMethodOptionDisabled,
                  ]}
                  onPress={() => handleSelectLoginMethod(method)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.loginMethodIcon, isSelected && styles.loginMethodIconSelected]}>
                    <Ionicons name={iconMap[method]} size={28} color={isSelected ? colors.surface : colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.loginMethodLabel, isSelected && styles.loginMethodLabelSelected]}>
                      {loginMethodLabels[method]}
                    </Text>
                    <Text style={styles.loginMethodSub}>{descMap[method]}</Text>
                  </View>
                  {isSelected && <Ionicons name="checkmark-circle" size={24} color={colors.primary} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </SafeAreaView>
      </Modal>

      {/* Opret/Skift personlig kode */}
      <Modal visible={showSetPin} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowSetPin(false)}>
        <SafeAreaView style={styles.modalContainer}>
          <ScreenHeader title={user?.pinCode ? 'Skift personlig kode' : 'Opret personlig kode'} onBack={() => setShowSetPin(false)} />
          <View style={styles.modalContent}>
            <View style={styles.pinSetupContainer}>
              <Text style={styles.pinSetupInstruction}>
                {pinStep === 'enter' ? 'Indtast en ny 4-cifret kode' : 'Gentag din kode for at bekræfte'}
              </Text>
              <View style={styles.pinDotsRow}>
                {[0, 1, 2, 3].map((i) => {
                  const val = pinStep === 'enter' ? newPin : confirmPin;
                  return (
                    <View
                      key={i}
                      style={[styles.pinDotSetting, i < val.length && styles.pinDotSettingFilled]}
                    />
                  );
                })}
              </View>
              <View style={styles.pinNumpad}>
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'].map((key) => (
                  <TouchableOpacity
                    key={key || 'empty'}
                    style={[styles.pinNumpadKey, !key && styles.pinNumpadKeyEmpty]}
                    onPress={() => {
                      if (key === 'del') {
                        if (pinStep === 'enter') setNewPin((p) => p.slice(0, -1));
                        else setConfirmPin((p) => p.slice(0, -1));
                      } else if (key) {
                        if (pinStep === 'enter' && newPin.length < 4) setNewPin((p) => p + key);
                        else if (pinStep === 'confirm' && confirmPin.length < 4) setConfirmPin((p) => p + key);
                      }
                    }}
                    activeOpacity={key ? 0.6 : 1}
                    disabled={!key}
                  >
                    {key === 'del' ? (
                      <Ionicons name="backspace-outline" size={24} color={colors.text} />
                    ) : (
                      <Text style={styles.pinNumpadKeyText}>{key}</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
              <View style={{ marginTop: spacing.lg }}>
                <Button title={pinStep === 'enter' ? 'Næste' : 'Bekræft'} onPress={handleSavePin} />
              </View>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Privatlivspolitik */}
      {renderInfoModal(showPrivacy, () => setShowPrivacy(false), 'Privatlivspolitik',
        'Privatlivspolitik for TrygKode\n\nSidst opdateret: 19. februar 2026\n\n' +
        '1. Dataindsamling\n' +
        'TrygKode indsamler kun de oplysninger, der er nødvendige for at appen fungerer:\n' +
        '- Dit navn (som du selv angiver)\n' +
        '- MitID-verifikationsstatus (vi gemmer IKKE dine MitID-oplysninger)\n' +
        '- Dine kontakter og kodeord (krypteret lokalt på din enhed)\n\n' +
        '2. Kodeord og sikkerhed\n' +
        'Dine kodeord opbevares krypteret på din enhed. Vi kan ikke se dine kodeord, og de sendes aldrig over internettet i ukrypteret form.\n\n' +
        '3. Deling af data\n' +
        'Vi deler aldrig dine personlige oplysninger med tredjeparter. Dine data tilhører dig.\n\n' +
        '4. Sletning\n' +
        'Du kan til enhver tid slette din konto og alle tilhørende data via Indstillinger.\n\n' +
        '5. Kontakt\n' +
        'Har du spørgsmål til vores privatlivspolitik? Kontakt os på privacy@trygkode.dk'
      )}

      {/* Hjælp og support */}
      {renderInfoModal(showHelp, () => setShowHelp(false), 'Hjælp og support',
        'Hjælp og support\n\n' +
        'Ofte stillede spørgsmål:\n\n' +
        'Hvad er TrygKode?\n' +
        'TrygKode er en dansk app, der beskytter dig og dine nærmeste mod AI-svindel. Du opretter personlige kodeord med dine kontakter, som I kan bruge til at verificere hinandens identitet.\n\n' +
        'Hvordan virker det?\n' +
        '1. Tilføj en kontakt (f.eks. din mor)\n' +
        '2. Opret et hemmeligt kodeord sammen\n' +
        '3. Hvis nogen ringer og udgiver sig for at være din mor — spørg efter kodeordet\n' +
        '4. Kan de ikke svare? Så er det svindel.\n\n' +
        'Er mine kodeord sikre?\n' +
        'Ja. Kodeord opbevares krypteret på din enhed og sendes aldrig ukrypteret.\n\n' +
        'Hvad hvis jeg glemmer mit kodeord?\n' +
        'Åbn appen og find kontakten — kodeordet vises i appen (beskyttet med biometrisk lås).\n\n' +
        'Kontakt os:\n' +
        'E-mail: support@trygkode.dk\n' +
        'Vi svarer normalt inden for 24 timer.'
      )}

      {/* Om TrygKode */}
      {renderInfoModal(showAbout, () => setShowAbout(false), 'Om TrygKode',
        'TrygKode\nVersion 1.0.0\n\n' +
        'TrygKode er udviklet for at beskytte danske familier mod den stigende trussel fra AI-svindel.\n\n' +
        'Svindlere bruger i dag kunstig intelligens til at klone stemmer og narre folk til at overføre penge. Det kræver kun 3 sekunders lydoptagelse at kopiere en stemme.\n\n' +
        'TrygKode løser dette med et simpelt princip: et hemmeligt kodeord mellem dig og dine nærmeste, som ingen AI kan kende.\n\n' +
        'Funktioner:\n' +
        '- Personlige kodeord med familie og venner\n' +
        '- Faste eller skiftende kodeord\n' +
        '- MitID-verifikation af brugere\n' +
        '- Check-in påmindelser\n' +
        '- Svindeltips og nyheder\n' +
        '- Familieadministrator til ældre\n\n' +
        'Udviklet i Danmark til danskere.\n\n' +
        '© 2026 TrygKode. Alle rettigheder forbeholdes.'
      )}

      {/* Familieadministrator - now navigates to separate screen */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  profileCard: {
    marginBottom: spacing.lg,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...typography.h3,
    color: colors.text,
  },
  profileSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  editProfile: {
    padding: spacing.sm,
    backgroundColor: colors.primaryLight + '20',
    borderRadius: borderRadius.sm,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  settingsItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  settingsIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primaryLight + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsContent: {
    flex: 1,
  },
  settingsLabel: {
    ...typography.body,
    color: colors.text,
  },
  settingsSubtitle: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: 2,
  },
  valueText: {
    ...typography.caption,
    fontWeight: '600',
  },
  dangerSection: {
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  modalText: {
    ...typography.body,
    color: colors.text,
    lineHeight: 26,
  },
  editCenter: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  inputLabel: {
    ...typography.bodyBold,
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  input: {
    ...typography.body,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  loginMethodDescription: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  loginMethodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  loginMethodOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + '15',
  },
  loginMethodOptionDisabled: {
    opacity: 0.5,
  },
  loginMethodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginMethodIconSelected: {
    backgroundColor: colors.primary,
  },
  loginMethodLabel: {
    ...typography.bodyBold,
    color: colors.text,
  },
  loginMethodLabelSelected: {
    color: colors.primary,
  },
  loginMethodSub: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: 2,
  },
  pinSetupContainer: {
    alignItems: 'center',
    gap: spacing.md,
  },
  pinSetupInstruction: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  pinDotsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  pinDotSetting: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: 'transparent',
  },
  pinDotSettingFilled: {
    backgroundColor: colors.primary,
  },
  pinNumpad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: 280,
    gap: spacing.sm,
  },
  pinNumpadKey: {
    width: 72,
    height: 56,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  pinNumpadKeyEmpty: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  pinNumpadKeyText: {
    ...typography.h3,
    color: colors.text,
  },
  demoWarningCard: {
    marginBottom: spacing.lg,
    backgroundColor: colors.warningLight,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  demoWarningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  demoWarningTitle: {
    ...typography.bodyBold,
    color: colors.warning,
  },
  demoWarningText: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
