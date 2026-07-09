namespace CarSparePartSysProject.Models.Dto.Suppliers
{
    public class UpdateSupplierRequestDto
    {
        public string? SupplierName { get; set; }
        public string? ContactPerson { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? Address { get; set; }
        public string? TaxNumber { get; set; }
        public bool? IsActive { get; set; }
    }
}
