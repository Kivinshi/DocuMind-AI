using System.Security.Claims;

using DocuMindAI.Api.Data;
using DocuMindAI.Api.Models;
using DocuMindAI.Api.Services;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DocuMindAI.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DocumentsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly StorageService _storageService;
    private readonly PdfTextExtractor _pdfTextExtractor;

    public DocumentsController(
        AppDbContext context,
        StorageService storageService,
        PdfTextExtractor pdfTextExtractor)
    {
        _context = context;
        _storageService = storageService;
        _pdfTextExtractor = pdfTextExtractor;
    }


    // =====================================================
    // GET CURRENT USER ID
    // =====================================================

    private bool TryGetCurrentUserId(out int userId)
    {
        userId = 0;

        // Standard ASP.NET Core claim
        var userIdClaim =
            User.FindFirstValue(ClaimTypes.NameIdentifier);

        // Fallback: "sub"
        if (string.IsNullOrWhiteSpace(userIdClaim))
        {
            userIdClaim =
                User.FindFirstValue("sub");
        }

        // Fallback: "userId"
        if (string.IsNullOrWhiteSpace(userIdClaim))
        {
            userIdClaim =
                User.FindFirstValue("userId");
        }

        return int.TryParse(userIdClaim, out userId);
    }


    // =====================================================
    // GET ALL DOCUMENTS
    // GET: /api/Documents
    // =====================================================

    [HttpGet]
    public async Task<IActionResult> GetDocuments()
    {
        // -------------------------------------------------
        // Get current logged-in user
        // -------------------------------------------------

        if (!TryGetCurrentUserId(out var userId))
        {
            return Unauthorized(new
            {
                message = "Invalid user identity."
            });
        }


        // -------------------------------------------------
        // Get only current user's documents
        // -------------------------------------------------

        var documents = await _context.Documents
            .AsNoTracking()
            .Where(document =>
                document.UserId == userId)
            .OrderByDescending(document =>
                document.UploadedAt)
            .Select(document => new
            {
                id = document.Id,
                fileName = document.FileName,
                fileUrl = document.FileUrl,
                fileSize = document.FileSize,
                uploadedAt = document.UploadedAt
            })
            .ToListAsync();


        return Ok(documents);
    }


    // =====================================================
    // GET SINGLE DOCUMENT
    // GET: /api/Documents/{id}
    // =====================================================

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetDocument(int id)
    {
        // -------------------------------------------------
        // Get current user
        // -------------------------------------------------

        if (!TryGetCurrentUserId(out var userId))
        {
            return Unauthorized(new
            {
                message = "Invalid user identity."
            });
        }


        // -------------------------------------------------
        // Find document belonging to current user
        // -------------------------------------------------

        var document = await _context.Documents
            .AsNoTracking()
            .Where(document =>
                document.Id == id &&
                document.UserId == userId)
            .Select(document => new
            {
                id = document.Id,
                fileName = document.FileName,
                fileUrl = document.FileUrl,
                fileSize = document.FileSize,
                extractedText = document.ExtractedText,
                uploadedAt = document.UploadedAt
            })
            .FirstOrDefaultAsync();


        if (document == null)
        {
            return NotFound(new
            {
                message = "Document not found."
            });
        }


        return Ok(document);
    }


    // =====================================================
    // UPLOAD DOCUMENT
    // POST: /api/Documents/upload
    // =====================================================

    [HttpPost("upload")]
    [RequestSizeLimit(10 * 1024 * 1024)]
    public async Task<IActionResult> UploadDocument(
        IFormFile file)
    {
        // -------------------------------------------------
        // Get current user
        // -------------------------------------------------

        if (!TryGetCurrentUserId(out var userId))
        {
            return Unauthorized(new
            {
                message = "Invalid user identity."
            });
        }


        // -------------------------------------------------
        // Validate file
        // -------------------------------------------------

        if (file == null || file.Length == 0)
        {
            return BadRequest(new
            {
                message = "Please select a file."
            });
        }


        // -------------------------------------------------
        // Validate file size
        // -------------------------------------------------

        const long maxFileSize =
            10 * 1024 * 1024;

        if (file.Length > maxFileSize)
        {
            return BadRequest(new
            {
                message = "File size cannot exceed 10 MB."
            });
        }


        // -------------------------------------------------
        // Validate extension
        // -------------------------------------------------

        var extension =
            Path.GetExtension(file.FileName)
                .ToLowerInvariant();

        if (extension != ".pdf")
        {
            return BadRequest(new
            {
                message =
                    "Only PDF files are supported right now."
            });
        }


        // -------------------------------------------------
        // Validate content type
        // -------------------------------------------------

        if (!string.Equals(
                file.ContentType,
                "application/pdf",
                StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new
            {
                message =
                    "Invalid PDF content type."
            });
        }


        // -------------------------------------------------
        // Generate unique file name
        // -------------------------------------------------

        var tempFileId = Guid.NewGuid();

        var storedFileName =
            $"{tempFileId}{extension}";


        // -------------------------------------------------
        // User-specific storage path
        // -------------------------------------------------

        var storagePath =
            $"users/{userId}/{tempFileId}/{storedFileName}";


        string extractedText = string.Empty;


        try
        {
            // =================================================
            // Extract PDF text
            // =================================================

            await using var extractionStream =
                file.OpenReadStream();

            extractedText =
                await _pdfTextExtractor
                    .ExtractTextAsync(
                        extractionStream);


            // =================================================
            // Upload to Supabase Storage
            // =================================================

            await using var uploadStream =
                file.OpenReadStream();

            await _storageService.UploadFileAsync(
                uploadStream,
                storagePath,
                file.ContentType);


            // =================================================
            // Create database record
            // =================================================

            var document = new Document
            {
                UserId = userId,

                FileName = file.FileName,

                FileUrl = storagePath,

                FileSize = file.Length,

                ExtractedText = extractedText,

                UploadedAt = DateTime.UtcNow
            };


            // =================================================
            // Save database record
            // =================================================

            _context.Documents.Add(document);

            await _context.SaveChangesAsync();


            // =================================================
            // Return response
            // =================================================

            return Ok(new
            {
                message =
                    "Document uploaded successfully.",

                document = new
                {
                    id = document.Id,

                    fileName = document.FileName,

                    fileUrl = document.FileUrl,

                    fileSize = document.FileSize,

                    uploadedAt =
                        document.UploadedAt,

                    extractedTextLength =
                        document.ExtractedText?.Length ?? 0
                }
            });
        }
        catch (Exception ex)
        {
            // -------------------------------------------------
            // Cleanup Supabase file if database save fails
            // -------------------------------------------------

            try
            {
                await _storageService
                    .RemoveFileAsync(storagePath);
            }
            catch
            {
                // Ignore cleanup error
            }


            Console.WriteLine(
                $"Document upload error: {ex}"
            );


            return StatusCode(
                StatusCodes.Status500InternalServerError,
                new
                {
                    message =
                        "An error occurred while uploading the document."
                });
        }
    }


    // =====================================================
    // DELETE DOCUMENT
    // DELETE: /api/Documents/{id}
    // =====================================================

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteDocument(
        int id)
    {
        // -------------------------------------------------
        // Get current user
        // -------------------------------------------------

        if (!TryGetCurrentUserId(out var userId))
        {
            return Unauthorized(new
            {
                message = "Invalid user identity."
            });
        }


        // -------------------------------------------------
        // Find user's document
        // -------------------------------------------------

        var document =
            await _context.Documents
                .FirstOrDefaultAsync(document =>
                    document.Id == id &&
                    document.UserId == userId);


        if (document == null)
        {
            return NotFound(new
            {
                message = "Document not found."
            });
        }


        // -------------------------------------------------
        // Delete Supabase Storage file
        // -------------------------------------------------

        try
        {
            if (!string.IsNullOrWhiteSpace(
                    document.FileUrl))
            {
                await _storageService
                    .RemoveFileAsync(
                        document.FileUrl);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine(
                $"Storage delete error: {ex}"
            );

            return StatusCode(
                StatusCodes.Status500InternalServerError,
                new
                {
                    message =
                        "Could not delete the document file from storage."
                });
        }


        // -------------------------------------------------
        // Delete database record
        // -------------------------------------------------

        _context.Documents.Remove(document);

        await _context.SaveChangesAsync();


        return Ok(new
        {
            message =
                "Document deleted successfully."
        });
    }
}