# API Testing Guide for Study Plan Persistence

## Quick Test Commands

### 1. Create a Semester

```bash
curl -X POST http://localhost:8081/api/semesters \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "studyPlanId": 1,
    "name": "Semester 1",
    "wOrS": "WS",
    "semesterOrder": 1
  }'
```

### 2. Get Semesters for a Study Plan

```bash
curl -X GET http://localhost:8081/api/semesters/study-plan/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Add Module to Semester

```bash
curl -X POST http://localhost:8081/api/semesters/1/modules \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "moduleId": 123,
    "moduleName": "Mathematics I",
    "moduleCode": "MA0901",
    "credits": 6,
    "moduleOrder": 1
  }'
```

### 4. Get Modules in a Semester

```bash
curl -X GET http://localhost:8081/api/semesters/1/modules \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5. Toggle Module Completion

```bash
curl -X PUT http://localhost:8081/api/semesters/modules/1/completion \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 6. Get Semester Statistics

```bash
curl -X GET http://localhost:8081/api/semesters/1/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 7. Update Semester

```bash
curl -X PUT http://localhost:8081/api/semesters/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Winter Semester 2023/24",
    "wOrS": "WS",
    "semesterOrder": 1
  }'
```

### 8. Delete Module from Semester

```bash
curl -X DELETE http://localhost:8081/api/semesters/1/modules/123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 9. Delete Semester

```bash
curl -X DELETE http://localhost:8081/api/semesters/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Expected Response Examples

### Semester Response

```json
{
  "id": 1,
  "name": "Semester 1",
  "wOrS": "WS",
  "semesterOrder": 1,
  "studyPlanId": 1,
  "createdDate": "2024-01-15T10:30:00",
  "updatedDate": "2024-01-15T10:30:00"
}
```

### Semester Module Response

```json
{
  "id": 1,
  "semesterId": 1,
  "moduleId": 123,
  "moduleOrder": 1,
  "moduleName": "Mathematics I",
  "moduleCode": "MA0901",
  "credits": 6,
  "isCompleted": false,
  "addedDate": "2024-01-15T10:35:00",
  "completedDate": null
}
```

### Statistics Response

```json
{
  "semesterId": 1,
  "totalModules": 5,
  "completedModules": 2,
  "totalCredits": 30,
  "completedCredits": 12,
  "completionPercentage": 40.0
}
```

## Notes

- Replace `YOUR_JWT_TOKEN` with a valid JWT token from the authentication service
- Replace `localhost:8081` with your actual study-plan-service URL
- All endpoints require valid authentication
- The study-plan-service should be running on port 8081
