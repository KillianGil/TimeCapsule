import React, { useState, useEffect, useRef, Suspense, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions, Animated as RNAnimated, Pressable } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { DeviceMotion } from 'expo-sensors';
import { Canvas, useFrame, useThree, ThreeEvent } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Lock, Sparkles, Search } from 'lucide-react-native';
import { Asset } from 'expo-asset';
import { SkeletonUtils } from 'three-stdlib';

const { height } = Dimensions.get('window');

const MODEL_PATH = require('../../assets/geocaching_capsules.glb');

// --- GYROSCOPE CAMERA ---
function GyroCamera({ rotation, isLocked }: { rotation: { beta: number; gamma: number }; isLocked: boolean }) {
    const { camera } = useThree();

    useFrame(() => {
        // Quand locked (capsule trouvée), la caméra revient doucement au centre
        const targetX = isLocked ? 0 : rotation.beta * 0.6;
        const targetY = isLocked ? 0 : rotation.gamma * 0.6;
        // Interpolation plus fluide
        const speed = isLocked ? 0.06 : 0.08;
        camera.rotation.x = THREE.MathUtils.lerp(camera.rotation.x, targetX, speed);
        camera.rotation.y = THREE.MathUtils.lerp(camera.rotation.y, targetY, speed);
    });

    return null;
}

// --- GLB CAPSULE MODEL ---
interface CapsuleModelProps {
    position: [number, number, number];
    isUnlocked: boolean;
    onTap: () => void;
    shouldOpen: boolean;
    onOpenComplete: () => void;
    modelUri: string;
}

function CapsuleModel({ position, isUnlocked, onTap, shouldOpen, onOpenComplete, onReady, visible = true, modelUri }: CapsuleModelProps & { onReady?: () => void; visible?: boolean }) {
    const groupRef = useRef<THREE.Group>(null!);
    const { camera } = useThree();
    const { scene, animations } = useGLTF(modelUri);
    const hasCalledReady = useRef(false);
    const { actions, names } = useAnimations(animations, groupRef);
    const [hasTriggeredComplete, setHasTriggeredComplete] = useState(false);
    const [currentScale, setCurrentScale] = useState(visible ? 0.08 : 0);

    // Animer l'apparition de la capsule
    useEffect(() => {
        if (visible && currentScale === 0) {
            // Apparition progressive
            let scale = 0;
            const interval = setInterval(() => {
                scale += 0.008;
                if (scale >= 0.08) {
                    scale = 0.08;
                    clearInterval(interval);
                }
                setCurrentScale(scale);
            }, 16);
            return () => clearInterval(interval);
        }
    }, [visible]);

    const clonedScene = useMemo(() => {
        const clone = SkeletonUtils.clone(scene);
        clone.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.material = child.material.clone();
                child.material.side = THREE.DoubleSide;
                child.frustumCulled = false;
            }
        });
        return clone;
    }, [scene]);

    // Signaler que le modèle est prêt
    useEffect(() => {
        if (clonedScene && !hasCalledReady.current) {
            hasCalledReady.current = true;
            onReady?.();
        }
    }, [clonedScene, onReady]);

    // Animation d'ouverture
    useEffect(() => {
        if (shouldOpen && names.length > 0) {
            const openAnimName = names.find(n =>
                n.toLowerCase().includes('open') ||
                n.toLowerCase().includes('ouvrir')
            ) || names[0];

            const action = actions[openAnimName];
            if (action) {
                action.setLoop(THREE.LoopOnce, 1);
                action.clampWhenFinished = true;
                action.timeScale = 0.5; // Plus lent = plus fluide
                action.reset().play();

                const duration = (action.getClip().duration / 0.5) * 1000;
                const stopAt = duration * 0.45;

                setTimeout(() => {
                    action.paused = true;
                }, stopAt);

                setTimeout(() => {
                    if (!hasTriggeredComplete) {
                        setHasTriggeredComplete(true);
                        onOpenComplete();
                    }
                }, stopAt + 600);
            }
        }
    }, [shouldOpen, names, actions]);

    // Animation idle - la capsule suit la caméra
    useFrame((state) => {
        if (!groupRef.current) return;
        const t = state.clock.elapsedTime;

        // Calculer la position devant la caméra
        const distance = 2; // Distance devant la caméra
        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyQuaternion(camera.quaternion);

        // Position cible devant la caméra
        const targetX = camera.position.x + direction.x * distance;
        const targetY = camera.position.y + direction.y * distance + Math.sin(t * 0.6) * 0.04;
        const targetZ = camera.position.z + direction.z * distance;

        // Interpolation fluide vers la position cible
        groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.1);
        groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.1);
        groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, 0.1);

        // Rotation idle seulement si pas en ouverture
        if (!shouldOpen) {
            groupRef.current.rotation.y += 0.002;
        }
    });

    const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        onTap();
    };

    return (
        <group ref={groupRef} position={position} scale={currentScale}>
            <primitive object={clonedScene} />
            <mesh onPointerDown={handlePointerDown} onClick={handlePointerDown as any}>
                <boxGeometry args={[12, 15, 12]} />
                <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>
            <pointLight
                position={[0, 0, 0]}
                color={isUnlocked ? '#FFD700' : '#FF6B35'}
                intensity={isUnlocked ? 2 : 1}
                distance={4}
            />
        </group>
    );
}

