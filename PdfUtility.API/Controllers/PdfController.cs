using Microsoft.AspNetCore.Mvc;
using PdfUtility.Application.DTOs;
using PdfUtility.Application.Interfaces;

namespace PdfUtility.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PdfController : ControllerBase
{
    private readonly IPdfService _pdfService;
    private const long MaxFileSizeBytes = 25 * 1024 * 1024; // 25 MB per file — tune per your infra
    private static readonly string[] AllowedExtensions = { ".pdf" };
    private const string AllowedMimeType = "application/pdf";

    public PdfController(IPdfService pdfService)
    {
        _pdfService = pdfService;
    }

    [HttpPost("merge")]
    [RequestSizeLimit(100 * 1024 * 1024)] // 100 MB total request cap
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Merge(List<IFormFile> files, CancellationToken ct)
    {
        if (files is null || files.Count < 2)
            return BadRequest("Upload at least two PDF files to merge.");

        foreach (var file in files)
        {
            var validationError = ValidatePdfFile(file);
            if (validationError is not null)
                return BadRequest(validationError);
        }

        // Open streams only when needed; disposed via the 'using' list below
        // rather than loading every file's bytes into a List<byte[]> upfront.
        var openedStreams = files.Select(f => f.OpenReadStream()).ToList();
        try
        {
            using var merged = await _pdfService.MergePdfsAsync(openedStreams, ct);
            return File(merged.ToArray(), "application/pdf", "merged.pdf");
        }
        finally
        {
            foreach (var s in openedStreams) await s.DisposeAsync();
        }
    }

    [HttpPost("split")]
    [RequestSizeLimit(100 * 1024 * 1024)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Split([FromForm] SplitPdfRequest request, CancellationToken ct)
    {
        var validationError = ValidatePdfFile(request.File);
        if (validationError is not null)
            return BadRequest(validationError);

        await using var stream = request.File.OpenReadStream();
        using var zip = await _pdfService.SplitPdfAsync(stream, request.PagesPerChunk, ct);

        return File(zip.ToArray(), "application/zip", "split_output.zip");
    }

    private static string? ValidatePdfFile(IFormFile? file)
    {
        if (file is null || file.Length == 0)
            return "A file is required.";

        if (file.Length > MaxFileSizeBytes)
            return $"File '{file.FileName}' exceeds the {MaxFileSizeBytes / 1024 / 1024} MB limit.";

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!AllowedExtensions.Contains(ext))
            return $"File '{file.FileName}' must have a .pdf extension.";

        // MIME check is a first line of defense only (client-supplied, spoofable).
        // Real validation happens when PdfReader.Open() throws in the service layer.
        if (!string.Equals(file.ContentType, AllowedMimeType, StringComparison.OrdinalIgnoreCase))
            return $"File '{file.FileName}' has an invalid content type.";

        return null;
    }
}