"use client";
import { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Collapse,
  IconButton,
  LinearProgress,
  TextField as MuiTextField,
  Typography,
} from "@mui/material";
import { ChatBubbleOutline, Send } from "@mui/icons-material";

import EmptyState from "@/components/ui/emptystate";
import SectionHeader from "@/components/ui/sectionheader";
import { listComments, createComment } from "@/services/keto/community.service";
import { Comment, Post } from "@/model/keto.models";
import { getUserInfo } from "@/services/xstorage.cross.service";

/**
 * Comunidad del grupo: publicaciones de logros y avances con sus
 * comentarios. El feed proviene del backend (/posts).
 */
export default function ComunidadPage() {
  const userInfo = getUserInfo();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newPostText, setNewPostText] = useState("");
  const [posting, setPosting] = useState(false);

  // Comentarios abiertos por postId
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [commentsByPost, setCommentsByPost] = useState<Record<string, Comment[]>>({});
  const [loadingComments, setLoadingComments] = useState<Record<string, boolean>>({});
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [sendingComment, setSendingComment] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    import("@/services/keto/community.service")
      .then(({ listPosts }) => listPosts())
      .then((data) => setPosts(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error(err);
        setError("No se pudo cargar el muro del grupo. El servicio aún no está disponible.");
        setPosts([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const toggleComments = async (postId: string) => {
    const next = !openComments[postId];
    setOpenComments((prev) => ({ ...prev, [postId]: next }));
    if (next && !commentsByPost[postId]) {
      setLoadingComments((prev) => ({ ...prev, [postId]: true }));
      try {
        const comments = await listComments(postId);
        setCommentsByPost((prev) => ({ ...prev, [postId]: Array.isArray(comments) ? comments : [] }));
      } catch {
        setCommentsByPost((prev) => ({ ...prev, [postId]: [] }));
      } finally {
        setLoadingComments((prev) => ({ ...prev, [postId]: false }));
      }
    }
  };

  const handleSendComment = async (postId: string) => {
    const texto = commentDrafts[postId]?.trim();
    if (!texto) return;
    setSendingComment(postId);
    try {
      const comment = await createComment(postId, texto);
      setCommentsByPost((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] ?? []), comment],
      }));
      setCommentDrafts((prev) => ({ ...prev, [postId]: "" }));
    } catch (err) {
      console.error(err);
    } finally {
      setSendingComment(null);
    }
  };

  if (loading) return <LinearProgress sx={{ borderRadius: 4 }} />;

  return (
    <Box>
      <SectionHeader title="Comunidad" subtitle="El progreso del grupo te motiva" />

      {/* Crear publicación */}
      <Card elevation={0} sx={{ border: "1px solid", borderColor: "AMSnowGray.main", mb: 2 }}>
        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
          <Box display="flex" gap={1.5}>
            <Avatar src={userInfo.photoURL || undefined} sx={{ width: 36, height: 36, bgcolor: "primary.main" }}>
              {userInfo.userName?.charAt(0)?.toUpperCase() || "?"}
            </Avatar>
            <MuiTextField
              placeholder="Comparte tu avance o logro…"
              value={newPostText}
              onChange={(e) => setNewPostText(e.target.value)}
              fullWidth
              multiline
              minRows={2}
              size="small"
            />
          </Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mt={1.5}>
            <Button
              variant="contained"
              endIcon={<Send />}
              disabled={posting || newPostText.trim().length === 0}
              onClick={async () => {
                setPosting(true);
                try {
                  const { createPost } = await import("@/services/keto/community.service");
                  await createPost({ texto: newPostText.trim() });
                  setNewPostText("");
                  load();
                } catch (err) {
                  console.error(err);
                } finally {
                  setPosting(false);
                }
              }}
            >
              Publicar
            </Button>
          </Box>
        </CardContent>
      </Card>

      {error ? (
        <EmptyState emoji="📡" title="Sin conexión" description={error} actionLabel="Reintentar" onAction={load} />
      ) : posts.length === 0 ? (
        <EmptyState
          emoji="👥"
          title="El muro está tranquilo"
          description="Cuando tú o tus compañeros compartan logros y avances, los verás aquí."
          actionLabel="Reintentar"
          onAction={load}
        />
      ) : (
        <Box display="flex" flexDirection="column" gap={1.5}>
          {posts.map((post) => (
            <Card key={post.id} elevation={0} sx={{ border: post.logroId ? "2px solid" : "1px solid", borderColor: post.logroId ? "secondary.main" : "AMSnowGray.main" }}>
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                  <Avatar src={post.autorFotoUrl || undefined} sx={{ width: 38, height: 38, bgcolor: "AMTeal.main" }}>
                    {post.autorNombre?.charAt(0)?.toUpperCase() || "?"}
                  </Avatar>
                  <Box flex={1}>
                    <Typography variant="subtitle2" fontWeight={700}>{post.autorNombre}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(post.fechaCreacion).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" })}
                    </Typography>
                  </Box>
                  {post.logroId && (
                    <Chip size="small" color="secondary" label="🏅 Logro compartido" />
                  )}
                </Box>

                <Typography variant="body2" whiteSpace="pre-line">{post.texto}</Typography>
                {post.imagenUrl && (
                  <Box component="img" src={post.imagenUrl} alt="" sx={{ mt: 1.5, width: "100%", borderRadius: 3 }} />
                )}

                <Box mt={1.5}>
                  <Button
                    size="small"
                    startIcon={<ChatBubbleOutline />}
                    onClick={() => toggleComments(post.id)}
                  >
                    Comentarios ({commentsByPost[post.id]?.length ?? post.comentariosCount ?? 0})
                  </Button>
                </Box>

                <Collapse in={!!openComments[post.id]}>
                  <Box mt={1} pl={1} borderLeft="3px solid" borderColor="AMUltraLightBlue.main">
                    {loadingComments[post.id] ? (
                      <CircularProgress size={18} sx={{ my: 1, ml: 1 }} />
                    ) : (
                      <>
                        {(commentsByPost[post.id] ?? []).map((c) => (
                          <Box key={c.id} mb={1}>
                            <Typography variant="caption" fontWeight={700}>
                              {c.autorNombre}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block" whiteSpace="pre-line">
                              {c.texto}
                            </Typography>
                          </Box>
                        ))}
                        {(commentsByPost[post.id]?.length ?? 0) === 0 && (
                          <Typography variant="caption" color="text.secondary">Sé el primero en comentar.</Typography>
                        )}
                      </>
                    )}
                    <Box display="flex" gap={1} mt={1}>
                      <MuiTextField
                        size="small"
                        fullWidth
                        placeholder="Escribe un comentario…"
                        value={commentDrafts[post.id] ?? ""}
                        onChange={(e) => setCommentDrafts((prev) => ({ ...prev, [post.id]: e.target.value }))}
                        onKeyDown={(e) => e.key === "Enter" && handleSendComment(post.id)}
                      />
                      <IconButton
                        color="primary"
                        disabled={sendingComment === post.id || !commentDrafts[post.id]?.trim()}
                        onClick={() => handleSendComment(post.id)}
                      >
                        <Send fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </Collapse>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
}
