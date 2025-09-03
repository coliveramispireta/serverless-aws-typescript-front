"use client";

import React, { useState } from "react";
import { Button, Avatar, Typography, Box, Tooltip, CircularProgress } from "@mui/material";

interface GoogleLoginButtonProps {
  onClick: () => void;
  userEmail?: string;
  userName?: string;
  userAvatar?: string;
  loading?: boolean;
}

const GoogleColorIcon = () => (
  <svg width="28" height="28" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg">
    <path
      fill="#4285F4"
      d="M533.5 278.4c0-17.4-1.4-34.1-4.1-50.3H272v95.2h146.9c-6.4 34.5-25.8 63.7-54.8 83.2v68h88.5c51.8-47.8 81.9-118 81.9-195.9z"
    />
    <path
      fill="#34A853"
      d="M272 544.3c73.7 0 135.7-24.4 180.9-66.3l-88.5-68c-24.6 16.5-56.1 26.2-92.4 26.2-71 0-131.2-47.9-152.8-112.2h-90v70.7c45.6 89.3 139.3 149.6 242.8 149.6z"
    />
    <path
      fill="#FBBC05"
      d="M119.2 321.9c-11-32.6-11-67.6 0-100.2v-70.7h-90c-39 77.7-39 169.7 0 247.4l90-70.5z"
    />
    <path
      fill="#EA4335"
      d="M272 107.7c38.7 0 73.4 13.3 100.8 39.5l75.5-75.5C404.7 24 345.5 0 272 0 168.6 0 74.8 60.3 29.2 149.6l90 70.7c21.7-64.3 81.8-112.2 152.8-112.2z"
    />
  </svg>
);

export default function GoogleLoginButton({
  onClick,
  userEmail,
  userName,
  userAvatar,
  loading = false,
}: GoogleLoginButtonProps) {
  const isLoggedIn = !!userEmail && !!userName;

  return (
    <Button
      onClick={onClick}
      variant="outlined"
      disabled={loading}
      sx={{
        borderRadius: "9999px",
        padding: "8px 24px",
        textTransform: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center", // centra contenido horizontalmente
        gap: 2,
        boxShadow: 1,
        bgcolor: "background.paper",
        minWidth: 280,
        "&:hover": {
          bgcolor: "grey.100",
          boxShadow: 3,
          "& svg": {
            transform: "rotate(10deg)",
            transition: "transform 0.3s ease",
          },
        },
        transition: "background-color 0.3s ease, box-shadow 0.3s ease",
      }}
    >
      {loading ? (
        <CircularProgress size={28} />
      ) : (
        <>
          {isLoggedIn ? (
            <Avatar
              src={userAvatar}
              alt={userName}
              sx={{ width: 32, height: 32, bgcolor: "grey.300" }}
            />
          ) : (
            <GoogleColorIcon />
          )}

          <Box textAlign="center" flexGrow={1}>
            {isLoggedIn ? (
              <>
                <Typography variant="body1" fontWeight="bold" noWrap>
                  Inicia sesión como {userName}
                </Typography>
                <Tooltip title={userEmail || ""}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    noWrap
                    sx={{ cursor: "default" }}
                  >
                    {userEmail}
                  </Typography>
                </Tooltip>
              </>
            ) : (
              <Typography variant="body1" fontWeight="bold">
                Iniciar sesión con Google
              </Typography>
            )}
          </Box>
        </>
      )}
    </Button>
  );
}
