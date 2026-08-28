"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  LinearProgress,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Snackbar,
  Alert,
  TextField as MuiTextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import InputAdornment from "@mui/material/InputAdornment";

import EmptyState from "@/components/ui/emptystate";
import {
  listCoachUsers,
  toggleUserDisabled,
  deleteUser,
  CoachUserSummary,
} from "@/services/keto/coach.service";

type FilterStatus = "all" | "active" | "disabled";

/**
 * Lista de usuarios del grupo con su resumen de progreso.
 * El coach puede deshabilitar, rehabilitar y eliminar usuarios.
 */
export default function CoachUsuariosView() {
  const [users, setUsers] = useState<CoachUserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");

  // ─── Menú contextual ───
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuUser, setMenuUser] = useState<CoachUserSummary | null>(null);

  // ─── Diálogos ───
  const [confirmToggle, setConfirmToggle] = useState<CoachUserSummary | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<CoachUserSummary | null>(null);

  // ─── Feedback ───
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });
  const [actionLoading, setActionLoading] = useState(false);

  const load = () => {
    setLoading(true);
    setError(null);
    listCoachUsers()
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error(err);
        setError("No se pudo cargar la lista de usuarios. El servicio aún no está disponible.");
        setUsers([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = users;

    // Filtro por estado
    if (filterStatus === "active") {
      result = result.filter((u) => !u.disabled);
    } else if (filterStatus === "disabled") {
      result = result.filter((u) => u.disabled);
    }

    // Filtro por búsqueda
    if (q) {
      result = result.filter(
        (u) => u.nombre?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q),
      );
    }

    return result;
  }, [users, query, filterStatus]);

  // ─── Acciones ───
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, user: CoachUserSummary) => {
    setMenuAnchor(event.currentTarget);
    setMenuUser(user);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuUser(null);
  };

  const handleToggleDisabled = async () => {
    if (!menuUser) return;
    setMenuAnchor(null);
    setConfirmToggle(menuUser);
  };

  const handleConfirmToggle = async () => {
    if (!confirmToggle) return;
    setActionLoading(true);
    try {
      const newDisabled = !confirmToggle.disabled;
      await toggleUserDisabled(confirmToggle.userId, newDisabled);
      setUsers((prev) =>
        prev.map((u) =>
          u.userId === confirmToggle.userId ? { ...u, disabled: newDisabled } : u,
        ),
      );
      setSnackbar({
        open: true,
        message: newDisabled
          ? `${confirmToggle.nombre} fue deshabilitado`
          : `${confirmToggle.nombre} fue habilitado`,
        severity: "success",
      });
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: "No se pudo cambiar el estado del usuario",
        severity: "error",
      });
    } finally {
      setActionLoading(false);
      setConfirmToggle(null);
    }
  };

  const handleDelete = async () => {
    if (!menuUser) return;
    setMenuAnchor(null);
    setConfirmDelete(menuUser);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    setActionLoading(true);
    try {
      await deleteUser(confirmDelete.userId);
      setUsers((prev) => prev.filter((u) => u.userId !== confirmDelete.userId));
      setSnackbar({
        open: true,
        message: `${confirmDelete.nombre} fue eliminado permanentemente`,
        severity: "success",
      });
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: "No se pudo eliminar el usuario",
        severity: "error",
      });
    } finally {
      setActionLoading(false);
      setConfirmDelete(null);
    }
  };

  if (loading) return <LinearProgress sx={{ borderRadius: 4 }} />;

  return (
    <Box>
      {/* Búsqueda */}
      <MuiTextField
        placeholder="Buscar por nombre o correo…"
        fullWidth
        size="small"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
      />

      {/* Filtros de estado */}
      <Box display="flex" gap={1} mb={2}>
        <Chip
          label="Todos"
          clickable
          color={filterStatus === "all" ? "primary" : "default"}
          variant={filterStatus === "all" ? "filled" : "outlined"}
          onClick={() => setFilterStatus("all")}
          size="small"
        />
        <Chip
          label="Activos"
          clickable
          color={filterStatus === "active" ? "success" : "default"}
          variant={filterStatus === "active" ? "filled" : "outlined"}
          onClick={() => setFilterStatus("active")}
          size="small"
        />
        <Chip
          label="Deshabilitados"
          clickable
          color={filterStatus === "disabled" ? "warning" : "default"}
          variant={filterStatus === "disabled" ? "filled" : "outlined"}
          onClick={() => setFilterStatus("disabled")}
          size="small"
        />
      </Box>

      {error ? (
        <EmptyState emoji="📡" title="Sin conexión" description={error} actionLabel="Reintentar" onAction={load} />
      ) : filtered.length === 0 ? (
        <EmptyState
          emoji="👥"
          title={
            users.length === 0
              ? "Aún no hay usuarios en el grupo"
              : filterStatus !== "all"
                ? `No hay usuarios ${filterStatus === "active" ? "activos" : "deshabilitados"}`
                : "Sin resultados"
          }
          description={
            users.length === 0
              ? "Cuando tus pacientes se registren y se activen, aparecerán aquí."
              : undefined
          }
          actionLabel={users.length === 0 ? "Reintentar" : undefined}
          onAction={users.length === 0 ? load : undefined}
        />
      ) : (
        <Box display="flex" flexDirection="column" gap={1.5}>
          {filtered.map((u) => {
            const perdida = u.perdidaTotalKg ?? 0;
            const alerta = !u.disabled && u.diasSinRegistrar != null && u.diasSinRegistrar > 3;
            const isDisabled = u.disabled ?? false;
            const sinPerfil = !u.nombre?.trim() && !u.email?.trim();
            return (
              <Card
                key={u.userId}
                elevation={0}
                sx={{
                  border: "1px solid",
                  borderColor: isDisabled
                    ? "grey.300"
                    : alerta
                      ? "AMRedAlert.main"
                      : "AMSnowGray.main",
                  opacity: isDisabled ? 0.6 : 1,
                }}
              >
                <CardContent
                  sx={{
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    "&:last-child": { pb: 2 },
                  }}
                >
                  <Avatar src={u.fotoUrl || undefined} sx={{ bgcolor: isDisabled ? "grey.400" : "primary.main" }}>
                    {u.nombre?.charAt(0)?.toUpperCase() || "?"}
                  </Avatar>
                  <Box flex={1} minWidth={0}>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <Typography fontWeight={700} noWrap>
                        {u.nombre || (sinPerfil ? "Usuario sin perfil" : "—")}
                      </Typography>
                      {sinPerfil && (
                        <Chip
                          size="small"
                          label="Perfil incompleto"
                          color="warning"
                          variant="outlined"
                          sx={{ height: 20, fontSize: "0.65rem" }}
                        />
                      )}
                      {isDisabled && (
                        <Chip
                          size="small"
                          label="Deshabilitado"
                          color="warning"
                          variant="outlined"
                          sx={{ height: 20, fontSize: "0.65rem" }}
                        />
                      )}
                    </Box>
                    {u.email ? (
                      <Typography variant="caption" color="text.secondary" noWrap display="block">
                        {u.email}
                      </Typography>
                    ) : null}
                  </Box>
                  <Box textAlign="right">
                    {u.pesoActualKg != null && (
                      <Typography variant="body2" fontWeight={700}>
                        {u.pesoActualKg} kg
                      </Typography>
                    )}
                    <Chip
                      size="small"
                      label={perdida > 0 ? `−${perdida} kg` : `${perdida} kg`}
                      color={perdida > 0 ? "success" : "default"}
                      sx={{ mt: 0.5 }}
                    />
                    {alerta && (
                      <Typography variant="caption" color="error" display="block">
                        ⚠️ {u.diasSinRegistrar} días sin registrar
                      </Typography>
                    )}
                  </Box>
                  {/* Menú contextual */}
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, u)}
                    sx={{ ml: 0.5 }}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}

      {/* ─── Menú contextual ─── */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={handleToggleDisabled}>
          <ListItemIcon>
            {menuUser?.disabled ? (
              <CheckCircleIcon fontSize="small" color="success" />
            ) : (
              <BlockIcon fontSize="small" color="warning" />
            )}
          </ListItemIcon>
          <ListItemText>
            {menuUser?.disabled ? "Habilitar" : "Deshabilitar"}
          </ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Eliminar</ListItemText>
        </MenuItem>
      </Menu>

      {/* ─── Diálogo: Confirmar toggle disable ─── */}
      <Dialog open={!!confirmToggle} onClose={() => setConfirmToggle(null)} maxWidth="xs" fullWidth>
        <DialogTitle>
          {confirmToggle?.disabled ? "¿Habilitar usuario?" : "¿Deshabilitar usuario?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirmToggle?.disabled ? (
              <>
                <strong>{confirmToggle?.nombre}</strong> será <strong>habilitado</strong>. Podrá
                iniciar sesión nuevamente en la aplicación.
              </>
            ) : (
              <>
                <strong>{confirmToggle?.nombre}</strong> será <strong>deshabilitado</strong>. No
                podrá iniciar sesión en la aplicación. Sus datos se conservarán y podrás
                rehabilitarlo más adelante.
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmToggle(null)} disabled={actionLoading}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmToggle}
            variant="contained"
            color={confirmToggle?.disabled ? "success" : "warning"}
            disabled={actionLoading}
          >
            {confirmToggle?.disabled ? "Habilitar" : "Deshabilitar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ─── Diálogo: Confirmar eliminar ─── */}
      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ color: "error.main" }}>⚠️ Eliminar usuario</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Eliminar a <strong>{confirmDelete?.nombre}</strong>? Se borrarán{" "}
            <strong>todos sus datos</strong> (pesos, comidas, logros y cuenta de acceso). Esta acción{" "}
            <strong>no se puede deshacer</strong>.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)} disabled={actionLoading}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            disabled={actionLoading}
          >
            Eliminar permanentemente
          </Button>
        </DialogActions>
      </Dialog>

      {/* ─── Snackbar feedback ─── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
