export type QrScanFacingMode = 'environment' | 'user';

export interface QrScanOptions {
    video: HTMLVideoElement;
    facingMode?: QrScanFacingMode;
    deviceId?: string;
    onResult: (value: string) => void;
    onError?: (error: Error) => void;
    formats?: string[];
    scanIntervalMs?: number;
    onReady?: (track: MediaStreamTrack) => void;
    continuous?: boolean;
}

export interface QrScanController {
    stop: () => void;
    setTorch: (enabled: boolean) => Promise<boolean>;
    isTorchSupported: () => boolean;
    getStream: () => MediaStream | null;
}

interface BarcodeDetectorLike {
    detect: (source: CanvasImageSource) => Promise<Array<{ rawValue: string; format: string }>>;
}

interface BarcodeDetectorConstructor {
    new (options?: { formats?: string[] }): BarcodeDetectorLike;
}

interface MediaTrackCapabilitiesWithTorch extends MediaTrackCapabilities {
    torch?: boolean;
}

interface MediaTrackConstraintSetWithTorch extends MediaTrackConstraintSet {
    torch?: boolean;
}

const getBarcodeDetector = (): BarcodeDetectorConstructor | null => {
    if (typeof window === 'undefined') return null;
    const ctor = (window as unknown as { BarcodeDetector?: BarcodeDetectorConstructor }).BarcodeDetector;
    return ctor ?? null;
};

export const isQrScanSupported = (): boolean => getBarcodeDetector() !== null;

export const isCameraAvailable = (): boolean =>
    typeof navigator !== 'undefined' && typeof navigator.mediaDevices !== 'undefined' && typeof navigator.mediaDevices.getUserMedia === 'function';

export const listVideoInputDevices = async (): Promise<MediaDeviceInfo[]> => {
    if (!isCameraAvailable() || typeof navigator.mediaDevices.enumerateDevices !== 'function') return [];
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter((device) => device.kind === 'videoinput');
};

const stopStream = (stream: MediaStream | null) => {
    if (!stream) return;
    stream.getTracks().forEach((track) => {
        try {
            track.stop();
        } catch {
            // ignore
        }
    });
};

export const startQrScan = async (options: QrScanOptions): Promise<QrScanController> => {
    const { video, facingMode = 'environment', deviceId, onResult, onError, formats = ['qr_code'], scanIntervalMs = 200, onReady, continuous = false } = options;

    const Detector = getBarcodeDetector();
    if (!Detector) {
        throw new Error('QR scanning is not supported in this browser. BarcodeDetector API is unavailable.');
    }
    if (!isCameraAvailable()) {
        throw new Error('Camera access is not available in this environment. A secure HTTPS context is required.');
    }

    const constraints: MediaStreamConstraints = {
        video: deviceId ? { deviceId: { exact: deviceId } } : { facingMode: { ideal: facingMode } },
        audio: false,
    };

    let stream: MediaStream;
    try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
    } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        throw error;
    }

    const track = stream.getVideoTracks()[0] ?? null;

    video.srcObject = stream;
    video.setAttribute('playsinline', 'true');
    video.setAttribute('muted', 'true');
    video.muted = true;
    try {
        await video.play();
    } catch (err) {
        stopStream(stream);
        const error = err instanceof Error ? err : new Error(String(err));
        throw error;
    }

    if (track && onReady) {
        try {
            onReady(track);
        } catch {
            // ignore consumer errors
        }
    }

    const detector = new Detector({ formats });
    let stopped = false;
    let timer: number | null = null;
    let lastValue: string | null = null;
    let lastValueAt = 0;

    const tick = async () => {
        if (stopped) return;
        if (video.readyState >= 2 && video.videoWidth > 0) {
            try {
                const results = await detector.detect(video);
                if (results.length > 0) {
                    const value = results[0].rawValue;
                    const now = Date.now();
                    const isDuplicate = continuous && value === lastValue && now - lastValueAt < 1500;
                    if (!isDuplicate) {
                        lastValue = value;
                        lastValueAt = now;
                        try {
                            onResult(value);
                        } catch {
                            // ignore consumer errors
                        }
                        if (!continuous) {
                            stop();
                            return;
                        }
                    }
                }
            } catch (err) {
                if (onError) onError(err instanceof Error ? err : new Error(String(err)));
            }
        }
        timer = window.setTimeout(tick, scanIntervalMs);
    };

    const stop = () => {
        if (stopped) return;
        stopped = true;
        if (timer !== null) {
            window.clearTimeout(timer);
            timer = null;
        }
        stopStream(stream);
        try {
            video.srcObject = null;
        } catch {
            // ignore
        }
    };

    const setTorch = async (enabled: boolean): Promise<boolean> => {
        if (!track) return false;
        const capabilities = track.getCapabilities() as MediaTrackCapabilitiesWithTorch;
        if (!capabilities.torch) return false;
        const advanced: MediaTrackConstraintSetWithTorch[] = [{ torch: enabled }];
        try {
            await track.applyConstraints({ advanced });
            return true;
        } catch {
            return false;
        }
    };

    const isTorchSupported = (): boolean => {
        if (!track) return false;
        const capabilities = track.getCapabilities() as MediaTrackCapabilitiesWithTorch;
        return Boolean(capabilities.torch);
    };

    timer = window.setTimeout(tick, scanIntervalMs);

    return {
        stop,
        setTorch,
        isTorchSupported,
        getStream: () => stream,
    };
};

export const scanQrCodeOnce = (options: Omit<QrScanOptions, 'onResult' | 'onError' | 'continuous'>): Promise<string> =>
    new Promise<string>((resolve, reject) => {
        let controller: QrScanController | null = null;
        startQrScan({
            ...options,
            continuous: false,
            onResult: (value) => {
                resolve(value);
                controller?.stop();
            },
            onError: (err) => {
                reject(err);
                controller?.stop();
            },
        })
            .then((c) => {
                controller = c;
            })
            .catch((err) => reject(err instanceof Error ? err : new Error(String(err))));
    });
