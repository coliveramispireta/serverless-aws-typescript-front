import React from "react";
import { Box, Container, Typography, Grid, Paper, Avatar } from "@mui/material";
import { getUserInfo } from "@/services/xstorage.cross.service";

const ProfilePage = () => {
  const userInfo = getUserInfo();
  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
          <Avatar
            src={userInfo.photoURL}
            alt={userInfo.userName}
            sx={{ width: 100, height: 100, mb: 2 }}
          />
          <Typography variant="h5">{userInfo.userName}</Typography>
          <Typography variant="body2" color="text.secondary">
            {userInfo.role}
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">
              Correo electrónico
            </Typography>
            <Typography variant="body1">{userInfo.email}</Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">
              Teléfono
            </Typography>
            <Typography variant="body1">{userInfo.phoneNumber || "-"}</Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">
              ID de usuario
            </Typography>
            <Typography variant="body1">{userInfo.id}</Typography>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default ProfilePage;
