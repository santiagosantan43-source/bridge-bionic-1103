(() => {
    const video = document.getElementById('recognitionVideo');
    const placeholder = document.getElementById('recognitionPlaceholder');
    const startButton = document.getElementById('recognitionStart');
    const stopButton = document.getElementById('recognitionStop');
    const letterOutput = document.getElementById('recognitionLetter');
    const confidenceOutput = document.getElementById('recognitionConfidence');
    const statusOutput = document.getElementById('recognitionStatus');

    if (!video || !placeholder || !startButton || !stopButton || !letterOutput || !confidenceOutput || !statusOutput) {
        return;
    }

    const serverUrl = 'ws://127.0.0.1:8765/ws/reconocimiento';
    const letterApiUrl = 'https://bridge-bionics-api.juandabondano30.workers.dev/api/letra';
    const captureCanvas = document.createElement('canvas');
    const captureContext = captureCanvas.getContext('2d');
    let cameraStream = null;
    let socket = null;
    let recognitionActive = false;
    let capturedFrameCount = 0;

    const setStatus = (message) => {
        statusOutput.textContent = message;
    };

    const resetResult = () => {
        letterOutput.textContent = '—';
        confidenceOutput.textContent = 'Confianza: —';
    };

    const releaseCamera = () => {
        cameraStream?.getTracks().forEach((track) => track.stop());
        cameraStream = null;
        video.srcObject = null;
        placeholder.hidden = false;
    };

    const stopRecognition = (message = 'Reconocimiento detenido') => {
        recognitionActive = false;

        if (socket && socket.readyState < WebSocket.CLOSING) {
            socket.close();
        }
        socket = null;
        releaseCamera();
        startButton.disabled = false;
        stopButton.disabled = true;
        resetResult();
        setStatus(message);
    };

    const waitForPrediction = (activeSocket) => new Promise((resolve, reject) => {
        const timeout = window.setTimeout(() => {
            activeSocket.removeEventListener('message', onMessage);
            activeSocket.removeEventListener('close', onClose);
            reject(new Error('El servidor tardó demasiado en responder.'));
        }, 60000);

        const onMessage = (event) => {
            window.clearTimeout(timeout);
            activeSocket.removeEventListener('close', onClose);
            try {
                resolve(JSON.parse(event.data));
            } catch (error) {
                reject(new Error(`Respuesta inválida del servidor: ${error.message}`));
            }
        };

        const onClose = () => {
            window.clearTimeout(timeout);
            activeSocket.removeEventListener('message', onMessage);
            reject(new Error('Se cerró la conexión con el servidor de reconocimiento.'));
        };

        activeSocket.addEventListener('message', onMessage, { once: true });
        activeSocket.addEventListener('close', onClose, { once: true });
    });

    const captureFrame = () => new Promise((resolve, reject) => {
        if (!captureContext || !video.videoWidth || !video.videoHeight) {
            reject(new Error('La cámara todavía no está lista.'));
            return;
        }

        const captureStartedAt = performance.now();
        captureCanvas.width = 640;
        captureCanvas.height = Math.round(640 * video.videoHeight / video.videoWidth);
        captureContext.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height);
        captureCanvas.toBlob((blob) => {
            if (blob) {
                resolve({
                    blob,
                    durationMs: performance.now() - captureStartedAt
                });
            }
            else reject(new Error('No se pudo capturar un frame de la cámara.'));
        }, 'image/jpeg', 0.82);
    });
let lastSentLetter = '';
    let lastSentTime = 0;

    const sendLetterToApp = async (letter) => {
        const now = Date.now();

        if (!letter || (letter === lastSentLetter && now - lastSentTime < 3000)) {
            return;
        }

        lastSentLetter = letter;
        lastSentTime = now;

        try {
            const response = await fetch(letterApiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ultima_letra: letter
                })
            });

            if (!response.ok) {
                console.error('[Bridge Bionics] No se pudo enviar la letra:', await response.text());
                return;
            }

            console.info('[Bridge Bionics] Letra enviada a la aplicación:', letter);
        } catch (error) {
            console.error('[Bridge Bionics] Error enviando la letra:', error);
        }
    };

    const updatePrediction = (prediction) => {
        if (prediction.error) {
            setStatus(prediction.error);
            return;
        }

        if (!prediction.ready) {
            setStatus(`Preparando secuencia: ${prediction.frames}/100 frames`);
            return;
        }

        letterOutput.textContent = prediction.letter;
        sendLetterToApp(prediction.letter);
        confidenceOutput.textContent = `Confianza: ${(prediction.confidence * 100).toFixed(1)}%`;
        setStatus('Reconociendo letra');
    
    };

    const streamFrames = async (activeSocket) => {
        while (recognitionActive && activeSocket === socket && activeSocket.readyState === WebSocket.OPEN) {
            const capture = await captureFrame();
            const frameNumber = ++capturedFrameCount;
            const sendStartedAt = performance.now();
            activeSocket.send(capture.blob);
            const sendDurationMs = performance.now() - sendStartedAt;
            const responseStartedAt = performance.now();
            const prediction = await waitForPrediction(activeSocket);
            const responseWaitMs = performance.now() - responseStartedAt;
            console.info('[LSC timing]', {
                frame: frameNumber,
                captureAndEncodeMs: Number(capture.durationMs.toFixed(2)),
                websocketSendMs: Number(sendDurationMs.toFixed(2)),
                websocketResponseWaitMs: Number(responseWaitMs.toFixed(2))
            });
            if (recognitionActive && activeSocket === socket) updatePrediction(prediction);
        }
    };

    const startRecognition = async () => {
        startButton.disabled = true;
        setStatus('Solicitando permiso para usar la cámara…');

        try {
            cameraStream = await navigator.mediaDevices.getUserMedia({
                audio: false,
                video: {
                    facingMode: 'user',
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                }
            });
            video.srcObject = cameraStream;
            await video.play();
            placeholder.hidden = true;

            setStatus('Conectando con la IA local…');
            const activeSocket = new WebSocket(serverUrl);
            socket = activeSocket;

            activeSocket.addEventListener('open', () => {
                if (activeSocket !== socket) return;
                recognitionActive = true;
                stopButton.disabled = false;
                setStatus('Cámara activa; preparando secuencia');
                streamFrames(activeSocket).catch((error) => {
                    if (recognitionActive && activeSocket === socket) {
                        stopRecognition(`Error de reconocimiento: ${error.message}`);
                    }
                });
            }, { once: true });

            activeSocket.addEventListener('error', () => {
                if (activeSocket === socket) {
                    stopRecognition('No se pudo conectar con la IA local. Comprueba que el servidor Python esté iniciado.');
                }
            }, { once: true });

            activeSocket.addEventListener('close', () => {
                if (activeSocket === socket && recognitionActive) {
                    stopRecognition('La conexión con la IA local se cerró.');
                }
            });
        } catch (error) {
            stopRecognition(`No se pudo iniciar el reconocimiento: ${error.message}`);
        }
    };

    startButton.addEventListener('click', startRecognition);
    stopButton.addEventListener('click', () => stopRecognition());
})();
