package com.rockstar.ri.dto;

import java.time.LocalDateTime;

public record ErrorResponse(
		LocalDateTime timestamp,
		int status,
		String error,
		String message) {

}
