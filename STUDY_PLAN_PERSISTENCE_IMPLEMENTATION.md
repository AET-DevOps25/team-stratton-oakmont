# Study Plan Database Persistence Implementation

## Overview

This document outlines the complete implementation of database persistence for study plan changes, transitioning from JSON storage to a proper relational database structure.

## Database Schema

### New Tables Created

#### 1. `- **Advanced Querying**: Complex queries for statistics and reporting

- **Scalability**: Normalized structure supports growth
- **Module Tracking**: Individual module completion tracking
- **Audit Trail**: Created/modified timestamps for all entitiessters` Table
- **Purpose**: Store semester information within study plans
- **Columns**:
  - `id` (BIGINT, Primary Key, Auto-increment)
  - `name` (VARCHAR(255), Not Null) - e.g., "Semester 1", "WS 2023/24"
  - `w_or_s` (VARCHAR(10)) - "WS" (Winter) or "SS" (Summer)
  - `semester_order` (INTEGER) - Order within the study plan
  - `study_plan_id` (BIGINT, Foreign Key to study_plans)
  - `created_date` (TIMESTAMP)
  - `updated_date` (TIMESTAMP)

#### 2. `semester_modules` Table

- **Purpose**: Store modules within each semester (junction table with additional metadata)
- **Columns**:
  - `id` (BIGINT, Primary Key, Auto-increment)
  - `semester_id` (BIGINT, Foreign Key to semesters)
  - `module_id` (BIGINT) - Reference to module in program-catalog-service
  - `module_order` (INTEGER) - Order within the semester
  - `module_name` (VARCHAR(255)) - Denormalized for performance
  - `module_code` (VARCHAR(50)) - Denormalized for performance
  - `credits` (INTEGER) - ECTS credits
  - `is_completed` (BOOLEAN, Default false)
  - `added_date` (TIMESTAMP)
  - `completed_date` (TIMESTAMP)

### Relationships

- `study_plans` 1 → many `semesters`
- `semesters` 1 → many `semester_modules`
- `semester_modules` many → 1 `modules` (external reference)

## Backend Implementation

### New Entities Created

1. **Semester.java** - JPA entity for semester management
2. **SemesterModule.java** - JPA entity for semester-module relationships

### New Repository Interfaces

1. **SemesterRepository.java** - Data access for semesters
2. **SemesterModuleRepository.java** - Data access for semester modules

### New Service Classes

1. **SemesterService.java** - Business logic for semester management
2. **SemesterModuleService.java** - Business logic for module management within semesters

### New Controller

**SemesterController.java** - REST API endpoints for semester and module operations

### New DTOs

1. **SemesterDto.java** - Data transfer object for semesters
2. **SemesterModuleDto.java** - Data transfer object for semester modules
3. **CreateSemesterRequest.java** - Request DTO for creating semesters
4. **AddModuleToSemesterRequest.java** - Request DTO for adding modules to semesters

## API Endpoints

### Semester Management

| Method | Endpoint                                  | Description                        |
| ------ | ----------------------------------------- | ---------------------------------- |
| POST   | `/api/semesters`                          | Create new semester                |
| GET    | `/api/semesters/{id}`                     | Get semester by ID                 |
| GET    | `/api/semesters/study-plan/{studyPlanId}` | Get all semesters for a study plan |
| PUT    | `/api/semesters/{id}`                     | Update semester                    |
| DELETE | `/api/semesters/{id}`                     | Delete semester                    |

### Module Management within Semesters

| Method | Endpoint                                             | Description                 |
| ------ | ---------------------------------------------------- | --------------------------- |
| POST   | `/api/semesters/{semesterId}/modules`                | Add module to semester      |
| GET    | `/api/semesters/{semesterId}/modules`                | Get all modules in semester |
| DELETE | `/api/semesters/{semesterId}/modules/{moduleId}`     | Remove module from semester |
| PUT    | `/api/semesters/modules/{moduleRecordId}`            | Update module details       |
| PUT    | `/api/semesters/modules/{moduleRecordId}/completion` | Toggle module completion    |

### Statistics

| Method | Endpoint                            | Description                        |
| ------ | ----------------------------------- | ---------------------------------- |
| GET    | `/api/semesters/{semesterId}/stats` | Get semester completion statistics |

## Frontend Integration Guide

### Required Changes to StudyPlanDetailPage.tsx

The frontend needs to be updated to use the new API endpoints instead of storing semester data in the `planData` JSON field.

#### 1. Update Data Fetching

Replace the current approach of reading semesters from `planData` with API calls:

```typescript
// OLD: Reading from planData
const semesters = studyPlan.planData?.semesters || [];

// NEW: Fetch from API
const [semesters, setSemesters] = useState<SemesterDto[]>([]);

