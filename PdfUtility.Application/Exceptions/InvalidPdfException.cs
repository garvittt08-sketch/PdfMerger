namespace PdfUtility.Application.Exceptions;

// Custom exception so middleware can distinguish "bad input" (400)
// from unexpected server errors (500) without string matching.
public class InvalidPdfException : Exception
{
    public InvalidPdfException(string message) : base(message) { }
    public InvalidPdfException(string message, Exception inner) : base(message, inner) { }
}