import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image, SafeAreaView, StatusBar, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather as Icon } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

const CreateProfileScreen = () => {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone?: string }>();
  const [image, setImage] = useState<string | null>(null);

  const formattedPhone = (() => {
    if (!phone) return "";
    const codes = ["+91", "+44", "+1"];
    for (const code of codes) {
      if (phone.startsWith(code)) {
        return `${code} ${phone.slice(code.length)}`;
      }
    }
    return phone;
  })();

  const flag = (() => {
    if (!phone) return "🇮🇳";
    if (phone.startsWith("+1")) return "🇺🇸";
    if (phone.startsWith("+44")) return "🇬🇧";
    return "🇮🇳";
  })();

  const pickImage = async () => {
    Alert.alert("Select Profile Photo", "Choose an option:", [
      { text: "Camera", onPress: () => openCamera() },
      { text: "Gallery", onPress: () => openGallery() },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required to take a photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 1 });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const openGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Gallery permission is required to select a photo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], quality: 1 });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#1a1a1a', '#0d0d0d']} style={styles.container}>
        {/* Background Wave Texture */}
        <Image
          source={require('../../assets/wave-bg.png')}
          style={styles.backgroundImage}
        />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Icon name="arrow-left" size={26} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/loginlogo.png')}
              style={styles.logo}
            />
          </View>

          {/* Title */}
          <Text style={styles.title}>Create your profile</Text>
          <Text style={styles.subtitle}>Let's personalize your Shivora experience</Text>

          {/* Profile Photo Uploader */}
          <View style={styles.profilePhotoSection}>
            <View style={styles.avatarWrapper}>
              <TouchableOpacity style={styles.avatarPlaceholder} onPress={pickImage}>
                {image ? (
                  <Image source={{ uri: image }} style={styles.avatar} />
                ) : (
                  <Icon name="user" size={50} color="#555" />
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.cameraIconContainer} onPress={pickImage}>
                <Icon name="camera" size={18} color="#000" />
              </TouchableOpacity>
            </View>
            <Text style={styles.addPhotoText}>Add profile photo</Text>
          </View>

          {/* Input Fields */}
          <View style={styles.form}>
            {/* Full Name */}
            <Text style={styles.inputLabel}>Full name</Text>
            <View style={styles.inputContainer}>
              <Icon name="user" size={20} color="#00FFC2" style={styles.inputIcon} />
              <TextInput
                placeholder="Enter your full name"
                placeholderTextColor="#8A8A8A"
                style={styles.input}
              />
            </View>

            {/* Email Address */}
            <Text style={styles.inputLabel}>Email address (optional)</Text>
            <View style={styles.inputContainer}>
              <Icon name="mail" size={20} color="#00FFC2" style={styles.inputIcon} />
              <TextInput
                placeholder="Enter your email address"
                placeholderTextColor="#8A8A8A"
                style={styles.input}
                keyboardType="email-address"
              />
            </View>

            {/* Mobile Number (Verified) */}
            <Text style={styles.inputLabel}>Mobile number</Text>
            <View style={[styles.inputContainer, styles.verifiedInputContainer]}>
              <Icon name="phone" size={20} color="#00FFC2" style={styles.inputIcon} />
              <Text style={styles.flag}>{flag}</Text>
              <TextInput
                style={styles.verifiedNumber}
                value={formattedPhone}
                editable={false}
              />
              <View style={styles.verifiedCheck}>
                <Icon name="check" size={16} color="#000" />
              </View>
            </View>
            <View style={styles.verifiedTextContainer}>
                <Icon name="check-circle" size={14} color="#00FFC2" />
                <Text style={styles.verifiedText}>This number is verified</Text>
            </View>
          </View>

          {/* Create Profile Button */}
          <TouchableOpacity style={styles.createButtonContainer} onPress={() => router.replace("/(tabs)/home")}>
              <Text style={styles.createButtonText}>Create Profile</Text>
              <Icon name="arrow-right" size={22} color="#000000" />
          </TouchableOpacity>

          {/* Footer Agreement */}
          <Text style={styles.footerText}>
            By continuing, you agree to our{' '}
            <Text style={styles.linkText}>Terms of Service</Text> and{' '}
            <Text style={styles.linkText}>Privacy Policy</Text>.
          </Text>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0d0d0d' },
  container: { flex: 1 },
  backgroundImage: { position: 'absolute', top: 0, left: 0, right: 0, height: '60%', opacity: 0.1, resizeMode: 'cover', zIndex: -1 },
  header: { position: 'absolute', top: 10, left: 10, zIndex: 10 },
  backButton: { padding: 10 },
  scrollContainer: { flexGrow: 1, paddingHorizontal: 25, paddingBottom: 20 },
  logoContainer: { alignItems: 'center', marginTop: 10, marginBottom: 5 },
  logo: { width: 120, height: 120, resizeMode: 'contain' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center', marginTop: -20 },
  subtitle: { fontSize: 16, color: '#B0B0B0', textAlign: 'center', marginTop: 8, marginBottom: 20 },
  profilePhotoSection: { alignItems: 'center', marginVertical: 5 },
  avatarWrapper: { position: 'relative', width: 110, height: 110 },
  avatarPlaceholder: { width: 110, height: 110, borderRadius: 55, backgroundColor: '#2C2C2C', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#00FFC2' },
  avatar: { width: '100%', height: '100%', borderRadius: 55 },
  cameraIconContainer: { position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderRadius: 16, backgroundColor: '#00FFC2', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#121212', zIndex: 10, elevation: 10 },
  addPhotoText: { color: '#B0B0B0', marginTop: 12, fontSize: 14 },
  form: { width: '100%' },
  inputLabel: { color: '#FFFFFF', fontSize: 15, marginBottom: 8, marginTop: 15 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(44, 44, 44, 0.7)', borderRadius: 12, borderWidth: 1, borderColor: '#4A4A4A', height: 55, paddingHorizontal: 15 },
  inputIcon: { marginRight: 10, color: '#00FFC2' },
  input: { flex: 1, color: '#FFFFFF', fontSize: 16 },
  verifiedNumber: { flex: 1, color: '#FFFFFF', fontSize: 16 },
  separator: { width: 1, height: '60%', backgroundColor: '#4A4A4A' },
  flag: { fontSize: 24, marginRight: 8, marginLeft: 5 },
  verifiedCheck: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#00FFC2', justifyContent: 'center', alignItems: 'center' },
  verifiedTextContainer: {flexDirection: 'row', alignItems: 'center', marginTop: 8, marginLeft: 5},
  verifiedText: {color: '#00FFC2', fontSize: 13, marginLeft: 6},
  createButtonContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#00FFC2', borderRadius: 14, height: 56, marginTop: 30, shadowColor: '#00FFC2', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
  createButtonText: { color: '#000000', fontSize: 18, fontWeight: 'bold', marginRight: 8 },
  footerText: { color: '#8A8A8A', textAlign: 'center', marginTop: 20, fontSize: 13, lineHeight: 18 },
  linkText: { color: '#FFFFFF', textDecorationLine: 'underline' },
});

export default CreateProfileScreen;