useEffect(() => {
  if (studyPlan?.id) {
    fetchSemesters(studyPlan.id);
  }
}, [studyPlan?.id]);

const fetchSemesters = async (studyPlanId: number) => {
  try {
    const response = await fetch(`/api/semesters/study-plan/${studyPlanId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const semestersData = await response.json();
    setSemesters(semestersData);
  } catch (error) {
    console.error("Error fetching semesters:", error);
  }
};
```

#### 2. Update Semester Creation

```typescript
const handleAddSemester = async () => {
  try {
    const response = await fetch("/api/semesters", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        studyPlanId: studyPlan.id,
        name: `Semester ${semesters.length + 1}`,
        wOrS: "WS", // or determine based on semester number
        semesterOrder: semesters.length + 1,
      }),
    });

    if (response.ok) {
      const newSemester = await response.json();
      setSemesters([...semesters, newSemester]);
    }
  } catch (error) {
    console.error("Error creating semester:", error);
  }
};
```

#### 3. Update Module Management

```typescript
const handleAddModuleToSemester = async (
  semesterId: number,
  moduleId: number,
  moduleData: any
) => {
  try {
    const response = await fetch(`/api/semesters/${semesterId}/modules`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        moduleId: moduleId,
        moduleName: moduleData.name,
        moduleCode: moduleData.code,
        credits: moduleData.credits,
      }),
    });

    if (response.ok) {
      // Refresh the semester modules
      fetchSemesterModules(semesterId);
    }
  } catch (error) {
    console.error("Error adding module:", error);
  }
};

const handleRemoveModuleFromSemester = async (
  semesterId: number,
  moduleId: number
) => {
  try {
    const response = await fetch(
      `/api/semesters/${semesterId}/modules/${moduleId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.ok) {
      // Refresh the semester modules
      fetchSemesterModules(semesterId);
    }
  } catch (error) {
    console.error("Error removing module:", error);
  }
};
```

#### 4. Update SemesterCard Component

The SemesterCard component needs to work with the new semester structure:

```typescript
interface SemesterCardProps {
  semester: SemesterDto;
  onUpdateSemester: (semester: SemesterDto) => void;
  onDeleteSemester: (semesterId: number) => void;
  onAddModule: (semesterId: number, moduleId: number, moduleData: any) => void;
  onRemoveModule: (semesterId: number, moduleId: number) => void;
}
```

### Data Types for Frontend

```typescript
interface SemesterDto {
  id: number;
  name: string;
  wOrS: "WS" | "SS";
  semesterOrder: number;
  studyPlanId: number;
  createdDate: string;
  updatedDate: string;
}

interface SemesterModuleDto {
  id: number;
  semesterId: number;
  moduleId: number;
  moduleOrder: number;
  moduleName: string;
  moduleCode: string;
  credits: number;
  isCompleted: boolean;
  addedDate: string;
  completedDate?: string;
}

interface CreateSemesterRequest {
  studyPlanId: number;
  name: string;
  wOrS: "WS" | "SS";
  semesterOrder?: number;
}

interface AddModuleToSemesterRequest {
  moduleId: number;
  moduleName: string;
  moduleCode: string;
  credits: number;
  moduleOrder?: number;
}
```

## Migration Strategy

### Phase 1: Backend Preparation (✅ COMPLETED)

- [x] Create new database entities and relationships
- [x] Implement service layer for semester and module management
- [x] Create REST API endpoints
- [x] Ensure backward compatibility with existing planData

### Phase 2: Frontend Migration

- [ ] Update data fetching to use new API endpoints
- [ ] Modify semester creation/deletion logic
- [ ] Update module management within semesters
- [ ] Test with existing study plans
- [ ] Handle migration of existing planData to new structure

### Phase 3: Data Migration

- [ ] Create migration script to convert existing planData to new structure
- [ ] Migrate existing study plans
- [ ] Remove or deprecate planData field

## Benefits of New Structure

1. **Better Data Integrity**: Foreign key constraints ensure referential integrity
2. **Improved Performance**: Indexed queries instead of JSON parsing
3. **Advanced Querying**: Complex queries for statistics and reporting
4. **Scalability**: Normalized structure supports growth
5. **Module Tracking**: Individual module completion and grading
6. **Audit Trail**: Created/modified timestamps for all entities

## Backward Compatibility

The existing `planData` field in the `study_plans` table remains intact, ensuring that:

- Existing study plans continue to work
- Frontend can be migrated incrementally
- Data migration can be performed safely

## Next Steps

1. **Update Frontend Components**: Modify React components to use new API endpoints
2. **Test Integration**: Thoroughly test the new semester/module management
3. **Data Migration**: Create and run migration scripts for existing data
4. **Performance Optimization**: Add database indexes as needed
5. **Documentation**: Update API documentation and user guides