// --- FALLBACK CAPSULE ---
function FallbackCapsule({ position, isUnlocked, onTap, shouldOpen, onOpenComplete, visible = true }: CapsuleModelProps & { visible?: boolean }) {
    const groupRef = useRef<THREE.Group>(null!);
    const lidRef = useRef<THREE.Group>(null!);
    const { camera } = useThree();
    const [openProgress, setOpenProgress] = useState(0);
    const [currentScale, setCurrentScale] = useState(visible ? 1 : 0);

    // Animer l'apparition
    useEffect(() => {
        if (visible && currentScale === 0) {
            let scale = 0;
            const interval = setInterval(() => {
                scale += 0.1;
                if (scale >= 1) {
                    scale = 1;
                    clearInterval(interval);
                }
                setCurrentScale(scale);
            }, 16);
            return () => clearInterval(interval);
        }
    }, [visible]);

    useEffect(() => {
        if (!shouldOpen) return;
        const interval = setInterval(() => {
            setOpenProgress(p => {
                if (p >= 1) {
                    clearInterval(interval);
                    setTimeout(onOpenComplete, 300);
                    return 1;
                }
                return p + 0.03;
            });
        }, 16);
        return () => clearInterval(interval);
    }, [shouldOpen]);

    useFrame((state) => {
        if (!groupRef.current) return;
        const t = state.clock.elapsedTime;

        // Calculer la position devant la caméra
        const distance = 2;
        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyQuaternion(camera.quaternion);

        const targetX = camera.position.x + direction.x * distance;
        const targetY = camera.position.y + direction.y * distance + Math.sin(t * 0.6) * 0.04;
        const targetZ = camera.position.z + direction.z * distance;

        groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.1);
        groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.1);
        groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, 0.1);

        if (!shouldOpen) {
            groupRef.current.rotation.y += 0.005;
        } else if (lidRef.current) {
            const ease = 1 - Math.pow(1 - openProgress, 3);
            lidRef.current.rotation.x = -ease * 2;
            lidRef.current.position.y = 0.6 + ease * 0.4;
        }
    });

    return (
        <group ref={groupRef} position={position} scale={currentScale} onClick={(e: any) => { e.stopPropagation(); onTap(); }}>
            <pointLight position={[0, 0, 0]} color={isUnlocked ? '#FFD700' : '#FF6B35'} intensity={1.5} distance={3} />
            <mesh>
                <cylinderGeometry args={[0.4, 0.45, 0.8, 32]} />
                <meshStandardMaterial color={isUnlocked ? '#D4AF37' : '#B8860B'} metalness={0.8} roughness={0.2} />
            </mesh>
            <group ref={lidRef} position={[0, 0.6, 0]}>
                <mesh>
                    <sphereGeometry args={[0.4, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
                    <meshStandardMaterial color={isUnlocked ? '#FFD700' : '#CD853F'} metalness={0.8} roughness={0.2} />
                </mesh>
            </group>
            {shouldOpen && openProgress > 0.3 && (
                <pointLight position={[0, 0.3, 0]} color="#FFFFFF" intensity={openProgress * 8} distance={2} />
            )}
        </group>
    );
}

// --- SCENE ---
function Scene({ capsulePosition, deviceRotation, isUnlocked, shouldOpen, onTap, onOpenComplete, useGLBModel, capsuleVisible, onModelReady, modelUri }: {
    capsulePosition: [number, number, number];
    deviceRotation: { beta: number; gamma: number };
    isUnlocked: boolean;
    shouldOpen: boolean;
    onTap: () => void;
    onOpenComplete: () => void;
    useGLBModel: boolean;
    capsuleVisible: boolean;
    onModelReady: () => void;
    modelUri: string;
}) {
    // Si on utilise le fallback, signaler prêt immédiatement
    useEffect(() => {
        if (!useGLBModel) {
            onModelReady();
        }
    }, [useGLBModel, onModelReady]);

    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight position={[5, 5, 5]} intensity={1} color="#FFF8DC" />
            <pointLight position={[-3, 3, -3]} intensity={0.6} color="#FFD700" />
            <directionalLight position={[0, 8, 5]} intensity={0.7} />
            <GyroCamera rotation={deviceRotation} isLocked={shouldOpen} />
            <Suspense fallback={null}>
                {useGLBModel && modelUri ? (
                    <CapsuleModel
                        position={capsulePosition}
                        isUnlocked={isUnlocked}
                        onTap={capsuleVisible ? onTap : () => { }}
                        shouldOpen={shouldOpen}
                        onOpenComplete={onOpenComplete}
                        onReady={onModelReady}
                        visible={capsuleVisible}
                        modelUri={modelUri}
                    />
                ) : (
                    <FallbackCapsule
                        position={capsulePosition}
                        isUnlocked={isUnlocked}
                        onTap={capsuleVisible ? onTap : () => { }}
                        shouldOpen={shouldOpen}
                        onOpenComplete={onOpenComplete}
                        visible={capsuleVisible}
                    />
                )}
            </Suspense>
        </>
    );
}

