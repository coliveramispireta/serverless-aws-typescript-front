import { listTickets } from "@/services/liststickets.service";
import { deleteTicket } from "@/services/delateticket.service";
import { createTicket } from "@/services/createticket.service";
import { getTicket } from "@/services/consultaticket.service";
import { updateTicket } from "@/services/updateticket.service";
import { useEffect, useState } from "react";

export type TicketStatus = "booked" | "checked-in" | "cancelled";
export type Ticket = {
  id: string;
  passengerName: string;
  flightNumber: string;
  origin: string;
  destination: string;
  seatNumber: string;
  price: number;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
};

export default function useDashboardTicket() {
  const [tickets, setTickets] = useState<Ticket[]>([]); // tabla general de tickets
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null); // ticket selecciondo

  const [loading, setLoading] = useState<boolean>(true);
  const [alert, setAlert] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const [creating, setCreating] = useState(false);
  const [editTicket, setEditTicket] = useState<Ticket | null>(null);

  const [openModalCreate, setOpenModalCreate] = useState(false);
  const [openModalCheckIn, setOpenModalCheckIn] = useState(false);
  const [openModalEdit, setOpenModalEdit] = useState(false);
  const [openModalDelete, setOpenModalDelete] = useState(false);

  const [formData, setFormData] = useState({
    passengerName: "",
    flightNumber: "",
    origin: "",
    destination: "",
    seatNumber: "",
    price: "",
    status: "",
  });

  //ABRIR MODALES

  const handleOpenCreate = () => {
    setOpenModalCreate(true);
  };
  const handleOpenDelete = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setOpenModalDelete(true);
  };

  const handleOpenEdit = (ticket: Ticket) => {
    setEditTicket(ticket);
    setOpenModalEdit(true);
  };

  const handleOpenCheckIn = async (id: string) => {
    try {
      const ticket = await getTicket(id);
      setSelectedTicket(ticket);
      setOpenModalCheckIn(true);
    } catch (error) {
      console.error("Error fetching ticket:", error);
    }
  };

  const handleOpenAlert = (type: "success" | "error", msg: string) => {
    setAlert({ type, msg });
    setTimeout(() => {
      setAlert(null);
    }, 4000);
  };

  // CERRAR MODALES
  const handleCloseModal = () => {
    setOpenModalCreate(false);
    setOpenModalCheckIn(false);
    setOpenModalEdit(false);
    setOpenModalDelete(false);
    setEditTicket(null);
    setFormData({
      passengerName: "",
      flightNumber: "",
      origin: "",
      destination: "",
      seatNumber: "",
      price: "",
      status: "",
    });
  };

  // FUNCIONES

  // LISTAR TICKETS
  const fetchTickets = async () => {
    setLoading(true);
    try {
      const data = await listTickets();
      console.log("data:", data);
      setTickets(data.items);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      handleOpenAlert("error", "Error al cargar tickets. Intenta refrescar nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // CREAR TICKET
  const handleCreate = async () => {
    if (
      !formData.passengerName ||
      !formData.flightNumber ||
      !formData.origin ||
      !formData.destination ||
      !formData.price
    ) {
      handleOpenAlert("error", "Por favor completa todos los campos obligatorios ✋");
      return;
    }

    setLoading(true);
    setCreating(true);

    try {
      const newTicket = {
        ...formData,
        price: parseFloat(formData.price),
      };
      const res = await createTicket(newTicket);
      handleOpenAlert("success", "Boleto creado exitosamente ✅");
      handleCloseModal();
      fetchTickets();
    } catch (error) {
      console.error("Error creating ticket:", error);
      handleOpenAlert("error", "Error al crear boleto. Intenta nuevamente.");
    } finally {
      setCreating(false);
      setLoading(false);
    }
  };

  // EDITAR TICKET
  const handleSaveEdit = async () => {
    if (!editTicket) return;
    setLoading(true);
    try {
      const { id, createdAt, updatedAt, ...cleanData } = editTicket;
      await updateTicket(id, cleanData);
      handleOpenAlert("success", "Boleto actualizado exitosamente ✅");
      handleCloseModal();
      fetchTickets();
    } catch (err) {
      console.error("Error updating ticket:", err);
      handleOpenAlert("error", "Error al actualizar boleto. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  // ELIMINAR TICKET
  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      await deleteTicket(id);
      handleOpenAlert("success", "Boleto eliminado exitosamente ✅");
      handleCloseModal();
      fetchTickets();
    } catch (error) {
      console.error("Error deleting ticket:", error);
      handleOpenAlert("error", "Error al eliminar boleto. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  // ACUTLIZAR ESTADO A CHECK-IN
  const handleChangeCheckIn = async () => {
    setLoading(true);
    try {
      const updatedTicket = { status: "checked-in" };
      await updateTicket(selectedTicket.id, updatedTicket);
      handleOpenAlert("success", "Boleto registrado exitosamente ✅");
      handleCloseModal();
      fetchTickets();
    } catch (error) {
      handleOpenAlert("error", "Error al registrar boleto. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const state = {
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
  };

  return state;
}
