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
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

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

type StepStatus =
  | 'Waiting'
  | 'In progress...'
  | 'Completed';

type ProcessingStep = {
  key: keyof typeof STEP_RANGES;
  title: string;
};

const storyData = {
  title: 'Switzerland Travel Story',

  description:
    'A breathtaking journey through the beautiful landscapes of Switzerland.',

  duration: '60 sec',
  aspectRatio: '9:16',
  style: 'Cinematic',
  voice: 'Female Voice',
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
    key: 'transitions',
    title: 'Adding transitions & effects',
  },
  {
    key: 'audio',
    title: 'Syncing audio & captions',
  },
  {
    key: 'finalizing',
    title: 'Finalizing your video',
  },
];

const STEP_RANGES = {
  analyzing: {
    start: 0,
    end: 20,
  },

  clips: {
    start: 20,
    end: 40,
  },

  transitions: {
    start: 40,
    end: 60,
  },

  audio: {
    start: 60,
    end: 80,
  },

  finalizing: {
    start: 80,
    end: 100,
  },
};

const AnimatedCircle =
  Animated.createAnimatedComponent(Circle);

const ProcessingScreen = () => {
  const router = useRouter();

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
     MAIN PROGRESS
  ========================================================== */

  const [mainProgress, setMainProgress] =
    useState(0);

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

  /* ==========================================================
     RUNNING PROGRESS
  ========================================================== */

  useEffect(() => {
    const interval = setInterval(() => {
      setMainProgress((current) => {
        if (current >= 100) {
          clearInterval(interval);
          return 100;
        }

        return current + 1;
      });
    }, 550);

    return () => {
      clearInterval(interval);
    };
  }, []);

  /* ==========================================================
     COMPLETE
  ========================================================== */

  useEffect(() => {
    if (mainProgress >= 100) {
      if (waveAnimationRef.current) {
        waveAnimationRef.current.stop();
        waveAnimationRef.current = null;
      }

      waveOpacity.setValue(1);
      waveScale.setValue(1);

      const timeout = setTimeout(() => {
        router.replace('/complete-video');
      }, 600);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, [
    mainProgress,
    router,
    waveOpacity,
    waveScale,
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
    if (mainProgress >= 100) {
      return;
    }

    if (waveAnimationRef.current) {
      return;
    }

    const waveAnimation =
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(
              waveOpacity,
              {
                toValue: 1,
                duration: 1800,
                easing:
                  Easing.inOut(
                    Easing.ease
                  ),
                useNativeDriver: true,
              }
            ),

            Animated.timing(
              waveScale,
              {
                toValue: 1.04,
                duration: 1800,
                easing:
                  Easing.inOut(
                    Easing.ease
                  ),
                useNativeDriver: true,
              }
            ),
          ]),

          Animated.parallel([
            Animated.timing(
              waveOpacity,
              {
                toValue: 0.72,
                duration: 1800,
                easing:
                  Easing.inOut(
                    Easing.ease
                  ),
                useNativeDriver: true,
              }
            ),

            Animated.timing(
              waveScale,
              {
                toValue: 0.98,
                duration: 1800,
                easing:
                  Easing.inOut(
                    Easing.ease
                  ),
                useNativeDriver: true,
              }
            ),
          ]),
        ])
      );

    waveAnimationRef.current =
      waveAnimation;

    waveAnimation.start();

    return () => {
      if (mainProgress < 100) {
        waveAnimation.stop();
        waveAnimationRef.current = null;
      }
    };
  }, [
    waveOpacity,
    waveScale,
    mainProgress,
  ]);

  /* ==========================================================
     STEPS
  ========================================================== */

  const steps = useMemo(() => {
    return PROCESSING_STEPS.map(
      (step) => {
        const range =
          STEP_RANGES[step.key];

        let status: StepStatus =
          'Waiting';

        let progress = 0;

        if (
          mainProgress <
          range.start
        ) {
          status = 'Waiting';
          progress = 0;
        } else if (
          mainProgress <
          range.end
        ) {
          status =
            'In progress...';

          progress =
            ((mainProgress -
              range.start) /
              (range.end -
                range.start)) *
            100;

          progress = Math.max(
            0,
            Math.min(
              100,
              progress
            )
          );
        } else {
          status = 'Completed';
          progress = 100;
        }

        return {
          ...step,
          status,
          progress,
        };
      }
    );
  }, [mainProgress]);

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

          <View
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
          </View>
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
              },
            ]}
            numberOfLines={1}
          >
            Generating Your Video
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
            Sit back and relax! Your video is being created.
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
                source={require('../assets/switzerland_story.png')}
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
                  storyData.title
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
                  storyData.description
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
                      storyData.duration
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
                      storyData.aspectRatio
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
                      storyData.style
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
                      storyData.voice
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
              pointerEvents="none"
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
                  stroke={
                    COLORS.primary
                  }
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
                  Generating...
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
            Creating amazing scenes for you...
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
            This may take a few minutes. You can safely leave the
            screen and come back later.
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
                      <View
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
                Your video is generated in the background.
                You don't need to keep this screen open.
              </Text>
            </View>
          </View>


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

    backgroundColor:
      COLORS.primary,
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
