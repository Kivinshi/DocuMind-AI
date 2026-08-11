using System.Net.Http.Headers;

namespace DocuMindAI.Api.Services;

public class StorageService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;

    private const string BucketName = "documents";

    public StorageService(
        HttpClient httpClient,
        IConfiguration configuration)
    {
        _httpClient = httpClient;
        _configuration = configuration;
    }

    public async Task<string> UploadFileAsync(
        Stream fileStream,
        string filePath,
        string contentType)
    {
        var supabaseUrl =
            _configuration["Supabase:Url"];

        var supabaseSecretKey =
            _configuration["Supabase:SecretKey"];

        if (string.IsNullOrWhiteSpace(supabaseUrl))
        {
            throw new InvalidOperationException(
                "Supabase:Url is not configured."
            );
        }

        if (string.IsNullOrWhiteSpace(supabaseSecretKey))
        {
            throw new InvalidOperationException(
                "Supabase:SecretKey is not configured."
            );
        }

        var uploadUrl =
            $"{supabaseUrl.TrimEnd('/')}/storage/v1/object/{BucketName}/{filePath}";

        using var content = new StreamContent(fileStream);

        content.Headers.ContentType =
            new MediaTypeHeaderValue(
                string.IsNullOrWhiteSpace(contentType)
                    ? "application/octet-stream"
                    : contentType
            );

        using var request =
            new HttpRequestMessage(
                HttpMethod.Post,
                uploadUrl
            );

        request.Headers.Add(
            "apikey",
            supabaseSecretKey
        );

        request.Headers.Authorization =
            new AuthenticationHeaderValue(
                "Bearer",
                supabaseSecretKey
            );

        request.Content = content;

        using var response =
            await _httpClient.SendAsync(request);

        var responseBody =
            await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException(
                $"Supabase Storage upload failed. " +
                $"Status: {(int)response.StatusCode} " +
                $"{response.StatusCode}. " +
                $"Response: {responseBody}"
            );
        }

        return filePath;
    }

    public async Task RemoveFileAsync(
        string filePath)
    {
        var supabaseUrl =
            _configuration["Supabase:Url"];

        var supabaseSecretKey =
            _configuration["Supabase:SecretKey"];

        if (string.IsNullOrWhiteSpace(supabaseUrl))
        {
            throw new InvalidOperationException(
                "Supabase:Url is not configured."
            );
        }

        if (string.IsNullOrWhiteSpace(supabaseSecretKey))
        {
            throw new InvalidOperationException(
                "Supabase:SecretKey is not configured."
            );
        }

        var deleteUrl =
            $"{supabaseUrl.TrimEnd('/')}/storage/v1/object/{BucketName}/{filePath}";

        using var request =
            new HttpRequestMessage(
                HttpMethod.Delete,
                deleteUrl
            );

        request.Headers.Add(
            "apikey",
            supabaseSecretKey
        );

        request.Headers.Authorization =
            new AuthenticationHeaderValue(
                "Bearer",
                supabaseSecretKey
            );

        using var response =
            await _httpClient.SendAsync(request);

        var responseBody =
            await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException(
                $"Supabase Storage delete failed. " +
                $"Status: {(int)response.StatusCode} " +
                $"{response.StatusCode}. " +
                $"Response: {responseBody}"
            );
        }
    }
}