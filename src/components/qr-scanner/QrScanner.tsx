import classNames from 'classnames';
import React, { useCallback, useEffect, useId, useImperativeHandle, useMemo, useRef, useState, forwardRef } from 'react';
import { CameraIcon, CameraSwitchIcon, FlashOffIcon, FlashOnIcon, QrScanIcon } from '../../assets/icons';
import {
    isCameraAvailable,
    isQrScanSupported,
    listVideoInputDevices,
    startQrScan,
} from '../../utils/qr-scanner';
import type { QrScanController, QrScanFacingMode } from '../../utils/qr-scanner';
import '../eui-base.scss';
import './QrScanner.scss';

export type QrScannerStatus = 'idle' | 'requesting' | 'scanning' | 'denied' | 'unsupported' | 'error';

export interface QrScannerProps {
    onScan: (value: string) => void;
    onError?: (error: Error) => void;
    facingMode?: QrScanFacingMode;
    formats?: string[];
    continuous?: boolean;
    autoStart?: boolean;
    showTorchToggle?: boolean;
    showCameraSwitch?: boolean;
    overlay?: 'frame' | 'mask' | 'none';
    width?: number | string;
    height?: number | string;
    aspectRatio?: number;
    scanIntervalMs?: number;
    pauseAfterScan?: boolean;
    unsupportedMessage?: React.ReactNode;
    deniedMessage?: React.ReactNode;
    startLabel?: React.ReactNode;
    id?: string;
    className?: string;
    ariaLabel?: string;
}

export interface QrScannerHandle {
    start: () => Promise<void>;
    stop: () => void;
    getStatus: () => QrScannerStatus;
}

