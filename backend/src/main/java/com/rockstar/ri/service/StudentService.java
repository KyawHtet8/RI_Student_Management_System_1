package com.rockstar.ri.service;

import com.rockstar.ri.model.Student;
import com.rockstar.ri.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Year;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository repository;
    private final SecureRandom secureRandom = new SecureRandom();

    // ၁။ ကျောင်းသားအားလုံး ရယူခြင်း (Department filter ပါဝင်သည်)
    public List<Student> getStudents(String department) {
        if (department != null && !department.isBlank() && !department.equalsIgnoreCase("All")) {
            return repository.findByDepartmentIgnoreCase(department);
        }
        return repository.findAll();
    }

    // ၂။ ID ဖြင့် ကျောင်းသားတစ်ဦးတည်းကို ရှာဖွေခြင်း
    public Student getStudentById(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found with ID: " + id));
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

        log.info("Successfully registered student: {} {} with Card ID: {}", 
                student.getFirstName(), student.getLastName(), student.getStudentId());
        
        return repository.save(student);
    }

    // ၄။ ကျောင်းသား အချက်အလက် ပြင်ဆင်ခြင်း
    @Transactional
    public Student updateStudent(String id, Student updated) {
        Student existing = getStudentById(id);

        existing.setFirstName(updated.getFirstName());
        existing.setLastName(updated.getLastName());
        existing.setEmail(updated.getEmail());
        existing.setMajor(updated.getMajor());
        existing.setDepartment(updated.getDepartment());
        existing.setYear(updated.getYear());
        existing.setGpa(updated.getGpa());
        existing.setStatus(updated.getStatus());
        existing.setTuitionStatus(updated.getTuitionStatus());
        existing.setAdvisor(updated.getAdvisor());
        existing.setAvatarUrl(updated.getAvatarUrl());

        log.info("Updated student details for ID: {}", id);
        return repository.save(existing);
    }

    // ၅။ ကျောင်းသား ဖျက်သိမ်းခြင်း
    @Transactional
    public void deleteStudent(String id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Cannot delete: Student not found with ID: " + id);
        }
        log.warn("Deleted student with ID: {}", id);
        repository.deleteById(id);
    }

    // ၆။ Frontend Batch Selection အတွက် (အုပ်စုလိုက် Status ပြောင်းခြင်း)
    @Transactional
    public void batchUpdateStatus(List<String> ids, String status) {
        log.info("Batch updating status to '{}' for {} students", status, ids.size());
        List<Student> students = repository.findAllById(ids);
        students.forEach(student -> student.setStatus(status));
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