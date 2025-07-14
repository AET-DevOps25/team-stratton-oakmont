import React from "react";
import {
  Paper,
  Typography,
  Box,
  Grid,
  LinearProgress,
  Card,
  Chip,
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

  // Data for visual representations (simplified without charts)
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
      <Box sx={{ position: "relative", display: "inline-block" }}>
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
        
        {/* Legend */}
        <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1 }}>
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
          {/* Overall Progress */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ color: "white", mb: 2 }}>
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

          {/* Visual Progress Representation */}
          <Grid container spacing={3}>
            {/* Credits Distribution */}
            <Grid size={{ xs: 12, lg: 6 }}>
              <Paper sx={{ backgroundColor: "#333", p: 3, borderRadius: 2 }}>
                <Typography variant="h6" sx={{ color: "white", mb: 3, textAlign: "center" }}>
                  Credits Distribution
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {categoryBreakdown
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
                            {item.percentage.toFixed(0)}%
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Category Breakdown */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" sx={{ color: "white", mb: 3 }}>
              Category Breakdown
            </Typography>
            <Grid container spacing={4}>
              {/* Donut Chart */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper sx={{ backgroundColor: "#333", p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ color: "white", mb: 3, textAlign: "center" }}>
                    Credit Distribution
                  </Typography>
                  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <DonutChart
                      data={categoryBreakdown}
                      totalCredits={totalPlannedCredits}
                    />
                  </Box>
                </Paper>
              </Grid>

              {/* Category Details */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {Object.entries(categoryStats).map(([category, stats]) => (
                    <Card key={category} sx={{ backgroundColor: "#333", p: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ color: "white" }}>
                          {category === "Mandatory Courses" ? "Mandatory" 
                           : category === "Practical Courses" ? "Practical"
                           : category === "Cross-Disciplinary Electives" ? "Electives"
                           : category === "Elective Modules in Interdisciplinary Fundamentals" ? "Interdisciplinary"
                           : category}
                        </Typography>
                        <Chip
                          label={`${stats.completed}/${stats.total} ECTS`}
                          size="small"
                          sx={{
                            backgroundColor: getCategoryColor(category),
                            color: "white",
                            fontSize: "0.7rem",
                          }}
                        />
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: "#555",
                          "& .MuiLinearProgress-bar": {
                            backgroundColor: getCategoryColor(category),
                            borderRadius: 4,
                          },
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{ color: "#aaa", display: "block", mt: 1 }}
                      >
                        {stats.total > 0 ? `${((stats.completed / stats.total) * 100).toFixed(0)}% Complete` : "No courses"}
                      </Typography>
                    </Card>
                  ))}
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default AnalyticsDashboard;
