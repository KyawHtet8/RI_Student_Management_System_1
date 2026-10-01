package com.rockstar.ri.service;

import com.rockstar.ri.model.Student;
import com.rockstar.ri.exception.ResourceNotFoundException;
import com.rockstar.ri.repository.StudentRepository;
import com.rockstar.ri.repository.AttendanceRecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Year;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class StudentService {

    private static final Set<String> STUDENT_STATUSES = Set.of("Active", "On Leave", "Graduated", "Suspended");

    private final StudentRepository repository;
    private final EnrollmentService enrollmentService;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final SecureRandom secureRandom = new SecureRandom();

    // ၁။ ကျောင်းသားအားလုံး ရယူခြင်း (Department filter ပါဝင်သည်)
    @Transactional(readOnly = true)
    public List<Student> getStudents(String department) {
        if (department != null && !department.isBlank() && !department.equalsIgnoreCase("All")) {
            return repository.findByDepartmentIgnoreCase(department);
        }
        return repository.findAll();
    }

    // ၂။ ID ဖြင့် ကျောင်းသားတစ်ဦးတည်းကို ရှာဖွေခြင်း
    @Transactional(readOnly = true)
    public Student getStudentById(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + id));
    }

    // ၃။ ကျောင်းသားအသစ် မှတ်ပုံတင်ခြင်း (100% Safe ID Generation)
    @Transactional
    public Student createStudent(Student student) {
        // [Best Fit 1] Primary Key မပါလာပါက Full UUID ဖြင့် လုံခြုံစွာ ထုတ်ပေးခြင်း
        if (student.getId() == null || student.getId().isBlank()) {
            student.setId("std-" + UUID.randomUUID().toString());
        }

        // [Best Fit 2] ကျောင်းသားကတ် ID မပါလာပါက တက္ကသိုလ်သုံး ပုံစံဖြင့် မထပ်အောင် ထုတ်ပေးခြင်း
        if (student.getStudentId() == null || student.getStudentId().isBlank()) {
            student.setStudentId(generateSafeStudentCardId());
        }

        // [Best Fit 3] Email တူ/မတူ စစ်ဆေးခြင်း
        if (repository.existsByEmail(student.getEmail())) {
            throw new IllegalArgumentException("Student email already exists: " + student.getEmail());
        }

        // GPA is derived from graded enrollments. A new student has no
        // academic results yet, so never accept a manually supplied GPA.
        student.setGpa(0.0);

        log.info("Successfully registered student: {} {} with Card ID: {}", 
                student.getFirstName(), student.getLastName(), student.getStudentId());
        
        return repository.save(student);
    }

    // ၄။ ကျောင်းသား အချက်အလက် ပြင်ဆင်ခြင်း
    @Transactional
    public Student updateStudent(String id, Student updated) {
        Student existing = getStudentById(id);

        // PUT is kept compatible with existing clients that send partial profile updates.
        if (updated.getFirstName() != null) existing.setFirstName(updated.getFirstName());
        if (updated.getLastName() != null) existing.setLastName(updated.getLastName());
        if (updated.getEmail() != null && !updated.getEmail().equalsIgnoreCase(existing.getEmail())
                && repository.existsByEmailAndIdNot(updated.getEmail(), id)) {
            throw new IllegalArgumentException("Student email already exists: " + updated.getEmail());
        }
        if (updated.getEmail() != null) existing.setEmail(updated.getEmail());
        if (updated.getPhone() != null) existing.setPhone(updated.getPhone());
        if (updated.getDateOfBirth() != null) existing.setDateOfBirth(updated.getDateOfBirth());
        if (updated.getGender() != null) existing.setGender(updated.getGender());
        if (updated.getMajor() != null) existing.setMajor(updated.getMajor());
        if (updated.getDepartment() != null) existing.setDepartment(updated.getDepartment());
        if (updated.getYear() != null) existing.setYear(updated.getYear());
        // GPA is derived from enrollments and must not be edited as profile data.
        if (updated.getStatus() != null) existing.setStatus(updated.getStatus());
        if (updated.getTuitionStatus() != null) existing.setTuitionStatus(updated.getTuitionStatus());
        if (updated.getAdvisor() != null) existing.setAdvisor(updated.getAdvisor());
        if (updated.getAvatarUrl() != null) existing.setAvatarUrl(updated.getAvatarUrl());
        if (updated.getExpectedGraduation() != null) existing.setExpectedGraduation(updated.getExpectedGraduation());
        if (updated.getAddress() != null) existing.setAddress(updated.getAddress());
        if (updated.getEmergencyContact() != null) existing.setEmergencyContact(updated.getEmergencyContact());
        if (updated.getNotes() != null) existing.setNotes(updated.getNotes());

        log.info("Updated student details for ID: {}", id);
        return repository.save(existing);
    }

    // ၅။ ကျောင်းသား ဖျက်သိမ်းခြင်း
    @Transactional
    public void deleteStudent(String id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Cannot delete: Student not found with ID: " + id);
        }

        // Remove dependent records before deleting the parent student. The
        // database foreign keys intentionally prevent a direct parent delete.
        enrollmentService.getByStudent(id).forEach(enrollment ->
                enrollmentService.deleteEnrollment(enrollment.getId()));
        attendanceRecordRepository.deleteByStudentId(id);
        log.warn("Deleted student with ID: {}", id);
        repository.deleteById(id);
    }

    // ၆။ Frontend Batch Selection အတွက် (အုပ်စုလိုက် Status ပြောင်းခြင်း)
    @Transactional
    public void batchUpdateStatus(List<String> ids, String status) {
        String normalizedStatus = STUDENT_STATUSES.stream()
                .filter(value -> value.equalsIgnoreCase(status == null ? "" : status.trim()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Invalid student status: " + status));
        log.info("Batch updating status to '{}' for {} students", status, ids.size());
        List<Student> students = repository.findAllById(ids);
        if (students.size() != ids.stream().distinct().count()) {
            throw new ResourceNotFoundException("One or more students could not be found");
        }
        students.forEach(student -> student.setStatus(normalizedStatus));
        repository.saveAll(students);
    }

    // ==========================================
    // 🛡️ Helper: Collision-Free Student Card ID
    // ပုံစံ: U-2026-1045 (Year + 4 Digit Random with Collision-Check)
    // ==========================================
    private String generateSafeStudentCardId() {
        int year = Year.now().getValue(); // e.g. 2026
        String candidateId;
        boolean exists;

        do {
            // SecureRandom ဖြင့် ခန့်မှန်းရခက်သော 4-digit နံပါတ် ထုတ်ပေးခြင်း (1000 - 9999)
            int randomNum = 1000 + secureRandom.nextInt(9000);
            candidateId = String.format("U-%d-%04d", year, randomNum);
            
            // Database ထဲတွင် ရှိပြီးသား ဟုတ်/မဟုတ် စစ်ဆေးသည် (ဘယ်တော့မှ မထပ်နိုင်ပါ)
            exists = repository.findByStudentId(candidateId).isPresent();
        } while (exists);

        return candidateId;
    }
}
