using System.ComponentModel.DataAnnotations;

namespace CarSparePartSys.Model
{
    public class PaymentMethod

    {
        [Key]

        public int PaymentMethodId { get; set; }
        public string MethodName { get; set; } = null!;
        public bool IsActive { get; set; }

        public ICollection<Payment> Payments { get; set; } = new List<Payment>();
    }
}
