namespace DocuMindAI.Api.DTOs;

public class AuthResponse
{
	public int UserId { get; set; }

	public string Email { get; set; } = string.Empty;

	public string PlanType { get; set; } = string.Empty;
}