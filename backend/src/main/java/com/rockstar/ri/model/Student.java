package com.rockstar.ri.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "students")
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
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false)
    private String email;

    private String major;
    private String department;

    // 🛡️ H2/SQL Reserved Keyword ဖြစ်သောကြောင့် Column Name ကို academic_year ဟု သတ်မှတ်ပေးခြင်း
    @Column(name = "academic_year")
    private String year;

    @Builder.Default
    private Double gpa = 0.0;

    @Builder.Default
    private String status = "Active";

    @Builder.Default
    private String tuitionStatus = "Paid";

    private String advisor;
    private String avatarUrl;

    @Builder.Default
    private LocalDate enrollmentDate = LocalDate.now();
}