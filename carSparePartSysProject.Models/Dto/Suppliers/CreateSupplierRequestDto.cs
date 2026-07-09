using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarSparePartSysProject.Models.Dto.Suppliers
{
    public class CreateSupplierRequestDto
    {
        [Required]
        [MaxLength(100)]
        public string SupplierName { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? ContactPerson { get; set; }

        [EmailAddress]
        public string? Email { get; set; }

        [Phone]
        public string? Phone { get; set; }

        public string? Address { get; set; }

        public string? TaxNumber { get; set; }

        public bool IsActive { get; set; } = true;
    }
}
