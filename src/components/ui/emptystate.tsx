"use client";
import { Box, Button, Typography } from "@mui/material";

interface EmptyStateProps {
  emoji?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** Estado vacío o sin conexión, con acción opcional */
export default function EmptyState({
  emoji = "🥑",
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      textAlign="center"
      gap={1}
      py={6}
      px={3}
    >
      <Typography fontSize={48}>{emoji}</Typography>
      <Typography variant="subtitle1" fontWeight={700}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" maxWidth={340}>
          {description}
        </Typography>
      )}
      {actionLabel && onAction && (
        <Button variant="contained" size="small" onClick={onAction} sx={{ mt: 1 }}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}
