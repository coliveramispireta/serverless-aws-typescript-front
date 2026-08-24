"use client";
import { Box, Typography } from "@mui/material";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

/** Encabezado de sección reutilizable dentro de las pantallas */
export default function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
  return (
    <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2} mt={1}>
      <Box>
        <Typography variant="h6" fontWeight={800}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
      {action}
    </Box>
  );
}
