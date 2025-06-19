import React from 'react';
import {
  Container,
  Typography,
  Box,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  Info
} from '@mui/icons-material';

interface Course {
  name: string;
  category: string;
  credits: number;
}

interface Semester {
  number: number;
  courses: Course[];
  totalCredits: number;
}

const StudyPlansPage: React.FC = () => {
  // Mock data - replace with real data later
  const mockSemesters: Semester[] = [
    {
      number: 1,
      courses: [
        { name: 'Course X', category: 'Algorithmen', credits: 6 },
        { name: 'Course X', category: 'Algorithmen', credits: 6 },
        { name: 'Course X', category: 'Algorithmen', credits: 6 },
        { name: 'Course X', category: 'Algorithmen', credits: 6 },
        { name: 'Course X', category: 'Algorithmen', credits: 6 }
      ],
      totalCredits: 30
    },
    {
      number: 2,
      courses: [
        { name: 'Course X', category: 'Algorithmen', credits: 6 },
        { name: 'Course X', category: 'Algorithmen', credits: 6 },
        { name: 'Course X', category: 'Algorithmen', credits: 6 },
        { name: 'Course X', category: 'Algorithmen', credits: 6 }
      ],
      totalCredits: 24
    },
    {
      number: 3,
      courses: [
        { name: 'Course X', category: 'Algorithmen', credits: 6 },
        { name: 'Course X', category: 'Algorithmen', credits: 6 },
        { name: 'Course X', category: 'Algorithmen', credits: 6 },
        { name: 'Course X', category: 'Algorithmen', credits: 6 }
      ],
      totalCredits: 24
    }
  ];

  const totalCredits = 120;
  const completedCredits = 40;
  const plannedCredits = 78;

  // Progress circle component
  const ProgressCircle = ({ current, total, label }: { current: number; total: number; label: string }) => (
    <Box sx={{ textAlign: 'center', minWidth: 120 }}>
      <Box
        sx={{
          position: 'relative',
          display: 'inline-flex',
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: `conic-gradient(#ff6b35 ${(current / total) * 360}deg, #333 0deg)`,
          alignItems: 'center',
          justifyContent: 'center',
          mb: 1
        }}
      >
        <Box
          sx={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            backgroundColor: '#2a2a2a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '12px',
            fontWeight: 'bold'
          }}
        >
          {current}/{total}
        </Box>
      </Box>
      <Typography variant="caption" sx={{ color: 'white', fontSize: '11px' }}>
        {label}
      </Typography>
    </Box>
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#1a1a1a',
        color: 'white',
        p: 3
      }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            M.Sc. Information Systems
          </Typography>
          <Chip 
            label="Progress" 
            sx={{ 
              backgroundColor: '#333', 
              color: 'white',
              border: '1px solid #555'
            }} 
          />
        </Box>

        {/* Progress Bars */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <ExpandMore sx={{ mr: 1 }} />
              <Typography variant="body2">Planned Progress</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="caption" sx={{ mr: 2, minWidth: 20 }}>
                {completedCredits}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(completedCredits / totalCredits) * 100}
                sx={{
                  flexGrow: 1,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: '#333',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#646cff'
                  }
                }}
              />
              <Typography variant="caption" sx={{ ml: 2, minWidth: 30 }}>
                {totalCredits}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <ExpandLess sx={{ mr: 1 }} />
              <Typography variant="body2">Progress</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="caption" sx={{ mr: 2, minWidth: 20 }}>
                {plannedCredits}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(plannedCredits / totalCredits) * 100}
                sx={{
                  flexGrow: 1,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: '#333',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#646cff'
                  }
                }}
              />
              <Typography variant="caption" sx={{ ml: 2, minWidth: 30 }}>
                {totalCredits}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Progress Circles */}
        <Box sx={{ display: 'flex', gap: 4, mb: 4, justifyContent: 'center' }}>
          <ProgressCircle current={12} total={18} label="Management" />
          <ProgressCircle current={12} total={18} label="Management" />
          <ProgressCircle current={12} total={18} label="Management" />
          <ProgressCircle current={12} total={18} label="Management" />
          <ProgressCircle current={12} total={18} label="Management" />
        </Box>

        {/* Semesters */}
        <Box>
          {mockSemesters.map((semester) => (
            <Accordion
              key={semester.number}
              defaultExpanded
              sx={{
                backgroundColor: '#2a2a2a',
                color: 'white',
                mb: 2,
                '&:before': {
                  display: 'none'
                }
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMore sx={{ color: 'white' }} />}
                sx={{
                  '& .MuiAccordionSummary-content': {
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }
                }}
              >
                <Typography variant="h6">
                  {semester.number}. Semester
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body2" sx={{ color: '#aaa' }}>
                    {semester.totalCredits} Credits
                  </Typography>
                  <IconButton size="small" sx={{ color: 'white' }}>
                    <Info fontSize="small" />
                  </IconButton>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <TableContainer component={Paper} sx={{ backgroundColor: '#333' }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ color: 'white', borderBottom: '1px solid #555' }}>
                          Course
                        </TableCell>
                        <TableCell sx={{ color: 'white', borderBottom: '1px solid #555' }}>
                          Category
                        </TableCell>
                        <TableCell align="right" sx={{ color: 'white', borderBottom: '1px solid #555' }}>
                          Credits
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {semester.courses.map((course, index) => (
                        <TableRow key={index}>
                          <TableCell sx={{ color: 'white', borderBottom: '1px solid #555' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <ExpandMore sx={{ mr: 1, fontSize: 16 }} />
                              {course.name}
                            </Box>
                          </TableCell>
                          <TableCell sx={{ color: 'white', borderBottom: '1px solid #555' }}>
                            {course.category}
                          </TableCell>
                          <TableCell align="right" sx={{ color: 'white', borderBottom: '1px solid #555' }}>
                            {course.credits}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>

        {/* Info Icon at bottom */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <IconButton sx={{ color: '#666' }}>
            <Info />
          </IconButton>
        </Box>
      </Container>
    </Box>
  );
};

export default StudyPlansPage;