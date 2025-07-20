import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  Chip,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
} from "@mui/material";
import { Close, ExpandMore } from "@mui/icons-material";

// Course interface that can handle both simple Course and ModuleDetails
interface Course {
  id: string;
  name: string;
  code?: string;
  moduleId?: string; // For ModuleDetails
  credits: number;
  semester?: string;
  language: string;
  professor?: string;
  responsible?: string; // For ModuleDetails
  occurrence?: string;
  description?: string;
  prerequisites?: string[];
  category: string;
  subcategory?: string;
  subSubcategory?: string;
  completed?: boolean;
  learningMethods?: string;
  assessment?: string;
  // ModuleDetails specific fields
  organisation?: string;
  moduleLevel?: string;
  totalHours?: number;
  contactHours?: number;
  selfStudyHours?: number;
  descriptionOfAchievementAndAssessmentMethods?: string;
  examRetakeNextSemester?: string;
  examRetakeAtTheEndOfSemester?: string;
  prerequisitesRecommended?: string;
  intendedLearningOutcomes?: string;
  content?: string;
  teachingAndLearningMethods?: string;
  media?: string;
  readingList?: string;
}

interface CourseDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  course: Course | null;
}

export const CourseDetailsDialog: React.FC<CourseDetailsDialogProps> = ({
  open,
  onClose,
  course,
}) => {
  if (!course) return null;

  // Helper function to get the course code (either code or moduleId)
  const getCourseCode = () => course.code || course.moduleId || "N/A";

  // Helper function to get the professor/responsible
  const getProfessor = () => course.professor || course.responsible || "N/A";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: "#1a1a1a",
          color: "white",
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle
        sx={{
          borderBottom: "1px solid #444",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
            {course.name}
          </Typography>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Chip
              label={getCourseCode()}
              sx={{ backgroundColor: "#646cff", color: "white" }}
            />
            <Chip
              label={`${course.credits} ECTS`}
              sx={{ backgroundColor: "#4caf50", color: "white" }}
            />
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ color: "#aaa" }} disableRipple>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 3 }}>
          {/* Quick Info Grid */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ p: 2, backgroundColor: "#2a2a2a", borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ color: "#aaa", mb: 1 }}>
                  Responsible
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {getProfessor()}
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ p: 2, backgroundColor: "#2a2a2a", borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ color: "#aaa", mb: 1 }}>
                  Organisation
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {course.organisation || "TUM"}
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ p: 2, backgroundColor: "#2a2a2a", borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ color: "#aaa", mb: 1 }}>
                  Level
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {course.moduleLevel || "Master"}
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ p: 2, backgroundColor: "#2a2a2a", borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ color: "#aaa", mb: 1 }}>
                  Language
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {course.language}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Workload Information */}
          {(course.totalHours ||
            course.contactHours ||
            course.selfStudyHours) && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, color: "#646cff" }}>
                Workload
              </Typography>
              <Grid container spacing={2}>
                {course.totalHours && (
                  <Grid size={{ xs: 4 }}>
                    <Box
                      sx={{
                        textAlign: "center",
                        p: 2,
                        backgroundColor: "#2a2a2a",
                        borderRadius: 2,
                      }}
                    >
                      <Typography
                        variant="h5"
                        sx={{ fontWeight: "bold", color: "#646cff" }}
                      >
                        {course.totalHours}h
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#aaa" }}>
                        Total Hours
                      </Typography>
                    </Box>
                  </Grid>
                )}
                {course.contactHours && (
                  <Grid size={{ xs: 4 }}>
                    <Box
                      sx={{
                        textAlign: "center",
                        p: 2,
                        backgroundColor: "#2a2a2a",
                        borderRadius: 2,
                      }}
                    >
                      <Typography
                        variant="h5"
                        sx={{ fontWeight: "bold", color: "#4caf50" }}
                      >
                        {course.contactHours}h
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#aaa" }}>
                        Contact Hours
                      </Typography>
                    </Box>
                  </Grid>
                )}
                {course.selfStudyHours && (
                  <Grid size={{ xs: 4 }}>
                    <Box
                      sx={{
                        textAlign: "center",
                        p: 2,
                        backgroundColor: "#2a2a2a",
                        borderRadius: 2,
                      }}
                    >
                      <Typography
                        variant="h5"
                        sx={{ fontWeight: "bold", color: "#ff9800" }}
                      >
                        {course.selfStudyHours}h
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#aaa" }}>
                        Self Study
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}

          {/* Detailed Information Sections */}
          <Box
            sx={{
              "& .MuiAccordion-root": {
                backgroundColor: "#2a2a2a",
                color: "white",
                mb: 1,
              },
            }}
          >
            {course.intendedLearningOutcomes && (
              <Accordion defaultExpanded>
                <AccordionSummary
                  expandIcon={<ExpandMore sx={{ color: "white" }} />}
                >
                  <Typography variant="h6">Learning Outcomes</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                    {course.intendedLearningOutcomes}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            )}

            {course.content && (
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMore sx={{ color: "white" }} />}
                >
                  <Typography variant="h6">Course Content</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                    {course.content}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            )}

            {course.teachingAndLearningMethods && (
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMore sx={{ color: "white" }} />}
                >
                  <Typography variant="h6">Teaching Methods</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                    {course.teachingAndLearningMethods}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            )}

            {course.descriptionOfAchievementAndAssessmentMethods && (
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMore sx={{ color: "white" }} />}
                >
                  <Typography variant="h6">Assessment Methods</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                    {course.descriptionOfAchievementAndAssessmentMethods}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            )}

            {course.prerequisitesRecommended && (
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMore sx={{ color: "white" }} />}
                >
                  <Typography variant="h6">Prerequisites</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                    {course.prerequisitesRecommended}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            )}

            {course.readingList && (
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMore sx={{ color: "white" }} />}
                >
                  <Typography variant="h6">Reading List</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                    {course.readingList}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            )}

            {course.media && (
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMore sx={{ color: "white" }} />}
                >
                  <Typography variant="h6">Media & Resources</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                    {course.media}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            )}

            {/* Fallback sections for simpler Course data */}
            {!course.intendedLearningOutcomes && course.description && (
              <Accordion defaultExpanded>
                <AccordionSummary
                  expandIcon={<ExpandMore sx={{ color: "white" }} />}
                >
                  <Typography variant="h6">Course Description</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                    {course.description}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            )}

            {!course.teachingAndLearningMethods && course.learningMethods && (
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMore sx={{ color: "white" }} />}
                >
                  <Typography variant="h6">Learning Methods</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                    {course.learningMethods}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            )}

            {!course.descriptionOfAchievementAndAssessmentMethods &&
              course.assessment && (
                <Accordion>
                  <AccordionSummary
                    expandIcon={<ExpandMore sx={{ color: "white" }} />}
                  >
                    <Typography variant="h6">Assessment</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                      {course.assessment}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              )}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
