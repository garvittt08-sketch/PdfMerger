using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace PdfUtility.Application.DTOs;

public class SplitPdfRequest
{
    [Required]
    public IFormFile File { get; set; } = default!;

    [Range(1, 500, ErrorMessage = "PagesPerChunk must be between 1 and 500.")]
    public int PagesPerChunk { get; set; } = 1;
}