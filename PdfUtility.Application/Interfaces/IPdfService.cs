namespace PdfUtility.Application.Interfaces;

public interface IPdfService
{
    /// <summary>
    /// Merges multiple PDF streams into a single output stream.
    /// Caller owns and disposes input streams.
    /// </summary>
    Task<MemoryStream> MergePdfsAsync(IEnumerable<Stream> pdfStreams, CancellationToken ct = default);

    /// <summary>
    /// Splits a PDF into chunks of N pages, returns a ZIP archive stream.
    /// </summary>
    Task<MemoryStream> SplitPdfAsync(Stream pdfStream, int pagesPerChunk, CancellationToken ct = default);
}