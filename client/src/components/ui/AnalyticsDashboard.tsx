import React from "react";
import {
  Paper,
  Typography,
  Box,
  Grid,
  LinearProgress,
  IconButton,
  Collapse,
} from "@mui/material";
import {
  Analytics,
  ExpandMore,
  ExpandLess,
} from "@mui/icons-material";

interface Course {
  id: string;
  name: string;
  code: string;
  credits: number;
  category: string;
  completed?: boolean;
}

interface AnalyticsDashboardProps {
  courses: Course[];
  totalRequiredCredits: number;
  expanded?: boolean;
  onToggleExpanded?: () => void;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  courses,
  totalRequiredCredits,
  expanded = true,
  onToggleExpanded,
}) => {
  // Calculate statistics
  const completedCourses = courses.filter((course) => course.completed);
  const totalCompletedCredits = completedCourses.reduce((sum, course) => sum + course.credits, 0);
  const totalPlannedCredits = courses.reduce((sum, course) => sum + course.credits, 0);
  const completionPercentage = totalRequiredCredits > 0 ? (totalCompletedCredits / totalRequiredCredits) * 100 : 0;

  // Category statistics
  const categoryStats = courses.reduce((acc, course) => {
    const category = course.category;
    if (!acc[category]) {
      acc[category] = { total: 0, completed: 0, planned: 0 };
    }
    acc[category].planned += course.credits;
    if (course.completed) {
      acc[category].completed += course.credits;
    }
    acc[category].total = acc[category].planned;
    return acc;
  }, {} as Record<string, { total: number; completed: number; planned: number }>);

  // Data for visual representations
  const categoryBreakdown = Object.entries(categoryStats).map(([category, stats]) => ({
    category: category === "Mandatory Courses" ? "Mandatory" 
            : category === "Practical Courses" ? "Practical"
            : category === "Cross-Disciplinary Electives" ? "Electives"
            : category === "Elective Modules in Interdisciplinary Fundamentals" ? "Interdisciplinary"
            : category,
    completed: stats.completed,
    total: stats.total,
    percentage: stats.total > 0 ? (stats.completed / stats.total) * 100 : 0,
    color: getCategoryColor(category),
  }));

  // Data for completed progress (only completed courses)
  const completedBreakdown = Object.entries(categoryStats).map(([category, stats]) => ({
    category: category === "Mandatory Courses" ? "Mandatory" 
            : category === "Practical Courses" ? "Practical"
            : category === "Cross-Disciplinary Electives" ? "Electives"
            : category === "Elective Modules in Interdisciplinary Fundamentals" ? "Interdisciplinary"
            : category,
    completed: stats.completed,
    total: stats.completed, // For completed section, total = completed
    percentage: 100, // Always 100% for completed courses
    color: getCategoryColor(category),
  })).filter(item => item.completed > 0); // Only show categories with completed courses

  // Data for planned progress (all planned courses)
  const plannedBreakdown = Object.entries(categoryStats).map(([category, stats]) => ({
    category: category === "Mandatory Courses" ? "Mandatory" 
            : category === "Practical Courses" ? "Practical"
            : category === "Cross-Disciplinary Electives" ? "Electives"
            : category === "Elective Modules in Interdisciplinary Fundamentals" ? "Interdisciplinary"
            : category,
    completed: stats.total, // For planned section, show total as the "completed" amount
    total: stats.total,
    percentage: 100, // Always 100% for planned courses
    color: getCategoryColor(category),
  })).filter(item => item.total > 0); // Only show categories with planned courses

  function getCategoryColor(category: string): string {
    switch (category) {
      case "Master Thesis":
        return "#9c27b0";
      case "Mandatory Courses":
        return "#f44336";
      case "Practical Courses":
        return "#ff9800";
      case "Cross-Disciplinary Electives":
        return "#646cff";
      case "Elective Modules in Interdisciplinary Fundamentals":
        return "#4caf50";
      default:
        return "#757575";
    }
  }

  // DonutChart component
  interface DonutChartProps {
    data: Array<{
      category: string;
      total: number;
      completed: number;
      color: string;
    }>;
    totalCredits: number;
  }

  const DonutChart: React.FC<DonutChartProps> = ({ data, totalCredits }) => {
    const size = 200;
    const strokeWidth = 30;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    
    let cumulativePercentage = 0;
    
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%" }}>
        {/* Donut Chart */}
        <Box sx={{ position: "relative", display: "inline-block", mb: 2 }}>
          <svg width={size} height={size}>
            {/* Background circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#555"
              strokeWidth={strokeWidth}
            />
            
            {/* Data segments */}
            {data.map((item, index) => {
              const percentage = totalCredits > 0 ? item.total / totalCredits : 0;
              const strokeDasharray = `${percentage * circumference} ${circumference}`;
              const strokeDashoffset = -cumulativePercentage * circumference;
              cumulativePercentage += percentage;
              
              return (
                <circle
                  key={index}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={item.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  transform={`rotate(-90 ${size / 2} ${size / 2})`}
                />
              );
            })}
          </svg>
          
          {/* Center text */}
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
            }}
          >
            <Typography variant="h6" sx={{ color: "white", fontWeight: "bold" }}>
              {totalCredits}
            </Typography>
            <Typography variant="caption" sx={{ color: "#aaa" }}>
              Total ECTS
            </Typography>
          </Box>
        </Box>
        
        {/* Legend */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, alignItems: "center" }}>
          {data.map((item, index) => (
            <Box key={index} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  backgroundColor: item.color,
                  borderRadius: "50%",
                }}
              />
              <Typography variant="caption" sx={{ color: "white" }}>
                {item.category}: {item.total} ECTS
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    );
  };

  return (
    <Paper
      sx={{
        backgroundColor: "#2a2a2a",
        borderRadius: 3,
        mb: 4,
        border: "1px solid rgba(100, 108, 255, 0.2)",
      }}
    >
      <Box
        sx={{
          p: 3,
          borderBottom: expanded ? "1px solid #444" : "none",
          cursor: onToggleExpanded ? "pointer" : "default",
        }}
        onClick={onToggleExpanded}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Analytics sx={{ color: "#646cff", fontSize: "2rem" }} />
            <Typography variant="h6" sx={{ color: "white", fontWeight: 600 }}>
              Progress Analytics
            </Typography>
          </Box>
          {onToggleExpanded && (
            <IconButton sx={{ color: "#aaa" }}>
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          )}
        </Box>

        {/* Always visible progress bar when collapsed */}
        {!expanded && (
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <LinearProgress
                variant="determinate"
                value={completionPercentage}
                sx={{
                  flexGrow: 1,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: "#444",
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: "#4caf50",
                    borderRadius: 4,
                  },
                }}
              />
              <Typography variant="body2" sx={{ color: "white", minWidth: 60, fontSize: "0.875rem" }}>
                {totalCompletedCredits}/{totalRequiredCredits} ECTS
              </Typography>
            </Box>
          </Box>
        )}
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ p: 3 }}>
          {/* Progress Section */}
          <Box sx={{ mb: 6 }}>
            <Typography variant="h6" sx={{ color: "white", mb: 3 }}>
              Progress
            </Typography>
            
            {/* Overall Progress */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ color: "#aaa", mb: 2 }}>
                Overall Progress
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={completionPercentage}
                  sx={{
                    flexGrow: 1,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: "#444",
                    "& .MuiLinearProgress-bar": {
                      backgroundColor: "#4caf50",
                      borderRadius: 6,
                    },
                  }}
                />
                <Typography variant="body2" sx={{ color: "white", minWidth: 60 }}>
                  {totalCompletedCredits}/{totalRequiredCredits} ECTS
                </Typography>
              </Box>
            </Box>

            {/* Progress Visualization */}
            <Grid container spacing={3}>
              {/* Donut Chart */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper sx={{ backgroundColor: "#333", p: 3, borderRadius: 2, minHeight: "300px", display: "flex", flexDirection: "column" }}>
                  <Typography variant="h6" sx={{ color: "white", mb: 3, textAlign: "center" }}>
                    Completed Credits Distribution
                  </Typography>
                  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", flex: 1 }}>
                    <DonutChart
                      data={completedBreakdown}
                      totalCredits={totalCompletedCredits}
                    />
                  </Box>
                </Paper>
              </Grid>

              {/* Progress Bars */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper sx={{ backgroundColor: "#333", p: 3, borderRadius: 2, minHeight: "300px", display: "flex", flexDirection: "column" }}>
                  <Typography variant="h6" sx={{ color: "white", mb: 3, textAlign: "center" }}>
                    Category Progress
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, justifyContent: categoryBreakdown.filter(item => item.total > 0).length === 0 ? "center" : "flex-start" }}>
                    {categoryBreakdown.filter(item => item.total > 0).length === 0 ? (
                      <Box sx={{ textAlign: "center", color: "#aaa" }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          No courses added yet
                        </Typography>
                        <Typography variant="caption">
                          Add courses to see category progress
                        </Typography>
                      </Box>
                    ) : (
                      categoryBreakdown
                        .filter(item => item.total > 0)
                        .map((item) => (
                          <Box key={item.category}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                              <Typography variant="body2" sx={{ color: "white" }}>
                                {item.category}
                              </Typography>
                              <Typography variant="body2" sx={{ color: "#aaa" }}>
                                {item.completed}/{item.total} ECTS
                              </Typography>
                            </Box>
                            <Box sx={{ position: "relative", height: 20, backgroundColor: "#555", borderRadius: 2, overflow: "hidden" }}>
                              <Box
                                sx={{
                                  position: "absolute",
                                  top: 0,
                                  left: 0,
                                  height: "100%",
                                  width: `${item.percentage}%`,
                                  backgroundColor: item.color,
                                  transition: "width 0.3s ease",
                                }}
                              />
                              <Typography
                                variant="caption"
                                sx={{
                                  position: "absolute",
                                  top: "50%",
                                  left: "50%",
                                  transform: "translate(-50%, -50%)",
                                  color: "white",
                                  fontWeight: "bold",
                                  fontSize: "0.7rem",
                                }}
                              >
                                {item.completed} ECTS
                              </Typography>
                            </Box>
                          </Box>
                        ))
                    )}
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>

          {/* Planned Progress Section */}
          <Box>
            <Typography variant="h6" sx={{ color: "white", mb: 3 }}>
              Planned Progress
            </Typography>
            
            {/* Overall Planned Progress */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ color: "#aaa", mb: 2 }}>
                Overall Planned Progress
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={totalRequiredCredits > 0 ? (totalPlannedCredits / totalRequiredCredits) * 100 : 0}
                  sx={{
                    flexGrow: 1,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: "#444",
                    "& .MuiLinearProgress-bar": {
                      backgroundColor: "#646cff",
                      borderRadius: 6,
                    },
                  }}
                />
                <Typography variant="body2" sx={{ color: "white", minWidth: 60 }}>
                  {totalPlannedCredits}/{totalRequiredCredits} ECTS
                </Typography>
              </Box>
            </Box>

            {/* Planned Progress Visualization */}
            <Grid container spacing={3}>
              {/* Donut Chart */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper sx={{ backgroundColor: "#333", p: 3, borderRadius: 2, minHeight: "300px", display: "flex", flexDirection: "column" }}>
                  <Typography variant="h6" sx={{ color: "white", mb: 3, textAlign: "center" }}>
                    Planned Credits Distribution
                  </Typography>
                  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", flex: 1 }}>
                    <DonutChart
                      data={plannedBreakdown}
                      totalCredits={totalPlannedCredits}
                    />
                  </Box>
                </Paper>
              </Grid>

              {/* Progress Bars */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper sx={{ backgroundColor: "#333", p: 3, borderRadius: 2, minHeight: "300px", display: "flex", flexDirection: "column" }}>
                  <Typography variant="h6" sx={{ color: "white", mb: 3, textAlign: "center" }}>
                    Category Planning
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, justifyContent: Object.entries(categoryStats).filter(([, stats]) => stats.total > 0).length === 0 ? "center" : "flex-start" }}>
                    {Object.entries(categoryStats).filter(([, stats]) => stats.total > 0).length === 0 ? (
                      <Box sx={{ textAlign: "center", color: "#aaa" }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          No courses planned yet
                        </Typography>
                        <Typography variant="caption">
                          Add courses to see planning distribution
                        </Typography>
                      </Box>
                    ) : (
                      Object.entries(categoryStats).map(([category, stats]) => (
                        stats.total > 0 && (
                          <Box key={category}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                              <Typography variant="body2" sx={{ color: "white" }}>
                                {category === "Mandatory Courses" ? "Mandatory" 
                                 : category === "Practical Courses" ? "Practical"
                                 : category === "Cross-Disciplinary Electives" ? "Electives"
                                 : category === "Elective Modules in Interdisciplinary Fundamentals" ? "Interdisciplinary"
                                 : category}
                              </Typography>
                              <Typography variant="body2" sx={{ color: "#aaa" }}>
                                {stats.total} ECTS
                              </Typography>
                            </Box>
                            <Box sx={{ position: "relative", height: 20, backgroundColor: "#555", borderRadius: 2, overflow: "hidden" }}>
                              <Box
                                sx={{
                                  position: "absolute",
                                  top: 0,
                                  left: 0,
                                  height: "100%",
                                  width: "100%",
                                  backgroundColor: getCategoryColor(category),
                                  transition: "width 0.3s ease",
                                }}
                              />
                              <Typography
                                variant="caption"
                                sx={{
                                  position: "absolute",
                                  top: "50%",
                                  left: "50%",
                                  transform: "translate(-50%, -50%)",
                                  color: "white",
                                  fontWeight: "bold",
                                  fontSize: "0.7rem",
                                }}
                              >
                                {stats.total} ECTS
                              </Typography>
                            </Box>
                          </Box>
                        )
                      ))
                    )}
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default AnalyticsDashboard;
