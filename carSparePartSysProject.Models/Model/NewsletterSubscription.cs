using System;
using System.ComponentModel.DataAnnotations;

namespace CarSparePartSys.Model
{
    public class NewsletterSubscription
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; } = null!;

        public DateTime SubscribedAt { get; set; } = DateTime.UtcNow;

        public bool IsContacted { get; set; } = false;
    }
}
