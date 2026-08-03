namespace PdfUtility.Application.DTOs;

public record PdfOperationResult(
    bool Success,
    string? FileName,
    string? ContentType,
    string? ErrorMessage
);