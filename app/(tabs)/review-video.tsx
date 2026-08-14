import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    SafeAreaView,
    StatusBar,
    TouchableOpacity,
    ScrollView,
    Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
    Feather as Icon,
    MaterialCommunityIcons,
} from '@expo/vector-icons';
import { useRouter } from 'expo-router';

/* =========================================================
   DATA
========================================================= */

const storyData = {
    title: 'Switzerland Travel Story',
    description:
        'A breathtaking journey through the beautiful landscapes of Switzerland.',
    duration: '60 sec',
    aspectRatio: '9:16',
    style: 'Cinematic',
    voice: 'Female Voice',
    thumbnail: require('../../assets/switzerland_story.png'),
};

const scenes = [
    {
        id: 1,
        title: 'Mountain Sunrise',
        description:
            'A stunning sunrise over the Swiss Alps with golden light.',
        duration: '8 sec',
        image: require('../../assets/scene1.png'),
    },
    {
        id: 2,
        title: 'Traveler in the Valley',
        description:
            'A traveler enjoying the breathtaking valley views.',
        duration: '10 sec',
        image: require('../../assets/scene2.png'),
    },
    {
        id: 3,
        title: 'Waterfall Landscape',
        description:
            'Majestic waterfall surrounded by green mountains.',
        duration: '10 sec',
        image: require('../../assets/scene3.png'),
    },
    {
        id: 4,
        title: 'Scenic Train Ride',
        description:
            'Iconic red train journey through beautiful Swiss landscapes.',
        duration: '8 sec',
        image: require('../../assets/scene4.png'),
    },
    {
        id: 5,
        title: 'Lakeside Village',
        description:
            'Peaceful village by the lake with stunning reflections.',
        duration: '7 sec',
        image: require('../../assets/scene5.png'),
    },
    {
        id: 6,
        title: 'Swiss Evening',
        description:
            'A beautiful evening view across the Swiss mountains and lake.',
        duration: '17 sec',
        image: require('../../assets/scene6.png'),
    },
];

/* =========================================================
   SCREEN
========================================================= */

