import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Container,
  Stack,
  Typography,
  TextField,
  IconButton,
  Chip,
  Avatar,
  Tooltip,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import SmartToyRoundedIcon from '@mui/icons-material/SmartToyRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';

import GlassCard from '../components/GlassCard';
import TypingIndicator from '../components/TypingIndicator';
import { useAuth } from '../context/AuthContext';
import { sendChatMessage } from '../services/chatService';

const STARTER_PROMPTS = [
  'Explain this report',
  'Can I eat fruits?',
  'Can I drive?',
  'Why am I taking this medicine?',
];

function makeId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

const MotionBox = motion.create(Box);

export default function ChatPage() {
  const theme = useTheme();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const sessionIdRef = useRef(null);
  const scrollEndRef = useRef(null);

  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, sending]);

  const doSend = async (text) => {
    const trimmed = (text ?? '').trim();
    if (!trimmed || sending) return;

    const userMessage = { id: makeId(), role: 'user', content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setSending(true);

    if (!sessionIdRef.current) {
      sessionIdRef.current = makeId();
    }

    try {
      const res = await sendChatMessage({ message: trimmed, sessionId: sessionIdRef.current });
      if (res?.session_id) sessionIdRef.current = res.session_id;
      setMessages((prev) => [
        ...prev,
        {
          id: makeId(),
          role: 'assistant',
          content: res?.reply || "I'm not sure how to answer that yet.",
          followups: Array.isArray(res?.suggested_followups) ? res.suggested_followups : [],
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: makeId(),
          role: 'error',
          content: err?.response?.data?.detail || 'Something went wrong sending that message.',
          retryText: trimmed,
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleRetry = (msgId, retryText) => {
    setMessages((prev) => prev.filter((m) => m.id !== msgId));
    doSend(retryText);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      doSend(input);
    }
  };

  const lastAssistantIndex = [...messages].map((m) => m.role).lastIndexOf('assistant');

  return (
    <Container maxWidth="md" sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 148px)' }}>
      <Stack spacing={1} sx={{ mb: 2, flexShrink: 0 }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundImage: theme.custom.gradients.primary,
              color: '#fff',
              flexShrink: 0,
            }}
          >
            <ForumRoundedIcon />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={800}>
              AI Health Chat
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ask about your prescriptions, bills, or general health guidance.
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, rowGap: 1 }}>
          {STARTER_PROMPTS.map((prompt) => (
            <Chip
              key={prompt}
              label={prompt}
              onClick={() => doSend(prompt)}
              disabled={sending}
              clickable
              sx={{
                backgroundImage: theme.custom.gradients.primarySoft,
                color: 'primary.main',
                fontWeight: 600,
              }}
            />
          ))}
        </Stack>
      </Stack>

      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          pr: 0.5,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          py: 1,
        }}
      >
        {messages.length === 0 && (
          <Box sx={{ m: 'auto', textAlign: 'center', color: 'text.secondary', maxWidth: 360 }}>
            <SmartToyRoundedIcon sx={{ fontSize: 40, mb: 1, opacity: 0.6 }} />
            <Typography variant="body2">
              Start a conversation — ask a question or tap one of the prompts above.
            </Typography>
          </Box>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => {
            if (msg.role === 'user') {
              return (
                <MotionBox
                  key={msg.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  sx={{ display: 'flex', justifyContent: 'flex-end' }}
                >
                  <Box
                    sx={{
                      maxWidth: '78%',
                      px: 2.25,
                      py: 1.5,
                      color: '#fff',
                      backgroundImage: theme.custom.gradients.primary,
                      borderRadius: '18px 18px 4px 18px',
                      boxShadow: '0 8px 20px rgba(14,124,134,0.28)',
                    }}
                  >
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {msg.content}
                    </Typography>
                  </Box>
                </MotionBox>
              );
            }

            if (msg.role === 'error') {
              return (
                <MotionBox
                  key={msg.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  sx={{ display: 'flex', justifyContent: 'flex-start' }}
                >
                  <GlassCard
                    sx={{
                      maxWidth: '78%',
                      p: 2,
                      borderRadius: '18px 18px 18px 4px',
                      border: `1px solid ${theme.palette.error.main}`,
                    }}
                  >
                    <Typography variant="body2" color="error" sx={{ mb: 1 }}>
                      {msg.content}
                    </Typography>
                    <Chip
                      icon={<ReplayRoundedIcon />}
                      label="Retry"
                      size="small"
                      color="error"
                      variant="outlined"
                      clickable
                      onClick={() => handleRetry(msg.id, msg.retryText)}
                    />
                  </GlassCard>
                </MotionBox>
              );
            }

            return (
              <MotionBox
                key={msg.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                sx={{ display: 'flex', justifyContent: 'flex-start' }}
              >
                <Stack direction="row" spacing={1.25} sx={{ maxWidth: '82%' , alignItems: "flex-start"}}>
                  <Avatar
                    sx={{
                      width: 30,
                      height: 30,
                      backgroundImage: theme.custom.gradients.accent,
                      flexShrink: 0,
                    }}
                  >
                    <SmartToyRoundedIcon sx={{ fontSize: 17 }} />
                  </Avatar>
                  <Box>
                    <GlassCard sx={{ p: 2, borderRadius: '18px 18px 18px 4px' }}>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {msg.content}
                      </Typography>
                    </GlassCard>
                    {idx === lastAssistantIndex && msg.followups?.length > 0 && (
                      <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 1, rowGap: 1 }}>
                        {msg.followups.map((f) => (
                          <Chip
                            key={f}
                            label={f}
                            size="small"
                            clickable
                            disabled={sending}
                            onClick={() => doSend(f)}
                            variant="outlined"
                            sx={{ borderColor: 'primary.main', color: 'primary.main' }}
                          />
                        ))}
                      </Stack>
                    )}
                  </Box>
                </Stack>
              </MotionBox>
            );
          })}
        </AnimatePresence>

        {sending && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
            <Stack direction="row" spacing={1.25} sx={{ alignItems: "flex-start" }}>
              <Avatar sx={{ width: 30, height: 30, backgroundImage: theme.custom.gradients.accent }}>
                <SmartToyRoundedIcon sx={{ fontSize: 17 }} />
              </Avatar>
              <GlassCard sx={{ py: 0.5, px: 1, borderRadius: '18px 18px 18px 4px' }}>
                <TypingIndicator color={theme.palette.primary.main} />
              </GlassCard>
            </Stack>
          </Box>
        )}
        <div ref={scrollEndRef} />
      </Box>

      <GlassCard sx={{ p: 1.25, mt: 1.5, flexShrink: 0 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "flex-end" }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder={`Message as ${user?.email ? user.email.split('@')[0] : 'you'}...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            variant="standard"
            slotProps={{ input: { disableUnderline: true } }}
            sx={{ px: 1 }}
          />
          <Tooltip title="Send (Enter)">
            <span>
              <IconButton
                onClick={() => doSend(input)}
                disabled={sending || !input.trim()}
                sx={{
                  backgroundImage: theme.custom.gradients.primary,
                  color: '#fff',
                  '&:hover': { backgroundImage: theme.custom.gradients.primary, filter: 'brightness(1.08)' },
                  '&.Mui-disabled': { backgroundImage: 'none', bgcolor: 'action.disabledBackground' },
                }}
              >
                <SendRoundedIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </GlassCard>
    </Container>
  );
}
