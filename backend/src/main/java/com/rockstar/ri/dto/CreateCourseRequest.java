package com.rockstar.ri.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateCourseRequest {
    @NotBlank @Size(max = 32) private String code;
    @NotBlank @Size(max = 200) private String name;
    @NotBlank @Size(max = 120) private String department;
    @NotNull @Positive private Integer credits;
    @NotBlank @Size(max = 120) private String instructor;
    @NotNull @Positive
    @JsonProperty("maxCapacity") @JsonAlias("capacity")
    private Integer capacity;
    @PositiveOrZero @Builder.Default
    @JsonProperty("enrolledCount") @JsonAlias("enrolled")
    private Integer enrolled = 0;
    @Size(max = 255) private String semester;
    @Size(max = 255) private String schedule;
    @Size(max = 255) private String room;
}
