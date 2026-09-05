import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  StyleSheet,
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  Animated,
  Easing,
  Image,
  useWindowDimensions,
  ScrollView,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { Feather as Icon } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';

const COLORS = {
  background: '#050B12',
  backgroundMid: '#06111B',

  card: '#081522',
  border: '#173651',
  divider: '#14283B',

  primary: '#00E6D0',
  primaryBright: '#00FFC2',

  progressTrack: '#102B43',

  white: '#FFFFFF',
  secondary: '#A5B5C8',
  muted: '#8FA5BC',
  waiting: '#9AAEC2',
};

const PROGRESS_GRADIENT = {
  start: '#00CFFF',
  middle: '#2C75FF',
  end: '#8C2EFF',
};

const API_BASE_URL =
  'http://192.168.31.189:4000';

const ASSETS = {
  coin: require('../assets/coin.png'),
  hero: require('../assets/text-video-hero.png'),
} as const;

type StepStatus =
  | 'Waiting'
  | 'In progress...'
  | 'Completed';

type BackendStage =
  | 'preparing'
  | 'clips'
  | 'joining'
  | 'audio'
  | 'finalizing'
  | 'completed'
  | 'failed';

type VideoJobStatus =
  | 'queued'
  | 'processing'
  | 'completed'
  | 'failed';

type VideoJobResponse = {
  success?: boolean;
  jobId?: string;
  status?: VideoJobStatus;
  stage?: BackendStage;
  progress?: number;
  currentClip?: number;
  totalClips?: number;
  durationSeconds?: number;
  aspectRatio?: string;
  style?: string;
  language?: string;
  voice?: string;
  video?: string;
  model?: string;
  error?: string;
};

type ProcessingStep = {
  key:
    | 'analyzing'
    | 'clips'
    | 'joining'
    | 'audio'
    | 'finalizing';
  title: string;
};

const PROCESSING_STEPS: ProcessingStep[] = [
  {
    key: 'analyzing',
    title: 'Analyzing scenes',
  },
  {
    key: 'clips',
    title: 'Generating video clips',
  },
  {
    key: 'joining',
    title: 'Joining scenes',
  },
  {
    key: 'audio',
    title: 'Creating voiceover',
  },
  {
    key: 'finalizing',
    title: 'Finalizing your video',
  },
];

const AnimatedCircle =
  Animated.createAnimatedComponent(Circle);

