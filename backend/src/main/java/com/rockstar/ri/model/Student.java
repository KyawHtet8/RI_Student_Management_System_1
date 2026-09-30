package com.rockstar.ri.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "students", indexes = {
        @Index(name = "idx_students_department", columnList = "department"),
        @Index(name = "idx_students_status", columnList = "status"),
        @Index(name = "idx_students_email", columnList = "email")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Student {
	@JsonProperty(access = JsonProperty.Access.READ_ONLY)
    @Id
    private String id;
	@JsonProperty(access = JsonProperty.Access.READ_ONLY)
    @Column(nullable = false, unique = true)
    private String studentId;

    @Column(nullable = false)
    @NotBlank(message = "First name is required")
    @Size(max = 100, message = "First name must be at most 100 characters")
    private String firstName;

    @Column(nullable = false)
    @NotBlank(message = "Last name is required")
    @Size(max = 100, message = "Last name must be at most 100 characters")
    private String lastName;

    @Column(nullable = false, unique = true)
    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    @Size(max = 255, message = "Email must be at most 255 characters")
    private String email;

    @Column(length = 40)
    private String phone;

    private LocalDate dateOfBirth;

    @Column(length = 30)
    private String gender;

    private String major;
    private String department;

    // 🛡️ H2/SQL Reserved Keyword ဖြစ်သောကြောင့် Column Name ကို academic_year ဟု သတ်မှတ်ပေးခြင်း
    @Column(name = "academic_year")
    private String year;

    @Builder.Default
    @DecimalMin(value = "0.0", message = "GPA cannot be below 0")
    @DecimalMax(value = "4.0", message = "GPA cannot exceed 4")
    private Double gpa = 0.0;

    @Builder.Default
    private String status = "Active";

    @Builder.Default
    private String tuitionStatus = "Paid";

    private String advisor;
    private String avatarUrl;

    @Column(length = 20)
    private String expectedGraduation;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "street", column = @Column(name = "address_street")),
            @AttributeOverride(name = "city", column = @Column(name = "address_city")),
            @AttributeOverride(name = "state", column = @Column(name = "address_state")),
            @AttributeOverride(name = "zip", column = @Column(name = "address_zip"))
    })
    private StudentAddress address;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "name", column = @Column(name = "emergency_name")),
            @AttributeOverride(name = "relationship", column = @Column(name = "emergency_relationship")),
            @AttributeOverride(name = "phone", column = @Column(name = "emergency_phone"))
    })
    private EmergencyContact emergencyContact;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "student_notes", joinColumns = @JoinColumn(name = "student_id"))
    @Column(name = "note", length = 2000)
    @Builder.Default
    private List<String> notes = new ArrayList<>();

    @Builder.Default
    private LocalDate enrollmentDate = LocalDate.now();
}