// --- MAIN ---
export default function ARMode() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [permission, requestPermission] = useCameraPermissions();

    const getParam = (key: string) => {
        const v = params[key];
        return Array.isArray(v) ? v[0] : (v || '');
    };

    const isUnlocked = getParam('isUnlocked') === 'true';
    const isOpened = getParam('isOpened') === 'true';
    const unlockDate = getParam('unlockDate') || new Date().toISOString();
    const senderName = getParam('senderName') || 'Inconnu';
    const title = getParam('title') || 'Capsule temporelle';
    const capsuleId = getParam('capsuleId');

    const capsulePosition: [number, number, number] = [0, 0, -2];

    const [deviceRotation, setDeviceRotation] = useState({ beta: 0, gamma: 0 });
    const [shouldOpen, setShouldOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [showMessage, setShowMessage] = useState(false);
    const [fadeOut, setFadeOut] = useState(false);
    const [useGLBModel, setUseGLBModel] = useState(false);
    const [modelUri, setModelUri] = useState<string>('');
    const [isSearching, setIsSearching] = useState(true);
    const [capsuleVisible, setCapsuleVisible] = useState(false);
    const [modelReady, setModelReady] = useState(false);

    const fadeAnim = useRef(new RNAnimated.Value(0)).current;
    const msgAnim = useRef(new RNAnimated.Value(0)).current;
    const searchAnim = useRef(new RNAnimated.Value(1)).current;
    const calibrationRef = useRef<{ beta: number; gamma: number } | null>(null);
    const pulseRef = useRef<RNAnimated.CompositeAnimation | null>(null);
    const minSearchTimeRef = useRef(false);

    // Charger le modèle GLB de manière asynchrone
    useEffect(() => {
        const loadAsset = async () => {
            try {
                const asset = Asset.fromModule(MODEL_PATH);
                await asset.downloadAsync();
                if (asset.localUri) {
                    setModelUri(asset.localUri);
                    setUseGLBModel(true);
                } else {
                    setUseGLBModel(false);
                    setModelReady(true);
                }
            } catch {
                setUseGLBModel(false);
                setModelReady(true);
            }
        };
        loadAsset();
    }, []);

    // Callback quand le modèle 3D est prêt
    const handleModelReady = () => {
        if (!modelReady) {
            setModelReady(true);
        }
    };

    // Effet de recherche au démarrage
    useEffect(() => {
        // Animation de pulsation pendant la recherche
        const pulse = RNAnimated.loop(
            RNAnimated.sequence([
                RNAnimated.timing(searchAnim, { toValue: 0.5, duration: 600, useNativeDriver: true }),
                RNAnimated.timing(searchAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
            ])
        );
        pulseRef.current = pulse;
        pulse.start();

        // Minimum 2 secondes de recherche pour l'effet
        setTimeout(() => {
            minSearchTimeRef.current = true;
        }, 2000);

        return () => {
            pulse.stop();
        };
    }, []);

    // Terminer la recherche quand le modèle est prêt ET le temps minimum est passé
    useEffect(() => {
        if (!modelReady || !minSearchTimeRef.current) {
            // Vérifier périodiquement si le temps minimum est passé
            const checkInterval = setInterval(() => {
                if (modelReady && minSearchTimeRef.current) {
                    clearInterval(checkInterval);
                    finishSearch();
                }
            }, 100);
            return () => clearInterval(checkInterval);
        } else {
            finishSearch();
        }

        function finishSearch() {
            RNAnimated.timing(searchAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start(() => {
                pulseRef.current?.stop();
                setIsSearching(false);
                setCapsuleVisible(true);
            });
        }
    }, [modelReady]);

    // Gyroscope - simple, calibre immédiatement
    useEffect(() => {
        DeviceMotion.setUpdateInterval(16);
        const sub = DeviceMotion.addListener((data) => {
            if (data.rotation) {
                const rawBeta = data.rotation.beta || 0;
                const rawGamma = data.rotation.gamma || 0;

                if (!calibrationRef.current) {
                    calibrationRef.current = { beta: rawBeta, gamma: rawGamma };
                }

                setDeviceRotation({
                    beta: rawBeta - calibrationRef.current.beta,
                    gamma: rawGamma - calibrationRef.current.gamma
                });
            }
        });
        return () => sub.remove();
    }, []);

    useEffect(() => {
        if (!permission?.granted) requestPermission();
    }, []);

    const showFeedback = (msg: string) => {
        setMessage(msg);
        setShowMessage(true);
        RNAnimated.sequence([
            RNAnimated.timing(msgAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
            RNAnimated.delay(1500),
            RNAnimated.timing(msgAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]).start(() => setShowMessage(false));
    };

    const handleTap = () => {
        if (shouldOpen) return;
        if (!isUnlocked) {
            showFeedback('Capsule verrouillée !');
        } else {
            setShouldOpen(true);
        }
    };

    const handleOpenComplete = () => {
        setFadeOut(true);
        RNAnimated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true
        }).start(() => {
            if (capsuleId) {
                router.replace({
                    pathname: `/dashboard/capsule/${capsuleId}`,
                    params: { autoOpen: 'true' }
                });
            } else {
                router.back();
            }
        });
    };

    const getHint = () => {
        if (isSearching) return 'Recherche en cours...';
        if (!isUnlocked) return 'Touchez la capsule';
        if (isOpened) return 'Touchez pour revoir';
        return 'Touchez pour ouvrir !';
    };

    if (!permission) return <View style={styles.container} />;

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.permText}>Permission caméra requise</Text>
                <TouchableOpacity onPress={requestPermission} style={styles.permBtn}>
                    <Text style={styles.permBtnText}>Autoriser</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.back()} style={[styles.permBtn, styles.permBtnBack]}>
                    <Text style={styles.permBtnText}>Retour</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CameraView style={StyleSheet.absoluteFill} facing="back" />

            <View style={styles.canvasContainer}>
                <Canvas camera={{ position: [0, 0, 0], fov: 60 }}>
                    <Scene
                        capsulePosition={capsulePosition}
                        deviceRotation={deviceRotation}
                        isUnlocked={isUnlocked}
                        shouldOpen={shouldOpen}
                        onTap={handleTap}
                        onOpenComplete={handleOpenComplete}
                        useGLBModel={useGLBModel}
                        capsuleVisible={capsuleVisible}
                        onModelReady={handleModelReady}
                        modelUri={modelUri}
                    />
                </Canvas>
            </View>

            {/* Zone de tap - seulement quand la capsule est visible */}
            {capsuleVisible && !shouldOpen && (
                <Pressable style={styles.tapOverlay} onPress={handleTap} />
            )}

            {/* Indicateur de recherche */}
            {isSearching && (
                <View style={styles.searchOverlay}>
                    <RNAnimated.View style={[styles.searchIndicator, { opacity: searchAnim, transform: [{ scale: searchAnim.interpolate({ inputRange: [0.3, 1], outputRange: [0.9, 1.1] }) }] }]}>
                        <Search color="#F4D35E" size={40} />
                    </RNAnimated.View>
                    <Text style={styles.searchText}>Recherche de la capsule...</Text>
                    <RNAnimated.View style={[styles.searchRing, { opacity: searchAnim, transform: [{ scale: searchAnim.interpolate({ inputRange: [0.3, 1], outputRange: [1, 1.5] }) }] }]} />
                </View>
            )}

            <View style={styles.ui} pointerEvents="box-none">
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <ArrowLeft color="#fff" size={24} />
                    </TouchableOpacity>
                    <View style={styles.badge}>
                        {isUnlocked ? <Sparkles color="#F4D35E" size={16} /> : <Lock color="#FF6B35" size={16} />}
                        <Text style={styles.badgeText} numberOfLines={1}>
                            {isUnlocked ? title : `De ${senderName}`}
                        </Text>
                    </View>
                </View>

                {/* Message */}
                {showMessage && (
                    <RNAnimated.View style={[styles.msgBox, { opacity: msgAnim }]}>
                        <Text style={styles.msgText}>{message}</Text>
                    </RNAnimated.View>
                )}

                {/* Bottom */}
                <View style={styles.bottom}>
                    {!isUnlocked && <CountdownDisplay unlockDate={unlockDate} />}
                    <View style={styles.hintBox}>
                        <Text style={styles.hintText}>{getHint()}</Text>
                    </View>
                </View>
            </View>

            {fadeOut && (
                <RNAnimated.View style={[styles.fadeOverlay, { opacity: fadeAnim }]} />
            )}
        </View>
    );
}

