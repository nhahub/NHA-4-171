using System.ComponentModel.DataAnnotations;

namespace CarSparePartSys.Model
{
    public enum AddressType
    {
        Shipping,
        Billing
    }

    public class Address
    {
        [Key]
        public int AddressId { get; set; }
        public int UserId { get; set; }
        public AddressType Type { get; set; }
        public string FullName { get; set; } = null!;
        public string Phone { get; set; } = null!;
        public string Street { get; set; } = null!;
        public string City { get; set; } = null!;
        public string? State { get; set; }
        public string? PostalCode { get; set; }
        public string Country { get; set; } = null!;
        public bool IsDefault { get; set; }
        public DateTime CreatedAt { get; set; }

        public User User { get; set; } = null!;
        public ICollection<Order> ShippingOrders { get; set; } = new List<Order>();
    }
}
