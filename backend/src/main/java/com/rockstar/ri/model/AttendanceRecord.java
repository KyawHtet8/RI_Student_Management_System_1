package com.rockstar.ri.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.FetchType;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "attendance_records",
        uniqueConstraints = @UniqueConstraint(name = "uk_attendance_student_course_date",
                columnNames = {"student_id", "course_id", "date"}),
        indexes = {
                @Index(name = "idx_attendance_student_course", columnList = "student_id, course_id"),
                @Index(name = "idx_attendance_course_date", columnList = "course_id, date")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceRecord {

    @Id
    @Column(length = 36, nullable = false, updatable = false)
    private String id;

    @Column(name = "student_id", length = 36, nullable = false, updatable = false)
    private String studentId;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", referencedColumnName = "id", insertable = false,
            updatable = false, foreignKey = @jakarta.persistence.ForeignKey(name = "fk_attendance_student"))
    private Student student;

    @Column(name = "course_id", length = 36, nullable = false, updatable = false)
    private String courseId;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_id", referencedColumnName = "id", insertable = false,
            updatable = false, foreignKey = @jakarta.persistence.ForeignKey(name = "fk_attendance_course"))
    private Course course;

    @Column(name = "date", length = 20, nullable = false, updatable = false)
    private String date;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AttendanceStatus status;

    @Column(length = 255)
    private String remarks;
}
