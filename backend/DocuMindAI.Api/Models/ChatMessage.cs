namespace DocuMindAI.Api.Models;

public class ChatMessage
{
    public int Id { get; set; }

    public int DocumentId { get; set; }

    public string Role { get; set; } = string.Empty;

    public string Content { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Document Document { get; set; } = null!;
}