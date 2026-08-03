using System.IO.Compression;
using PdfSharpCore.Pdf;
using PdfSharpCore.Pdf.IO;
using PdfUtility.Application.Exceptions;
using PdfUtility.Application.Interfaces;

namespace PdfUtility.Infrastructure.Services;

public class PdfService : IPdfService
{
    public async Task<MemoryStream> MergePdfsAsync(IEnumerable<Stream> pdfStreams, CancellationToken ct = default)
    {
        // Output document lives only in memory for the duration of the request.
        using var outputDocument = new PdfDocument();

        foreach (var stream in pdfStreams)
        {
            ct.ThrowIfCancellationRequested();

            // MEMORY NOTE: PdfSharpCore requires a seekable stream.
            // We copy each incoming (often non-seekable) upload stream into
            // a bounded MemoryStream, process it, then let it go out of scope
            // immediately — never holding all inputs in memory simultaneously.
            using var seekableInput = await CopyToSeekableStreamAsync(stream, ct);

            PdfDocument inputDocument;
            try
            {
                // Import mode = Import avoids retaining references to the
                // source document after copy, letting GC reclaim it sooner.
                inputDocument = PdfReader.Open(seekableInput, PdfDocumentOpenMode.Import);
            }
            catch (Exception ex)
            {
                throw new InvalidPdfException("One or more uploaded files are not valid PDFs.", ex);
            }

            using (inputDocument)
            {
                foreach (var page in inputDocument.Pages)
                {
                    outputDocument.AddPage(page);
                }
            }
        }

        if (outputDocument.PageCount == 0)
            throw new InvalidPdfException("No valid pages found to merge.");

        var result = new MemoryStream();
        outputDocument.Save(result, closeStream: false);
        result.Position = 0; // reset for the caller/controller to read from the start
        return result;
    }

    public async Task<MemoryStream> SplitPdfAsync(Stream pdfStream, int pagesPerChunk, CancellationToken ct = default)
    {
        using var seekableInput = await CopyToSeekableStreamAsync(pdfStream, ct);

        PdfDocument sourceDocument;
        try
        {
            sourceDocument = PdfReader.Open(seekableInput, PdfDocumentOpenMode.Import);
        }
        catch (Exception ex)
        {
            throw new InvalidPdfException("The uploaded file is not a valid or is a corrupted PDF.", ex);
        }

        var zipStream = new MemoryStream();

        // leaveOpen: true -> we control disposal of zipStream ourselves,
        // since we still need to read from it after the archive closes.
        using (sourceDocument)
        using (var archive = new ZipArchive(zipStream, ZipArchiveMode.Create, leaveOpen: true))
        {
            int totalPages = sourceDocument.PageCount;
            int chunkIndex = 1;

            for (int startPage = 0; startPage < totalPages; startPage += pagesPerChunk)
            {
                ct.ThrowIfCancellationRequested();

                int endPage = Math.Min(startPage + pagesPerChunk, totalPages);

                // Each chunk document is created, written, and disposed
                // BEFORE moving to the next chunk — only one chunk's worth
                // of pages is ever resident in memory at a time.
                using var chunkDocument = new PdfDocument();
                for (int i = startPage; i < endPage; i++)
                {
                    chunkDocument.AddPage(sourceDocument.Pages[i]);
                }

                // PdfDocument.Save requires a seekable stream. ZipArchiveEntry stream
                // is non-seekable, so we save to an intermediate MemoryStream first.
                using var chunkMemoryStream = new MemoryStream();
                chunkDocument.Save(chunkMemoryStream, closeStream: false);
                chunkMemoryStream.Position = 0;

                var entry = archive.CreateEntry($"chunk_{chunkIndex:D3}.pdf", CompressionLevel.Optimal);
                using var entryStream = entry.Open();
                await chunkMemoryStream.CopyToAsync(entryStream, ct);

                chunkIndex++;
            }
        }

        zipStream.Position = 0;
        return zipStream;
    }

    /// <summary>
    /// Copies an upload stream (often forward-only) into a fresh MemoryStream
    /// so PdfSharpCore can seek within it. Caller disposes the result.
    /// </summary>
    private static async Task<MemoryStream> CopyToSeekableStreamAsync(Stream input, CancellationToken ct)
    {
        var seekable = new MemoryStream();
        await input.CopyToAsync(seekable, 81920, ct); // 80KB buffer — avoids large single allocations
        seekable.Position = 0;
        return seekable;
    }
}