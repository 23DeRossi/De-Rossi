# Security Specification - Rapor Kurikulum Merdeka

## Data Invariants
1. Students must have a valid class reference.
2. Grades must reference existing students and subjects.
3. Teachers can only edit grades for subjects they teach or if they are admins.
4. Students/Grades cannot be deleted by unauthorized teachers.
5. `createdAt` and `updatedAt` must be server-validated.

## The Dirty Dozen Payloads (Rejection Tests)
1. Creating a student with a 2MB name string (Denial of Wallet).
2. Updating a grade's `studentId` to point to a different student (Identity Spoofing).
3. A teacher updating a grade for a subject they don't teach (Privilege Escalation).
4. Creating a student profile with `isAdmin: true` set by the client (Self-Assigned Role).
5. Deleting a student record by a non-admin teacher.
6. Updating `createdAt` timestamp (Immortality breach).
7. Injecting special characters or scripts into NISN (Resource Poisoning).
8. Reading all teacher private profiles without being logged in (PII Leak).
9. Listing all grades without filtering by class or student (Query Scraping).
10. Creating a grade with a negative score (Validation failure).
11. Updating a terminal report status from "Finished" to "Edit" without admin rights.
12. Shadow updating a student with a `highly_verified: true` ghost field.

## Secure Helpers Summary
- `isValidId(id)`: Regex and size check.
- `isAdmin()`: Check against `/admins/` collection.
- `isTeacherOf(subjectId)`: Check teacher's profile subjects.
- `isValidStudent(data)`: Schema validation.
- `isValidGrade(data)`: Schema validation.
