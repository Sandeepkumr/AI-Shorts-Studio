import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.brand}>Frame AI</Text>
        <Text style={styles.credits}>120 credits</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>AI VIDEO STUDIO</Text>
        <Text style={styles.title}>Create your next video in 
seconds.</Text>
        <Text style={styles.text}>Describe a scene, choose a style, and 
let AI bring it to life.</Text>
        <View style={styles.prompt}>
          <Text style={styles.promptLabel}>DESCRIBE YOUR VIDEO</Text>
          <Text style={styles.placeholder}>A cinematic aerial view 
of...</Text>
        </View>
        <View style={styles.button}>
          <Text style={styles.buttonText}>Create a video</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0B0B12", padding: 24 },
  header: { flexDirection: "row", justifyContent: "space-between", 
marginTop: 30 },
  brand: { color: "#FFFFFF", fontSize: 22, fontWeight: "800" },
  credits: { color: "#C7A7FF", fontWeight: "700" },
  content: { marginTop: 100 },
  label: { color: "#A77BFF", fontSize: 12, fontWeight: "800" },
  title: { color: "#FFFFFF", fontSize: 40, fontWeight: "800", marginTop: 
14 },
  text: { color: "#A6A6B6", fontSize: 16, lineHeight: 24, marginTop: 18 },
  prompt: { backgroundColor: "#171720", borderRadius: 18, marginTop: 48, 
padding: 18 },
  promptLabel: { color: "#88889B", fontSize: 11, fontWeight: "800" },
  placeholder: { color: "#737386", fontSize: 16, marginTop: 20 },
  button: { backgroundColor: "#8B5CF6", borderRadius: 16, marginTop: 16, 
padding: 18 },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800", 
textAlign: "center" },
});