const QrScanner = forwardRef<QrScannerHandle, QrScannerProps>(
    (
        {
            onScan,
            onError,
            facingMode = 'environment',
            formats = ['qr_code'],
            continuous = false,
            autoStart = false,
            showTorchToggle = true,
            showCameraSwitch = true,
            overlay = 'mask',
            width = '100%',
            height,
            aspectRatio = 1,
            scanIntervalMs = 200,
            pauseAfterScan = true,
            unsupportedMessage,
            deniedMessage,
            startLabel,
            id,
            className,
            ariaLabel = 'QR code scanner',
        },
        ref,
    ) => {
        const generatedId = useId();
        const elementId = id ?? `qr-scanner-${generatedId}`;
        const videoRef = useRef<HTMLVideoElement | null>(null);
        const controllerRef = useRef<QrScanController | null>(null);
        const onScanRef = useRef(onScan);
        const onErrorRef = useRef(onError);
        onScanRef.current = onScan;
        onErrorRef.current = onError;

        const [status, setStatus] = useState<QrScannerStatus>('idle');
        const [errorMessage, setErrorMessage] = useState<string | null>(null);
        const [activeFacingMode, setActiveFacingMode] = useState<QrScanFacingMode>(facingMode);
        const [torchOn, setTorchOn] = useState(false);
        const [torchSupported, setTorchSupported] = useState(false);
        const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

        const supported = useMemo(() => isQrScanSupported() && isCameraAvailable(), []);

        const stop = useCallback(() => {
            if (controllerRef.current) {
                controllerRef.current.stop();
                controllerRef.current = null;
            }
            setTorchOn(false);
            setTorchSupported(false);
        }, []);

        const start = useCallback(async () => {
            if (!supported) {
                setStatus('unsupported');
                return;
            }
            const video = videoRef.current;
            if (!video) return;
            if (controllerRef.current) return;

            setStatus('requesting');
            setErrorMessage(null);
            try {
                const controller = await startQrScan({
                    video,
                    facingMode: activeFacingMode,
                    formats,
                    continuous,
                    scanIntervalMs,
                    onReady: () => {
                        setTorchSupported(controller?.isTorchSupported() ?? false);
                    },
                    onResult: (value) => {
                        onScanRef.current(value);
                        if (!continuous && pauseAfterScan) {
                            stop();
                            setStatus('idle');
                        }
                    },
                    onError: (err) => {
                        if (onErrorRef.current) onErrorRef.current(err);
                    },
                });
                controllerRef.current = controller;
                setTorchSupported(controller.isTorchSupported());
                setStatus('scanning');
            } catch (err) {
                const error = err instanceof Error ? err : new Error(String(err));
                const name = (error as Error & { name?: string }).name;
                if (name === 'NotAllowedError' || name === 'SecurityError') {
                    setStatus('denied');
                } else if (name === 'NotFoundError' || name === 'OverconstrainedError') {
                    setStatus('error');
                    setErrorMessage('No suitable camera found.');
                } else {
                    setStatus('error');
                    setErrorMessage(error.message);
                }
                if (onErrorRef.current) onErrorRef.current(error);
            }
        }, [supported, activeFacingMode, formats, continuous, scanIntervalMs, pauseAfterScan, stop]);

        useImperativeHandle(
            ref,
            () => ({
                start,
                stop: () => {
                    stop();
                    setStatus('idle');
                },
                getStatus: () => status,
            }),
            [start, stop, status],
        );

        useEffect(() => {
            let cancelled = false;
            (async () => {
                try {
                    const devices = await listVideoInputDevices();
                    if (!cancelled) setHasMultipleCameras(devices.length > 1);
                } catch {
                    // ignore
                }
            })();
            return () => {
                cancelled = true;
            };
        }, []);

        useEffect(() => {
            if (autoStart && supported) {
                start();
            }
            return () => {
                stop();
            };
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []);

        useEffect(() => {
            if (status === 'scanning') {
                stop();
                setStatus('idle');
                start();
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [activeFacingMode]);

        const toggleTorch = useCallback(async () => {
            if (!controllerRef.current) return;
            const next = !torchOn;
            const ok = await controllerRef.current.setTorch(next);
            if (ok) setTorchOn(next);
        }, [torchOn]);

        const switchCamera = useCallback(() => {
            setActiveFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
        }, []);

        const containerStyle: React.CSSProperties = {
            width,
            ...(height !== undefined ? { height } : { aspectRatio: String(aspectRatio) }),
        };

        const isScanning = status === 'scanning';
        const showStartButton = status === 'idle' && supported;

        return (
            <div id={elementId} className={classNames('eui-qr-scanner', className)} style={containerStyle} role="region" aria-label={ariaLabel}>
                <video ref={videoRef} className="eui-qr-scanner-video" playsInline muted aria-hidden={!isScanning} />

                {overlay !== 'none' && isScanning && (
                    <div className={classNames('eui-qr-scanner-overlay', `eui-qr-scanner-overlay-${overlay}`)} aria-hidden="true">
                        <div className="eui-qr-scanner-frame">
                            <span className="eui-qr-scanner-corner eui-qr-scanner-corner-tl" />
                            <span className="eui-qr-scanner-corner eui-qr-scanner-corner-tr" />
                            <span className="eui-qr-scanner-corner eui-qr-scanner-corner-bl" />
                            <span className="eui-qr-scanner-corner eui-qr-scanner-corner-br" />
                            <span className="eui-qr-scanner-scanline" />
                        </div>
                    </div>
                )}

                {isScanning && (
                    <div className="eui-qr-scanner-controls" role="toolbar" aria-label="Scanner controls">
                        {showCameraSwitch && hasMultipleCameras && (
                            <button
                                type="button"
                                className="eui-qr-scanner-control"
                                onClick={switchCamera}
                                aria-label="Switch camera"
                                title="Switch camera"
                            >
                                <CameraSwitchIcon width={18} height={18} />
                            </button>
                        )}
                        {showTorchToggle && torchSupported && (
                            <button
                                type="button"
                                className={classNames('eui-qr-scanner-control', { 'eui-qr-scanner-control-active': torchOn })}
                                onClick={toggleTorch}
                                aria-label={torchOn ? 'Turn flashlight off' : 'Turn flashlight on'}
                                aria-pressed={torchOn}
                                title={torchOn ? 'Turn flashlight off' : 'Turn flashlight on'}
                            >
                                {torchOn ? <FlashOnIcon width={18} height={18} /> : <FlashOffIcon width={18} height={18} />}
                            </button>
                        )}
                        <button
                            type="button"
                            className="eui-qr-scanner-control eui-qr-scanner-control-stop"
                            onClick={() => {
                                stop();
                                setStatus('idle');
                            }}
                            aria-label="Stop scanning"
                            title="Stop scanning"
                        >
                            <span aria-hidden="true">×</span>
                        </button>
                    </div>
                )}

                {status === 'requesting' && (
                    <div className="eui-qr-scanner-state" role="status" aria-live="polite">
                        <CameraIcon width={28} height={28} />
                        <span>Requesting camera access…</span>
                    </div>
                )}

                {showStartButton && (
                    <div className="eui-qr-scanner-state">
                        <QrScanIcon width={36} height={36} />
                        <button type="button" className="eui-qr-scanner-start" onClick={start}>
                            {startLabel ?? 'Start scanning'}
                        </button>
                        <small>Camera permission will be requested.</small>
                    </div>
                )}

                {status === 'denied' && (
                    <div className="eui-qr-scanner-state eui-qr-scanner-state-error" role="alert">
                        <CameraIcon width={28} height={28} />
                        <span>Camera access denied.</span>
                        {deniedMessage ?? <small>Allow camera permission in your browser settings to scan QR codes.</small>}
                        <button type="button" className="eui-qr-scanner-start" onClick={start}>
                            Try again
                        </button>
                    </div>
                )}

                {status === 'unsupported' && (
                    <div className="eui-qr-scanner-state eui-qr-scanner-state-error" role="alert">
                        <QrScanIcon width={28} height={28} />
                        <span>Scanning not supported.</span>
                        {unsupportedMessage ?? (
                            <small>This browser does not expose the BarcodeDetector API. Try Chrome on Android or Safari 17+ on iOS.</small>
                        )}
                    </div>
                )}

                {status === 'error' && (
                    <div className="eui-qr-scanner-state eui-qr-scanner-state-error" role="alert">
                        <CameraIcon width={28} height={28} />
                        <span>Scanner error.</span>
                        <small>{errorMessage ?? 'An unknown error occurred while starting the scanner.'}</small>
                        <button type="button" className="eui-qr-scanner-start" onClick={start}>
                            Try again
                        </button>
                    </div>
                )}

                {!supported && status === 'idle' && (
                    <div className="eui-qr-scanner-state eui-qr-scanner-state-error" role="alert">
                        <QrScanIcon width={28} height={28} />
                        <span>Scanning not supported.</span>
                        {unsupportedMessage ?? (
                            <small>This browser does not expose the BarcodeDetector API. Try Chrome on Android or Safari 17+ on iOS.</small>
                        )}
                    </div>
                )}
            </div>
        );
    },
);

QrScanner.displayName = 'QrScanner';

export { QrScanner };
export default QrScanner;
