"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  TextField,
  Typography,
  CircularProgress,
  Box,
  Paper,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Switch,
  FormControlLabel,
  Pagination,
  useTheme,
  useMediaQuery,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { MagnifyingGlass, Faders } from "phosphor-react";
import { motion, AnimatePresence } from "framer-motion";
import MusicianCard, { Musician } from "@/app/components/MusicianCard";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import useSWR from "swr";

// Define types for filter options
type Option = { id: string; name: string };

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const Musicians = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [showFilters, setShowFilters] = useState(!isMobile);

  // Filter states
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [musicianType, setMusicianType] = useState(
    searchParams.get("musicianOrBand") || ""
  );
  const [province, setProvince] = useState(searchParams.get("province") || "");
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [genres, setGenres] = useState<Option[]>([]);
  const [instruments, setInstruments] = useState<Option[]>([]);
  const [skills, setSkills] = useState<Option[]>([]);
  const [acceptsGigs, setAcceptsGigs] = useState<boolean | null>(
    searchParams.get("acceptsGigs") === "true"
      ? true
      : searchParams.get("acceptsGigs") === "false"
      ? false
      : null
  );
  const [acceptsCollabs, setAcceptsCollabs] = useState<boolean | null>(
    searchParams.get("acceptsCollaborations") === "true"
      ? true
      : searchParams.get("acceptsCollaborations") === "false"
      ? false
      : null
  );
  const [availability, setAvailability] = useState<Option[]>([]);
  const [hourlyRate, setHourlyRate] = useState<number[]>([
    Number(searchParams.get("minRate")) || 0,
    Number(searchParams.get("maxRate")) || 100000,
  ]);

  // SWR hooks for fetching filter data
  const { data: allGenres = [] } = useSWR<Option[]>("/api/genres", fetcher);
  const { data: allInstruments = [] } = useSWR<Option[]>(
    "/api/instruments",
    fetcher
  );
  const { data: allSkills = [] } = useSWR<Option[]>("/api/skills", fetcher);
  const { data: allAvailability = [] } = useSWR<Option[]>(
    "/api/availability",
    fetcher
  );

  // SWR hook for fetching musicians
  const query = new URLSearchParams(searchParams);
  query.set("page", page.toString());
  query.set("limit", "12");
  const {
    data: musiciansData,
    error: musiciansError,
    isLoading: musiciansLoading,
  } = useSWR<{ musicians: Musician[]; totalPages: number }>(
    `/api/public/m?${query.toString()}`,
    fetcher,
    {
      keepPreviousData: true,
    }
  );

  const musicians = musiciansData?.musicians || [];
  const totalPages = musiciansData?.totalPages || 0;

  const updateURL = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    if (searchTerm) params.set("q", searchTerm);
    else params.delete("q");
    if (musicianType) params.set("musicianOrBand", musicianType);
    else params.delete("musicianOrBand");
    if (province) params.set("province", province);
    else params.delete("province");
    if (city) params.set("city", city);
    else params.delete("city");
    if (genres.length > 0)
      params.set("genres", genres.map((g) => g.name).join(","));
    else params.delete("genres");
    if (instruments.length > 0)
      params.set("instruments", instruments.map((i) => i.name).join(","));
    else params.delete("instruments");
    if (skills.length > 0)
      params.set("skills", skills.map((s) => s.name).join(","));
    else params.delete("skills");
    if (acceptsGigs !== null)
      params.set("acceptsGigs", acceptsGigs.toString());
    else params.delete("acceptsGigs");
    if (acceptsCollabs !== null)
      params.set("acceptsCollaborations", acceptsCollabs.toString());
    else params.delete("acceptsCollaborations");
    if (availability.length > 0)
      params.set("availability", availability.map((a) => a.name).join(","));
    else params.delete("availability");
    params.set("minRate", hourlyRate[0].toString());
    params.set("maxRate", hourlyRate[1].toString());

    router.push(`${pathname}?${params.toString()}`);
  }, [
    searchTerm,
    musicianType,
    province,
    city,
    genres,
    instruments,
    skills,
    acceptsGigs,
    acceptsCollabs,
    availability,
    hourlyRate,
    router,
    pathname,
    searchParams,
  ]);

  useEffect(() => {
    const genreNames = searchParams.get("genres")?.split(",") || [];
    const instrumentNames = searchParams.get("instruments")?.split(",") || [];
    const skillNames = searchParams.get("skills")?.split(",") || [];
    const availabilityNames =
      searchParams.get("availability")?.split(",") || [];

    if (allGenres.length > 0) {
      setGenres(allGenres.filter((g) => genreNames.includes(g.name)));
    }
    if (allInstruments.length > 0) {
      setInstruments(
        allInstruments.filter((i) => instrumentNames.includes(i.name))
      );
    }
    if (allSkills.length > 0) {
      setSkills(allSkills.filter((s) => skillNames.includes(s.name)));
    }
    if (allAvailability.length > 0) {
      setAvailability(
        allAvailability.filter((a) => availabilityNames.includes(a.name))
      );
    }
  }, [searchParams, allGenres, allInstruments, allSkills, allAvailability]);

  const handleApplyFilters = () => {
    setPage(1);
    updateURL();
  };

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
    const params = new URLSearchParams(searchParams);
    params.set("page", value.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setMusicianType("");
    setProvince("");
    setCity("");
    setGenres([]);
    setInstruments([]);
    setSkills([]);
    setAcceptsGigs(null);
    setAcceptsCollabs(null);
    setAvailability([]);
    setHourlyRate([0, 100000]);
    setPage(1);
    router.push(pathname);
  };

  return (
    <Container maxWidth="xl" sx={{ my: 4 }}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {/* Search and Filters Section */}
        <Paper
          elevation={2}
          sx={{
            p: 2,
            borderRadius: "8px",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Buscar por nombre, instrumento, género..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleApplyFilters()}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleApplyFilters}
                      color="primary"
                      aria-label="search"
                    >
                      <MagnifyingGlass size={20} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                },
              }}
            />
            <IconButton
              onClick={() => setShowFilters(!showFilters)}
              color="primary"
              aria-label="toggle filters"
            >
              <Faders size={24} />
            </IconButton>
          </Box>
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                style={{ overflow: "hidden" }}
              >
                <Box
                  sx={{
                    pt: 2,
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "1fr 1fr",
                      md: "1fr 1fr 1fr",
                    },
                    gap: 2,
                  }}
                >
                  <FormControl fullWidth>
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={musicianType}
                  label="Tipo"
                  onChange={(e) => setMusicianType(e.target.value)}
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="Musician">Músico Solista</MenuItem>
                  <MenuItem value="Band">Banda</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Provincia"
                variant="outlined"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
              />
              <TextField
                fullWidth
                label="Ciudad"
                variant="outlined"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
              <Autocomplete
                multiple
                options={allGenres}
                getOptionLabel={(option) => option.name}
                value={genres}
                onChange={(_, newValue) => setGenres(newValue)}
                renderInput={(params) => (
                  <TextField {...params} label="Géneros" />
                )}
              />
              <Autocomplete
                multiple
                options={allInstruments}
                getOptionLabel={(option) => option.name}
                value={instruments}
                onChange={(_, newValue) => setInstruments(newValue)}
                renderInput={(params) => (
                  <TextField {...params} label="Instrumentos" />
                )}
              />
              <Autocomplete
                multiple
                options={allSkills}
                getOptionLabel={(option) => option.name}
                value={skills}
                onChange={(_, newValue) => setSkills(newValue)}
                renderInput={(params) => (
                  <TextField {...params} label="Habilidades" />
                )}
              />
              <Autocomplete
                multiple
                options={allAvailability}
                getOptionLabel={(option) => option.name}
                value={availability}
                onChange={(_, newValue) => setAvailability(newValue)}
                renderInput={(params) => (
                  <TextField {...params} label="Disponibilidad" />
                )}
              />
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  fullWidth
                  label="Tarifa Mínima"
                  type="number"
                  value={hourlyRate[0]}
                  onChange={(e) => {
                    const newMin =
                      e.target.value === "" ? 0 : Number(e.target.value);
                    setHourlyRate([newMin, hourlyRate[1]]);
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  label="Tarifa Máxima"
                  type="number"
                  value={hourlyRate[1]}
                  onChange={(e) => {
                    const newMax =
                      e.target.value === ""
                        ? 100000
                        : Number(e.target.value);
                    setHourlyRate([hourlyRate[0], newMax]);
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    ),
                  }}
                />
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={acceptsGigs === true}
                    onChange={(e) =>
                      setAcceptsGigs(e.target.checked ? true : null)
                    }
                  />
                }
                label="Acepta Contrataciones"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={acceptsCollabs === true}
                    onChange={(e) =>
                      setAcceptsCollabs(e.target.checked ? true : null)
                    }
                  />
                }
                label="Acepta Colaboraciones"
              />
                  <Box
                    sx={{
                      gridColumn: "1 / -1",
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: 1,
                      mt: 2,
                    }}
                  >
                    <Button variant="outlined" onClick={handleClearFilters}>
                      Limpiar Filtros
                    </Button>
                    <Button variant="contained" onClick={handleApplyFilters}>
                      Aplicar
                    </Button>
                  </Box>
                </Box>
              </motion.div>
            )}
          </AnimatePresence>
        </Paper>

        {/* Musicians List */}
        <Box>
          {musiciansLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
              <CircularProgress />
            </Box>
          ) : musiciansError ? (
            <Typography color="error" sx={{ m: 4, width: "100%" }}>
              Error al cargar los músicos. Por favor, intente de nuevo.
            </Typography>
          ) : (
            <>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(3, 1fr)",
                    lg: "repeat(4, 1fr)",
                  },
                  gap: 3,
                }}
              >
                {musicians.length > 0 ? (
                  musicians.map((musician) => (
                    <MusicianCard key={musician.id} musician={musician} />
                  ))
                ) : (
                  <Typography sx={{ m: 4, gridColumn: "1 / -1" }}>
                    No se encontraron músicos con esos criterios.
                  </Typography>
                )}
              </Box>
              {totalPages > 1 && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    mt: 4,
                    "& .MuiPagination-root": {
                      p: 1,
                      borderRadius: "8px",
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      backdropFilter: "blur(10px)",
                    },
                    "& .MuiPaginationItem-root": {
                      color: "#fff",
                      "&.Mui-selected": {
                        backgroundColor: "rgba(255, 255, 255, 0.3)",
                        fontWeight: "bold",
                      },
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.2)",
                      },
                    },
                  }}
                >
                  <Pagination sx={{ mb : 10 }}
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                  />
                </Box>
              )}
            </>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default Musicians;
