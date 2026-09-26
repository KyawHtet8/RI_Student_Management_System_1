package com.rockstar.ri.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Entity
@Table(name = "courses", indexes = {
        @Index(name = "idx_courses_code", columnList = "code"),
        @Index(name = "idx_courses_name", columnList = "name")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Course {

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    @Id
    private String id;

    @Column(nullable = false, unique = true, length = 32)
    private String code;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false, length = 120)
    private String department;

    @Column(nullable = false)
    private Integer credits;

    @Column(nullable = false, length = 120)
    private String instructor;

    @JsonProperty("maxCapacity")
    @JsonAlias("capacity")
    @Column(name = "capacity", nullable = false)
    private Integer capacity;

    @JsonProperty("enrolledCount")
    @JsonAlias("enrolled")
    @Column(name = "enrolled", nullable = false)
    @Builder.Default
    private Integer enrolled = 0;

    private String semester;
    private String schedule;
    private String room;
}