const ReviewEditScenesScreen = () => {
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<'scenes' | 'timeline'>(
        'scenes'
    );

    const handleEditIdea = () => {
        router.back();
    };

    const handleContinue = () => {
        /*
         * Change this route only if your generating screen
         * has a different filename/path.
         */
        router.push('/video-generating');
    };

    const handleEditScene = (sceneId: number) => {
        console.log('Edit scene:', sceneId);
    };

    const handleRegenerateScene = (sceneId: number) => {
        console.log('Regenerate scene:', sceneId);
    };

    const handleRegenerateAll = () => {
        console.log('Regenerate all scenes');
    };

    const handleAddScene = () => {
        console.log('Add scene');
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar
                barStyle="light-content"
                backgroundColor="#020A12"
            />

            <LinearGradient
                colors={['#020A12', '#04111C', '#020A12']}
                style={styles.container}
            >
                {/* =================================================
                    HEADER
                ================================================= */}

                <View style={styles.header}>

                    {/* Top Row */}
                    <View style={styles.headerTopRow}>

                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => router.back()}
                            activeOpacity={0.7}
                        >
                            <Icon
                                name="arrow-left"
                                size={25}
                                color="#FFFFFF"
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.creditsPill}
                            activeOpacity={0.8}
                        >
                            <Image
                                source={require('../../assets/coin.png')}
                                style={styles.coinIcon}
                            />

                            <Text style={styles.creditsText}>
                                12,450
                            </Text>

                            <View style={styles.creditPlus}>
                                <Icon
                                    name="plus"
                                    size={15}
                                    color="#00E5D0"
                                />
                            </View>
                        </TouchableOpacity>

                    </View>

                    {/* Centered Title */}
                    <View style={styles.headerTitleContainer}>

                        <Text style={styles.headerTitle}>
                            Review & Edit Scenes
                        </Text>

                        <Text style={styles.headerSubtitle}>
                            AI has created a story for your video.
                            {'\n'}
                            Review and make changes if needed.
                        </Text>

                    </View>

                </View>

                {/* =================================================
                    SCROLL CONTENT
                ================================================= */}

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    bounces={true}
                >

                    {/* =================================================
                        STORY CARD
                    ================================================= */}

                    <View style={styles.storyCard}>

                        <Image
                            source={storyData.thumbnail}
                            style={styles.storyThumbnail}
                        />

                        <View style={styles.storyContent}>

                            {/* Story Title */}
                            <View style={styles.storyTitleRow}>

                                <View style={styles.storyTitleArea}>

                                    <Text
                                        style={styles.storyTitle}
                                        numberOfLines={1}
                                        ellipsizeMode="tail"
                                    >
                                        {storyData.title}
                                    </Text>

                                    <TouchableOpacity
                                        style={styles.smallEditButton}
                                        onPress={handleEditIdea}
                                        activeOpacity={0.7}
                                    >
                                        <Icon
                                            name="edit-2"
                                            size={16}
                                            color="#AFC0D4"
                                        />
                                    </TouchableOpacity>

                                </View>

                                <TouchableOpacity
                                    style={styles.editIdeaButton}
                                    onPress={handleEditIdea}
                                    activeOpacity={0.75}
                                >
                                    <Text style={styles.editIdeaText}>
                                        Edit Idea
                                    </Text>
                                </TouchableOpacity>

                            </View>

                            {/* Description */}
                            <Text
                                style={styles.storyDescription}
                                numberOfLines={2}
                            >
                                {storyData.description}
                            </Text>

                            {/* Metadata */}
                            <View style={styles.storyMeta}>

                                <MetaItem
                                    icon="clock"
                                    text={storyData.duration}
                                />

                                <MetaItem
                                    icon="square"
                                    text={storyData.aspectRatio}
                                />

                                <MetaItem
                                    icon="film"
                                    text={storyData.style}
                                />

                                <MetaItem
                                    icon="volume-2"
                                    text={storyData.voice}
                                />

                            </View>

                        </View>
                    </View>

                    {/* =================================================
                        TABS
                    ================================================= */}

                    <View style={styles.tabsContainer}>

                        <TouchableOpacity
                            style={[
                                styles.tab,
                                activeTab === 'scenes' &&
                                    styles.activeTab,
                            ]}
                            onPress={() => setActiveTab('scenes')}
                            activeOpacity={0.8}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    activeTab === 'scenes' &&
                                        styles.activeTabText,
                                ]}
                            >
                                Scenes (6)
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.tab,
                                activeTab === 'timeline' &&
                                    styles.activeTab,
                            ]}
                            onPress={() => setActiveTab('timeline')}
                            activeOpacity={0.8}
                        >
                            <MaterialCommunityIcons
                                name="view-grid-outline"
                                size={20}
                                color={
                                    activeTab === 'timeline'
                                        ? '#00E5D0'
                                        : '#AAB7C7'
                                }
                            />

                            <Text
                                style={[
                                    styles.tabText,
                                    activeTab === 'timeline' &&
                                        styles.activeTabText,
                                ]}
                            >
                                Timeline View
                            </Text>
                        </TouchableOpacity>

                    </View>

                    {/* =================================================
                        ACTION BUTTONS
                    ================================================= */}

                    <View style={styles.actionRow}>

                        <TouchableOpacity
                            style={styles.regenerateAllButton}
                            onPress={handleRegenerateAll}
                            activeOpacity={0.75}
                        >
                            <Icon
                                name="refresh-cw"
                                size={17}
                                color="#C7D2DF"
                            />

                            <Text style={styles.regenerateAllText}>
                                Regenerate All
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.addSceneButton}
                            onPress={handleAddScene}
                            activeOpacity={0.8}
                        >
                            <Icon
                                name="plus"
                                size={21}
                                color="#00100E"
                            />

                            <Text style={styles.addSceneText}>
                                Add Scene
                            </Text>
                        </TouchableOpacity>

                    </View>

                    {/* =================================================
                        SCENES
                    ================================================= */}

                    {activeTab === 'scenes' ? (
                        <View style={styles.sceneList}>
                            {scenes.map((scene) => (
                                <SceneCard
                                    key={scene.id}
                                    scene={scene}
                                    onEdit={() =>
                                        handleEditScene(scene.id)
                                    }
                                    onRegenerate={() =>
                                        handleRegenerateScene(
                                            scene.id
                                        )
                                    }
                                />
                            ))}
                        </View>
                    ) : (
                        <View style={styles.timelinePlaceholder}>

                            <MaterialCommunityIcons
                                name="timeline-outline"
                                size={42}
                                color="#00E5D0"
                            />

                            <Text style={styles.timelineTitle}>
                                Timeline View
                            </Text>

                            <Text style={styles.timelineDescription}>
                                Timeline editing will be available
                                here.
                            </Text>

                        </View>
                    )}

                    {/* Bottom spacer */}
                    <View style={styles.bottomSpacer} />

                </ScrollView>

                {/* =================================================
                    FIXED FOOTER
                ================================================= */}

                <View style={styles.fixedFooter}>

                    {/* Summary Card */}
                    <View style={styles.summaryCard}>

                        {/* Duration */}
                        <View style={styles.summaryItem}>

                            <View style={styles.summaryIconCircle}>
                                <Icon
                                    name="clock"
                                    size={22}
                                    color="#00E5D0"
                                />
                            </View>

                            <View style={styles.summaryText}>
                                <Text style={styles.summaryLabel}>
                                    Total Duration
                                </Text>

                                <Text style={styles.summaryValue}>
                                    60 sec
                                </Text>
                            </View>

                        </View>

                        <View style={styles.summaryDivider} />

                        {/* Cost */}
                        <View style={styles.summaryItem}>

                            <Image
                                source={require('../../assets/coin.png')}
                                style={styles.summaryCoin}
                            />

                            <View style={styles.summaryText}>
                                <Text style={styles.summaryLabel}>
                                    Estimated Cost
                                </Text>

                                <Text
                                    style={[
                                        styles.summaryValue,
                                        styles.costValue,
                                    ]}
                                >
                                    220 credits
                                </Text>
                            </View>

                            <TouchableOpacity
                                style={styles.infoButton}
                                activeOpacity={0.7}
                            >
                                <Icon
                                    name="info"
                                    size={17}
                                    color="#AFC0D4"
                                />
                            </TouchableOpacity>

                        </View>

                    </View>

                    {/* Continue Button */}
                    <TouchableOpacity
                        style={styles.continueButton}
                        onPress={handleContinue}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.continueText}>
                            Continue to Generate Video
                        </Text>

                        <Icon
                            name="arrow-right"
                            size={28}
                            color="#00100E"
                        />
                    </TouchableOpacity>

                    {/* Privacy */}
                    <View style={styles.privacyRow}>

                        <Icon
                            name="lock"
                            size={15}
                            color="#AAB7C7"
                        />

                        <Text style={styles.privacyText}>
                            Your video will be private and secure
                        </Text>

                    </View>

                </View>

            </LinearGradient>
        </SafeAreaView>
    );
};