// --- COUNTDOWN ---
function CountdownDisplay({ unlockDate }: { unlockDate: string }) {
    const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const update = () => {
            const diff = Math.max(0, new Date(unlockDate).getTime() - Date.now());
            setCountdown({
                days: Math.floor(diff / 86400000),
                hours: Math.floor((diff % 86400000) / 3600000),
                minutes: Math.floor((diff % 3600000) / 60000),
                seconds: Math.floor((diff % 60000) / 1000)
            });
        };
        update();
        const i = setInterval(update, 1000);
        return () => clearInterval(i);
    }, [unlockDate]);

    return (
        <View style={styles.countdownBox}>
            <Text style={styles.countdownTitle}>Ouverture dans</Text>
            <View style={styles.countdownRow}>
                {[
                    { v: countdown.days, l: 'J' },
                    { v: countdown.hours, l: 'H' },
                    { v: countdown.minutes, l: 'M' },
                    { v: countdown.seconds, l: 'S' },
                ].map((item, i) => (
                    <View key={item.l} style={styles.countdownItemRow}>
                        {i > 0 && <Text style={styles.countdownSep}>:</Text>}
                        <View style={styles.countdownItem}>
                            <Text style={styles.countdownNum}>{String(item.v).padStart(2, '0')}</Text>
                            <Text style={styles.countdownLbl}>{item.l}</Text>
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    canvasContainer: {
        ...StyleSheet.absoluteFillObject,
    },
    tapOverlay: {
        position: 'absolute',
        top: '15%',
        left: '5%',
        right: '5%',
        bottom: '20%',
        backgroundColor: 'transparent',
    },
    ui: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'space-between',
        paddingTop: 60,
        paddingBottom: 40,
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    badge: {
        flex: 1,
        marginLeft: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 20,
    },
    badgeText: {
        color: '#F4D35E',
        fontWeight: '600',
        fontSize: 14,
        flex: 1,
    },
    msgBox: {
        position: 'absolute',
        top: height * 0.3,
        left: 30,
        right: 30,
        alignItems: 'center',
    },
    msgText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        backgroundColor: 'rgba(255,107,53,0.9)',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 10,
        overflow: 'hidden',
    },
    bottom: {
        gap: 12,
    },
    countdownBox: {
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
        borderRadius: 14,
        padding: 12,
    },
    countdownTitle: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 11,
        marginBottom: 6,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    countdownRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    countdownItemRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    countdownItem: {
        alignItems: 'center',
        minWidth: 40,
    },
    countdownNum: {
        color: '#FF6B35',
        fontSize: 22,
        fontWeight: '700',
    },
    countdownLbl: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 9,
    },
    countdownSep: {
        color: '#FF6B35',
        fontSize: 18,
        marginHorizontal: 2,
    },
    hintBox: {
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 16,
    },
    hintText: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 14,
        fontWeight: '500',
    },
    fadeOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#fff',
    },
    permText: {
        color: '#fff',
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
        paddingHorizontal: 40,
    },
    permBtn: {
        paddingHorizontal: 30,
        paddingVertical: 14,
        backgroundColor: '#F4D35E',
        borderRadius: 12,
    },
    permBtnBack: {
        marginTop: 10,
        backgroundColor: '#333',
    },
    permBtnText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 16,
    },
    searchOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchIndicator: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchText: {
        color: '#F4D35E',
        fontSize: 16,
        fontWeight: '600',
        marginTop: 20,
        textShadowColor: 'rgba(0,0,0,0.8)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    searchRing: {
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 2,
        borderColor: 'rgba(244, 211, 94, 0.4)',
    },
});