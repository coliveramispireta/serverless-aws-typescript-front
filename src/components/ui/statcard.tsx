"use client";
import { Box, Card, CardContent, IconButton, Tooltip, Typography } from "@mui/material";
import { InfoOutlined } from "@mui/icons-material";
import { ReactNode } from "react";

interface StatCardProps {
  icon?: ReactNode;
  label: string;
  value: string;
  hint?: string;
  accentColor?: string;
  help?: ReactNode;
}

/** Tarjeta compacta de métrica para el dashboard visual */
export default function StatCard({ icon, label, value, hint, accentColor, help }: StatCardProps) {
  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: "AMSnowGray.main",
        height: "100%",
      }}
    >
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          {icon && (
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              sx={{
                width: 34,
                height: 34,
                borderRadius: 2,
                bgcolor: `${accentColor ?? "#059669"}1A`,
                color: accentColor ?? "primary.main",
              }}
            >
              {icon}
            </Box>
          )}
          <Typography variant="caption" color="text.secondary" fontWeight={600} flex={1}>
            {label}
          </Typography>
          {help && (
            <Tooltip title={help} arrow>
              <IconButton size="small" sx={{ p: 0.25, color: "text.secondary" }}>
                <InfoOutlined style={{ fontSize: 15 }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        <Typography variant="h5" fontWeight={800} lineHeight={1.1}>
          {value}
        </Typography>
        {hint && (
          <Typography variant="caption" color="text.secondary">
            {hint}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}