/* =========================================================
   META ITEM
========================================================= */

type MetaItemProps = {
    icon: React.ComponentProps<typeof Icon>['name'];
    text: string;
};

const MetaItem = ({ icon, text }: MetaItemProps) => {
    return (
        <View style={styles.metaItem}>

            <Icon
                name={icon}
                size={16}
                color="#AFC0D4"
            />

            <Text style={styles.metaText}>
                {text}
            </Text>

        </View>
    );
};

/* =========================================================
   SCENE CARD
========================================================= */

type SceneCardProps = {
    scene: {
        id: number;
        title: string;
        description: string;
        duration: string;
        image: any;
    };
    onEdit: () => void;
    onRegenerate: () => void;
};

const SceneCard = ({
    scene,
    onEdit,
    onRegenerate,
}: SceneCardProps) => {
    return (
        <View style={styles.sceneCard}>

            {/* Drag Handle */}
            <View style={styles.dragHandle}>
                <View style={styles.dragDot} />
                <View style={styles.dragDot} />
                <View style={styles.dragDot} />
            </View>

            {/* Scene Image */}
            <View style={styles.sceneImageContainer}>

                <Image
                    source={scene.image}
                    style={styles.sceneImage}
                />

                {/* Number */}
                <View style={styles.sceneNumber}>
                    <Text style={styles.sceneNumberText}>
                        {scene.id}
                    </Text>
                </View>

                {/* Duration */}
                <View style={styles.durationBadge}>
                    <Text style={styles.durationText}>
                        {scene.duration}
                    </Text>
                </View>

            </View>

            {/* Scene Content */}
            <View style={styles.sceneContent}>

                <View style={styles.sceneTitleRow}>

                    <Text
                        style={styles.sceneTitle}
                        numberOfLines={1}
                    >
                        {scene.title}
                    </Text>

                    <TouchableOpacity
                        style={styles.sceneEditIcon}
                        onPress={onEdit}
                        activeOpacity={0.7}
                    >
                        <Icon
                            name="edit-2"
                            size={16}
                            color="#AFC0D4"
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.moreButton}
                        activeOpacity={0.7}
                    >
                        <Icon
                            name="more-vertical"
                            size={20}
                            color="#AFC0D4"
                        />
                    </TouchableOpacity>

                </View>

                <Text
                    style={styles.sceneDescription}
                    numberOfLines={2}
                >
                    {scene.description}
                </Text>

                {/* Actions */}
                <View style={styles.sceneActions}>

                    <TouchableOpacity
                        style={styles.sceneActionButton}
                        onPress={onEdit}
                        activeOpacity={0.75}
                    >
                        <Icon
                            name="edit-2"
                            size={15}
                            color="#C9D4E2"
                        />

                        <Text style={styles.sceneActionText}>
                            Edit
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.sceneActionButton}
                        onPress={onRegenerate}
                        activeOpacity={0.75}
                    >
                        <MaterialCommunityIcons
                            name="creation"
                            size={17}
                            color="#00E5D0"
                        />

                        <Text style={styles.sceneActionText}>
                            Regenerate
                        </Text>
                    </TouchableOpacity>

                </View>

            </View>

        </View>
    );
};

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({

    /* =====================================================
       BASE
    ===================================================== */

    safeArea: {
        flex: 1,
        backgroundColor: '#020A12',
    },

    container: {
        flex: 1,
    },

    /* =====================================================
       HEADER
    ===================================================== */

    header: {
        paddingHorizontal: 20,
        paddingTop: 7,
        paddingBottom: 12,
    },

    headerTopRow: {
        height: 42,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    backButton: {
        width: 42,
        height: 42,
        alignItems: 'flex-start',
        justifyContent: 'center',
    },

    creditsPill: {
        height: 40,
        minWidth: 143,
        paddingHorizontal: 11,
        borderRadius: 22,
        borderWidth: 1.3,
        borderColor: '#00E5D0',
        backgroundColor: 'rgba(0,229,208,0.035)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },

    coinIcon: {
        width: 19,
        height: 19,
        resizeMode: 'contain',
    },

    creditsText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
        marginHorizontal: 7,
    },

    creditPlus: {
        width: 22,
        height: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },

    headerTitleContainer: {
        alignItems: 'center',
        paddingHorizontal: 42,
        marginTop: 8,
    },

    headerTitle: {
        color: '#FFFFFF',
        fontSize: 21,
        lineHeight: 26,
        fontWeight: '700',
        textAlign: 'center',
    },

    headerSubtitle: {
        color: '#AEBBCC',
        fontSize: 12.5,
        lineHeight: 18,
        textAlign: 'center',
        marginTop: 4,
    },

    /* =====================================================
       SCROLL
    ===================================================== */

    scrollView: {
        flex: 1,
    },

    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 2,

        /*
         * The footer is fixed, so we need enough space
         * at the bottom for the last scene to scroll above it.
         */
        paddingBottom: 250,
    },

    /* =====================================================
       STORY CARD
    ===================================================== */

    storyCard: {
        minHeight: 165,
        flexDirection: 'row',
        backgroundColor: '#071521',
        borderRadius: 17,
        borderWidth: 1,
        borderColor: '#16344E',
        padding: 14,
        marginBottom: 18,
    },

    storyThumbnail: {
        width: 132,
        height: 132,
        borderRadius: 11,
        resizeMode: 'cover',
    },

    storyContent: {
        flex: 1,
        marginLeft: 14,
        minWidth: 0,
    },

    storyTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        minWidth: 0,
    },

    storyTitleArea: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        minWidth: 0,
    },

    storyTitle: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 17,
        lineHeight: 22,
        fontWeight: '700',
    },

    smallEditButton: {
        marginLeft: 7,
        padding: 2,
    },

    editIdeaButton: {
        marginLeft: 8,
        paddingHorizontal: 13,
        height: 38,
        borderRadius: 9,
        borderWidth: 1,
        borderColor: '#1B3C56',
        alignItems: 'center',
        justifyContent: 'center',
    },

    editIdeaText: {
        color: '#E4EBF4',
        fontSize: 12.5,
        fontWeight: '600',
    },

    storyDescription: {
        color: '#AAB7C7',
        fontSize: 13,
        lineHeight: 19,
        marginTop: 8,
    },

    storyMeta: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        marginTop: 11,
    },

    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 12,
        marginBottom: 4,
    },

    metaText: {
        color: '#AAB7C7',
        fontSize: 11.5,
        marginLeft: 5,
    },

    /* =====================================================
       TABS
    ===================================================== */

    tabsContainer: {
        height: 59,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#15354E',
        backgroundColor: '#071521',
        flexDirection: 'row',
        marginBottom: 17,
        overflow: 'hidden',
    },

    tab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        position: 'relative',
    },

    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#00E5D0',
    },

    tabText: {
        color: '#AAB7C7',
        fontSize: 15,
        fontWeight: '500',
        marginLeft: 7,
    },

    activeTabText: {
        color: '#00E5D0',
        fontWeight: '600',
    },

    /* =====================================================
       ACTIONS
    ===================================================== */

    actionRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginBottom: 17,
    },

    regenerateAllButton: {
        height: 47,
        paddingHorizontal: 17,
        borderRadius: 11,
        borderWidth: 1,
        borderColor: '#1A3C55',
        backgroundColor: '#071521',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },

    regenerateAllText: {
        color: '#D6DFEA',
        fontSize: 13.5,
        fontWeight: '600',
        marginLeft: 8,
    },

    addSceneButton: {
        height: 47,
        paddingHorizontal: 17,
        borderRadius: 11,
        backgroundColor: '#00E5D0',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },

    addSceneText: {
        color: '#00100E',
        fontSize: 13.5,
        fontWeight: '700',
        marginLeft: 5,
    },

    /* =====================================================
       SCENES
    ===================================================== */

    sceneList: {
        width: '100%',
    },

    sceneCard: {
        minHeight: 163,
        borderRadius: 17,
        borderWidth: 1,
        borderColor: '#15354E',
        backgroundColor: '#071521',
        padding: 13,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 9,
    },

    dragHandle: {
        width: 23,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 4,
    },

    dragDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#7E91A7',
        marginVertical: 2,
    },

    sceneImageContainer: {
        width: 116,
        height: 91,
        borderRadius: 11,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#0C1B28',
    },

    sceneImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },

    sceneNumber: {
        position: 'absolute',
        top: 8,
        left: 8,
        width: 30,
        height: 30,
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: '#00E5D0',
        backgroundColor: '#071521',
        alignItems: 'center',
        justifyContent: 'center',
    },

    sceneNumberText: {
        color: '#00E5D0',
        fontSize: 15,
        fontWeight: '700',
    },

    durationBadge: {
        position: 'absolute',
        bottom: 7,
        right: 7,
        paddingHorizontal: 8,
        paddingVertical: 5,
        borderRadius: 7,
        backgroundColor: 'rgba(0,0,0,0.78)',
    },

    durationText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '600',
    },

    sceneContent: {
        flex: 1,
        marginLeft: 13,
        minWidth: 0,
        alignSelf: 'stretch',
        justifyContent: 'center',
    },

    sceneTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        minWidth: 0,
    },

    sceneTitle: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 16.5,
        lineHeight: 21,
        fontWeight: '700',
    },

    sceneEditIcon: {
        padding: 4,
        marginLeft: 4,
    },

    moreButton: {
        padding: 2,
        marginLeft: 2,
    },

    sceneDescription: {
        color: '#AAB7C7',
        fontSize: 12.5,
        lineHeight: 18,
        marginTop: 6,
        marginBottom: 11,
    },

    sceneActions: {
        flexDirection: 'row',
    },

    sceneActionButton: {
        height: 39,
        paddingHorizontal: 13,
        borderRadius: 9,
        borderWidth: 1,
        borderColor: '#1B3C56',
        backgroundColor: '#091925',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 9,
    },

    sceneActionText: {
        color: '#D5DFEA',
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 6,
    },

    /* =====================================================
       TIMELINE
    ===================================================== */

    timelinePlaceholder: {
        minHeight: 300,
        borderRadius: 17,
        borderWidth: 1,
        borderColor: '#15354E',
        backgroundColor: '#071521',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 30,
    },

    timelineTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
        marginTop: 12,
    },

    timelineDescription: {
        color: '#91A3B7',
        fontSize: 13,
        textAlign: 'center',
        marginTop: 7,
    },

    bottomSpacer: {
        height: 40,
    },

    /* =====================================================
       FIXED FOOTER
    ===================================================== */

    fixedFooter: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        paddingHorizontal: 20,
        paddingTop: 9,
        paddingBottom: 13,
        backgroundColor: '#020A12',
    },

    summaryCard: {
        height: 78,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#15354E',
        backgroundColor: '#071521',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 17,
        marginBottom: 10,
    },

    summaryItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        minWidth: 0,
    },

    summaryIconCircle: {
        width: 34,
        height: 34,
        alignItems: 'center',
        justifyContent: 'center',
    },

    summaryCoin: {
        width: 31,
        height: 31,
        resizeMode: 'contain',
    },

    summaryText: {
        marginLeft: 9,
        minWidth: 0,
    },

    summaryLabel: {
        color: '#AAB7C7',
        fontSize: 11.5,
    },

    summaryValue: {
        color: '#FFFFFF',
        fontSize: 17,
        lineHeight: 22,
        fontWeight: '700',
        marginTop: 2,
    },

    costValue: {
        color: '#00E5D0',
    },

    summaryDivider: {
        width: 1,
        height: 42,
        backgroundColor: '#1A344A',
        marginHorizontal: 12,
    },

    infoButton: {
        marginLeft: 5,
        width: 25,
        height: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },

    continueButton: {
        height: 59,
        borderRadius: 16,
        backgroundColor: '#00E5D0',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },

    continueText: {
        color: '#00100E',
        fontSize: 17,
        fontWeight: '800',
        marginRight: 18,
    },

    privacyRow: {
        height: 28,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },

    privacyText: {
        color: '#9BAABC',
        fontSize: 11.5,
        marginLeft: 7,
    },
});

export default ReviewEditScenesScreen;