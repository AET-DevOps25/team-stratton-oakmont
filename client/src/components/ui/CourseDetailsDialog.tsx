import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Divider,
} from "@mui/material";

// Course interface
interface Course {
  id: string;
  name: string;
  code: string;
  credits: number;
  semester: string;
  language: string;
  professor: string;
  occurrence: string;
  description?: string;
  prerequisites?: string[];
  category: string;
  subcategory?: string;
  subSubcategory?: string;
  completed?: boolean;
  learningMethods?: string;
  assessment?: string;
}

interface CourseDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  course: Course | null;
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case "Mandatory Courses":
      return "#2196f3";
    case "Practical Courses":
      return "#4caf50";
    case "Cross-Disciplinary Electives":
      return "#ff9800";
    case "Elective Modules in Interdisciplinary Fundamentals":
      return "#9c27b0";
    default:
      return "#666";
  }
};

export const CourseDetailsDialog: React.FC<CourseDetailsDialogProps> = ({
  open,
  onClose,
  course,
}) => {
  if (!course) return null;

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
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {course.name}
          </Typography>
          <Chip
            label={course.code}
            sx={{
              backgroundColor: "#555",
              color: "white",
            }}
          />
        </Box>
        <Chip
          label={
            course.category === "Mandatory Courses"
              ? "Mandatory"
              : course.category === "Practical Courses"
              ? "Practical"
              : course.category === "Cross-Disciplinary Electives"
              ? "Electives"
              : course.category === "Elective Modules in Interdisciplinary Fundamentals"
              ? "Interdisciplinary"
              : course.category
          }
          sx={{
            backgroundColor: getCategoryColor(course.category),
            color: "white",
          }}
        />
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3, mb: 3 }}>
          <Box>
            <Typography variant="subtitle2" sx={{ color: "#aaa", mb: 1 }}>
              Credits
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {course.credits} ECTS
            </Typography>
          </Box>
          
          <Box>
            <Typography variant="subtitle2" sx={{ color: "#aaa", mb: 1 }}>
              Professor
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {course.professor}
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ color: "#aaa", mb: 1 }}>
              Occurrence
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {course.occurrence}
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ color: "#aaa", mb: 1 }}>
              Status
            </Typography>
            <Chip
              label={course.completed ? "Completed" : "Not Completed"}
              size="small"
              sx={{
                backgroundColor: course.completed ? "#4caf50" : "#666",
                color: "white",
              }}
            />
          </Box>
        </Box>

        <Divider sx={{ my: 2, borderColor: "#444" }} />

        <Box>
          <Typography variant="subtitle2" sx={{ color: "#aaa", mb: 2 }}>
            Course Description
          </Typography>
          <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
            {course.description || "No description available for this course."}
          </Typography>
        </Box>

        <Divider sx={{ my: 2, borderColor: "#444" }} />

        <Box>
          <Typography variant="subtitle2" sx={{ color: "#aaa", mb: 2 }}>
            Learning Methods
          </Typography>
          <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
            {course.learningMethods || "Learning methods information not available."}
          </Typography>
        </Box>

        <Divider sx={{ my: 2, borderColor: "#444" }} />

        <Box>
          <Typography variant="subtitle2" sx={{ color: "#aaa", mb: 2 }}>
            Assessment
          </Typography>
          <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
            {course.assessment || "Assessment information not available."}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} sx={{ color: "#646cff" }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
