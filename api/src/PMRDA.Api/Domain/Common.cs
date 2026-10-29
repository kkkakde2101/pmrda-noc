namespace PMRDA.Api.Domain;

public abstract class AuditableEntity
{
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public int? CreatedById { get; set; }
    public User? CreatedBy { get; set; }
}
