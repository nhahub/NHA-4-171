using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarSparePartSysProject.Models.Dto.Products
{
    public class UpdateProductRequestDto
    {
        [MaxLength(150)]
        public string? ProductName { get; set; }

        public string? Description { get; set; }

        public decimal? UnitPrice { get; set; }

        public string? ImageUrl { get; set; }

        public int? CategoryId { get; set; }

        public int? SupplierId { get; set; }

        public bool? IsActive { get; set; }
    }
}
