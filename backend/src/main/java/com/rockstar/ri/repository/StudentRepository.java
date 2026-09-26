package com.rockstar.ri.repository;

import com.rockstar.ri.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, String> {

    // ၁။ ဌာနအလိုက် စစ်ထုတ်ရှာဖွေခြင်း (e.g. "Computer Science")
    List<Student> findByDepartmentIgnoreCase(String department);

    // ၂။ အခြေအနေအလိုက် ရှာဖွေခြင်း (e.g. "Active", "Probation", "Suspended")
    List<Student> findByStatus(String status);

    // ၃။ ကျောင်းသားကတ် ID ဖြင့် ရှာဖွေခြင်း (e.g. "U-1082")
    Optional<Student> findByStudentId(String studentId);

    // ၄။ Email တူ/မတူ စစ်ဆေးခြင်း (Duplicate Email Check)
    boolean existsByEmail(String email);

    // ၅။ နာမည် သို့မဟုတ် ကျောင်းသား ID ဖြင့် Search ရှာဖွေခြင်း
    @Query("SELECT s FROM Student s WHERE " +
           "LOWER(s.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s.lastName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s.studentId) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Student> searchStudents(@Param("query") String query);
}