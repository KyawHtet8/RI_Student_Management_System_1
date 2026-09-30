package com.rockstar.ri.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "enrollments",
        uniqueConstraints = @UniqueConstraint(name = "uk_enrollment_student_course_semester",
                columnNames = {"student_id", "course_id", "semester"}),
        indexes = {
                @Index(name = "idx_enrollments_student", columnList = "student_id"),
                @Index(name = "idx_enrollments_course", columnList = "course_id")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Enrollment {

    @Id
    @Column(length = 36, nullable = false, updatable = false)
    private String id;

    @Column(name = "student_id", length = 36, nullable = false, updatable = false)
    private String studentId;

    @Column(name = "course_id", length = 36, nullable = false, updatable = false)
    private String courseId;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", referencedColumnName = "id", insertable = false,
            updatable = false, foreignKey = @jakarta.persistence.ForeignKey(name = "fk_enrollment_student"))
    private Student student;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_id", referencedColumnName = "id", insertable = false,
            updatable = false, foreignKey = @jakarta.persistence.ForeignKey(name = "fk_enrollment_course"))
    private Course course;

    @Column(name = "enrollment_date", length = 20, nullable = false)
    @Builder.Default
    private String enrollmentDate = LocalDate.now().toString();

    @Column(length = 20, nullable = false)
    @Builder.Default
    private String status = "Enrolled";

    @Column(length = 10)
    private String grade;

    @Column(length = 40, nullable = false)
    private String semester;
}
