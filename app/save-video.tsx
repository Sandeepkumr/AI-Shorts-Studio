import React, { useEffect, useRef } from 'react';
import {
    StyleSheet,
    View,
    Text,
    SafeAreaView,
    StatusBar,
    TouchableOpacity,
    Image,
    Animated,
    useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather as Icon, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// ============================================================
// ASSETS
// File location:
// app/save-video.tsx
//
// Assets location:
// assets/
//
// Therefore the correct path is:
// ../assets/filename
// ============================================================

const SWITZERLAND_IMAGE = require('../assets/switzerland_story.png');
const PROGRESS_WAVE = require('../assets/progress-wave-bg.png');
const COIN_IMAGE = require('../assets/coin.png');

// ============================================================
// APP THEME
// ============================================================

const COLORS = {
    background: '#020B14',
    backgroundSecondary: '#061522',

    card: '#071725',
    cardSecondary: '#091A29',

    border: '#123650',
    borderLight: '#16435C',

    primary: '#00E5D4',
    primaryBright: '#00F5E5',
    primaryDark: '#087B83',

    text: '#FFFFFF',
    textSecondary: '#AAB9CC',
    textMuted: '#8292A6',

    purple: '#A895FF',
    gold: '#FFD84D',
    danger: '#FF5360',
};

// ============================================================
// VIDEO DATA
// ============================================================

const videoData = {
    title: 'Switzerland Travel Story',
    duration: '60 sec',
    aspectRatio: '9:16',
    style: 'Cinematic',
    resolution: '1080p',
    thumbnail: SWITZERLAND_IMAGE,
};

// ============================================================
// QUICK ACTIONS
// ============================================================

const quickActions = [
    {
        key: 'edit',
        icon: 'edit-3',
        title: 'Edit Video',
        subtitle: 'Make changes',
        color: COLORS.primary,
    },
    {
        key: 'duplicate',
        icon: 'copy',
        title: 'Duplicate',
        subtitle: 'Create a copy',
        color: COLORS.purple,
    },
    {
        key: 'template',
        icon: 'star',
        title: 'Use as Template',
        subtitle: 'Create similar',
        color: COLORS.gold,
    },
    {
        key: 'delete',
        icon: 'trash-2',
        title: 'Delete',
        subtitle: 'Remove video',
        color: COLORS.danger,
    },
];

// ============================================================
// SHARE OPTIONS
// ============================================================

const shareOptions = [
    {
        key: 'instagram',
        icon: 'instagram',
        label: 'Instagram',
    },
    {
        key: 'tiktok',
        icon: 'tiktok',
        label: 'TikTok',
    },
    {
        key: 'youtube',
        icon: 'youtube',
        label: 'YouTube',
    },
    {
        key: 'whatsapp',
        icon: 'whatsapp',
        label: 'WhatsApp',
    },
];

// ============================================================
// SCREEN
// ============================================================

const VideoSavedScreen = () => {
    const router = useRouter();

    const { width, height } = useWindowDimensions();

    // ========================================================
    // RESPONSIVE SIZING
    // ========================================================

    const isSmallScreen = height < 700;
    const isVerySmallScreen = height < 650;

    const horizontalPadding = width <= 375 ? 18 : 22;

    const successHeight = isVerySmallScreen
        ? 70
        : isSmallScreen
            ? 78
            : 88;

    const successCircleSize = isVerySmallScreen
        ? 64
        : isSmallScreen
            ? 58
            : 62;

    const videoHeight = isVerySmallScreen
        ? 225
        : isSmallScreen
            ? 220
            : 235;

    const quickActionHeight = isVerySmallScreen
        ? 62
        : 68;

    const buttonHeight = isVerySmallScreen
        ? 43
        : 47;

    // ========================================================
    // ANIMATION VALUES
    // ========================================================

    const successScale = useRef(
        new Animated.Value(0.75)
    ).current;

    const successOpacity = useRef(
        new Animated.Value(0)
    ).current;

    const contentOpacity = useRef(
        new Animated.Value(0)
    ).current;

    const waveScale = useRef(
        new Animated.Value(0.9)
    ).current;

    // ========================================================
    // SUCCESS ANIMATION
    // ========================================================

    useEffect(() => {
        Animated.sequence([
            Animated.parallel([
                Animated.spring(successScale, {
                    toValue: 1,
                    friction: 7,
                    tension: 70,
                    useNativeDriver: true,
                }),

                Animated.timing(successOpacity, {
                    toValue: 1,
                    duration: 350,
                    useNativeDriver: true,
                }),
            ]),

            Animated.parallel([
                Animated.timing(contentOpacity, {
                    toValue: 1,
                    duration: 350,
                    useNativeDriver: true,
                }),

                Animated.spring(waveScale, {
                    toValue: 1,
                    friction: 8,
                    tension: 60,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();
    }, []);

    // ========================================================
    // RENDER
    // ========================================================

    return (
        <SafeAreaView style={styles.safeArea}>

            <StatusBar
                barStyle="light-content"
                backgroundColor={COLORS.background}
            />

            <LinearGradient
                colors={[
                    '#020B14',
                    '#03111D',
                    '#020B14',
                ]}
                locations={[0, 0.5, 1]}
                style={styles.container}
            >

                {/* ====================================================
                    HEADER
                ==================================================== */}

                <View style={styles.header}>

                    <View style={{ flex: 1 }} />

                    <TouchableOpacity
                        activeOpacity={0.8}
                        style={styles.creditsContainer}
                    >

                        <Image
                            source={COIN_IMAGE}
                            style={styles.coinIcon}
                        />

                        <Text style={styles.creditsText}>
                            12,230
                        </Text>

                        <Icon
                            name="plus"
                            size={17}
                            color={COLORS.primary}
                        />

                    </TouchableOpacity>

                </View>

                {/* ====================================================
                    MAIN CONTENT
                ==================================================== */}

                <View
                    style={[
                        styles.content,
                        {
                            paddingHorizontal:
                                horizontalPadding,
                        },
                    ]}
                >

                    {/* ==================================================
                        SUCCESS WAVE
                    ================================================== */}

                    <Animated.View
                        style={[
                            styles.successSection,
                            {
                                height: successHeight,
                                opacity: successOpacity,
                                transform: [
                                    {
                                        scale: successScale,
                                    },
                                ],
                            },
                        ]}
                    >

                        <Animated.Image
                            source={PROGRESS_WAVE}
                            resizeMode="contain"
                            style={[
                                styles.successWave,
                                {
                                    width: width * 1.15,
                                    height: successHeight * 1.35,
                                    transform: [
                                        {
                                            scale: waveScale,
                                        },
                                    ],
                                },
                            ]}
                        />

                        <View
                            style={[
                                styles.successCircle,
                                {
                                    width: successCircleSize,
                                    height: successCircleSize,
                                    borderRadius:
                                        successCircleSize / 2,
                                },
                            ]}
                        >

                            <Icon
                                name="check"
                                size={
                                    isVerySmallScreen
                                        ? 27
                                        : 31
                                }
                                color={COLORS.primary}
                            />

                        </View>

                    </Animated.View>

                    {/* ==================================================
                        TITLE
                    ================================================== */}

                    <Animated.View
                        style={[
                            styles.mainHeadingContainer,
                            {
                                opacity: contentOpacity,
                            },
                        ]}
                    >

                        <Text
                            style={[
                                styles.mainTitle,
                                isVerySmallScreen && {
                                    fontSize: 21,
                                    lineHeight: 25,
                                },
                            ]}
                            numberOfLines={1}
                            adjustsFontSizeToFit
                        >
                            Your video has been saved!
                        </Text>

                        <Text
                            style={[
                                styles.mainSubtitle,
                                isVerySmallScreen && {
                                    fontSize: 13,
                                    lineHeight: 18,
                                },
                            ]}
                        >
                            What would you like to do next?
                        </Text>

                    </Animated.View>

                    {/* ==================================================
                        VIDEO CARD
                    ================================================== */}

                    <Animated.View
                        style={{
                            opacity: contentOpacity,
                        }}
                    >

                        <View
                            style={[
                                styles.videoCard,
                                {
                                    height: videoHeight,
                                },
                            ]}
                        >

                            <Image
                                source={videoData.thumbnail}
                                resizeMode="cover"
                                style={styles.videoThumbnail}
                            />

                            <LinearGradient
                                colors={[
                                    'transparent',
                                    'rgba(0,0,0,0.15)',
                                    'rgba(0,0,0,0.90)',
                                ]}
                                locations={[
                                    0.30,
                                    0.55,
                                    1,
                                ]}
                                style={styles.videoOverlay}
                            />

                            {/* Play Button */}

                            <TouchableOpacity
                                activeOpacity={0.85}
                                style={[
                                    styles.playButton,
                                    isVerySmallScreen && {
                                        width: 50,
                                        height: 50,
                                        borderRadius: 25,
                                        marginLeft: -25,
                                        marginTop: -25,
                                    },
                                ]}
                            >

                                <Icon
                                    name="play"
                                    size={
                                        isVerySmallScreen
                                            ? 21
                                            : 24
                                    }
                                    color="#FFFFFF"
                                    style={{
                                        marginLeft: 3,
                                    }}
                                />

                            </TouchableOpacity>

                            {/* Video Information */}

                            <View style={styles.videoInfo}>

                                <Text
                                    style={[
                                        styles.videoTitle,
                                        isVerySmallScreen && {
                                            fontSize: 15,
                                        },
                                    ]}
                                    numberOfLines={1}
                                >
                                    {videoData.title}
                                </Text>

                                <View style={styles.videoMetaRow}>

                                    <View style={styles.metaItem}>

                                        <Icon
                                            name="clock"
                                            size={15}
                                            color="#D3DCE8"
                                        />

                                        <Text
                                            style={styles.metaText}
                                        >
                                            {videoData.duration}
                                        </Text>

                                    </View>

                                    <View style={styles.metaItem}>

                                        <Icon
                                            name="smartphone"
                                            size={15}
                                            color="#D3DCE8"
                                        />

                                        <Text
                                            style={styles.metaText}
                                        >
                                            {videoData.aspectRatio}
                                        </Text>

                                    </View>

                                    <View style={styles.metaItem}>

                                        <Icon
                                            name="film"
                                            size={15}
                                            color="#D3DCE8"
                                        />

                                        <Text
                                            style={styles.metaText}
                                        >
                                            {videoData.style}
                                        </Text>

                                    </View>

                                </View>

                            </View>

                            {/* Resolution */}

                            <View style={styles.resolutionBadge}>

                                <Text style={styles.resolutionText}>
                                    {videoData.resolution}
                                </Text>

                            </View>

                        </View>

                        {/* ==================================================
                            LIBRARY CARD
                        ================================================== */}

                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={[
                                styles.libraryCard,
                                isVerySmallScreen && {
                                    height: 62,
                                },
                            ]}
                        >

                            <View
                                style={[
                                    styles.libraryIconBox,
                                    isVerySmallScreen && {
                                        width: 40,
                                        height: 40,
                                    },
                                ]}
                            >

                                <Icon
                                    name="folder"
                                    size={
                                        isVerySmallScreen
                                            ? 21
                                            : 24
                                    }
                                    color={COLORS.primary}
                                />

                                <View style={styles.folderCheck}>

                                    <Icon
                                        name="check"
                                        size={8}
                                        color={COLORS.primary}
                                    />

                                </View>

                            </View>

                            <View
                                style={
                                    styles.libraryTextContainer
                                }
                            >

                                <Text
                                    style={[
                                        styles.libraryTitle,
                                        isVerySmallScreen && {
                                            fontSize: 13,
                                        },
                                    ]}
                                    numberOfLines={1}
                                >
                                    Video saved to your library
                                </Text>

                                <Text
                                    style={[
                                        styles.librarySubtitle,
                                        isVerySmallScreen && {
                                            fontSize: 10.5,
                                        },
                                    ]}
                                    numberOfLines={1}
                                >
                                    You can find it in "My Creations" section.
                                </Text>

                            </View>

                            <Icon
                                name="chevron-right"
                                size={20}
                                color="#A8B8CA"
                            />

                        </TouchableOpacity>

                        {/* ==================================================
                            QUICK ACTIONS
                        ================================================== */}

                        <Text style={styles.sectionTitle}>
                            Quick Actions
                        </Text>

                        <View
                            style={[
                                styles.quickActionsContainer,
                                {
                                    height:
                                        quickActionHeight,
                                },
                            ]}
                        >

                            {quickActions.map((action) => (

                                <TouchableOpacity
                                    key={action.key}
                                    activeOpacity={0.8}
                                    style={
                                        styles.quickActionCard
                                    }
                                >

                                    <View
                                        style={[
                                            styles.quickActionIcon,
                                            {
                                                borderColor:
                                                    `${action.color}55`,
                                                backgroundColor:
                                                    `${action.color}08`,
                                            },
                                        ]}
                                    >

                                        <Icon
                                            name={
                                                action.icon as any
                                            }
                                            size={
                                                isVerySmallScreen
                                                    ? 18
                                                    : 20
                                            }
                                            color={
                                                action.color
                                            }
                                        />

                                    </View>

                                    <Text
                                        style={[
                                            styles.quickActionTitle,
                                            isVerySmallScreen && {
                                                fontSize: 8.5,
                                            },
                                        ]}
                                        numberOfLines={1}
                                        adjustsFontSizeToFit
                                    >
                                        {action.title}
                                    </Text>

                                    <Text
                                        style={[
                                            styles.quickActionSubtitle,
                                            isVerySmallScreen && {
                                                fontSize: 7.5,
                                            },
                                        ]}
                                        numberOfLines={1}
                                    >
                                        {action.subtitle}
                                    </Text>

                                </TouchableOpacity>

                            ))}

                        </View>

                        {/* ==================================================
                            SHARE
                        ================================================== */}

                        <Text style={styles.shareTitle}>
                            Share on
                        </Text>

                        <View style={styles.shareContainer}>

                            {shareOptions.map((option) => (

                                <TouchableOpacity
                                    key={option.key}
                                    activeOpacity={0.8}
                                    style={styles.shareOption}
                                >

                                    <View
                                        style={[
                                            styles.shareIconCircle,
                                            isVerySmallScreen && {
                                                width: 36,
                                                height: 36,
                                                borderRadius: 18,
                                            },
                                        ]}
                                    >

                                        <FontAwesome5
                                            name={
                                                option.icon as any
                                            }
                                            size={
                                                isVerySmallScreen
                                                    ? 19
                                                    : 22
                                            }
                                            color="#FFFFFF"
                                        />

                                    </View>

                                    <Text
                                        style={[
                                            styles.shareLabel,
                                            isVerySmallScreen && {
                                                fontSize: 8.5,
                                            },
                                        ]}
                                    >
                                        {option.label}
                                    </Text>

                                </TouchableOpacity>

                            ))}

                            {/* More */}

                            <TouchableOpacity
                                activeOpacity={0.8}
                                style={styles.shareOption}
                            >

                                <View
                                    style={[
                                        styles.shareIconCircle,
                                        isVerySmallScreen && {
                                            width: 36,
                                            height: 36,
                                            borderRadius: 18,
                                        },
                                    ]}
                                >

                                    <Icon
                                        name="more-horizontal"
                                        size={
                                            isVerySmallScreen
                                                ? 21
                                                : 24
                                        }
                                        color="#AFC0D4"
                                    />

                                </View>

                                <Text
                                    style={[
                                        styles.shareLabel,
                                        isVerySmallScreen && {
                                            fontSize: 8.5,
                                        },
                                    ]}
                                >
                                    More
                                </Text>

                            </TouchableOpacity>

                        </View>

                        {/* ==================================================
                            BOTTOM BUTTONS
                        ================================================== */}

                        <View style={styles.bottomButtons}>

                            <TouchableOpacity
                                activeOpacity={0.85}
                                style={[
                                    styles.homeButton,
                                    {
                                        height: buttonHeight,
                                    },
                                ]}
                                onPress={() =>
                                    router.replace('/')
                                }
                            >

                                <Icon
                                    name="home"
                                    size={
                                        isVerySmallScreen
                                            ? 18
                                            : 20
                                    }
                                    color="#00110F"
                                />

                                <Text
                                    style={[
                                        styles.homeButtonText,
                                        isVerySmallScreen && {
                                            fontSize: 14,
                                        },
                                    ]}
                                >
                                    Go to Home
                                </Text>

                            </TouchableOpacity>

                            <TouchableOpacity
                                activeOpacity={0.85}
                                style={[
                                    styles.viewVideosButton,
                                    {
                                        height: buttonHeight,
                                    },
                                ]}
                            >

                                <Icon
                                    name="image"
                                    size={
                                        isVerySmallScreen
                                            ? 18
                                            : 20
                                    }
                                    color={COLORS.primary}
                                />

                                <Text
                                    style={[
                                        styles.viewVideosText,
                                        isVerySmallScreen && {
                                            fontSize: 13,
                                        },
                                    ]}
                                >
                                    View All Videos
                                </Text>

                            </TouchableOpacity>

                        </View>

                    </Animated.View>

                </View>

            </LinearGradient>

        </SafeAreaView>
    );
};

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({

    // ========================================================
    // ROOT
    // ========================================================

    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },

    container: {
        flex: 1,
    },

    // ========================================================
    // HEADER
    // ========================================================

    header: {
        height: 58,

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',

        paddingHorizontal: 20,
    },

    backButton: {
        width: 38,
        height: 38,

        alignItems: 'center',
        justifyContent: 'center',
    },

    creditsContainer: {
        height: 40,

        minWidth: 151,

        paddingHorizontal: 13,

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',

        borderWidth: 1.3,
        borderColor: COLORS.primary,

        borderRadius: 22,

        backgroundColor: 'rgba(0,229,212,0.025)',
    },

    coinIcon: {
        width: 17,
        height: 17,
        resizeMode: 'contain',
    },

    creditsText: {
        color: COLORS.text,

        fontSize: 14,
        fontWeight: '700',

        marginHorizontal: 9,
    },

    // ========================================================
    // CONTENT
    // ========================================================

    content: {
        flex: 1,

        paddingTop: 2,
        paddingBottom: 7,
    },

    // ========================================================
    // SUCCESS
    // ========================================================

    successSection: {
        alignItems: 'center',
        justifyContent: 'center',

        position: 'relative',
    },

    successWave: {
        position: 'absolute',
        opacity: 0.68,
    },

    successCircle: {
        alignItems: 'center',
        justifyContent: 'center',

        backgroundColor: COLORS.background,

        borderWidth: 3,
        borderColor: COLORS.primary,

        shadowColor: COLORS.primary,

        shadowOffset: {
            width: 0,
            height: 0,
        },

        shadowOpacity: 0.45,
        shadowRadius: 11,

        elevation: 8,
    },

    // ========================================================
    // TITLE
    // ========================================================

    mainHeadingContainer: {
        alignItems: 'center',

        marginTop: 2,
        marginBottom: 11,
    },

    mainTitle: {
        color: COLORS.text,

        fontSize: 23,
        lineHeight: 28,

        fontWeight: '800',

        textAlign: 'center',
    },

    mainSubtitle: {
        color: COLORS.textSecondary,

        fontSize: 15,
        lineHeight: 20,

        textAlign: 'center',

        marginTop: 3,
    },

    // ========================================================
    // VIDEO CARD
    // ========================================================

    videoCard: {
        width: '100%',

        borderRadius: 17,

        overflow: 'hidden',

        backgroundColor: COLORS.card,

        borderWidth: 1,
        borderColor: COLORS.border,

        position: 'relative',

        marginBottom: 9,
    },

    videoThumbnail: {
        width: '100%',
        height: '100%',
    },

    videoOverlay: {
        ...StyleSheet.absoluteFillObject,
    },

    playButton: {
        position: 'absolute',

        width: 58,
        height: 58,

        borderRadius: 29,

        left: '50%',
        top: '50%',

        marginLeft: -29,
        marginTop: -29,

        alignItems: 'center',
        justifyContent: 'center',

        backgroundColor: 'rgba(0,18,30,0.78)',

        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.50)',
    },

    videoInfo: {
        position: 'absolute',

        left: 17,
        right: 17,
        bottom: 14,
    },

    videoTitle: {
        color: COLORS.text,

        fontSize: 17,
        lineHeight: 21,

        fontWeight: '800',

        marginBottom: 7,

        maxWidth: '72%',
    },

    videoMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',

        gap: 12,
    },

    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    metaText: {
        color: '#D6DFEA',

        fontSize: 12,

        marginLeft: 5,
    },

    resolutionBadge: {
        position: 'absolute',

        right: 15,
        bottom: 13,

        paddingHorizontal: 10,
        paddingVertical: 5,

        borderRadius: 15,

        backgroundColor: 'rgba(2,12,20,0.78)',

        borderWidth: 1.2,
        borderColor: COLORS.primary,
    },

    resolutionText: {
        color: COLORS.primary,

        fontSize: 12,
        fontWeight: '700',
    },

    // ========================================================
    // LIBRARY CARD
    // ========================================================

    libraryCard: {
        height: 70,

        flexDirection: 'row',
        alignItems: 'center',

        paddingHorizontal: 13,

        borderRadius: 14,

        backgroundColor: COLORS.card,

        borderWidth: 1,
        borderColor: COLORS.borderLight,

        marginBottom: 10,
    },

    libraryIconBox: {
        width: 46,
        height: 46,

        borderRadius: 12,

        alignItems: 'center',
        justifyContent: 'center',

        backgroundColor: 'rgba(0,229,212,0.06)',

        borderWidth: 1,
        borderColor: 'rgba(0,229,212,0.25)',

        position: 'relative',
    },

    folderCheck: {
        position: 'absolute',

        right: 5,
        bottom: 6,
    },

    libraryTextContainer: {
        flex: 1,

        marginLeft: 12,
        marginRight: 5,
    },

    libraryTitle: {
        color: COLORS.text,

        fontSize: 14,
        fontWeight: '700',

        marginBottom: 3,
    },

    librarySubtitle: {
        color: COLORS.textSecondary,

        fontSize: 11.5,
    },

    // ========================================================
    // QUICK ACTIONS
    // ========================================================

    sectionTitle: {
        color: COLORS.text,

        fontSize: 17,
        fontWeight: '800',

        marginBottom: 7,
    },

    quickActionsContainer: {
        width: '100%',

        flexDirection: 'row',
        justifyContent: 'space-between',

        marginBottom: 8,
    },

    quickActionCard: {
        width: '23.6%',

        paddingHorizontal: 2,
        paddingVertical: 4,

        alignItems: 'center',
        justifyContent: 'flex-start',

        borderRadius: 12,

        backgroundColor: COLORS.card,

        borderWidth: 1,
        borderColor: COLORS.border,
    },

    quickActionIcon: {
        width: 28,
        height: 28,

        borderRadius: 8,

        alignItems: 'center',
        justifyContent: 'center',

        borderWidth: 1,

        marginBottom: 3,
    },

    quickActionTitle: {
        color: COLORS.text,

        fontSize: 8.5,
        fontWeight: '600',

        textAlign: 'center',

        width: '100%',
    },

    quickActionSubtitle: {
        color: COLORS.textSecondary,

        fontSize: 7.5,

        textAlign: 'center',

        marginTop: 1,
    },

    // ========================================================
    // SHARE
    // ========================================================

    shareTitle: {
        color: COLORS.text,

        fontSize: 17,
        fontWeight: '800',

        marginBottom: 3,
    },

    shareContainer: {
        flexDirection: 'row',

        justifyContent: 'space-between',

        paddingHorizontal: 4,

        marginBottom: 8,
    },

    shareOption: {
        alignItems: 'center',

        width: 58,
    },

    shareIconCircle: {
        width: 40,
        height: 40,

        borderRadius: 20,

        alignItems: 'center',
        justifyContent: 'center',

        backgroundColor: COLORS.card,

        borderWidth: 1,
        borderColor: COLORS.border,

        marginBottom: 3,
    },

    shareLabel: {
        color: COLORS.textSecondary,

        fontSize: 9.5,

        textAlign: 'center',
    },

    // ========================================================
    // BOTTOM BUTTONS
    // ========================================================

    bottomButtons: {
        gap: 5,
    },

    homeButton: {
        borderRadius: 14,

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',

        backgroundColor: COLORS.primary,

        shadowColor: COLORS.primary,

        shadowOffset: {
            width: 0,
            height: 4,
        },

        shadowOpacity: 0.18,
        shadowRadius: 8,

        elevation: 5,
    },

    homeButtonText: {
        color: '#00110F',

        fontSize: 15,
        fontWeight: '800',

        marginLeft: 9,
    },

    viewVideosButton: {
        borderRadius: 14,

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',

        backgroundColor: 'transparent',

        borderWidth: 1.2,
        borderColor: COLORS.primary,
    },

    viewVideosText: {
        color: COLORS.primary,

        fontSize: 14,
        fontWeight: '700',

        marginLeft: 9,
    },
});

export default VideoSavedScreen;