import { useEffect, useRef, useState } from 'react';
import { Box, Button, Alert, Stack } from '@mui/material';
import PhotoCameraRoundedIcon from '@mui/icons-material/PhotoCameraRounded';

/**
 * getUserMedia-based camera preview with a capture-to-blob button.
 * Calls `onCapture(blob)` with a JPEG blob. Shows a graceful error message
 * if the camera/device is unavailable or permission is denied.
 */
export default function CameraCapture({ onCapture }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    async function startCamera() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError('Camera capture is not supported in this browser. Please use file upload instead.');
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });
        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setReady(true);
        }
      } catch (err) {
        setError(
          'Camera unavailable — permission was denied or no camera was found. Please use file upload instead.',
        );
      }
    }

    startCamera();

    return () => {
      active = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const capture = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (blob) onCapture?.(blob);
      },
      'image/jpeg',
      0.92,
    );
  };

  if (error) {
    return <Alert severity="warning">{error}</Alert>;
  }

  return (
    <Stack spacing={2} sx={{ alignItems: "center" }}>
      <Box
        sx={{
          width: '100%',
          borderRadius: 4,
          overflow: 'hidden',
          bgcolor: 'common.black',
          aspectRatio: '4 / 3',
        }}
      >
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </Box>
      <Button
        variant="contained"
        color="primary"
        startIcon={<PhotoCameraRoundedIcon />}
        onClick={capture}
        disabled={!ready}
      >
        Capture
      </Button>
    </Stack>
  );
}
