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
    Alert,
    useWindowDimensions,
} from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather as Icon, FontAwesome5 } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEvent } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import { projectStore } from '../src/services/projectStore';

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
   DYNAMIC VIDEO DATA
============================================================ */

const API_BASE_URL =
    'http://192.168.31.189:4000';

type CompleteVideoParams = {
    videoUrl?: string;
    story?: string;
    title?: string;
    duration?: string;
    ratio?: string;
    style?: string;
    language?: string;
    voice?: string;
    resolution?: string;
    createdAt?: string;
    projectType?: string;
};

const resolveVideoUrl = (
    value?: string,
): string | undefined => {
    if (!value?.trim()) {
        return undefined;
    }

    const normalized =
        value.trim();

    if (
        normalized.startsWith(
            'http://',
        ) ||
        normalized.startsWith(
            'https://',
        )
    ) {
        return normalized;
    }

    return `${API_BASE_URL}${
        normalized.startsWith('/')
            ? ''
            : '/'
    }${normalized}`;
};

const formatStyle = (
    value?: string,
): string => {
    switch (
        value?.trim()
    ) {
        case '3d':
            return '3D Animation';

        case 'cinematic':
            return 'Cinematic';

        case 'realistic':
            return 'Realistic';

        case 'anime':
            return 'Anime';

        case 'cartoon':
            return 'Cartoon';

        default:
            return (
                value?.trim() ||
                '3D Animation'
            );
    }
};

const formatVoice = (
    value?: string,
): string => {
    switch (
        value?.trim()
    ) {
        case 'female':
            return 'Female Voice';

        case 'male':
            return 'Male Voice';

        case 'none':
            return 'No Voice';

        case 'auto':
            return 'AI Auto';

        default:
            return (
                value?.trim() ||
                'AI Auto'
            );
    }
};

const getTodayLabel =
    (): string =>
        new Intl.DateTimeFormat(
            'en-US',
            {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            },
        ).format(
            new Date(),
        );

/* ============================================================
   COMPONENT
============================================================ */

const downloadVideoToLocalFile = async (
    remoteUrl: string,
): Promise<string> => {
    const fileName =
        `shivora-video-${Date.now()}.mp4`;

    const destination =
        new File(
            Paths.cache,
            fileName,
        );

    const downloaded =
        await File.downloadFileAsync(
            remoteUrl,
            destination,
            {
                idempotent: true,
            },
        );

    return downloaded.uri;
};