const ProcessingScreen = () => {
  const router = useRouter();

  const params = useLocalSearchParams<{
    jobId?: string;
    story?: string;
    title?: string;
    duration?: string;
    ratio?: string;
    style?: string;
    language?: string;
    voice?: string;
    camera?: string;
    appearance?: string;
    analysis?: string;
    config?: string;
    status?: string;
    stage?: string;
    progress?: string;
  }>();

  const {
    width: screenWidth,
    height: screenHeight,
  } = useWindowDimensions();

  const scale = Math.max(
    0.8,
    Math.min(1.05, screenHeight / 820)
  );

  const isSmallScreen =
    screenHeight <= 720;

  const sizes = useMemo(() => {
    return {
      /* Header */

      headerHeight: 48 * scale,

      backButton: 38 * scale,
      backIcon: 24 * scale,

      creditsHeight: 38 * scale,
      creditsWidth: 138 * scale,

      coin: 17 * scale,
      creditsText: 14 * scale,

      /* Title */

      title: 25 * scale,
      titleLineHeight: 30 * scale,

      subtitle: 13.5 * scale,
      subtitleLineHeight: 18 * scale,

      /* Story */

      storyHeight: 116 * scale,

      thumbnailWidth: 108 * scale,
      thumbnailHeight: 91 * scale,

      playButton: 38 * scale,
      playIcon: 17 * scale,

      storyTitle: 15.5 * scale,
      storyDescription: 11.5 * scale,
      metaText: 9.8 * scale,
      metaIcon: 12 * scale,

      /* =====================================================
         PROGRESS CIRCLE
         REDUCED SIZE
      ===================================================== */

      circle: isSmallScreen
        ? 145 * scale
        : 155 * scale,

      stroke: 7 * scale,

      /* Wave */

      waveWidth: Math.min(
        screenWidth * 2.05,
        820
      ),

      waveHeight: isSmallScreen
        ? 210 * scale
        : 270 * scale,

      progressAreaHeight:
        isSmallScreen
          ? 225 * scale
          : 240 * scale,

      percentage: 40 * scale,
      percentSymbol: 20 * scale,
      generating: 13 * scale,

      /* Scenes */

      scenesTitle: 18.5 * scale,
      scenesTitleLineHeight: 23 * scale,

      scenesSubtitle: 11.5 * scale,
      scenesSubtitleLineHeight: 16 * scale,

      /* Steps */

      stepHeight: 58 * scale,

      stepIcon: 33 * scale,
      stepIconBorder: 2.5 * scale,

      stepCheck: 14 * scale,
      stepClock: 13 * scale,
      stepDot: 7 * scale,

      stepTitle: 12.8 * scale,
      stepStatus: 10 * scale,

      progressBarHeight: 4 * scale,

      /* Pro Tip */

      proTipHeight: 65 * scale,
      proTipIcon: 35 * scale,

      proTipTitle: 13.5 * scale,
      proTipText: 10.5 * scale,

      /* Cancel */

      cancelHeight: 45 * scale,
      cancelIcon: 18 * scale,
      cancelText: 13.5 * scale,
    };
  }, [
    scale,
    screenWidth,
    isSmallScreen,
  ]);

  /* ==========================================================
     REAL GENERATION STATE
  ========================================================== */

  const [mainProgress, setMainProgress] =
    useState(
      Math.max(
        0,
        Math.min(
          100,
          Number(params.progress) || 0,
        ),
      ),
    );

  const [jobStatus, setJobStatus] =
    useState<VideoJobStatus>(
      params.status === 'completed'
        ? 'completed'
        : params.status === 'failed'
          ? 'failed'
          : 'processing',
    );

  const [jobStage, setJobStage] =
    useState<BackendStage>(
      params.stage === 'clips' ||
      params.stage === 'joining' ||
      params.stage === 'audio' ||
      params.stage === 'finalizing' ||
      params.stage === 'completed' ||
      params.stage === 'failed'
        ? (params.stage as BackendStage)
        : 'preparing',
    );

  const [currentClip, setCurrentClip] =
    useState(
      0,
    );

  const [totalClips, setTotalClips] =
    useState(
      Math.max(
        1,
        Number(params.duration || 30) / 5,
      ),
    );

  const [videoUrl, setVideoUrl] =
    useState<string | null>(
      null,
    );

  const [errorMessage, setErrorMessage] =
    useState<string | null>(
      null,
    );

  const [isPolling, setIsPolling] =
    useState(true);

  // Prevent duplicate navigation if completion is observed
  // more than once during polling or re-renders.
  const hasNavigatedToCompleteRef =
    useRef(false);

  /* ==========================================================
     ANIMATIONS
  ========================================================== */

  const progressAnimation = useRef(
    new Animated.Value(0)
  ).current;

  const waveOpacity = useRef(
    new Animated.Value(0.9)
  ).current;

  const waveScale = useRef(
    new Animated.Value(1)
  ).current;

  const waveAnimationRef =
    useRef<Animated.CompositeAnimation | null>(
      null
    );

  /* ==========================================================
     CIRCLE
  ========================================================== */

  const radius =
    (sizes.circle - sizes.stroke) / 2;

  const circumference =
    2 * Math.PI * radius;

  const displayTitle =
    params.title?.trim() ||
    'Your Story';

  const displayDescription =
    params.story?.trim() ||
    'Your video is being created from your approved story.';

  const displayDuration =
    params.duration?.trim() ||
    String(
      Math.max(
        15,
        totalClips * 5,
      ),
    );

  const displayRatio =
    params.ratio?.trim() ||
    '9:16';

  const displayStyle =
    params.style?.trim() ||
    '3d';

  const displayVoice =
    params.voice?.trim() ||
    'auto';

  const displayLanguage =
    params.language?.trim() ||
    'English (US)';

  const progressStep = (
    stepKey: ProcessingStep['key'],
  ): {
    status: StepStatus;
    progress: number;
  } => {
    const stageOrder: ProcessingStep['key'][] = [
      'analyzing',
      'clips',
      'joining',
      'audio',
      'finalizing',
    ];

    const currentIndex =
      jobStage === 'preparing'
        ? 0
        : jobStage === 'clips'
          ? 1
          : jobStage === 'joining'
            ? 2
            : jobStage === 'audio'
              ? 3
              : jobStage === 'finalizing'
                ? 4
                : jobStage === 'completed'
                  ? 5
                  : -1;

    const stepIndex =
      stageOrder.indexOf(
        stepKey,
      );

    if (
      jobStatus ===
      'failed'
    ) {
      if (
        stepIndex <
        currentIndex
      ) {
        return {
          status:
            'Completed',
          progress:
            100,
        };
      }

      if (
        stepIndex ===
        currentIndex
      ) {
        return {
          status:
            'In progress...',
          progress:
            100,
        };
      }

      return {
        status:
          'Waiting',
        progress:
          0,
      };
    }

    if (
      stepIndex <
      currentIndex
    ) {
      return {
        status:
          'Completed',
        progress:
          100,
      };
    }

    if (
      stepIndex >
      currentIndex
    ) {
      return {
        status:
          'Waiting',
        progress:
          0,
      };
    }

    if (
      jobStage ===
      'completed'
    ) {
      return {
        status:
          'Completed',
        progress:
          100,
      };
    }

    let localProgress =
      0;

    if (
      stepKey ===
      'analyzing'
    ) {
      if (
        jobStage ===
        'preparing'
      ) {
        localProgress =
          Math.min(
            100,
            (mainProgress /
              10) *
              100,
          );
      } else {
        localProgress = 100;
      }
    } else if (
      stepKey ===
      'clips'
    ) {
      const clipProgress =
        totalClips > 0
          ? currentClip /
            totalClips
          : 0;

      localProgress =
        jobStage ===
          'clips'
          ? Math.round(
              clipProgress *
                100,
            )
          : 100;
    } else if (
      stepKey ===
      'joining'
    ) {
      localProgress =
        jobStage ===
          'joining'
          ? 55
          : 100;
    } else if (
      stepKey ===
      'audio'
    ) {
      localProgress =
        jobStage ===
          'audio'
          ? 60
          : 100;
    } else {
      localProgress =
        jobStage ===
          'finalizing'
          ? mainProgress
          : 100;
    }

    return {
      status:
        'In progress...',
      progress:
        Math.max(
          0,
          Math.min(
            100,
            Math.round(
              localProgress,
            ),
          ),
        ),
    };
  };

  const steps = useMemo(() => {
    return PROCESSING_STEPS.map(
      (step) => ({
        ...step,
        ...progressStep(
          step.key,
        ),
      }),
    );
  }, [
    jobStage,
    jobStatus,
    mainProgress,
    currentClip,
    totalClips,
  ]);

  /* ==========================================================
     REAL JOB POLLING
  ========================================================== */

  useEffect(() => {
    const jobId = params.jobId;

    if (!jobId) {
      setErrorMessage(
        'Video generation job ID is missing.',
      );
      setJobStatus('failed');
      setIsPolling(false);
      return;
    }

    let isMounted = true;
    let timer: ReturnType<typeof setTimeout> | null =
      null;

    const pollStatus = async () => {
      if (!isMounted) {
        return;
      }

      try {
        const response =
          await fetch(
            `${API_BASE_URL}/video/status/${encodeURIComponent(jobId)}`,
          );

        const data =
          (await response.json()) as VideoJobResponse;

        if (!response.ok || !data.success) {
          throw new Error(
            data.error ||
              'Unable to read video generation status.',
          );
        }

        if (!isMounted) {
          return;
        }

        setJobStatus(
          data.status ??
            'processing',
        );

        setJobStage(
          data.stage ??
            'preparing',
        );

        setMainProgress(
          Math.max(
            0,
            Math.min(
              100,
              Number(data.progress) || 0,
            ),
          ),
        );

        if (
          typeof data.currentClip ===
          'number'
        ) {
          setCurrentClip(
            data.currentClip,
          );
        }

        if (
          typeof data.totalClips ===
          'number'
        ) {
          setTotalClips(
            Math.max(
              1,
              data.totalClips,
            ),
          );
        }

        const completedVideoUrl =
          data.video;

        if (completedVideoUrl) {
          setVideoUrl(
            completedVideoUrl,
          );
        }

        if (
          data.status ===
          'completed'
        ) {
          setMainProgress(100);
          setJobStage('completed');
          setIsPolling(false);

          // Navigate only after the backend explicitly reports
          // completion and provides the finished MP4 URL.
          if (
            completedVideoUrl &&
            !hasNavigatedToCompleteRef.current
          ) {
            hasNavigatedToCompleteRef.current = true;

            router.replace({
              pathname:
                '/complete-video',
              params: {
                videoUrl:
                  completedVideoUrl,
                story:
                  params.story ?? '',
                title:
                  params.title ?? '',
                duration:
                  params.duration ??
                  '30',
                ratio:
                  params.ratio ??
                  '9:16',
                style:
                  params.style ??
                  '',
                language:
                  params.language ??
                  'English (US)',
                voice:
                  params.voice ??
                  'auto',
              },
            });

            return;
          }

          // Do not leave the screen merely because status is
          // completed if the response did not contain the video.
          timer = setTimeout(
            pollStatus,
            1000,
          );

          return;
        }

        if (
          data.status ===
          'failed'
        ) {
          setErrorMessage(
            data.error ||
              'Video generation failed.',
          );
          setIsPolling(false);
          return;
        }

        timer = setTimeout(
          pollStatus,
          1500,
        );
      } catch (error) {
        console.error(
          '[VIDEO GENERATING] Status polling error:',
          error,
        );

        if (!isMounted) {
          return;
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Unable to check video generation status.',
        );

        setJobStatus(
          'failed',
        );

        setJobStage(
          'failed',
        );

        setIsPolling(false);
      }
    };

    void pollStatus();

    return () => {
      isMounted = false;

      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [
    params.jobId,
    params.story,
    params.title,
    params.duration,
    params.ratio,
    params.style,
    params.language,
    params.voice,
    router,
  ]);

  /* ==========================================================
     FAILURE
  ========================================================== */

  useEffect(() => {
    if (
      jobStatus !==
      'failed'
    ) {
      return;
    }

    if (!errorMessage) {
      return;
    }

    // Keep the generating screen visible so the user
    // can see the failure state instead of being sent
    // to the completion screen.
    console.warn(
      '[VIDEO GENERATING] Job failed:',
      errorMessage,
    );
  }, [
    jobStatus,
    errorMessage,
  ]);

  /* ==========================================================
     PROGRESS RING ANIMATION
  ========================================================== */

  useEffect(() => {
    Animated.timing(progressAnimation, {
      toValue: mainProgress,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [
    mainProgress,
    progressAnimation,
  ]);

  /* ==========================================================
     WAVE ANIMATION
  ========================================================== */

  useEffect(() => {
    const waveAnimation = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(waveOpacity, {
            toValue: 1,
            duration: 1800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(waveScale, {
            toValue: 1.04,
            duration: 1800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(waveOpacity, {
            toValue: 0.72,
            duration: 1800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(waveScale, {
            toValue: 0.98,
            duration: 1800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    waveAnimationRef.current = waveAnimation;
    waveAnimation.start();

    return () => {
      waveAnimation.stop();
      waveAnimationRef.current = null;
    };
  }, [waveOpacity, waveScale]);

  /* ==========================================================
     RING OFFSET
  ========================================================== */

  const strokeDashoffset =
    progressAnimation.interpolate({
      inputRange: [0, 100],

      outputRange: [
        circumference,
        0,
      ],
    });

const getStatusSubtitle = (
  stage: BackendStage,
  currentClip: number,
  totalClips: number,
): string => {
  switch (stage) {
    case 'preparing':
      return 'Preparing your story and scenes.';
    case 'clips':
      return `Generating scene ${Math.min(
        Math.max(currentClip, 1),
        totalClips,
      )} of ${totalClips}.`;
    case 'joining':
      return 'Joining your generated scenes.';
    case 'audio':
      return 'Creating and syncing your voiceover.';
    case 'finalizing':
      return 'Applying the final touches to your video.';
    case 'completed':
      return 'Your video is ready.';
    case 'failed':
      return 'Something went wrong while creating your video.';
    default:
      return 'Preparing your video.';
  }
};

const getStageHeadline = (
  stage: BackendStage,
  currentClip: number,
  totalClips: number,
): string => {
  switch (stage) {
    case 'preparing':
      return 'Analyzing your story...';
    case 'clips':
      return `Creating scene ${Math.min(
        Math.max(currentClip, 1),
        totalClips,
      )} of ${totalClips}...`;
    case 'joining':
      return 'Joining your scenes...';
    case 'audio':
      return 'Creating your voiceover...';
    case 'finalizing':
      return 'Finalizing your video...';
    case 'completed':
      return 'Your video is ready!';
    default:
      return 'Working on your video...';
  }
};

const getStageLabel = (
  stage: BackendStage,
): string => {
  switch (stage) {
    case 'preparing':
      return 'Preparing...';
    case 'clips':
      return 'Generating...';
    case 'joining':
      return 'Joining...';
    case 'audio':
      return 'Voiceover...';
    case 'finalizing':
      return 'Finalizing...';
    case 'completed':
      return 'Complete';
    case 'failed':
      return 'Failed';
    default:
      return 'Working...';
  }
};

const formatStyle = (
  value: string,
): string => {
  switch (value) {
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
      return value;
  }
};

const formatVoice = (
  value: string,
  language: string,
): string => {
  switch (value) {
    case 'female':
      return 'Female Voice';
    case 'male':
      return 'Male Voice';
    case 'none':
      return 'No Voice';
    case 'auto':
      return `AI Auto (${language})`;
    default:
      return value;
  }
};

  /* ==========================================================
     STEP ICON
  ========================================================== */

  const renderStepIcon = (
    status: StepStatus
  ) => {
    if (
      status ===
      'Completed'
    ) {
      return (
        <View
          style={[
            styles.completedIcon,
            {
              width:
                sizes.stepIcon,

              height:
                sizes.stepIcon,

              borderRadius:
                sizes.stepIcon / 2,
            },
          ]}
        >
          <Icon
            name="check"
            size={
              sizes.stepCheck
            }
            color="#041116"
          />
        </View>
      );
    }

    if (
      status ===
      'In progress...'
    ) {
      return (
        <View
          style={[
            styles.activeIcon,
            {
              width:
                sizes.stepIcon,

              height:
                sizes.stepIcon,

              borderRadius:
                sizes.stepIcon / 2,

              borderWidth:
                sizes.stepIconBorder,
            },
          ]}
        >
          <View
            style={[
              styles.activeIconDot,
              {
                width:
                  sizes.stepDot,

                height:
                  sizes.stepDot,

                borderRadius:
                  sizes.stepDot / 2,
              },
            ]}
          />
        </View>
      );
    }

    return (
      <View
        style={[
          styles.waitingIcon,
          {
            width:
              sizes.stepIcon,

            height:
              sizes.stepIcon,

            borderRadius:
              sizes.stepIcon / 2,
          },
        ]}
      >
        <Icon
          name="clock"
          size={
            sizes.stepClock
          }
          color={
            COLORS.muted
          }
        />
      </View>
    );
  };

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <SafeAreaView
      style={
        styles.safeArea
      }
      edges={[
        'top',
        'bottom',
      ]}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor={
          COLORS.background
        }
      />

      <LinearGradient
        colors={[
          COLORS.background,
          COLORS.backgroundMid,
          COLORS.background,
        ]}
        locations={[
          0,
          0.5,
          1,
        ]}
        style={
          styles.container
        }
      >

        {/* HEADER */}

        <View
          style={[
            styles.header,
            {
              height:
                sizes.headerHeight,

              paddingHorizontal:
                18 * scale,
            },
          ]}
        >
          <View style={{ flex: 1 }} />

          <TouchableOpacity
            style={[
              styles.creditsDisplay,
              {
                width:
                  sizes.creditsWidth,

                height:
                  sizes.creditsHeight,

                borderRadius:
                  sizes.creditsHeight /
                  2,
              },
            ]}
            onPress={() => router.push('/coins')}
          >
            <Image
              source={require('../assets/coin.png')}
              style={{
                width:
                  sizes.coin,

                height:
                  sizes.coin,
              }}
            />

            <Text
              style={[
                styles.creditsText,
                {
                  fontSize:
                    sizes.creditsText,
                },
              ]}
            >
              12,230
            </Text>

            <Icon
              name="plus"
              size={
                15 * scale
              }
              color={
                COLORS.primary
              }
            />
          </TouchableOpacity>
        </View>

        {/* CONTENT */}

        <ScrollView
          style={
            styles.scrollView
          }
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingHorizontal:
                18 * scale,

              paddingBottom:
                20 * scale,
            },
          ]}
          showsVerticalScrollIndicator={
            false
          }
          bounces={false}
        >

          {/* TITLE */}

          <Text
            style={[
              styles.mainTitle,
              {
                fontSize:
                  sizes.title,

                lineHeight:
                  sizes.titleLineHeight,
                color:
                  jobStatus === 'failed'
                    ? '#FF7D8A'
                    : COLORS.white,
              },
            ]}
            numberOfLines={1}
          >
            {jobStatus === 'failed'
              ? 'Video Generation Failed'
              : 'Generating Your Video'}
          </Text>

          <Text
            style={[
              styles.mainSubtitle,
              {
                fontSize:
                  sizes.subtitle,

                lineHeight:
                  sizes.subtitleLineHeight,

                marginTop:
                  2 * scale,

                marginBottom:
                  9 * scale,
              },
            ]}
            numberOfLines={1}
          >
            {jobStatus === 'failed'
              ? 'Something went wrong while creating your video.'
              : getStatusSubtitle(
                  jobStage,
                  currentClip,
                  totalClips,
                )}
          </Text>

          {/* STORY CARD */}

          <View
            style={[
              styles.storyCard,
              {
                height:
                  sizes.storyHeight,

                borderRadius:
                  14 * scale,

                padding:
                  9 * scale,
              },
            ]}
          >
            <View
              style={[
                styles.thumbnailWrapper,
                {
                  width:
                    sizes.thumbnailWidth,

                  height:
                    sizes.thumbnailHeight,

                  borderRadius:
                    10 * scale,
                },
              ]}
            >
              <Image
                source={ASSETS.hero}
                style={
                  styles.thumbnail
                }
              />

              <View
                style={
                  styles.thumbnailOverlay
                }
              >
                <View
                  style={[
                    styles.playButton,
                    {
                      width:
                        sizes.playButton,

                      height:
                        sizes.playButton,

                      borderRadius:
                        sizes.playButton /
                        2,
                    },
                  ]}
                >
                  <Icon
                    name="play"
                    size={
                      sizes.playIcon
                    }
                    color={
                      COLORS.white
                    }
                    style={{
                      marginLeft:
                        2 * scale,
                    }}
                  />
                </View>
              </View>
            </View>

            <View
              style={[
                styles.storyInfo,
                {
                  marginLeft:
                    10 * scale,
                },
              ]}
            >
              <Text
                style={[
                  styles.storyTitle,
                  {
                    fontSize:
                      sizes.storyTitle,

                    marginBottom:
                      3 * scale,
                  },
                ]}
                numberOfLines={
                  1
                }
              >
                {
                  displayTitle
                }
              </Text>

              <Text
                style={[
                  styles.storyDescription,
                  {
                    fontSize:
                      sizes.storyDescription,

                    lineHeight:
                      15 * scale,

                    marginBottom:
                      4 * scale,
                  },
                ]}
                numberOfLines={
                  2
                }
              >
                {
                  displayDescription
                }
              </Text>

              <View
                style={
                  styles.storyMeta
                }
              >
                <View
                  style={[
                    styles.metaItem,
                    {
                      marginRight:
                        7 * scale,
                    },
                  ]}
                >
                  <Icon
                    name="clock"
                    size={
                      sizes.metaIcon
                    }
                    color={
                      COLORS.secondary
                    }
                  />

                  <Text
                    style={[
                      styles.metaText,
                      {
                        fontSize:
                          sizes.metaText,
                      },
                    ]}
                  >
                    {
                      `${displayDuration} sec`
                    }
                  </Text>
                </View>

                <View
                  style={[
                    styles.metaItem,
                    {
                      marginRight:
                        7 * scale,
                    },
                  ]}
                >
                  <Icon
                    name="square"
                    size={
                      sizes.metaIcon
                    }
                    color={
                      COLORS.secondary
                    }
                  />

                  <Text
                    style={[
                      styles.metaText,
                      {
                        fontSize:
                          sizes.metaText,
                      },
                    ]}
                  >
                    {
                      displayRatio
                    }
                  </Text>
                </View>

                <View
                  style={[
                    styles.metaItem,
                    {
                      marginRight:
                        7 * scale,
                    },
                  ]}
                >
                  <Icon
                    name="film"
                    size={
                      sizes.metaIcon
                    }
                    color={
                      COLORS.secondary
                    }
                  />

                  <Text
                    style={[
                      styles.metaText,
                      {
                        fontSize:
                          sizes.metaText,
                      },
                    ]}
                  >
                    {
                      formatStyle(
                        displayStyle,
                      )
                    }
                  </Text>
                </View>

                <View
                  style={
                    styles.metaItem
                  }
                >
                  <Icon
                    name="volume-2"
                    size={
                      sizes.metaIcon
                    }
                    color={
                      COLORS.secondary
                    }
                  />

                  <Text
                    style={[
                      styles.metaText,
                      {
                        fontSize:
                          sizes.metaText,
                      },
                    ]}
                  >
                    {
                      formatVoice(
                        displayVoice,
                        displayLanguage,
                      )
                    }
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* =================================================
              WAVE + LOADER
          ================================================== */}

          <View
            style={[
              styles.progressArea,
              {
                height:
                  sizes.progressAreaHeight,
              },
            ]}
          >

            {/* WAVE */}

            <Animated.Image
                source={require('../assets/progress-wave-bg.png')}
                style={[
                  styles.processingWave,
                  {
                    width:
                      sizes.waveWidth,

                    height:
                      sizes.waveHeight,

                    opacity:
                      waveOpacity,

                    transform: [
                      {
                        scale:
                          waveScale,
                      },
                    ],
                  },
                ]}
                resizeMode="contain"
              />

            {/* SMALLER LOADER CIRCLE */}

            <View
              style={[
                styles.progressRing,
                {
                  width:
                    sizes.circle,

                  height:
                    sizes.circle,
                },
              ]}
            >
              <Svg
                width={
                  sizes.circle
                }
                height={
                  sizes.circle
                }
                viewBox={`0 0 ${sizes.circle} ${sizes.circle}`}
              >
                <Defs>
                  <SvgLinearGradient
                    id="progressGradient"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1"
                  >
                    <Stop
                      offset="0"
                      stopColor={PROGRESS_GRADIENT.start}
                    />
                    <Stop
                      offset="0.5"
                      stopColor={PROGRESS_GRADIENT.middle}
                    />
                    <Stop
                      offset="1"
                      stopColor={PROGRESS_GRADIENT.end}
                    />
                  </SvgLinearGradient>
                </Defs>

                {/* Background ring */}

                <Circle
                  cx={
                    sizes.circle / 2
                  }
                  cy={
                    sizes.circle / 2
                  }
                  r={radius}
                  stroke="#153450"
                  strokeWidth={
                    sizes.stroke
                  }
                  fill="transparent"
                />

                {/* Running progress */}

                <AnimatedCircle
                  cx={
                    sizes.circle / 2
                  }
                  cy={
                    sizes.circle / 2
                  }
                  r={radius}
                  stroke="url(#progressGradient)"
                  strokeWidth={
                    sizes.stroke
                  }
                  fill="transparent"
                  strokeLinecap="round"
                  strokeDasharray={`${circumference} ${circumference}`}
                  strokeDashoffset={
                    strokeDashoffset
                  }
                  rotation="-90"
                  origin={`${sizes.circle / 2}, ${sizes.circle / 2}`}
                />
              </Svg>

              {/* CENTER TEXT */}

              <View
                style={
                  styles.progressText
                }
              >
                <View
                  style={
                    styles.percentRow
                  }
                >
                  <Text
                    style={[
                      styles.percentNumber,
                      {
                        fontSize:
                          sizes.percentage,

                        lineHeight:
                          sizes.percentage *
                          1.08,
                      },
                    ]}
                  >
                    {
                      mainProgress
                    }
                  </Text>

                  <Text
                    style={[
                      styles.percentSymbol,
                      {
                        fontSize:
                          sizes.percentSymbol,
                      },
                    ]}
                  >
                    %
                  </Text>
                </View>

                <Text
                  style={[
                    styles.generatingText,
                    {
                      fontSize:
                        sizes.generating,
                    },
                  ]}
                >
                  {jobStatus === 'failed'
                    ? 'Failed'
                    : jobStatus === 'completed'
                      ? 'Complete'
                      : !isPolling
                        ? 'Waiting...'
                        : jobStage === 'clips'
                          ? `Scene ${Math.min(
                              Math.max(
                                currentClip,
                                1,
                              ),
                              totalClips,
                            )} of ${totalClips}`
                          : getStageLabel(
                              jobStage,
                            )}
                </Text>
              </View>
            </View>
          </View>

          {/* SCENES */}

          <Text
            style={[
              styles.scenesTitle,
              {
                fontSize:
                  sizes.scenesTitle,

                lineHeight:
                  sizes.scenesTitleLineHeight,
              },
            ]}
            numberOfLines={1}
          >
            {jobStatus === 'failed'
              ? 'Your video could not be completed.'
              : getStageHeadline(
                  jobStage,
                  currentClip,
                  totalClips,
                )}
          </Text>

          <Text
            style={[
              styles.scenesSubtitle,
              {
                fontSize:
                  sizes.scenesSubtitle,

                lineHeight:
                  sizes.scenesSubtitleLineHeight,

                marginTop:
                  2 * scale,

                marginBottom:
                  7 * scale,
              },
            ]}
            numberOfLines={2}
          >
            {jobStatus === 'failed'
              ? errorMessage ||
                'Please return and try again.'
              : `Generating ${totalClips} five-second clips for your ${displayDuration}-second video.`}
          </Text>

          {/* STEPS */}

          <View
            style={[
              styles.stepsCard,
              {
                borderRadius:
                  15 * scale,

                paddingHorizontal:
                  11 * scale,

                paddingVertical:
                  2 * scale,
              },
            ]}
          >
            {steps.map(
              (step, index) => (
                <View
                  key={
                    step.key
                  }
                  style={[
                    styles.stepRow,
                    {
                      height:
                        sizes.stepHeight,
                    },

                    index ===
                      steps.length -
                        1 &&
                      styles.lastStepRow,
                  ]}
                >
                  {
                    renderStepIcon(
                      step.status
                    )
                  }

                  <View
                    style={[
                      styles.stepContent,
                      {
                        marginLeft:
                          10 * scale,
                      },
                    ]}
                  >
                    <View
                      style={
                        styles.stepHeader
                      }
                    >
                      <Text
                        style={[
                          styles.stepTitle,
                          {
                            fontSize:
                              sizes.stepTitle,
                          },

                          step.status ===
                            'Waiting' &&
                            styles.waitingStepTitle,
                        ]}
                        numberOfLines={
                          1
                        }
                      >
                        {
                          step.title
                        }
                      </Text>

                      <Text
                        style={[
                          styles.stepStatus,
                          {
                            fontSize:
                              sizes.stepStatus,

                            marginLeft:
                              5 * scale,
                          },

                          step.status ===
                            'Completed' &&
                            styles.completedStatus,

                          step.status ===
                            'In progress...' &&
                            styles.activeStatus,
                        ]}
                      >
                        {
                          step.status
                        }
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.progressBarTrack,
                        {
                          height:
                            sizes.progressBarHeight,

                          borderRadius:
                            sizes.progressBarHeight /
                            2,

                          marginTop:
                            5 * scale,
                        },
                      ]}
                    >
                      <LinearGradient
                        colors={[
                          PROGRESS_GRADIENT.start,
                          PROGRESS_GRADIENT.middle,
                          PROGRESS_GRADIENT.end,
                        ]}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={[
                          styles.progressBarFill,
                          {
                            width: `${step.progress}%`,
                            borderRadius:
                              sizes.progressBarHeight /
                              2,
                          },
                        ]}
                      />
                    </View>
                  </View>
                </View>
              )
            )}
          </View>

          {/* PRO TIP */}

          <View
            style={[
              styles.proTipCard,
              {
                height:
                  sizes.proTipHeight,

                borderRadius:
                  14 * scale,

                marginTop:
                  7 * scale,

                paddingHorizontal:
                  10 * scale,
              },
            ]}
          >
            <View
              style={[
                styles.proTipIcon,
                {
                  width:
                    sizes.proTipIcon,

                  height:
                    sizes.proTipIcon,
                },
              ]}
            >
              <Icon
                name="zap"
                size={
                  21 * scale
                }
                color={
                  COLORS.primary
                }
              />
            </View>

            <View
              style={[
                styles.proTipContent,
                {
                  marginLeft:
                    8 * scale,
                },
              ]}
            >
              <Text
                style={[
                  styles.proTipTitle,
                  {
                    fontSize:
                      sizes.proTipTitle,
                  },
                ]}
              >
                Pro Tip
              </Text>

              <Text
                style={[
                  styles.proTipText,
                  {
                    fontSize:
                      sizes.proTipText,

                    lineHeight:
                      14 * scale,
                  },
                ]}
                numberOfLines={2}
              >
                {jobStatus === 'failed'
                  ? 'Check your settings and try generating the video again.'
                  : `Shivora is processing your ${displayDuration}-second ${formatStyle(
                      displayStyle,
                    )} video. Keep this screen open while it completes.`}
              </Text>
            </View>
          </View>

          {jobStatus === 'failed' && (
            <TouchableOpacity
              activeOpacity={0.85}
              style={[
                styles.retryButton,
                {
                  height:
                    sizes.cancelHeight,
                  borderRadius:
                    24 * scale,
                  marginTop:
                    8 * scale,
                },
              ]}
              onPress={() => {
                router.back();
              }}
            >
              <Icon
                name="arrow-left"
                size={sizes.cancelIcon}
                color={COLORS.primary}
              />
              <Text
                style={[
                  styles.cancelButtonText,
                  {
                    fontSize:
                      sizes.cancelText,
                    marginLeft:
                      8 * scale,
                  },
                ]}
              >
                Back to Preview
              </Text>
            </TouchableOpacity>
          )}

        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

/* ================================================================
   STYLES
================================================================ */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor:
      COLORS.background,
  },

  container: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
  },

  /* Header */

  header: {
    flexDirection:
      'row',

    alignItems:
      'center',

    justifyContent:
      'space-between',
  },

  backButton: {
    justifyContent:
      'center',

    alignItems:
      'center',
  },

  creditsDisplay: {
    flexDirection:
      'row',

    alignItems:
      'center',

    justifyContent:
      'center',

    borderWidth:
      1.2,

    borderColor:
      COLORS.primary,

    backgroundColor:
      'rgba(5,18,27,0.94)',
  },

  creditsText: {
    color:
      COLORS.white,

    fontWeight:
      '700',
  },

  /* Titles */

  mainTitle: {
    color:
      COLORS.white,

    fontWeight:
      '800',

    textAlign:
      'center',
  },

  mainSubtitle: {
    color:
      COLORS.secondary,

    textAlign:
      'center',
  },

  /* Story */

  storyCard: {
    width:
      '100%',

    flexDirection:
      'row',

    alignItems:
      'center',

    backgroundColor:
      'rgba(8,21,34,0.94)',

    borderWidth:
      1,

    borderColor:
      COLORS.border,
  },

  thumbnailWrapper: {
    overflow:
      'hidden',

    backgroundColor:
      '#07111C',
  },

  thumbnail: {
    width:
      '100%',

    height:
      '100%',

    resizeMode:
      'cover',
  },

  thumbnailOverlay: {
    ...StyleSheet.absoluteFillObject,

    justifyContent:
      'center',

    alignItems:
      'center',
  },

  playButton: {
    backgroundColor:
      'rgba(0,0,0,0.62)',

    justifyContent:
      'center',

    alignItems:
      'center',

    borderWidth:
      1,

    borderColor:
      'rgba(255,255,255,0.45)',
  },

  storyInfo: {
    flex:
      1,

    minWidth:
      0,

    justifyContent:
      'center',
  },

  storyTitle: {
    color:
      COLORS.white,

    fontWeight:
      '700',
  },

  storyDescription: {
    color:
      COLORS.secondary,
  },

  storyMeta: {
    flexDirection:
      'row',

    flexWrap:
      'wrap',

    alignItems:
      'center',
  },

  metaItem: {
    flexDirection:
      'row',

    alignItems:
      'center',

    marginBottom:
      2,
  },

  metaText: {
    color:
      COLORS.secondary,

    marginLeft:
      3,
  },

  /* Progress */

  progressArea: {
    width:
      '100%',

    position:
      'relative',

    alignItems:
      'center',

    justifyContent:
      'center',

    overflow:
      'visible',
  },

  processingWave: {
    position:
      'absolute',

    zIndex:
      1,

    resizeMode:
      'contain',
  },

  progressRing: {
    position:
      'absolute',

    alignItems:
      'center',

    justifyContent:
      'center',

    zIndex:
      2,
  },

  progressText: {
    position:
      'absolute',

    alignItems:
      'center',

    justifyContent:
      'center',

    zIndex:
      3,
  },

  percentRow: {
    flexDirection:
      'row',

    alignItems:
      'baseline',

    justifyContent:
      'center',
  },

  percentNumber: {
    color:
      COLORS.white,

    fontWeight:
      '800',

    includeFontPadding:
      false,
  },

  percentSymbol: {
    color:
      COLORS.white,

    fontWeight:
      '700',

    marginLeft:
      2,
  },

  generatingText: {
    color:
      COLORS.secondary,

    marginTop:
      1,
  },

  /* Scenes */

  scenesTitle: {
    color:
      COLORS.white,

    fontWeight:
      '800',

    textAlign:
      'center',
  },

  scenesSubtitle: {
    color:
      COLORS.secondary,

    textAlign:
      'center',

    paddingHorizontal:
      2,
  },

  /* Steps */

  stepsCard: {
    width:
      '100%',

    backgroundColor:
      'rgba(8,21,34,0.94)',

    borderWidth:
      1,

    borderColor:
      COLORS.border,
  },

  stepRow: {
    width:
      '100%',

    flexDirection:
      'row',

    alignItems:
      'center',

    borderBottomWidth:
      1,

    borderBottomColor:
      COLORS.divider,
  },

  lastStepRow: {
    borderBottomWidth:
      0,
  },

  completedIcon: {
    justifyContent:
      'center',

    alignItems:
      'center',

    backgroundColor:
      COLORS.primary,
  },

  activeIcon: {
    justifyContent:
      'center',

    alignItems:
      'center',

    borderColor:
      COLORS.primary,
  },

  activeIconDot: {
    backgroundColor:
      COLORS.primary,
  },

  waitingIcon: {
    justifyContent:
      'center',

    alignItems:
      'center',

    borderWidth:
      1.8,

    borderColor:
      '#8197AE',
  },

  stepContent: {
    flex:
      1,

    minWidth:
      0,
  },

  stepHeader: {
    flexDirection:
      'row',

    alignItems:
      'center',

    justifyContent:
      'space-between',
  },

  stepTitle: {
    flex:
      1,

    color:
      COLORS.white,

    fontWeight:
      '700',
  },

  waitingStepTitle: {
    color:
      COLORS.waiting,
  },

  stepStatus: {
    color:
      COLORS.muted,

    flexShrink:
      0,
  },

  activeStatus: {
    color:
      COLORS.primary,

    fontWeight:
      '600',
  },

  completedStatus: {
    color:
      COLORS.primary,

    fontWeight:
      '600',
  },

  progressBarTrack: {
    width:
      '100%',

    backgroundColor:
      COLORS.progressTrack,

    overflow:
      'hidden',
  },

  progressBarFill: {
    height:
      '100%',
  },

  /* Pro Tip */

  proTipCard: {
    width:
      '100%',

    flexDirection:
      'row',

    alignItems:
      'center',

    backgroundColor:
      'rgba(0,230,208,0.025)',

    borderWidth:
      1,

    borderColor:
      '#006C68',
  },

  proTipIcon: {
    justifyContent:
      'center',

    alignItems:
      'center',
  },

  proTipContent: {
    flex:
      1,

    minWidth:
      0,
  },

  proTipTitle: {
    color:
      COLORS.primary,

    fontWeight:
      '800',

    marginBottom:
      1,
  },

  proTipText: {
    color:
      COLORS.secondary,
  },

  /* Cancel */

  retryButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.3,
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(0,230,208,0.015)',
  },

  cancelButton: {
    width:
      '100%',

    flexDirection:
      'row',

    alignItems:
      'center',

    justifyContent:
      'center',

    borderWidth:
      1.3,

    borderColor:
      COLORS.primary,

    backgroundColor:
      'rgba(0,230,208,0.015)',
  },

  cancelButtonText: {
    color:
      COLORS.primary,

    fontWeight:
      '700',
  },
});

export default ProcessingScreen;