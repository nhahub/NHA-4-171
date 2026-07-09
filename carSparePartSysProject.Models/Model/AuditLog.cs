using System.ComponentModel.DataAnnotations;

namespace CarSparePartSys.Model
{
    public class AuditLog
    {
        [Key]
        public int AuditLogId { get; set; }
        public int? UserId { get; set; }
        public string Action { get; set; } = null!;      // Create, Update, Delete
        public string EntityName { get; set; } = null!;  // e.g. "Product"
        public int? EntityId { get; set; }
        public string? OldValues { get; set; }            // JSON snapshot
        public string? NewValues { get; set; }            // JSON snapshot
        public DateTime CreatedAt { get; set; }

        public User? User { get; set; }
    }
}
