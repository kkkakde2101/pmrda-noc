using Microsoft.EntityFrameworkCore;
using PMRDA.Api.Domain;

namespace PMRDA.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<TreeNocApplication> Applications => Set<TreeNocApplication>();
    public DbSet<TreeInventoryItem> TreeInventory => Set<TreeInventoryItem>();
    public DbSet<ApplicationDocument> Documents => Set<ApplicationDocument>();
    public DbSet<WorkflowAction> WorkflowActions => Set<WorkflowAction>();
    public DbSet<SiteInspectionReport> InspectionReports => Set<SiteInspectionReport>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<User>(e =>
        {
            e.ToTable("Users");
            e.Ignore(x => x.FullName);
            e.Property(x => x.LoginName).HasMaxLength(50).IsRequired();
            e.HasIndex(x => x.LoginName).IsUnique();
            e.Property(x => x.PasswordHash).HasMaxLength(200).IsRequired();
            e.Property(x => x.FirstName).HasMaxLength(100).IsRequired();
            e.Property(x => x.LastName).HasMaxLength(100).IsRequired();
            e.Property(x => x.Email).HasMaxLength(200).IsRequired();
            e.Property(x => x.Mobile).HasMaxLength(15);
        });

        b.Entity<TreeNocApplication>(e =>
        {
            e.ToTable("Applications");
            e.Property(x => x.ApplicationNumber).HasMaxLength(50).IsRequired();
            e.HasIndex(x => x.ApplicationNumber).IsUnique();
            e.Property(x => x.ApplicantName).HasMaxLength(200).IsRequired();
            e.Property(x => x.MobileNumber).HasMaxLength(15).IsRequired();
            e.Property(x => x.SurveyNumber).HasMaxLength(50).IsRequired();
            e.Property(x => x.Village).HasMaxLength(100).IsRequired();
            e.Property(x => x.Taluka).HasMaxLength(100).IsRequired();
            e.Property(x => x.District).HasMaxLength(100).IsRequired();
            e.Property(x => x.PlotAreaSqm).HasPrecision(10, 2);
            e.Property(x => x.ChallanAmount).HasPrecision(10, 2);
            e.HasOne(x => x.ApplicantUser).WithMany().HasForeignKey(x => x.ApplicantUserId).OnDelete(DeleteBehavior.Restrict);
            e.HasMany(x => x.TreeInventory).WithOne(x => x.Application).HasForeignKey(x => x.ApplicationId).OnDelete(DeleteBehavior.Cascade);
            e.HasMany(x => x.Documents).WithOne(x => x.Application).HasForeignKey(x => x.ApplicationId).OnDelete(DeleteBehavior.Cascade);
            e.HasMany(x => x.WorkflowHistory).WithOne(x => x.Application).HasForeignKey(x => x.ApplicationId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.InspectionReport).WithOne(x => x.Application).HasForeignKey<SiteInspectionReport>(x => x.ApplicationId).OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<TreeInventoryItem>(e =>
        {
            e.ToTable("TreeInventory");
            e.Property(x => x.TreeNumber).HasMaxLength(20).IsRequired();
            e.Property(x => x.CommonName).HasMaxLength(100).IsRequired();
            e.Property(x => x.ScientificName).HasMaxLength(150).IsRequired();
            e.Property(x => x.HeightMetres).HasPrecision(5, 2);
            e.Property(x => x.GirthMetres).HasPrecision(5, 2);
            e.Property(x => x.Latitude).HasPrecision(9, 6);
            e.Property(x => x.Longitude).HasPrecision(9, 6);
        });

        b.Entity<ApplicationDocument>(e =>
        {
            e.ToTable("Documents");
            e.Property(x => x.Label).HasMaxLength(300).IsRequired();
            e.Property(x => x.FileName).HasMaxLength(255).IsRequired();
            e.Property(x => x.StoragePath).HasMaxLength(500).IsRequired();
        });

        b.Entity<WorkflowAction>(e =>
        {
            e.ToTable("WorkflowHistory");
            e.Property(x => x.Action).HasMaxLength(100).IsRequired();
            e.Property(x => x.Remarks).HasMaxLength(2000);
            e.HasOne(x => x.PerformedBy).WithMany().HasForeignKey(x => x.PerformedByUserId).OnDelete(DeleteBehavior.Restrict);
        });

        b.Entity<SiteInspectionReport>(e =>
        {
            e.ToTable("InspectionReports");
            e.Property(x => x.InspectorName).HasMaxLength(200).IsRequired();
            e.Property(x => x.TotalPlotArea).HasPrecision(10, 2);
            e.Property(x => x.Findings).HasMaxLength(4000).IsRequired();
        });
    }
}
