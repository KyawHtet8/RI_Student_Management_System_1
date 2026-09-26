package com.rockstar.ri.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record BatchStatusRequest(
		@NotEmpty(message = "At least one student ID is required")
		List<String> ids,
		@NotBlank(message = "Status is required")
		String status) {

}
