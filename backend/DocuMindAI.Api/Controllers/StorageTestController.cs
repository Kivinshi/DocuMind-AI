using DocuMindAI.Api.Services;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DocuMindAI.Api.Controllers;

[ApiController]
[Route("api/storage-test")]
[Authorize]
public class StorageTestController : ControllerBase
{
    private readonly StorageService _storageService;

    public StorageTestController(
        StorageService storageService)
    {
        _storageService = storageService;
    }

    [HttpPost]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> TestUpload(
        IFormFile file)
    {
        if (file == null)
        {
            return BadRequest(new
            {
                message = "Please provide a file."
            });
        }

        if (file.Length == 0)
        {
            return BadRequest(new
            {
                message = "The uploaded file is empty."
            });
        }

        var extension =
            Path.GetExtension(file.FileName)
                .ToLowerInvariant();

        if (extension != ".pdf")
        {
            return BadRequest(new
            {
                message =
                    "Only PDF files are allowed for this test."
            });
        }

        var safeFileName =
            Path.GetFileNameWithoutExtension(
                file.FileName
            );

        safeFileName =
            string.Join(
                "_",
                safeFileName
                    .Split(
                        Path.GetInvalidFileNameChars(),
                        StringSplitOptions.RemoveEmptyEntries
                    )
            );

        var filePath =
            $"test/{Guid.NewGuid()}-{safeFileName}{extension}";

        await using var stream =
            file.OpenReadStream();

        var result =
            await _storageService.UploadFileAsync(
                stream,
                filePath,
                file.ContentType
            );

        return Ok(new
        {
            message =
                "File uploaded successfully.",

            path = result
        });
    }
}