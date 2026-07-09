using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarSparePartSysProject.Models.Dto.Products
{
    public class CreateProductRequestDto
    {
        [Required]
        [MaxLength(150)]
        public string ProductName { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Required]
        public decimal UnitPrice { get; set; }

        public string? ImageUrl { get; set; }

        [Required]
        public int CategoryId { get; set; }

        [Required]
        public int SupplierId { get; set; }

        public bool IsActive { get; set; } = true;
    }
}