const VideoCompleteScreen = () => {
    const router = useRouter();

    const params =
        useLocalSearchParams<CompleteVideoParams>();

    const { width, height } =
        useWindowDimensions();

    const videoUrl =
        resolveVideoUrl(
            params.videoUrl,
        );

    const displayTitle =
        params.title?.trim() ||
        'Your Video';

    const displayDescription =
        params.story?.trim() ||
        'Your generated video is ready to watch and share.';

    const displayDuration =
        params.duration?.trim() ||
        '30';

    const displayRatio =
        params.ratio?.trim() ||
        '9:16';

    const displayStyle =
        formatStyle(
            params.style,
        );

    const displayLanguage =
        params.language?.trim() ||
        'English (US)';

    const displayVoice =
        formatVoice(
            params.voice,
        );

    const displayResolution =
        params.resolution?.trim() ||
        '480p';

    const displayCreatedOn =
        params.createdAt?.trim() ||
        getTodayLabel();

    const player =
        useVideoPlayer(
            videoUrl ?? null,
            (videoPlayer) => {
                videoPlayer.loop = false;
            },
        );

    const {
        isPlaying,
    } = useEvent(
        player,
        'playingChange',
        {
            isPlaying:
                player.playing,
        },
    );

    const [isSavingProject, setIsSavingProject] =
        React.useState(false);

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

    const handlePlayVideo =
        () => {
            if (!videoUrl) {
                Alert.alert(
                    'Video Preview',
                    'The generated video URL is unavailable.',
                );

                return;
            }

            try {
                if (player.playing) {
                    player.pause();
                } else {
                    player.play();
                }
            } catch (error) {
                console.error(
                    '[VIDEO READY] Play error:',
                    error,
                );

                Alert.alert(
                    'Video Preview',
                    'Unable to play the generated video.',
                );
            }
        };

    const handleDownload =
        async () => {
            if (
                isSavingProject ||
                !videoUrl
            ) {
                if (!videoUrl) {
                    Alert.alert(
                        'Download Video',
                        'The generated video URL is unavailable.',
                    );
                }

                return;
            }

            setIsSavingProject(true);

            try {
                console.log(
                    '[VIDEO READY] Downloading video to device...',
                );

                const localUri =
                    await downloadVideoToLocalFile(
                        videoUrl,
                    );

                console.log(
                    '[VIDEO READY] Local video:',
                    localUri,
                );

                /*
                 * Save the actual MP4 to the user's
                 * Photos / Camera Roll.
                 */
                const permission =
                    await MediaLibrary.requestPermissionsAsync(
                        true,
                    );

                if (!permission.granted) {
                    Alert.alert(
                        'Permission Required',
                        'Please allow Shivora to access your Photos so the video can be saved to your Camera Roll.',
                    );

                    return;
                }

                await MediaLibrary.saveToLibraryAsync(
                    localUri,
                );

                console.log(
                    '[VIDEO READY] Video saved to Camera Roll.',
                );

                /*
                 * Also persist the project in Shivora.
                 */
                await projectStore.saveProject({
                    id:
                        `video-${Date.now()}`,
                    title:
                        displayTitle,
                    type:
                        params.projectType ===
                        'Image to Video'
                            ? 'Image to Video'
                            : 'Text to Video',
                    duration:
                        displayDuration
                            ? `${displayDuration} sec`
                            : '0 sec',
                    date:
                        new Date().toISOString(),
                    status:
                        'Completed',
                    favorite:
                        false,
                    videoUrl,
                    ratio:
                        displayRatio,
                    style:
                        params.style?.trim() ||
                        '3d',
                    language:
                        displayLanguage,
                    voice:
                        params.voice?.trim() ||
                        'auto',
                    resolution:
                        displayResolution,
                });

                console.log(
                    '[VIDEO READY] Project saved to My Projects.',
                );

                router.push({
                    pathname:
                        '/save-video',
                    params: {
                        videoUrl,
                        localUri,
                        title:
                            displayTitle,
                    },
                } as any);
            } catch (error) {
                console.error(
                    '[VIDEO READY] Download/save error:',
                    error,
                );

                Alert.alert(
                    'Download Failed',
                    error instanceof Error
                        ? error.message
                        : 'Unable to save the video. Please try again.',
                );
            } finally {
                setIsSavingProject(
                    false,
                );
            }
        };


    const handleShare =
        async () => {
            if (!videoUrl) {
                Alert.alert(
                    'Share Video',
                    'The generated video URL is unavailable.',
                );

                return;
            }

            try {
                const isAvailable =
                    await Sharing.isAvailableAsync();

                if (!isAvailable) {
                    Alert.alert(
                        'Share Video',
                        'Video sharing is not available on this device.',
                    );

                    return;
                }

                const localUri =
                    await downloadVideoToLocalFile(
                        videoUrl,
                    );

                await Sharing.shareAsync(
                    localUri,
                    {
                        mimeType:
                            'video/mp4',
                        dialogTitle:
                            `Share ${displayTitle}`,
                        UTI:
                            'public.movie',
                    },
                );
            } catch (error) {
                console.error(
                    '[VIDEO READY] Share error:',
                    error,
                );

                Alert.alert(
                    'Share Video',
                    'Unable to prepare the video for sharing.',
                );
            }
        };


    const handleSocialShare =
        async (
            platform: string,
        ) => {
            if (!videoUrl) {
                Alert.alert(
                    `${platform} Share`,
                    'The generated video URL is unavailable.',
                );

                return;
            }

            try {
                const isAvailable =
                    await Sharing.isAvailableAsync();

                if (!isAvailable) {
                    Alert.alert(
                        `${platform} Share`,
                        'Video sharing is not available on this device.',
                    );

                    return;
                }

                const localUri =
                    await downloadVideoToLocalFile(
                        videoUrl,
                    );

                await Sharing.shareAsync(
                    localUri,
                    {
                        mimeType:
                            'video/mp4',
                        dialogTitle:
                            `Share ${displayTitle}`,
                        UTI:
                            'public.movie',
                    },
                );
            } catch (error) {
                console.error(
                    `[VIDEO READY] ${platform} share error:`,
                    error,
                );

                Alert.alert(
                    `${platform} Share`,
                    'Unable to prepare the video for sharing.',
                );
            }
        };


    const handleCreateAnother =
        () => {
            router.replace(
                '/home',
            );
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
        actionText: 15.5 * scale,
        actionIcon: 20 * scale,

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
                        onPress={() => router.push('/coins')}
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
                                {videoUrl ? (
                                    <VideoView
                                        player={player}
                                        style={
                                            styles.videoThumbnail
                                        }
                                        contentFit="cover"
                                        nativeControls={false}
                                    />
                                ) : (
                                    <Image
                                        source={require('../assets/text-video-hero.png')}
                                        style={
                                            styles.videoThumbnail
                                        }
                                        resizeMode="cover"
                                    />
                                )}

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
                                        name={
                                            isPlaying
                                                ? 'pause'
                                                : 'play'
                                        }
                                        size={sizes.playIcon}
                                        color={COLORS.white}
                                        style={{
                                            marginLeft:
                                                isPlaying
                                                    ? 0
                                                    : 3 * scale,
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
                                        {displayTitle}
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
                                                {displayDuration} sec
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
                                                {displayRatio}
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
                                                {displayStyle}
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
                                                {displayResolution}
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
                                    borderRadius: 26,
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
                                    {displayResolution}
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
                                    {displayDuration} sec
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
                                    {displayRatio}
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
                                    {displayCreatedOn}
                                </Text>
                            </View>
                        </View>

                        <View
                            style={[
                                styles.languageVoiceCard,
                                {
                                    borderRadius:
                                        15 * scale,
                                    marginBottom:
                                        10 * scale,
                                    paddingHorizontal:
                                        12 * scale,
                                    paddingVertical:
                                        9 * scale,
                                },
                            ]}
                        >
                            <View
                                style={styles.languageVoiceItem}
                            >
                                <Icon
                                    name="globe"
                                    size={15 * scale}
                                    color={COLORS.primary}
                                />

                                <View
                                    style={
                                        styles.languageVoiceCopy
                                    }
                                >
                                    <Text
                                        style={[
                                            styles.languageVoiceLabel,
                                            {
                                                fontSize:
                                                    8.5 * scale,
                                            },
                                        ]}
                                    >
                                        Language
                                    </Text>

                                    <Text
                                        style={[
                                            styles.languageVoiceValue,
                                            {
                                                fontSize:
                                                    10 * scale,
                                            },
                                        ]}
                                        numberOfLines={1}
                                    >
                                        {displayLanguage}
                                    </Text>
                                </View>
                            </View>

                            <View
                                style={styles.languageVoiceItem}
                            >
                                <Icon
                                    name="volume-2"
                                    size={15 * scale}
                                    color={COLORS.blue}
                                />

                                <View
                                    style={
                                        styles.languageVoiceCopy
                                    }
                                >
                                    <Text
                                        style={[
                                            styles.languageVoiceLabel,
                                            {
                                                fontSize:
                                                    8.5 * scale,
                                            },
                                        ]}
                                    >
                                        Voice
                                    </Text>

                                    <Text
                                        style={[
                                            styles.languageVoiceValue,
                                            {
                                                fontSize:
                                                    10 * scale,
                                            },
                                        ]}
                                        numberOfLines={1}
                                    >
                                        {displayVoice}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* =================================================
                            DOWNLOAD
                        ================================================== */}

                        <TouchableOpacity
                            style={[
                                styles.downloadButton,
                                {
                                    height: 52,
                                    borderRadius:
                                        26,
                                    marginBottom:
                                        8 * scale,
                                    overflow: 'hidden',
                                },
                            ]}
                            activeOpacity={0.85}
                            onPress={() => { void handleDownload(); }}
                            disabled={isSavingProject}
                        >
                            <LinearGradient
                                colors={['#00CFFF', '#2C75FF', '#8C2EFF']}
                                start={{ x: 0, y: 0.5 }}
                                end={{ x: 1, y: 0.5 }}
                                style={{
                                    flex: 1,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: 15 * scale,
                                }}
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
                                    {isSavingProject
                                        ? 'Saving to Projects...'
                                        : 'Download Video'}
                                </Text>
                            </LinearGradient>
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
        ...StyleSheet.absoluteFill,
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

    /* Language / Voice */

    languageVoiceCard: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(7,23,37,0.82)',
        borderWidth: 1.2,
        borderColor: COLORS.border,
    },

    languageVoiceItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        minWidth: 0,
        paddingHorizontal: 4,
    },

    languageVoiceCopy: {
        flex: 1,
        minWidth: 0,
        marginLeft: 7,
    },

    languageVoiceLabel: {
        color: COLORS.textSecondary,
        marginBottom: 1,
    },

    languageVoiceValue: {
        color: COLORS.white,
        fontWeight: '700',
    },

    /* Buttons */

    downloadButton: {
        width: '100%',
        height: 52,
        borderRadius: 26,
        overflow: 'hidden',
        backgroundColor: 'transparent',

        shadowColor: COLORS.primary,
        shadowOffset: {
            width: 0,
            height: 7,
        },
        shadowOpacity: 0.18,
        shadowRadius: 12,
        elevation: 7,
    },

    downloadButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        lineHeight: 20,
        fontWeight: '700',
        marginLeft: 8,
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