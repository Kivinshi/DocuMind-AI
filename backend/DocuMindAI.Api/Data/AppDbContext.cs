using DocuMindAI.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace DocuMindAI.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();

    public DbSet<Document> Documents => Set<Document>();

    public DbSet<ChatMessage> ChatMessages => Set<ChatMessage>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(u => u.Id);

            entity.Property(u => u.Email)
                .IsRequired()
                .HasMaxLength(255);

            entity.HasIndex(u => u.Email)
                .IsUnique();

            entity.Property(u => u.PasswordHash)
                .IsRequired();

            entity.Property(u => u.PlanType)
                .IsRequired()
                .HasMaxLength(50);
        });

        // User -> Documents relationship
        modelBuilder.Entity<Document>(entity =>
        {
            entity.HasKey(d => d.Id);

            entity.Property(d => d.FileName)
                .IsRequired()
                .HasMaxLength(255);

            entity.Property(d => d.FileUrl)
                .IsRequired();

            entity.Property(d => d.ExtractedText)
                .IsRequired();

            entity.HasOne(d => d.User)
                .WithMany(u => u.Documents)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Document -> ChatMessages relationship
        modelBuilder.Entity<ChatMessage>(entity =>
        {
            entity.HasKey(c => c.Id);

            entity.Property(c => c.Role)
                .IsRequired()
                .HasMaxLength(20);

            entity.Property(c => c.Content)
                .IsRequired();

            entity.HasOne(c => c.Document)
                .WithMany(d => d.ChatMessages)
                .HasForeignKey(c => c.DocumentId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}