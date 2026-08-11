//using DocuMindAI.Api.Models;
//using Microsoft.EntityFrameworkCore;

//namespace DocuMindAI.Api.Data;

//public class AppDbContext : DbContext
//{
//    public AppDbContext(
//        DbContextOptions<AppDbContext> options)
//        : base(options)
//    {
//    }


//    // =====================================================
//    // TABLES
//    // =====================================================

//    public DbSet<User> Users => Set<User>();

//    public DbSet<Document> Documents => Set<Document>();

//    public DbSet<ChatMessage> ChatMessages => Set<ChatMessage>();


//    // =====================================================
//    // MODEL CONFIGURATION
//    // =====================================================

//    protected override void OnModelCreating(
//        ModelBuilder modelBuilder)
//    {
//        base.OnModelCreating(modelBuilder);


//        // =================================================
//        // USER
//        // =================================================

//        modelBuilder.Entity<User>(entity =>
//        {
//            entity.HasKey(u => u.Id);


//            entity.Property(u => u.Email)
//                .IsRequired()
//                .HasMaxLength(255);


//            entity.HasIndex(u => u.Email)
//                .IsUnique();


//            entity.Property(u => u.PasswordHash)
//                .IsRequired();


//            entity.Property(u => u.PlanType)
//                .IsRequired()
//                .HasMaxLength(50);


//            entity.Property(u => u.CreatedAt)
//                .IsRequired();
//        });


//        // =================================================
//        // DOCUMENT
//        // =================================================

//        modelBuilder.Entity<Document>(entity =>
//        {
//            entity.HasKey(d => d.Id);


//            entity.Property(d => d.FileName)
//                .IsRequired()
//                .HasMaxLength(255);


//            entity.Property(d => d.FileUrl)
//                .IsRequired();


//            entity.Property(d => d.FileSize)
//                .IsRequired();


//            entity.Property(d => d.ExtractedText)
//                .IsRequired();


//            entity.Property(d => d.UploadedAt)
//                .IsRequired();


//            // ---------------------------------------------
//            // User -> Documents
//            // ---------------------------------------------

//            entity.HasOne(d => d.User)
//                .WithMany(u => u.Documents)
//                .HasForeignKey(d => d.UserId)
//                .OnDelete(DeleteBehavior.Cascade);
//        });


//        // =================================================
//        // CHAT MESSAGE
//        // =================================================

//        modelBuilder.Entity<ChatMessage>(entity =>
//        {
//            entity.HasKey(c => c.Id);


//            entity.Property(c => c.Role)
//                .IsRequired()
//                .HasMaxLength(20);


//            entity.Property(c => c.Content)
//                .IsRequired();


//            entity.Property(c => c.CreatedAt)
//                .IsRequired();


//            // ---------------------------------------------
//            // Document -> ChatMessages
//            // ---------------------------------------------

//            entity.HasOne(c => c.Document)
//                .WithMany(d => d.ChatMessages)
//                .HasForeignKey(c => c.DocumentId)
//                .OnDelete(DeleteBehavior.Cascade);
//        });
//    }
//}


using DocuMindAI.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace DocuMindAI.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(
        DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }


    // =====================================================
    // TABLES
    // =====================================================

    public DbSet<User> Users => Set<User>();

    public DbSet<Document> Documents => Set<Document>();

    public DbSet<ChatMessage> ChatMessages => Set<ChatMessage>();


    // =====================================================
    // MODEL CONFIGURATION
    // =====================================================

    protected override void OnModelCreating(
        ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);


        // =================================================
        // USER
        // =================================================

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

            entity.Property(u => u.CreatedAt)
                .IsRequired();
        });


        // =================================================
        // DOCUMENT
        // =================================================

        modelBuilder.Entity<Document>(entity =>
        {
            entity.HasKey(d => d.Id);

            entity.Property(d => d.FileName)
                .IsRequired()
                .HasMaxLength(255);

            entity.Property(d => d.FileUrl)
                .IsRequired();

            entity.Property(d => d.FileSize)
                .IsRequired();

            entity.Property(d => d.ExtractedText)
                .IsRequired();

            entity.Property(d => d.UploadedAt)
                .IsRequired();


            // User -> Documents

            entity.HasOne(d => d.User)
                .WithMany(u => u.Documents)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });


        // =================================================
        // CHAT MESSAGE
        // =================================================

        modelBuilder.Entity<ChatMessage>(entity =>
        {
            entity.HasKey(c => c.Id);

            entity.Property(c => c.Role)
                .IsRequired()
                .HasMaxLength(20);

            entity.Property(c => c.Content)
                .IsRequired();

            entity.Property(c => c.CreatedAt)
                .IsRequired();


            // Document -> ChatMessages

            entity.HasOne(c => c.Document)
                .WithMany(d => d.ChatMessages)
                .HasForeignKey(c => c.DocumentId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}