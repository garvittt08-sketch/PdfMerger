using System.Net;
using System.Text.Json;
using PdfUtility.Application.Exceptions;

namespace PdfUtility.Api.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (InvalidPdfException ex)
        {
            _logger.LogWarning(ex, "Invalid PDF upload rejected.");
            await WriteError(context, HttpStatusCode.BadRequest, ex.Message);
        }
        catch (OperationCanceledException)
        {
            // Client disconnected / request timed out — not a server error.
            _logger.LogInformation("Request was cancelled by the client.");
            context.Response.StatusCode = 499; // Client Closed Request
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception during PDF processing.");
            await WriteError(context, HttpStatusCode.InternalServerError,
                "An unexpected error occurred while processing the request.");
        }
    }

    private static async Task WriteError(HttpContext context, HttpStatusCode statusCode, string message)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)statusCode;
        var payload = JsonSerializer.Serialize(new { error = message });
        await context.Response.WriteAsync(payload);
    }
}