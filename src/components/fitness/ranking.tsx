"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Chip,
  LinearProgress,
} from "@mui/material";
import {
  EmojiEvents,
  TrendingDown,
  AccountBalance,
} from "@mui/icons-material";
import useFitnessHook from "./usefitnesshook";



export const Ranking = (
    {   
      participantesConProgreso,
      pozoPremioInscripciones,
      costoPorInscripcion,
      participantes 
    } : any
) => {


  return (
    
          <>
            {/* Pozo Total */}
            <Box
              sx={{
                bgcolor: "rgba(255,215,0,0.1)",
                borderRadius: 3,
                p: 3,
                mb: 3,
                border: "2px solid #ffd700",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
              }}
            >
              <AccountBalance sx={{ fontSize: 40, color: "#ffd700" }} />
              <Box textAlign="center">
                <Typography variant="body2" color="#aaa">
                  Pozo del premio (Inscripciones)
                </Typography>
                <Typography variant="h3" fontWeight="800" color="#ffd700">
                  S/. {pozoPremioInscripciones.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="#aaa">
                  {participantes.length} participantes × S/. {costoPorInscripcion}
                </Typography>
              </Box>
            </Box>

            <Paper
              sx={{
                bgcolor: "rgba(255,255,255,0.05)",
                borderRadius: 4,
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.1)",
                overflow: "hidden",
                boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              }}
            >
              <Table>
                <TableHead>
                  <TableRow
                    sx={{
                      bgcolor: "rgba(255,215,0,0.1)",
                    }}
                  >
                    <TableCell sx={{ color: "#ffd700", fontWeight: 700 }}>#</TableCell>
                    <TableCell sx={{ color: "#ffd700", fontWeight: 700 }}>Participante</TableCell>
                    <TableCell sx={{ color: "#ffd700", fontWeight: 700 }}>Peso inicial</TableCell>
                    <TableCell sx={{ color: "#ffd700", fontWeight: 700 }}>Peso actual</TableCell>
                    <TableCell sx={{ color: "#ffd700", fontWeight: 700 }}>Peso ideal</TableCell>
                    <TableCell sx={{ color: "#ffd700", fontWeight: 700 }}>
                      Progreso al ideal
                    </TableCell>
                    {/* <TableCell sx={{ color: "#ffd700", fontWeight: 700 }}>Galería</TableCell> */}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {participantesConProgreso.map((p: any, i: any) => (
                    <TableRow
                      key={i}
                      sx={{
                        "&:hover": {
                          bgcolor: "rgba(255,255,255,0.05)",
                        },
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      <TableCell>
                        {i === 0 && <EmojiEvents sx={{ color: "#ffd700", fontSize: 28 }} />}
                        {i === 1 && <EmojiEvents sx={{ color: "#c0c0c0", fontSize: 28 }} />}
                        {i === 2 && <EmojiEvents sx={{ color: "#cd7f32", fontSize: 28 }} />}
                        {i > 2 && (
                          <Typography color="#aaa" fontWeight="bold">
                            {i + 1}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar
                            src={p.avatar}
                            sx={{
                              width: 50,
                              height: 50,
                              border: i === 0 ? "3px solid #ffd700" : "none",
                            }}
                          />
                          <Typography fontWeight="700" fontSize="1.1rem" color="#fff">
                            {p.nombre}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography color="#aaa">{p.pesoInicial} kg</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight="600" color="#fff">
                          {p.pesoActual} kg
                        </Typography>
                        <Typography variant="caption" color="#4caf50">
                          -{p.pesoPerdido.toFixed(1)} kg
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight="600" color="#ffd700">
                          {p.pesoIdeal} kg
                        </Typography>
                        <Typography variant="caption" color="#aaa">
                          Faltan {(p.pesoActual - p.pesoIdeal).toFixed(1)} kg
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Chip
                            icon={<TrendingDown />}
                            label={`${p.porcentajeProgreso}%`}
                            sx={{
                              bgcolor: i === 0 ? "rgba(127,255,0,0.2)" : "rgba(255,215,0,0.2)",
                              color: i === 0 ? "#7fff00" : "#ffd700",
                              fontWeight: "bold",
                              border: `1px solid ${i === 0 ? "#7fff00" : "#ffd700"}`,
                            }}
                          />
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(p.porcentajeProgreso, 100)}
                            sx={{
                              mt: 1,
                              height: 6,
                              borderRadius: 3,
                              bgcolor: "rgba(255,255,255,0.1)",
                              "& .MuiLinearProgress-bar": {
                                background:
                                  i === 0
                                    ? "linear-gradient(90deg, #7fff00, #32cd32)"
                                    : "linear-gradient(90deg, #ffd700, #ff6b35)",
                                borderRadius: 3,
                              },
                            }}
                          />
                          <Typography variant="caption" color="#aaa" mt={0.5}>
                            {p.pesoPerdido.toFixed(1)} / {p.pesoAPerder.toFixed(1)} kg
                          </Typography>
                        </Box>
                      </TableCell>
                      {/* <TableCell>
                        <Avatar
                          src={p.progreso}
                          variant="rounded"
                          sx={{
                            width: 80,
                            height: 60,
                            borderRadius: 2,
                            border: "2px solid rgba(255,255,255,0.2)",
                          }}
                        />
                      </TableCell> */}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
            <br />
          </>
        

  );
};
