using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarSparePartSysProject.Models.Dto.Compatibility
{
    public class CreateCompatibilityRequestDto
    {
        [Required]
        public int ProductId { get; set; }

        [Required]
        public int ModelId { get; set; }

        public string? Notes { get; set; }
    }
}
