import React, { useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  ScrollView,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

/*
 * ============================================================
 * IMAGE TO VIDEO — MY COINS SCREEN
 * ============================================================
 *
 * File:
 *   app/coins.tsx
 *
 * IMPORTANT:
 * This file is directly inside /app, so assets must use:
 *   ../assets/filename.png
 * ============================================================
 */

const ASSETS = {
  coin: require("../assets/coin.png"),
};

const COLORS = {
  background: "#020A10",
  surface: "#071A24",
  border: "#123E4D",
  text: "#F6F8FA",
  secondary: "#B3C1C8",
  muted: "#84959E",
  cyan: "#08D8D1",
  cyanBright: "#00E7DF",
  purple: "#B05CFF",
  gold: "#FFD700",
};

const COIN_PACKS = [
  {
    id: "1",
    coins: 500,
    price: "$4.99",
    tag: "Starter",
    popular: false,
  },
  {
    id: "2",
    coins: 1200,
    price: "$9.99",
    tag: "Best Value",
    popular: true,
  },
  {
    id: "3",
    coins: 3000,
    price: "$19.99",
    tag: "Pro",
    popular: false,
  },
];

const RECENT_TRANSACTIONS = [
  {
    id: "1",
    title: "Video Generation",
    date: "May 8, 2025",
    amount: -50,
    type: "usage",
  },
  {
    id: "2",
    title: "Coins Purchased",
    date: "May 7, 2025",
    amount: 1200,
    type: "purchase",
  },
  {
    id: "3",
    title: "Daily Bonus",
    date: "May 6, 2025",
    amount: 10,
    type: "bonus",
  },
];

export default function MyCoinsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const horizontalPadding = width <= 375 ? 18 : 22;

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/" as any);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* ==================================================
          HEADER
      ================================================== */}
      <View style={[styles.header, { paddingHorizontal: horizontalPadding }]}>
        <Pressable
          onPress={goBack}
          hitSlop={10}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons name="chevron-back" size={33} color={COLORS.text} />
        </Pressable>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>My Coins</Text>
        </View>

        <View style={styles.headerRightPlaceholder} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* ==================================================
            BALANCE CARD
        ================================================== */}
        <View style={[styles.balanceCard, { marginHorizontal: horizontalPadding }]}>
          <LinearGradient
            colors={["#0A2A36", "#04141A"]}
            style={styles.balanceGradient}
          >
            <View style={styles.balanceInfo}>
              <Text style={styles.balanceLabel}>Current Balance</Text>
              <View style={styles.balanceRow}>
                <Image source={ASSETS.coin} style={styles.balanceIcon} />
                <Text style={styles.balanceValue}>12,450</Text>
              </View>
            </View>
            <View style={styles.balanceSparkle}>
              <Text style={styles.sparkleIcon}>✦</Text>
            </View>
          </LinearGradient>
        </View>

        {/* ==================================================
            BUY COINS SECTION
        ================================================== */}
        <View style={[styles.sectionHeader, { paddingHorizontal: horizontalPadding }]}>
          <Text style={styles.sectionTitle}>Get More Coins</Text>
        </View>

        <View style={[styles.packsRow, { paddingHorizontal: horizontalPadding }]}>
          {COIN_PACKS.map((pack) => (
            <Pressable 
              key={pack.id} 
              style={[
                styles.packCard, 
                pack.popular && styles.packCardPopular
              ]}
            >
              {pack.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>POPULAR</Text>
                </View>
              )}
              <Image source={ASSETS.coin} style={styles.packIcon} />
              <Text style={styles.packCoins}>{pack.coins}</Text>
              <Text style={styles.packTag}>{pack.tag}</Text>
              <View style={styles.priceButton}>
                <Text style={styles.priceText}>{pack.price}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        {/* ==================================================
            TRANSACTIONS SECTION
        ================================================== */}
        <View style={[styles.sectionHeader, { paddingHorizontal: horizontalPadding, marginTop: 25 }]}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
        </View>

        <View style={{ paddingHorizontal: horizontalPadding }}>
          {RECENT_TRANSACTIONS.map((tx) => (
            <View key={tx.id} style={styles.transactionItem}>
              <View style={styles.txIconContainer}>
                <Ionicons 
                  name={tx.amount > 0 ? "arrow-down-circle" : "arrow-up-circle"} 
                  size={24} 
                  color={tx.amount > 0 ? COLORS.cyan : COLORS.purple} 
                />
              </View>
              <View style={styles.txInfo}>
                <Text style={styles.txTitle}>{tx.title}</Text>
                <Text style={styles.txDate}>{tx.date}</Text>
              </View>
              <Text style={[
                styles.txAmount,
                { color: tx.amount > 0 ? COLORS.cyan : COLORS.text }
              ]}>
                {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    width: "100%",
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 48,
    height: 46,
    borderRadius: 15,
    borderWidth: 1.3,
    borderColor: "#154A5D",
    backgroundColor: "#061822",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleWrap: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "800",
  },
  headerRightPlaceholder: {
    width: 48,
  },
  balanceCard: {
    height: 120,
    marginTop: 15,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "#124859",
  },
  balanceGradient: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 25,
    justifyContent: "space-between",
  },
  balanceInfo: {
    justifyContent: "center",
  },
  balanceLabel: {
    color: COLORS.secondary,
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 5,
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  balanceIcon: {
    width: 32,
    height: 32,
    marginRight: 10,
  },
  balanceValue: {
    color: COLORS.text,
    fontSize: 36,
    fontWeight: "900",
    letterSpacing: -1,
  },
  balanceSparkle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(8, 216, 209, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  sparkleIcon: {
    color: COLORS.cyan,
    fontSize: 24,
  },
  sectionHeader: {
    marginTop: 30,
    marginBottom: 15,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "700",
  },
  packsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  packCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    alignItems: "center",
    position: "relative",
  },
  packCardPopular: {
    borderColor: COLORS.cyan,
    backgroundColor: "#081D26",
  },
  popularBadge: {
    position: "absolute",
    top: -10,
    backgroundColor: COLORS.cyan,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  popularText: {
    color: COLORS.background,
    fontSize: 9,
    fontWeight: "900",
  },
  packIcon: {
    width: 40,
    height: 40,
    marginBottom: 8,
  },
  packCoins: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "800",
  },
  packTag: {
    color: COLORS.secondary,
    fontSize: 11,
    marginBottom: 12,
  },
  priceButton: {
    width: "100%",
    backgroundColor: "#020C14",
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#123E4D",
    alignItems: "center",
  },
  priceText: {
    color: COLORS.cyan,
    fontSize: 13,
    fontWeight: "700",
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    padding: 15,
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(18, 62, 77, 0.3)",
  },
  txIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(2, 12, 20, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  txInfo: {
    flex: 1,
  },
  txTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "600",
  },
  txDate: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 2,
  },
  txAmount: {
    fontSize: 16,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.7,
  },
});
