"use client";
import { Chip, Tooltip } from "@mui/material";
import { AutoAwesome, Person } from "@mui/icons-material";

export type ContentSource = "auto" | "coach";

interface SourceBadgeProps {
  source: ContentSource;
  size?: "small" | "medium";
}

/**
 * Distingue visualmente el origen del contenido:
 *  - "auto"  → generado automáticamente por el sistema
 *  - "coach" → creado personalmente por el coach
 */
export default function SourceBadge({ source, size = "small" }: SourceBadgeProps) {
  if (source === "coach") {
    return (
      <Tooltip title="Creado por tu coach" arrow>
        <Chip
          icon={<Person />}
          label="Tu coach"
          size={size}
          color="secondary"
          sx={{
            fontWeight: 600,
            "& .MuiChip-icon": { fontSize: 16 },
          }}
        />
      </Tooltip>
    );
  }

  return (
    <Tooltip title="Generado automáticamente por el sistema" arrow>
      <Chip
        icon={<AutoAwesome />}
        label="Automático"
        size={size}
        color="AMTeal"
        variant="outlined"
        sx={{
          fontWeight: 600,
          bgcolor: "rgba(13, 148, 136, 0.06)",
          "& .MuiChip-icon": { fontSize: 16 },
        }}
      />
    </Tooltip>
  );
}
