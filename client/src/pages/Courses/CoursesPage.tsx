import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  Chip,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  IconButton,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Badge,
} from "@mui/material";
import {
  Search,
  School,
  MenuBook,
  FilterList,
  Sort,
  Computer,
  Analytics,
  People,
  Biotech,
  MenuBookOutlined,
  Refresh,
  Info,
  Language,
  Schedule,
  Star,
  Clear,
} from "@mui/icons-material";
import { useCourses } from "../../hooks/useCourses";
import type { CourseDto } from "../../types/Course";
import { extractFilterOptions } from "../../api/courses";

interface CoursesPageProps {}

const CoursesPage: React.FC<CoursesPageProps> = () => {
  const {
    courses,
    loading,
    error,
    fetchCourses,
    searchCourses,
    filterCourses,
  } = useCourses();
  const [filteredCourses, setFilteredCourses] = useState<CourseDto[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCourse, setSelectedCourse] = useState<CourseDto | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // Filter states
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
  const [selectedCredits, setSelectedCredits] = useState<string>("all");
  const [selectedOccurrence, setSelectedOccurrence] = useState<string>("all");
  const [selectedModuleLevel, setSelectedModuleLevel] = useState<string>("all");

  // Table states
  const [orderBy, setOrderBy] = useState<keyof CourseDto>("name");
  const [order, setOrder] = useState<"asc" | "desc">("asc");

  // Menu states
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<HTMLElement | null>(
    null
  );
  const [sortMenuAnchor, setSortMenuAnchor] = useState<HTMLElement | null>(
    null
  );

  // Update filtered courses when courses or filters change
  useEffect(() => {
    let filtered = [...courses];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (course) =>
          course.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.abbreviation
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          course.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.responsible
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          course.organisation?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply filters
    if (selectedLanguage !== "all") {
      filtered = filtered.filter(
        (course) => course.language === selectedLanguage
      );
    }
    if (selectedCredits !== "all") {
      filtered = filtered.filter(
        (course) => course.credits === parseInt(selectedCredits)
      );
    }
    if (selectedOccurrence !== "all") {
      filtered = filtered.filter(
        (course) => course.occurrence === selectedOccurrence
      );
    }
    if (selectedModuleLevel !== "all") {
      filtered = filtered.filter(
        (course) => course.moduleLevel === selectedModuleLevel
      );
    }

    setFilteredCourses(filtered);
  }, [
    courses,
    searchQuery,
    selectedLanguage,
    selectedCredits,
    selectedOccurrence,
    selectedModuleLevel,
  ]);

  // Get unique values for filter options
  const filterOptions = extractFilterOptions(courses);

  const handleSort = (property: keyof CourseDto) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    const aValue = a[orderBy];
    const bValue = b[orderBy];

    if (typeof aValue === "string" && typeof bValue === "string") {
      return order === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return order === "asc" ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });

  const handleFilterMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setFilterMenuAnchor(event.currentTarget);
  };

  const handleFilterMenuClose = () => {
    setFilterMenuAnchor(null);
  };

  const handleSortMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setSortMenuAnchor(event.currentTarget);
  };

  const handleSortMenuClose = () => {
    setSortMenuAnchor(null);
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedLanguage("all");
    setSelectedCredits("all");
    setSelectedOccurrence("all");
    setSelectedModuleLevel("all");
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (selectedLanguage !== "all") count++;
    if (selectedCredits !== "all") count++;
    if (selectedOccurrence !== "all") count++;
    if (selectedModuleLevel !== "all") count++;
    return count;
  };

  const handleCourseClick = (course: CourseDto) => {
    setSelectedCourse(course);
    setDetailDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDetailDialogOpen(false);
    setSelectedCourse(null);
  };

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      await searchCourses(searchQuery);
    } else {
      await fetchCourses();
    }
  };

  const handleTestApiEndpoints = async () => {
    console.log("Testing API endpoints...");

    try {
      // Test search
      if (searchQuery.trim()) {
        console.log(`Testing search with: "${searchQuery}"`);
        await searchCourses(searchQuery);
      }

      // Test language filter
      if (selectedLanguage !== "all") {
        console.log(`Testing language filter: ${selectedLanguage}`);
        const { getCoursesByLanguage } = await import("../../api/courses");
        const languageResults = await getCoursesByLanguage(selectedLanguage);
        console.log(
          `Language filter results: ${languageResults.length} courses`
        );
      }

      // Test credits filter
      if (selectedCredits !== "all") {
        console.log(`Testing credits filter: ${selectedCredits}`);
        const { getCoursesByCredits } = await import("../../api/courses");
        const creditsResults = await getCoursesByCredits(selectedCredits);
        console.log(`Credits filter results: ${creditsResults.length} courses`);
      }

      console.log("API endpoints tested successfully!");
    } catch (error) {
      console.error("Error testing API endpoints:", error);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "#1a1a1a",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress sx={{ color: "#646cff" }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "#1a1a1a",
          color: "white",
          p: 3,
        }}
      >
        <Container maxWidth="lg">
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button
            variant="contained"
            onClick={fetchCourses}
            sx={{
              backgroundColor: "#646cff",
              "&:hover": { backgroundColor: "#5a5aff" },
            }}
          >
            Retry
          </Button>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#1a1a1a",
        color: "white",
        p: 3,
      }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <School sx={{ mr: 2, fontSize: "2rem", color: "#646cff" }} />
              <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                Course Catalog
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="outlined"
                onClick={handleTestApiEndpoints}
                sx={{
                  borderColor: "#646cff",
                  color: "#646cff",
                  "&:hover": {
                    borderColor: "#5a5aff",
                    backgroundColor: "rgba(100, 108, 255, 0.1)",
                  },
                }}
              >
                Test API Endpoints
              </Button>
              <Button
                variant="contained"
                onClick={fetchCourses}
                startIcon={<Refresh />}
                sx={{
                  backgroundColor: "#646cff",
                  "&:hover": { backgroundColor: "#5a5aff" },
                }}
              >
                Refresh
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}> 
            <Card sx={{ backgroundColor: "#2a2a2a", color: "white" }}>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Typography
                      variant="h4"
                      sx={{ fontWeight: "bold", color: "#646cff" }}
                    >
                      {courses.length}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#aaa" }}>
                      Total Courses
                    </Typography>
                  </Box>
                  <MenuBook sx={{ fontSize: "2rem", color: "#646cff" }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ backgroundColor: "#2a2a2a", color: "white" }}>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Typography
                      variant="h4"
                      sx={{ fontWeight: "bold", color: "#4caf50" }}
                    >
                      {filterOptions.languages.length}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#aaa" }}>
                      Languages
                    </Typography>
                  </Box>
                  <Language sx={{ fontSize: "2rem", color: "#4caf50" }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ backgroundColor: "#2a2a2a", color: "white" }}>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Typography
                      variant="h4"
                      sx={{ fontWeight: "bold", color: "#ff9800" }}
                    >
                      {filterOptions.creditOptions.length}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#aaa" }}>
                      Credit Options
                    </Typography>
                  </Box>
                  <Star sx={{ fontSize: "2rem", color: "#ff9800" }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ backgroundColor: "#2a2a2a", color: "white" }}>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Typography
                      variant="h4"
                      sx={{ fontWeight: "bold", color: "#e91e63" }}
                    >
                      {filteredCourses.length}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#aaa" }}>
                      Filtered Results
                    </Typography>
                  </Box>
                  <FilterList sx={{ fontSize: "2rem", color: "#e91e63" }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Search and Filter Bar */}
        <Paper
          sx={{
            p: 3,
            mb: 4,
            backgroundColor: "#2a2a2a",
            color: "white",
            borderRadius: 3,
          }}
        >
          <Typography variant="h6" sx={{ mb: 3 }}>
            Search & Filter
          </Typography>

          {/* Search Bar */}
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              placeholder="Search courses by name, abbreviation, content, professor, or organization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: "#aaa" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#333",
                  borderRadius: 2,
                  "& fieldset": { borderColor: "#555" },
                  "&:hover fieldset": { borderColor: "#646cff" },
                  "&.Mui-focused fieldset": { borderColor: "#646cff" },
                },
                "& .MuiInputBase-input": { color: "white" },
              }}
            />
          </Box>

          {/* Filter Controls */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: "#aaa" }}>Language</InputLabel>
                <Select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  sx={{
                    color: "white",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#555",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#646cff",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#646cff",
                    },
                    "& .MuiSvgIcon-root": { color: "white" },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: { backgroundColor: "#2a2a2a", color: "white" },
                    },
                  }}
                >
                  <MenuItem value="all">All Languages</MenuItem>
                  {filterOptions.languages.map((lang) => (
                    <MenuItem key={lang} value={lang}>
                      {lang}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: "#aaa" }}>Credits</InputLabel>
                <Select
                  value={selectedCredits}
                  onChange={(e) => setSelectedCredits(e.target.value)}
                  sx={{
                    color: "white",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#555",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#646cff",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#646cff",
                    },
                    "& .MuiSvgIcon-root": { color: "white" },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: { backgroundColor: "#2a2a2a", color: "white" },
                    },
                  }}
                >
                  <MenuItem value="all">All Credits</MenuItem>
                  {filterOptions.creditOptions.map((credits) => (
                    <MenuItem key={credits} value={credits.toString()}>
                      {credits} ECTS
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: "#aaa" }}>Occurrence</InputLabel>
                <Select
                  value={selectedOccurrence}
                  onChange={(e) => setSelectedOccurrence(e.target.value)}
                  sx={{
                    color: "white",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#555",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#646cff",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#646cff",
                    },
                    "& .MuiSvgIcon-root": { color: "white" },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: { backgroundColor: "#2a2a2a", color: "white" },
                    },
                  }}
                >
                  <MenuItem value="all">All Occurrences</MenuItem>
                  {filterOptions.occurrences.map((occurrence) => (
                    <MenuItem key={occurrence} value={occurrence}>
                      {occurrence}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: "#aaa" }}>Module Level</InputLabel>
                <Select
                  value={selectedModuleLevel}
                  onChange={(e) => setSelectedModuleLevel(e.target.value)}
                  sx={{
                    color: "white",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#555",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#646cff",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#646cff",
                    },
                    "& .MuiSvgIcon-root": { color: "white" },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: { backgroundColor: "#2a2a2a", color: "white" },
                    },
                  }}
                >
                  <MenuItem value="all">All Levels</MenuItem>
                  {filterOptions.moduleLevels.map((level) => (
                    <MenuItem key={level} value={level}>
                      {level}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Active Filters */}
          {getActiveFilterCount() > 0 && (
            <Box
              sx={{
                mt: 3,
                display: "flex",
                alignItems: "center",
                gap: 1,
                flexWrap: "wrap",
              }}
            >
              <Typography variant="body2" sx={{ color: "#aaa", mr: 1 }}>
                Active filters:
              </Typography>
              {searchQuery.trim() && (
                <Chip
                  label={`Search: "${searchQuery}"`}
                  onDelete={() => setSearchQuery("")}
                  size="small"
                  sx={{ backgroundColor: "#646cff", color: "white" }}
                />
              )}
              {selectedLanguage !== "all" && (
                <Chip
                  label={`Language: ${selectedLanguage}`}
                  onDelete={() => setSelectedLanguage("all")}
                  size="small"
                  sx={{ backgroundColor: "#4caf50", color: "white" }}
                />
              )}
              {selectedCredits !== "all" && (
                <Chip
                  label={`Credits: ${selectedCredits}`}
                  onDelete={() => setSelectedCredits("all")}
                  size="small"
                  sx={{ backgroundColor: "#ff9800", color: "white" }}
                />
              )}
              {selectedOccurrence !== "all" && (
                <Chip
                  label={`Occurrence: ${selectedOccurrence}`}
                  onDelete={() => setSelectedOccurrence("all")}
                  size="small"
                  sx={{ backgroundColor: "#e91e63", color: "white" }}
                />
              )}
              {selectedModuleLevel !== "all" && (
                <Chip
                  label={`Level: ${selectedModuleLevel}`}
                  onDelete={() => setSelectedModuleLevel("all")}
                  size="small"
                  sx={{ backgroundColor: "#9c27b0", color: "white" }}
                />
              )}
              <Button
                size="small"
                onClick={clearAllFilters}
                startIcon={<Clear />}
                sx={{ color: "#aaa", minWidth: "auto" }}
              >
                Clear All
              </Button>
            </Box>
          )}
        </Paper>

        {/* Courses Table */}
        <Paper
          sx={{ backgroundColor: "#2a2a2a", color: "white", borderRadius: 3 }}
        >
          <Box
            sx={{
              p: 2,
              borderBottom: "1px solid #444",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="h6">
              Courses ({sortedCourses.length})
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Tooltip title="Sort options">
                <IconButton onClick={handleSortMenuOpen} sx={{ color: "#aaa" }}>
                  <Sort />
                </IconButton>
              </Tooltip>
              <Tooltip title="Filter options">
                <IconButton
                  onClick={handleFilterMenuOpen}
                  sx={{
                    color: getActiveFilterCount() > 0 ? "#646cff" : "#aaa",
                  }}
                >
                  <Badge badgeContent={getActiveFilterCount()} color="primary">
                    <FilterList />
                  </Badge>
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#333" }}>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    <TableSortLabel
                      active={orderBy === "name"}
                      direction={orderBy === "name" ? order : "asc"}
                      onClick={() => handleSort("name")}
                      sx={{ color: "white !important" }}
                    >
                      Course Name
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    <TableSortLabel
                      active={orderBy === "abbreviation"}
                      direction={orderBy === "abbreviation" ? order : "asc"}
                      onClick={() => handleSort("abbreviation")}
                      sx={{ color: "white !important" }}
                    >
                      Code
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    <TableSortLabel
                      active={orderBy === "credits"}
                      direction={orderBy === "credits" ? order : "asc"}
                      onClick={() => handleSort("credits")}
                      sx={{ color: "white !important" }}
                    >
                      ECTS
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Language
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Occurrence
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Level
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Responsible
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedCourses.map((course) => (
                  <TableRow
                    key={course.id}
                    sx={{
                      "&:hover": { backgroundColor: "#333" },
                      borderBottom: "1px solid #444",
                    }}
                  >
                    <TableCell sx={{ color: "white" }}>
                      <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                        {course.name}
                      </Typography>
                      {course.subtitle && (
                        <Typography variant="caption" sx={{ color: "#aaa" }}>
                          {course.subtitle}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ color: "white" }}>
                      <Chip
                        label={course.abbreviation || "N/A"}
                        size="small"
                        sx={{
                          backgroundColor: "#646cff",
                          color: "white",
                          fontFamily: "monospace",
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: "white" }}>
                      <Chip
                        label={course.credits || 0}
                        size="small"
                        sx={{ backgroundColor: "#4caf50", color: "white" }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: "white" }}>
                      <Chip
                        label={course.language || "N/A"}
                        size="small"
                        sx={{ backgroundColor: "#ff9800", color: "white" }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: "white" }}>
                      <Chip
                        label={course.occurrence || "N/A"}
                        size="small"
                        sx={{ backgroundColor: "#e91e63", color: "white" }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: "white" }}>
                      <Chip
                        label={course.moduleLevel || "N/A"}
                        size="small"
                        sx={{ backgroundColor: "#9c27b0", color: "white" }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: "white" }}>
                      {course.responsible || "N/A"}
                    </TableCell>
                    <TableCell sx={{ color: "white" }}>
                      <Tooltip title="View Details">
                        <IconButton
                          onClick={() => handleCourseClick(course)}
                          sx={{ color: "#646cff" }}
                        >
                          <Info />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* No courses message */}
        {sortedCourses.length === 0 && (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <School sx={{ fontSize: "3rem", color: "#666", mb: 2 }} />
            <Typography variant="h6" sx={{ color: "#aaa", mb: 1 }}>
              No courses found
            </Typography>
            <Typography variant="body2" sx={{ color: "#666" }}>
              Try adjusting your search terms or filters
            </Typography>
          </Box>
        )}

        {/* Course Detail Dialog */}
        <Dialog
          open={detailDialogOpen}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: { backgroundColor: "#2a2a2a", color: "white" },
          }}
        >
          <DialogTitle>
            <Typography variant="h6">{selectedCourse?.name}</Typography>
            <Typography variant="body2" sx={{ color: "#aaa" }}>
              {selectedCourse?.abbreviation} • {selectedCourse?.credits} ECTS
            </Typography>
          </DialogTitle>
          <DialogContent>
            {selectedCourse && (
              <Box sx={{ space: 2 }}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6}}>
                    <Typography
                      variant="subtitle2"
                      sx={{ color: "#646cff", mb: 1 }}
                    >
                      Course Information
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Responsible:</strong>{" "}
                      {selectedCourse.responsible || "N/A"}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Organisation:</strong>{" "}
                      {selectedCourse.organisation || "N/A"}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Language:</strong>{" "}
                      {selectedCourse.language || "N/A"}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Occurrence:</strong>{" "}
                      {selectedCourse.occurrence || "N/A"}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Duration:</strong>{" "}
                      {selectedCourse.duration || "N/A"}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6}}>
                    <Typography
                      variant="subtitle2"
                      sx={{ color: "#646cff", mb: 1 }}
                    >
                      Study Details
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Module Level:</strong>{" "}
                      {selectedCourse.moduleLevel || "N/A"}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Total Hours:</strong>{" "}
                      {selectedCourse.totalHours || "N/A"}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Contact Hours:</strong>{" "}
                      {selectedCourse.contactHours || "N/A"}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Self Study Hours:</strong>{" "}
                      {selectedCourse.selfStudyHours || "N/A"}
                    </Typography>
                  </Grid>
                </Grid>
                {selectedCourse.content && (
                  <Box sx={{ mt: 2 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ color: "#646cff", mb: 1 }}
                    >
                      Course Content
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {selectedCourse.content}
                    </Typography>
                  </Box>
                )}
                {selectedCourse.intendedLearningOutcomes && (
                  <Box sx={{ mt: 2 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ color: "#646cff", mb: 1 }}
                    >
                      Learning Outcomes
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {selectedCourse.intendedLearningOutcomes}
                    </Typography>
                  </Box>
                )}
                {selectedCourse.prerequisitesRecommended && (
                  <Box sx={{ mt: 2 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ color: "#646cff", mb: 1 }}
                    >
                      Prerequisites
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {selectedCourse.prerequisitesRecommended}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} sx={{ color: "#646cff" }}>
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Sort Menu */}
        <Menu
          anchorEl={sortMenuAnchor}
          open={Boolean(sortMenuAnchor)}
          onClose={handleSortMenuClose}
          PaperProps={{
            sx: { backgroundColor: "#2a2a2a", color: "white" },
          }}
        >
          <MenuItem
            onClick={() => {
              handleSort("name");
              handleSortMenuClose();
            }}
          >
            Sort by Name
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleSort("abbreviation");
              handleSortMenuClose();
            }}
          >
            Sort by Code
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleSort("credits");
              handleSortMenuClose();
            }}
          >
            Sort by ECTS
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleSort("language");
              handleSortMenuClose();
            }}
          >
            Sort by Language
          </MenuItem>
        </Menu>
      </Container>
    </Box>
  );
};

export default CoursesPage;
