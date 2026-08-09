namespace DocuMindAI.Api.Models;

public class User
{
    public int Id { get; set; }

    public string Email { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public string PlanType { get; set; } = "Free";

    public ICollection<Document> Documents { get; set; } = new List<Document>();
}