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
    Share,
    Alert,
    useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather as Icon, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

/* ============================================================
   THEME
============================================================ */

const COLORS = {
    background: '#020B14',
    backgroundSecondary: '#061522',

    card: '#071725',
    cardSecondary: '#081A29',

    border: '#12314A',
    borderLight: '#17405C',

    white: '#FFFFFF',
    textSecondary: '#A7B6C8',
    textMuted: '#8192A7',

    primary: '#00E5D0',
    primaryBright: '#00FFC2',

    blue: '#00A8FF',
    purple: '#A99BFF',

    darkProgress: '#102A43',
};

/* ============================================================
   MOCK VIDEO DATA
============================================================ */

const videoData = {
    title: 'Switzerland Travel Story',

    description:
        'A breathtaking journey through the beautiful landscapes of Switzerland.',

    thumbnail: require('../assets/switzerland_story.png'),

    duration: '60 sec',
    aspectRatio: '9:16',
    style: 'Cinematic',
    resolution: '1080p',
    createdOn: 'May 12, 2025',
};

/*
 * Replace this later with the actual generated video URL
 * returned from your backend.
 */
const VIDEO_URL = '';

/* ============================================================
   COMPONENT
============================================================ */

const VideoCompleteScreen = () => {
    const router = useRouter();
    const { width, height } = useWindowDimensions();

    /*
     * Base design is optimized for approximately
     * 844pt height devices.
     *
     * Smaller devices automatically scale down.
     */
    const scale = Math.min(1, height / 844);

    const successScale = useRef(new Animated.Value(0.7)).current;
    const successOpacity = useRef(new Animated.Value(0)).current;
    const contentOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.parallel([
                Animated.spring(successScale, {
                    toValue: 1,
                    friction: 7,
                    tension: 55,
                    useNativeDriver: true,
                }),

                Animated.timing(successOpacity, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
            ]),

            Animated.timing(contentOpacity, {
                toValue: 1,
                duration: 350,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    /* =========================================================
       ACTIONS
    ========================================================= */

    const handlePlayVideo = () => {
        if (!VIDEO_URL) {
            Alert.alert(
                'Video Preview',
                'The generated video URL will be connected here after video generation is integrated.'
            );
            return;
        }

        // Connect your video player here.
    };

    const handleDownload = () => {
        if (!VIDEO_URL) {
            Alert.alert(
                'Download Video',
                'The generated video URL will be connected here after video generation is integrated.'
            );
            return;
        }

        // Connect your actual download implementation here.
    };

    const handleShare = async () => {
        try {
            if (!VIDEO_URL) {
                Alert.alert(
                    'Share Video',
                    'The generated video URL will be connected here after video generation is integrated.'
                );
                return;
            }

            await Share.share({
                message: `Check out my video: ${videoData.title}`,
                url: VIDEO_URL,
            });
        } catch (error) {
            console.log('Share error:', error);
        }
    };

    const handleSocialShare = async (platform: string) => {
        try {
            if (!VIDEO_URL) {
                Alert.alert(
                    `${platform} Share`,
                    'The generated video URL will be connected here after video generation is integrated.'
                );
                return;
            }

            await Share.share({
                message: `Check out my video: ${videoData.title}`,
                url: VIDEO_URL,
            });
        } catch (error) {
            console.log(`${platform} share error:`, error);
        }
    };

    const handleCreateAnother = () => {
        /*
         * Change this route only if your actual create screen
         * uses another Expo Router path.
         */
        router.push('/create-video');
    };

    /* =========================================================
       DYNAMIC SIZES
    ========================================================= */

    const sizes = {
        headerHeight: 52 * scale,

        backButton: 38 * scale,
        backIcon: 24 * scale,

        creditsHeight: 40 * scale,
        creditsMinWidth: 142 * scale,
        coin: 18 * scale,
        creditsText: 15 * scale,

        successHeight: 92 * scale,
        successCircle: 58 * scale,
        successCheck: 26 * scale,
        waveWidth: Math.min(width * 1.15, 650),
        waveHeight: 100 * scale,

        title: 25 * scale,
        subtitle: 13.5 * scale,

        videoHeight: 215 * scale,
        playButton: 58 * scale,
        playIcon: 27 * scale,

        videoTitle: 17 * scale,
        metadata: 11.5 * scale,
        metadataIcon: 14 * scale,

        detailsHeight: 86 * scale,
        detailIcon: 29 * scale,
        detailIconSize: 16 * scale,
        detailLabel: 9.5 * scale,
        detailValue: 11.5 * scale,

        actionHeight: 48 * scale,
        actionText: 15 * scale,
        actionIcon: 19 * scale,

        socialCircle: 43 * scale,
        socialIcon: 21 * scale,
        socialLabel: 9.5 * scale,

        createHeight: 52 * scale,
        createIcon: 21 * scale,
        createText: 14 * scale,
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar
                barStyle="light-content"
                backgroundColor={COLORS.background}
            />

            <LinearGradient
                colors={[
                    COLORS.background,
                    '#03101B',
                    COLORS.background,
                ]}
                locations={[0, 0.5, 1]}
                style={styles.container}
            >
                {/* =====================================================
                    HEADER
                ====================================================== */}

                <View
                    style={[
                        styles.header,
                        {
                            height: sizes.headerHeight,
                            paddingHorizontal: 22 * scale,
                        },
                    ]}
                >
                    <View style={{ flex: 1 }} />

                    <TouchableOpacity
                        style={[
                            styles.creditsButton,
                            {
                                height: sizes.creditsHeight,
                                minWidth: sizes.creditsMinWidth,
                                borderRadius: sizes.creditsHeight / 2,
                            },
                        ]}
                        activeOpacity={0.8}
                    >
                        <Image
                            source={require('../assets/coin.png')}
                            style={{
                                width: sizes.coin,
                                height: sizes.coin,
                            }}
                        />

                        <Text
                            style={[
                                styles.creditsText,
                                {
                                    fontSize: sizes.creditsText,
                                },
                            ]}
                        >
                            12,230
                        </Text>

                        <Icon
                            name="plus"
                            size={16 * scale}
                            color={COLORS.primaryBright}
                        />
                    </TouchableOpacity>
                </View>

                {/* =====================================================
                    MAIN CONTENT
                    NO SCROLLVIEW
                ====================================================== */}

                <View
                    style={[
                        styles.content,
                        {
                            paddingHorizontal: 20 * scale,
                        },
                    ]}
                >
                    {/* =================================================
                        SUCCESS AREA
                    ================================================== */}

                    <Animated.View
                        style={[
                            styles.successArea,
                            {
                                height: sizes.successHeight,
                                opacity: successOpacity,
                                transform: [
                                    {
                                        scale: successScale,
                                    },
                                ],
                            },
                        ]}
                    >
                        <Image
                            source={require('../assets/progress-wave-bg.png')}
                            style={{
                                width: sizes.waveWidth,
                                height: sizes.waveHeight,
                            }}
                            resizeMode="contain"
                        />

                        <View
                            style={[
                                styles.successCircle,
                                {
                                    width: sizes.successCircle,
                                    height: sizes.successCircle,
                                    borderRadius:
                                        sizes.successCircle / 2,
                                },
                            ]}
                        >
                            <Icon
                                name="check"
                                size={sizes.successCheck}
                                color={COLORS.primaryBright}
                            />
                        </View>
                    </Animated.View>

                    {/* =================================================
                        TITLE
                    ================================================== */}

                    <Animated.View
                        style={{
                            opacity: contentOpacity,
                        }}
                    >
                        <Text
                            style={[
                                styles.mainTitle,
                                {
                                    fontSize: sizes.title,
                                    marginTop: 1 * scale,
                                },
                            ]}
                        >
                            Your Video is Ready!
                        </Text>

                        <Text
                            style={[
                                styles.mainSubtitle,
                                {
                                    fontSize: sizes.subtitle,
                                    lineHeight: 19 * scale,
                                    marginTop: 4 * scale,
                                    marginBottom: 12 * scale,
                                },
                            ]}
                        >
                            We've successfully created your video.
                            {'\n'}
                            Preview it, share it, or create another one.
                        </Text>

                        {/* =============================================
                            VIDEO CARD
                        ============================================== */}

                        <View
                            style={[
                                styles.videoCard,
                                {
                                    height: sizes.videoHeight,
                                    borderRadius: 17 * scale,
                                },
                            ]}
                        >
                            <TouchableOpacity
                                style={styles.videoTouchable}
                                activeOpacity={0.9}
                                onPress={handlePlayVideo}
                            >
                                <Image
                                    source={videoData.thumbnail}
                                    style={styles.videoThumbnail}
                                    resizeMode="cover"
                                />

                                {/* Bottom gradient */}
                                <LinearGradient
                                    colors={[
                                        'transparent',
                                        'rgba(0,0,0,0.15)',
                                        'rgba(0,0,0,0.90)',
                                    ]}
                                    locations={[0, 0.45, 1]}
                                    style={styles.videoGradient}
                                />

                                {/* Play button */}
                                <View
                                    style={[
                                        styles.playButton,
                                        {
                                            width: sizes.playButton,
                                            height: sizes.playButton,
                                            borderRadius:
                                                sizes.playButton / 2,
                                            marginLeft:
                                                -sizes.playButton / 2,
                                            marginTop:
                                                -sizes.playButton / 2,
                                        },
                                    ]}
                                >
                                    <Icon
                                        name="play"
                                        size={sizes.playIcon}
                                        color={COLORS.white}
                                        style={{
                                            marginLeft: 3 * scale,
                                        }}
                                    />
                                </View>

                                {/* Video information */}
                                <View
                                    style={[
                                        styles.videoInfo,
                                        {
                                            left: 14 * scale,
                                            right: 14 * scale,
                                            bottom: 10 * scale,
                                        },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.videoTitle,
                                            {
                                                fontSize:
                                                    sizes.videoTitle,
                                            },
                                        ]}
                                        numberOfLines={1}
                                    >
                                        {videoData.title}
                                    </Text>

                                    <View
                                        style={[
                                            styles.videoMetaRow,
                                            {
                                                gap: 9 * scale,
                                            },
                                        ]}
                                    >
                                        {/* Duration */}
                                        <View
                                            style={
                                                styles.videoMetaItem
                                            }
                                        >
                                            <Icon
                                                name="clock"
                                                size={
                                                    sizes.metadataIcon
                                                }
                                                color={
                                                    COLORS.textSecondary
                                                }
                                            />

                                            <Text
                                                style={[
                                                    styles.videoMetaText,
                                                    {
                                                        fontSize:
                                                            sizes.metadata,
                                                        marginLeft:
                                                            4 * scale,
                                                    },
                                                ]}
                                            >
                                                {videoData.duration}
                                            </Text>
                                        </View>

                                        {/* Aspect ratio */}
                                        <View
                                            style={
                                                styles.videoMetaItem
                                            }
                                        >
                                            <Icon
                                                name="smartphone"
                                                size={
                                                    sizes.metadataIcon
                                                }
                                                color={
                                                    COLORS.textSecondary
                                                }
                                            />

                                            <Text
                                                style={[
                                                    styles.videoMetaText,
                                                    {
                                                        fontSize:
                                                            sizes.metadata,
                                                        marginLeft:
                                                            4 * scale,
                                                    },
                                                ]}
                                            >
                                                {videoData.aspectRatio}
                                            </Text>
                                        </View>

                                        {/* Style */}
                                        <View
                                            style={
                                                styles.videoMetaItem
                                            }
                                        >
                                            <Icon
                                                name="film"
                                                size={
                                                    sizes.metadataIcon
                                                }
                                                color={
                                                    COLORS.textSecondary
                                                }
                                            />

                                            <Text
                                                style={[
                                                    styles.videoMetaText,
                                                    {
                                                        fontSize:
                                                            sizes.metadata,
                                                        marginLeft:
                                                            4 * scale,
                                                    },
                                                ]}
                                            >
                                                {videoData.style}
                                            </Text>
                                        </View>

                                        {/* Resolution */}
                                        <View
                                            style={[
                                                styles.resolutionBadge,
                                                {
                                                    borderRadius:
                                                        12 * scale,
                                                    paddingHorizontal:
                                                        8 * scale,
                                                    paddingVertical:
                                                        4 * scale,
                                                },
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    styles.resolutionText,
                                                    {
                                                        fontSize:
                                                            sizes.metadata,
                                                    },
                                                ]}
                                            >
                                                {videoData.resolution}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </View>

                        {/* =================================================
                            DETAILS CARD
                        ================================================== */}

                        <View
                            style={[
                                styles.detailsCard,
                                {
                                    height: sizes.detailsHeight,
                                    borderRadius: 15 * scale,
                                    marginTop: 10 * scale,
                                    marginBottom: 10 * scale,
                                },
                            ]}
                        >
                            {/* Resolution */}
                            <View style={styles.detailItem}>
                                <View
                                    style={[
                                        styles.detailIconContainer,
                                        {
                                            width:
                                                sizes.detailIcon,
                                            height:
                                                sizes.detailIcon,
                                            borderRadius:
                                                sizes.detailIcon /
                                                2,
                                        },
                                    ]}
                                >
                                    <Icon
                                        name="zap"
                                        size={
                                            sizes.detailIconSize
                                        }
                                        color={COLORS.purple}
                                    />
                                </View>

                                <Text
                                    style={[
                                        styles.detailLabel,
                                        {
                                            fontSize:
                                                sizes.detailLabel,
                                        },
                                    ]}
                                >
                                    Resolution
                                </Text>

                                <Text
                                    style={[
                                        styles.detailValue,
                                        {
                                            fontSize:
                                                sizes.detailValue,
                                        },
                                    ]}
                                >
                                    1080p
                                </Text>
                            </View>

                            <View style={styles.detailSeparator} />

                            {/* Duration */}
                            <View style={styles.detailItem}>
                                <View
                                    style={[
                                        styles.detailIconContainer,
                                        {
                                            width:
                                                sizes.detailIcon,
                                            height:
                                                sizes.detailIcon,
                                            borderRadius:
                                                sizes.detailIcon /
                                                2,
                                        },
                                    ]}
                                >
                                    <Icon
                                        name="clock"
                                        size={
                                            sizes.detailIconSize
                                        }
                                        color={COLORS.primary}
                                    />
                                </View>

                                <Text
                                    style={[
                                        styles.detailLabel,
                                        {
                                            fontSize:
                                                sizes.detailLabel,
                                        },
                                    ]}
                                >
                                    Duration
                                </Text>

                                <Text
                                    style={[
                                        styles.detailValue,
                                        {
                                            fontSize:
                                                sizes.detailValue,
                                        },
                                    ]}
                                >
                                    60 sec
                                </Text>
                            </View>

                            <View style={styles.detailSeparator} />

                            {/* Format */}
                            <View style={styles.detailItem}>
                                <View
                                    style={[
                                        styles.detailIconContainer,
                                        {
                                            width:
                                                sizes.detailIcon,
                                            height:
                                                sizes.detailIcon,
                                            borderRadius:
                                                sizes.detailIcon /
                                                2,
                                        },
                                    ]}
                                >
                                    <Icon
                                        name="film"
                                        size={
                                            sizes.detailIconSize
                                        }
                                        color={COLORS.blue}
                                    />
                                </View>

                                <Text
                                    style={[
                                        styles.detailLabel,
                                        {
                                            fontSize:
                                                sizes.detailLabel,
                                        },
                                    ]}
                                >
                                    Format
                                </Text>

                                <Text
                                    style={[
                                        styles.detailValue,
                                        {
                                            fontSize:
                                                sizes.detailValue,
                                        },
                                    ]}
                                >
                                    9:16
                                </Text>
                            </View>

                            <View style={styles.detailSeparator} />

                            {/* Created */}
                            <View style={styles.detailItem}>
                                <View
                                    style={[
                                        styles.detailIconContainer,
                                        {
                                            width:
                                                sizes.detailIcon,
                                            height:
                                                sizes.detailIcon,
                                            borderRadius:
                                                sizes.detailIcon /
                                                2,
                                        },
                                    ]}
                                >
                                    <Icon
                                        name="calendar"
                                        size={
                                            sizes.detailIconSize
                                        }
                                        color={COLORS.purple}
                                    />
                                </View>

                                <Text
                                    style={[
                                        styles.detailLabel,
                                        {
                                            fontSize:
                                                sizes.detailLabel,
                                        },
                                    ]}
                                >
                                    Created On
                                </Text>

                                <Text
                                    style={[
                                        styles.detailValue,
                                        {
                                            fontSize:
                                                sizes.detailValue,
                                        },
                                    ]}
                                    numberOfLines={1}
                                >
                                    May 12, 2025
                                </Text>
                            </View>
                        </View>

                        {/* =================================================
                            DOWNLOAD
                        ================================================== */}

                        <TouchableOpacity
                            style={[
                                styles.downloadButton,
                                {
                                    height: sizes.actionHeight,
                                    borderRadius:
                                        15 * scale,
                                    marginBottom:
                                        7 * scale,
                                },
                            ]}
                            activeOpacity={0.85}
                            onPress={() => router.push('/save-video')}
                        >
                            <Icon
                                name="download"
                                size={sizes.actionIcon}
                                color="#00120F"
                            />

                            <Text
                                style={[
                                    styles.downloadButtonText,
                                    {
                                        fontSize:
                                            sizes.actionText,
                                    },
                                ]}
                            >
                                Download Video
                            </Text>
                        </TouchableOpacity>

                        {/* =================================================
                            SHARE
                        ================================================== */}

                        <TouchableOpacity
                            style={[
                                styles.shareButton,
                                {
                                    height: sizes.actionHeight,
                                    borderRadius:
                                        15 * scale,
                                    marginBottom:
                                        10 * scale,
                                },
                            ]}
                            activeOpacity={0.85}
                            onPress={handleShare}
                        >
                            <Icon
                                name="share-2"
                                size={sizes.actionIcon}
                                color={COLORS.primaryBright}
                            />

                            <Text
                                style={[
                                    styles.shareButtonText,
                                    {
                                        fontSize:
                                            sizes.actionText,
                                    },
                                ]}
                            >
                                Share Video
                            </Text>
                        </TouchableOpacity>

                        {/* =================================================
                            SOCIAL SHARING
                        ================================================== */}

                        <View
                            style={[
                                styles.socialContainer,
                                {
                                    marginBottom:
                                        10 * scale,
                                },
                            ]}
                        >
                            {/* Instagram */}
                            <TouchableOpacity
                                style={styles.socialItem}
                                onPress={() =>
                                    handleSocialShare(
                                        'Instagram'
                                    )
                                }
                                activeOpacity={0.75}
                            >
                                <View
                                    style={[
                                        styles.socialCircle,
                                        {
                                            width:
                                                sizes.socialCircle,
                                            height:
                                                sizes.socialCircle,
                                            borderRadius:
                                                sizes.socialCircle /
                                                2,
                                        },
                                    ]}
                                >
                                    <FontAwesome5
                                        name="instagram"
                                        size={
                                            sizes.socialIcon
                                        }
                                        color={COLORS.white}
                                    />
                                </View>

                                <Text
                                    style={[
                                        styles.socialLabel,
                                        {
                                            fontSize:
                                                sizes.socialLabel,
                                        },
                                    ]}
                                >
                                    Instagram
                                </Text>
                            </TouchableOpacity>

                            {/* TikTok */}
                            <TouchableOpacity
                                style={styles.socialItem}
                                onPress={() =>
                                    handleSocialShare(
                                        'TikTok'
                                    )
                                }
                                activeOpacity={0.75}
                            >
                                <View
                                    style={[
                                        styles.socialCircle,
                                        {
                                            width:
                                                sizes.socialCircle,
                                            height:
                                                sizes.socialCircle,
                                            borderRadius:
                                                sizes.socialCircle /
                                                2,
                                        },
                                    ]}
                                >
                                    <FontAwesome5
                                        name="tiktok"
                                        size={
                                            sizes.socialIcon
                                        }
                                        color={COLORS.white}
                                    />
                                </View>

                                <Text
                                    style={[
                                        styles.socialLabel,
                                        {
                                            fontSize:
                                                sizes.socialLabel,
                                        },
                                    ]}
                                >
                                    TikTok
                                </Text>
                            </TouchableOpacity>

                            {/* YouTube */}
                            <TouchableOpacity
                                style={styles.socialItem}
                                onPress={() =>
                                    handleSocialShare(
                                        'YouTube'
                                    )
                                }
                                activeOpacity={0.75}
                            >
                                <View
                                    style={[
                                        styles.socialCircle,
                                        {
                                            width:
                                                sizes.socialCircle,
                                            height:
                                                sizes.socialCircle,
                                            borderRadius:
                                                sizes.socialCircle /
                                                2,
                                        },
                                    ]}
                                >
                                    <FontAwesome5
                                        name="youtube"
                                        size={
                                            sizes.socialIcon
                                        }
                                        color={COLORS.white}
                                    />
                                </View>

                                <Text
                                    style={[
                                        styles.socialLabel,
                                        {
                                            fontSize:
                                                sizes.socialLabel,
                                        },
                                    ]}
                                >
                                    YouTube
                                </Text>
                            </TouchableOpacity>

                            {/* WhatsApp */}
                            <TouchableOpacity
                                style={styles.socialItem}
                                onPress={() =>
                                    handleSocialShare(
                                        'WhatsApp'
                                    )
                                }
                                activeOpacity={0.75}
                            >
                                <View
                                    style={[
                                        styles.socialCircle,
                                        {
                                            width:
                                                sizes.socialCircle,
                                            height:
                                                sizes.socialCircle,
                                            borderRadius:
                                                sizes.socialCircle /
                                                2,
                                        },
                                    ]}
                                >
                                    <FontAwesome5
                                        name="whatsapp"
                                        size={
                                            sizes.socialIcon
                                        }
                                        color={COLORS.white}
                                    />
                                </View>

                                <Text
                                    style={[
                                        styles.socialLabel,
                                        {
                                            fontSize:
                                                sizes.socialLabel,
                                        },
                                    ]}
                                >
                                    WhatsApp
                                </Text>
                            </TouchableOpacity>

                            {/* More */}
                            <TouchableOpacity
                                style={styles.socialItem}
                                onPress={handleShare}
                                activeOpacity={0.75}
                            >
                                <View
                                    style={[
                                        styles.socialCircle,
                                        {
                                            width:
                                                sizes.socialCircle,
                                            height:
                                                sizes.socialCircle,
                                            borderRadius:
                                                sizes.socialCircle /
                                                2,
                                        },
                                    ]}
                                >
                                    <Icon
                                        name="more-horizontal"
                                        size={
                                            sizes.socialIcon
                                        }
                                        color={
                                            COLORS.textSecondary
                                        }
                                    />
                                </View>

                                <Text
                                    style={[
                                        styles.socialLabel,
                                        {
                                            fontSize:
                                                sizes.socialLabel,
                                        },
                                    ]}
                                >
                                    More
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* =================================================
                            CREATE ANOTHER
                        ================================================== */}

                        <TouchableOpacity
                            style={[
                                styles.createAnotherCard,
                                {
                                    height:
                                        sizes.createHeight,
                                    borderRadius:
                                        15 * scale,
                                },
                            ]}
                            activeOpacity={0.8}
                            onPress={handleCreateAnother}
                        >
                            <View
                                style={
                                    styles.createAnotherLeft
                                }
                            >
                                <Icon
                                    name="refresh-cw"
                                    size={
                                        sizes.createIcon
                                    }
                                    color={
                                        COLORS.textSecondary
                                    }
                                />

                                <Text
                                    style={[
                                        styles.createAnotherText,
                                        {
                                            fontSize:
                                                sizes.createText,
                                            marginLeft:
                                                10 * scale,
                                        },
                                    ]}
                                >
                                    Create Another Video
                                </Text>
                            </View>

                            <Icon
                                name="chevron-right"
                                size={22 * scale}
                                color={
                                    COLORS.textSecondary
                                }
                            />
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </LinearGradient>
        </SafeAreaView>
    );
};

/* ================================================================
   STATIC STYLES
================================================================ */

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },

    container: {
        flex: 1,
    },

    /* Header */

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    backButton: {
        justifyContent: 'center',
        alignItems: 'center',
    },

    creditsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.3,
        borderColor: COLORS.primaryBright,
        backgroundColor: 'rgba(0,229,208,0.035)',
        paddingHorizontal: 12,
    },

    creditsText: {
        color: COLORS.white,
        fontWeight: '700',
        marginHorizontal: 6,
    },

    /* Main */

    content: {
        flex: 1,
        justifyContent: 'flex-start',
    },

    /* Success */

    successArea: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },

    successCircle: {
        position: 'absolute',
        borderWidth: 2.5,
        borderColor: COLORS.primaryBright,
        backgroundColor: 'rgba(2,11,20,0.88)',
        justifyContent: 'center',
        alignItems: 'center',

        shadowColor: COLORS.primaryBright,
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.55,
        shadowRadius: 14,
        elevation: 10,
    },

    /* Titles */

    mainTitle: {
        color: COLORS.white,
        fontWeight: '800',
        textAlign: 'center',
    },

    mainSubtitle: {
        color: COLORS.textSecondary,
        textAlign: 'center',
    },

    /* Video */

    videoCard: {
        width: '100%',
        overflow: 'hidden',
        backgroundColor: COLORS.card,
        borderWidth: 1.2,
        borderColor: COLORS.border,
    },

    videoTouchable: {
        flex: 1,
        position: 'relative',
    },

    videoThumbnail: {
        ...StyleSheet.absoluteFillObject,
        width: undefined,
        height: undefined,
    },

    videoGradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '55%',
    },

    playButton: {
        position: 'absolute',
        left: '50%',
        top: '50%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(2,11,20,0.80)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.45)',
    },

    videoInfo: {
        position: 'absolute',
    },

    videoTitle: {
        color: COLORS.white,
        fontWeight: '800',
        marginBottom: 6,
    },

    videoMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    videoMetaItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    videoMetaText: {
        color: COLORS.textSecondary,
        fontWeight: '500',
    },

    resolutionBadge: {
        marginLeft: 'auto',
        borderWidth: 1.2,
        borderColor: COLORS.primaryBright,
        backgroundColor: 'rgba(0,229,208,0.08)',
    },

    resolutionText: {
        color: COLORS.primaryBright,
        fontWeight: '700',
    },

    /* Details */

    detailsCard: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(7,23,37,0.82)',
        borderWidth: 1.2,
        borderColor: COLORS.border,
    },

    detailItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 0,
    },

    detailIconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 3,
    },

    detailLabel: {
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: 2,
    },

    detailValue: {
        color: COLORS.white,
        fontWeight: '700',
        textAlign: 'center',
    },

    detailSeparator: {
        width: 1,
        height: '65%',
        backgroundColor: COLORS.borderLight,
    },

    /* Buttons */

    downloadButton: {
        width: '100%',
        backgroundColor: COLORS.primaryBright,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',

        shadowColor: COLORS.primaryBright,
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.16,
        shadowRadius: 7,
        elevation: 5,
    },

    downloadButtonText: {
        color: '#00120F',
        fontWeight: '800',
        marginLeft: 9,
    },

    shareButton: {
        width: '100%',
        borderWidth: 1.3,
        borderColor: COLORS.primaryBright,
        backgroundColor: 'transparent',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },

    shareButtonText: {
        color: COLORS.primaryBright,
        fontWeight: '800',
        marginLeft: 9,
    },

    /* Social */

    socialContainer: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
    },

    socialItem: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '19%',
    },

    socialCircle: {
        backgroundColor: '#071522',
        borderWidth: 1,
        borderColor: COLORS.border,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 3,
    },

    socialLabel: {
        color: COLORS.textSecondary,
        textAlign: 'center',
    },

    /* Create Another */

    createAnotherCard: {
        width: '100%',
        borderWidth: 1.2,
        borderColor: COLORS.border,
        backgroundColor: 'rgba(7,23,37,0.82)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
    },

    createAnotherLeft: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },

    createAnotherText: {
        color: COLORS.white,
        fontWeight: '700',
    },
});

export default VideoCompleteScreen;