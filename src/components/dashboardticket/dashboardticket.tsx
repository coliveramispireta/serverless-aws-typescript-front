"use client";

import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Paper,
  CircularProgress,
  Box,
  Button,
  IconButton,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import useDashboardTicket, { TicketStatus } from "./usedashboardticket";

const DashboardTicket: React.FC = () => {
  const {
    handleOpenCreate,
    handleOpenCheckIn,
    handleOpenEdit,
    handleOpenDelete,
    handleCloseModal,
    openModalCreate,
    openModalEdit,
    openModalCheckIn,
    openModalDelete,
    setOpenModalCreate,
    tickets,
    selectedTicket,
    loading,
    creating,
    formData,
    setFormData,
    handleCreate,
    editTicket,
    setEditTicket,
    handleSaveEdit,
    handleChangeCheckIn,
    handleDelete,
    alert,
    setAlert,
  } = useDashboardTicket();

  const columns: GridColDef[] = [
    {
      field: "registrar",
      headerName: "REGISTRO",
      width: 120,
      sortable: false,
      renderCell: (params) =>
        params.row.status === "booked" ? (
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={() => handleOpenCheckIn(params.row.id)}
            sx={{ minWidth: "auto", px: 2, py: 0, fontSize: "0.75rem" }}
          >
            Check-in
          </Button>
        ) : null,
    },
    { field: "passengerName", headerName: "Pasajero", width: 150 },
    { field: "flightNumber", headerName: "Vuelo", width: 100 },
    { field: "origin", headerName: "Origen", width: 120 },
    { field: "destination", headerName: "Destino", width: 120 },
    { field: "seatNumber", headerName: "Asiento", width: 100 },
    { field: "price", headerName: "Precio", width: 100 },
    {
      field: "status",
      headerName: "Estado",
      width: 150,
      sortable: false,
      renderCell: (params) => {
        let bgColor = "";
        let label = "";

        switch (params.row.status) {
          case "booked":
            bgColor = "#f2e891"; // amarillo claro
            label = "RESERVADO";
            break;
          case "checked-in":
            bgColor = "#69e0ae"; // verde claro
            label = "REGISTRADO";
            break;
          case "cancelled":
            bgColor = "#ffcdd2"; // rojo claro
            label = "CANCELADO";
            break;
          default:
            label = "";
        }
        return (
          <Box
            sx={{
              backgroundColor: bgColor,
              borderRadius: "8px",
              px: 1.5,
              py: 0.5,
              textAlign: "center",
              fontWeight: "bold",
              width: "100%",
            }}
          >
            {label}
          </Box>
        );
      },
    },
    { field: "createdAt", headerName: "Creado", width: 180 },
    { field: "updatedAt", headerName: "Actualizado", width: 180 },
    {
      field: "actions",
      headerName: "Acciones",
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <IconButton color="primary" onClick={() => handleOpenEdit(params.row)}>
            <EditIcon />
          </IconButton>
          <IconButton color="error" onClick={() => handleOpenDelete(params.row)}>
            <DeleteIcon />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          🎟️ Gestión de Tickets
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{
            backgroundColor: "#1976d2",
            "&:hover": { backgroundColor: "#1565c0" },
          }}
          onClick={handleOpenCreate}
        >
          Reservar Ticket
        </Button>
      </Stack>

      <Paper sx={{ height: 600, p: 2, borderRadius: 3, boxShadow: 3 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={tickets}
            columns={columns}
            getRowId={(row) => row.id}
            pageSizeOptions={[5, 10, 20]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
          />
        )}
      </Paper>

      {/* Modal Crear Ticket */}
      <Dialog open={openModalCreate} onClose={handleCloseModal} fullWidth>
        <DialogTitle>Crear Nuevo Ticket</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Nombre del pasajero"
              value={formData.passengerName}
              onChange={(e) => setFormData({ ...formData, passengerName: e.target.value })}
              fullWidth
            />
            <TextField
              label="Número de vuelo"
              value={formData.flightNumber}
              onChange={(e) => setFormData({ ...formData, flightNumber: e.target.value })}
              fullWidth
            />
            <TextField
              label="Origen"
              value={formData.origin}
              onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
              fullWidth
            />
            <TextField
              label="Destino"
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              fullWidth
            />
            <TextField
              label="Asiento"
              value={formData.seatNumber}
              onChange={(e) => setFormData({ ...formData, seatNumber: e.target.value })}
              fullWidth
            />
            <TextField
              label="Precio"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel id="status-label">Estado</InputLabel>
              <Select
                labelId="status-label"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as TicketStatus })
                }
              >
                <MenuItem value="booked">Reservado</MenuItem>
                <MenuItem value="checked-in">Registrado</MenuItem>
                <MenuItem value="cancelled">Cancelado</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} disabled={creating}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={creating}
            startIcon={creating ? <CircularProgress size={20} /> : null}
          >
            {creating ? "Creando..." : "Crear"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal EDITAR Ticket */}
      <Dialog open={openModalEdit} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Ticket</DialogTitle>
        <DialogContent dividers>
          {editTicket && (
            <Stack spacing={2}>
              <TextField
                label="Pasajero"
                value={editTicket.passengerName}
                onChange={(e) => setEditTicket({ ...editTicket, passengerName: e.target.value })}
                fullWidth
              />
              <TextField
                label="Vuelo"
                value={editTicket.flightNumber}
                onChange={(e) => setEditTicket({ ...editTicket, flightNumber: e.target.value })}
                fullWidth
              />
              <TextField
                label="Origen"
                value={editTicket.origin}
                onChange={(e) => setEditTicket({ ...editTicket, origin: e.target.value })}
                fullWidth
              />
              <TextField
                label="Destino"
                value={editTicket.destination}
                onChange={(e) => setEditTicket({ ...editTicket, destination: e.target.value })}
                fullWidth
              />

              {/* desplegable para el estado */}
              <TextField
                select
                label="Estado"
                value={editTicket.status}
                onChange={(e) =>
                  setEditTicket({
                    ...editTicket,
                    status: e.target.value as TicketStatus,
                  })
                }
                fullWidth
              >
                <MenuItem value="booked">Reservado</MenuItem>
                <MenuItem value="checked-in">Registrado</MenuItem>
                <MenuItem value="cancelled">Cancelado</MenuItem>
              </TextField>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="inherit">
            Cancelar
          </Button>
          <Button onClick={handleSaveEdit} variant="contained" color="primary" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Registrar */}
      <Dialog open={openModalCheckIn} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>Confirmar Ticket Reservado</DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2}>
            <Typography>
              <strong>Pasajero:</strong> {selectedTicket?.passengerName}
            </Typography>
            <Typography>
              <strong>Vuelo:</strong> {selectedTicket?.flightNumber}
            </Typography>
            <Typography>
              <strong>Origen:</strong> {selectedTicket?.origin}
            </Typography>
            <Typography>
              <strong>Destino:</strong> {selectedTicket?.destination}
            </Typography>
            <Typography>
              <strong>Asiento:</strong> {selectedTicket?.seatNumber}
            </Typography>
            <Typography>
              <strong>Precio:</strong> ${selectedTicket?.price}
            </Typography>
            <Typography>
              <strong>Estado:</strong>
              {selectedTicket?.status === "booked"
                ? "RESERVADO"
                : selectedTicket?.status === "checked-in"
                  ? "REGISTRADO"
                  : selectedTicket?.status === "cancelled"
                    ? "CANCELADO"
                    : ""}
            </Typography>

            {loading && <CircularProgress size={24} sx={{ alignSelf: "center" }} />}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseModal} disabled={loading} color="inherit">
            Salir
          </Button>
          <Button
            onClick={handleChangeCheckIn}
            disabled={loading}
            variant="contained"
            color="primary"
          >
            check-in
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmar eliminat ticket */}
      <Dialog open={openModalDelete} onClose={handleCloseModal}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar el ticket de{" "}
            <strong>{selectedTicket?.passengerName}</strong>? Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              handleDelete(selectedTicket?.id);
            }}
            color="error"
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Eliminar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={alert !== null}
        onClose={() => setAlert(null)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={alert?.type}
          sx={{
            width: "100%",
            bgcolor:
              alert?.type === "success" ? "#38b06c" : alert?.type === "error" ? "#f44336" : "",
            color: "white",
            fontSize: "1.2rem",
            py: 0.5,
            px: 6,
            borderRadius: 2,
            mt: 8,
          }}
          icon={false}
        >
          {alert?.msg}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default DashboardTicket;
