"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  TextField,
  Grid,
  Typography,
  CircularProgress,
  Box,
  Paper,
  Button,
  Collapse,
  Slider,
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
} from "@mui/material";
import { debounce } from "lodash";
import MusicianCard, { Musician } from "@/app/components/MusicianCard";
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import useSWR from "swr";

// Define types for filter options
type Option = { id: string; name: string };

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const MusiciansPage = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filtersOpen, setFiltersOpen] = useState(true);
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

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
    Number(searchParams.get("maxRate")) || 500,
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
    // We set page to 1 when applying new filters.
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
    // This effect updates the local state of filters when the options are loaded and search params change.
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
    setHourlyRate([0, 500]);
    setPage(1);
    router.push(pathname); // Clears all query params
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Buscar Músicos
        </Typography>

        {isMobile && (
          <Button
            startIcon={<FilterListIcon />}
            onClick={() => setFiltersOpen(!filtersOpen)}
            sx={{ mb: 2 }}
          >
            {filtersOpen ? "Ocultar Filtros" : "Mostrar Filtros"}
          </Button>
        )}

        <Grid container spacing={3}>
          <Grid
            size={{ md: 3 }}
            sx={{
              display: isMobile ? "block" : "block",
            }}
          >
            <Collapse in={filtersOpen}>
              <Paper elevation={3} sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Filtros
                </Typography>
                <Grid container spacing={2}>
                  {/* All filter controls go here */}
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Buscar por nombre, etc."
                      variant="outlined"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
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
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Provincia"
                      variant="outlined"
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Ciudad"
                      variant="outlined"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
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
                  </Grid>
                  <Grid size={{ xs: 12 }}>
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
                  </Grid>
                  <Grid size={{ xs: 12 }}>
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
                  </Grid>
                  <Grid size={{ xs: 12 }}>
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
                  </Grid>
                  <Grid size={{ xs: 12 }}>
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
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Typography gutterBottom>
                      Tarifa por Hora: ${hourlyRate[0]} - ${hourlyRate[1]}
                    </Typography>
                    <Slider
                      value={hourlyRate}
                      onChange={(_, newValue) =>
                        setHourlyRate(newValue as number[])
                      }
                      valueLabelDisplay="auto"
                      min={0}
                      max={500}
                      step={10}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
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
                  </Grid>
                  <Grid size={{ xs: 12 }} sx={{ textAlign: "right" }}>
                    <Button
                      variant="outlined"
                      onClick={handleClearFilters}
                      sx={{ mr: 1 }}
                    >
                      Limpiar
                    </Button>
                    <Button variant="contained" onClick={handleApplyFilters}>
                      Aplicar
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </Collapse>
          </Grid>

          <Grid size={{ xs: 12, md: 9 }}>
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
                <Grid container spacing={3}>
                  {musicians.length > 0 ? (
                    musicians.map((musician) => (
                      <Grid
                        key={musician.id}
                        size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                      >
                        <MusicianCard musician={musician} />
                      </Grid>
                    ))
                  ) : (
                    <Typography sx={{ m: 4, width: "100%" }}>
                      No se encontraron músicos con esos criterios.
                    </Typography>
                  )}
                </Grid>
                {totalPages > 1 && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      mt: 4,
                      "& .MuiPagination-root": {
                        // Targeting the root of the Pagination component
                        p: 1, // Adding some padding
                        borderRadius: "8px", // Rounding the corners of the background
                        backgroundColor: "rgba(255, 255, 255, 0.1)", // A semi-transparent white background
                        backdropFilter: "blur(10px)", // Applying a blur effect
                      },
                      "& .MuiPaginationItem-root": {
                        // Targeting all pagination items
                        color: "#fff", // White text color for the numbers
                        "&.Mui-selected": {
                          // Targeting the selected item
                          backgroundColor: "rgba(255, 255, 255, 0.3)", // A more opaque white for the selected item's background
                          fontWeight: "bold", // Make the selected number bold
                        },
                        "&:hover": {
                          // Targeting items on hover
                          backgroundColor: "rgba(255, 255, 255, 0.2)", // A slightly more opaque white on hover
                        },
                      },
                    }}
                  >
                    <Pagination
                      count={totalPages}
                      page={page}
                      onChange={handlePageChange}
                      color="primary"
                    />
                  </Box>
                )}
              </>
            )}
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default MusiciansPage;
