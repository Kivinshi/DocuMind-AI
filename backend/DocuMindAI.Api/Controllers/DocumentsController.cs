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
    // GET ALL DOCUMENTS FOR CURRENT USER
    // GET: /api/documents
    // =====================================================

    [HttpGet]
    public async Task<IActionResult> GetDocuments()
    {
        // -------------------------------------------------
        // Get logged-in user ID from JWT
        // -------------------------------------------------

        var userIdClaim = User.FindFirst(
            ClaimTypes.NameIdentifier
        )?.Value;

        if (!int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(new
            {
                message = "Invalid user identity."
            });
        }


        // -------------------------------------------------
        // Get only this user's documents
        // -------------------------------------------------

        var documents = await _context.Documents
            .Where(document => document.UserId == userId)
            .OrderByDescending(document => document.UploadedAt)
            .Select(document => new
            {
                document.Id,
                document.FileName,
                document.FileUrl,
                document.FileSize,
                document.UploadedAt
            })
            .ToListAsync();


        return Ok(documents);
    }


    // =====================================================
    // GET SINGLE DOCUMENT
    // GET: /api/documents/{id}
    // =====================================================

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetDocument(int id)
    {
        // -------------------------------------------------
        // Get logged-in user ID from JWT
        // -------------------------------------------------

        var userIdClaim = User.FindFirst(
            ClaimTypes.NameIdentifier
        )?.Value;

        if (!int.TryParse(userIdClaim, out var userId))
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
            .Where(document =>
                document.Id == id &&
                document.UserId == userId
            )
            .Select(document => new
            {
                document.Id,
                document.FileName,
                document.FileUrl,
                document.FileSize,
                document.ExtractedText,
                document.UploadedAt
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
    // POST: /api/documents/upload
    // =====================================================

    [HttpPost("upload")]
    [RequestSizeLimit(10 * 1024 * 1024)]
    public async Task<IActionResult> UploadDocument(
        IFormFile file)
    {
        // =================================================
        // 1. GET CURRENT USER ID
        // =================================================

        var userIdClaim = User.FindFirst(
            ClaimTypes.NameIdentifier
        )?.Value;

        if (!int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(new
            {
                message = "Invalid user identity."
            });
        }


        // =================================================
        // 2. CHECK FILE
        // =================================================

        if (file == null || file.Length == 0)
        {
            return BadRequest(new
            {
                message = "Please select a file."
            });
        }


        // =================================================
        // 3. CHECK FILE SIZE
        // =================================================

        const long maxFileSize = 10 * 1024 * 1024;

        if (file.Length > maxFileSize)
        {
            return BadRequest(new
            {
                message = "File size cannot exceed 10 MB."
            });
        }


        // =================================================
        // 4. CHECK FILE EXTENSION
        // =================================================

        var extension = Path
            .GetExtension(file.FileName)
            .ToLowerInvariant();

        if (extension != ".pdf")
        {
            return BadRequest(new
            {
                message = "Only PDF files are supported right now."
            });
        }


        // =================================================
        // 5. CHECK CONTENT TYPE
        // =================================================

        if (!string.Equals(
            file.ContentType,
            "application/pdf",
            StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new
            {
                message = "Invalid PDF content type."
            });
        }


        // =================================================
        // 6. GENERATE UNIQUE STORAGE FILE ID
        // =================================================

        var tempFileId = Guid.NewGuid();

        var storedFileName =
            $"{tempFileId}{extension}";


        // =================================================
        // 7. USER-SPECIFIC STORAGE PATH
        // =================================================

        var storagePath =
            $"users/{userId}/{tempFileId}/{storedFileName}";


        string extractedText = string.Empty;


        try
        {
            // =================================================
            // 8. EXTRACT TEXT FROM PDF
            // =================================================

            await using var extractionStream =
                file.OpenReadStream();

            extractedText =
                await _pdfTextExtractor.ExtractTextAsync(
                    extractionStream
                );


            // =================================================
            // 9. UPLOAD FILE TO SUPABASE STORAGE
            // =================================================

            await using var uploadStream =
                file.OpenReadStream();

            await _storageService.UploadFileAsync(
                uploadStream,
                storagePath,
                file.ContentType
            );


            // =================================================
            // 10. CREATE DATABASE RECORD
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
            // 11. SAVE DOCUMENT TO DATABASE
            // =================================================

            _context.Documents.Add(document);

            await _context.SaveChangesAsync();


            // =================================================
            // 12. RETURN SUCCESS RESPONSE
            // =================================================

            return Ok(new
            {
                message = "Document uploaded successfully.",

                document = new
                {
                    document.Id,

                    document.FileName,

                    document.FileSize,

                    document.UploadedAt,

                    extractedTextLength =
                        document.ExtractedText.Length
                }
            });
        }
        catch
        {
            // =================================================
            // CLEANUP STORAGE IF DATABASE SAVE FAILS
            // =================================================

            try
            {
                await _storageService.RemoveFileAsync(
                    storagePath
                );
            }
            catch
            {
                // Do not hide the original exception.
            }

            throw;
        }
    }


    // =====================================================
    // DELETE DOCUMENT
    // DELETE: /api/documents/{id}
    // =====================================================

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteDocument(int id)
    {
        // -------------------------------------------------
        // Get logged-in user ID from JWT
        // -------------------------------------------------

        var userIdClaim = User.FindFirst(
            ClaimTypes.NameIdentifier
        )?.Value;

        if (!int.TryParse(userIdClaim, out var userId))
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
            .FirstOrDefaultAsync(document =>
                document.Id == id &&
                document.UserId == userId
            );


        if (document == null)
        {
            return NotFound(new
            {
                message = "Document not found."
            });
        }


        // -------------------------------------------------
        // Delete file from Supabase Storage first
        // -------------------------------------------------

        try
        {
            if (!string.IsNullOrWhiteSpace(document.FileUrl))
            {
                await _storageService.RemoveFileAsync(
                    document.FileUrl
                );
            }
        }
        catch
        {
            return StatusCode(500, new
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
            message = "Document deleted successfully."
        });
    }
}

