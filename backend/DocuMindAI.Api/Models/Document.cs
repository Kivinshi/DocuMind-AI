namespace DocuMindAI.Api.Models;

public class Document
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public string FileName { get; set; } = string.Empty;

    public string FileUrl { get; set; } = string.Empty;

    public long FileSize { get; set; }

    public string ExtractedText { get; set; } = string.Empty;

    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;

    public ICollection<ChatMessage> ChatMessages { get; set; } = new List<ChatMessage>();
}