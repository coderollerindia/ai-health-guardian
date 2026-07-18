import { useCallback, useRef, useState } from 'react';
import { Box, Typography, IconButton, Stack } from '@mui/material';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import InsertDriveFileRoundedIcon from '@mui/icons-material/InsertDriveFileRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

/**
 * Drag-and-drop + click-to-browse file picker.
 * Accepts image/*,.pdf by default. Calls `onFile(file)` once a file is chosen
 * and shows a filename/preview once selected.
 */
export default function FileDropzone({
  onFile,
  accept = 'image/*,.pdf',
  label = 'Drag & drop a file here, or click to browse',
  helperText = 'Images or PDF, up to 10MB',
}) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(
    (selected) => {
      if (!selected) return;
      setFile(selected);
      if (selected.type?.startsWith('image/')) {
        setPreview(URL.createObjectURL(selected));
      } else {
        setPreview(null);
      }
      onFile?.(selected);
    },
    [onFile],
  );

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files?.[0];
    handleFile(dropped);
  };

  const clearFile = (e) => {
    e.stopPropagation();
    setFile(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <Box
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      role="button"
      tabIndex={0}
      sx={{
        border: '2px dashed',
        borderColor: dragOver ? 'primary.main' : 'divider',
        borderRadius: 4,
        p: { xs: 3, sm: 5 },
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all .2s ease',
        bgcolor: dragOver ? 'action.hover' : 'transparent',
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        hidden
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {!file && (
        <Stack spacing={1} sx={{ alignItems: "center" }}>
          <CloudUploadRoundedIcon sx={{ fontSize: 46, color: 'primary.main' }} />
          <Typography variant="body1" fontWeight={700}>
            {label}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {helperText}
          </Typography>
        </Stack>
      )}
      {file && (
        <Stack spacing={1} sx={{ alignItems: "center" }}>
          {preview ? (
            <Box
              component="img"
              src={preview}
              alt={file.name}
              sx={{
                maxHeight: 180,
                maxWidth: '100%',
                width: 'auto',
                height: 'auto',
                objectFit: 'contain',
                borderRadius: 3,
                boxShadow: 2,
              }}
            />
          ) : (
            <InsertDriveFileRoundedIcon sx={{ fontSize: 46, color: 'primary.main' }} />
          )}
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 220 }}>
              {file.name}
            </Typography>
            <IconButton size="small" onClick={clearFile} aria-label="remove file">
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>
      )}
    </Box>
  );
}
