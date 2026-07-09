using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarSparePartSysProject.Models.Dto.CarModels
{
    public class CreateCarModelRequestDto
    {
        [Required]
        public int BrandId { get; set; }

        [Required]
        [MaxLength(100)]
        public string ModelName { get; set; } = string.Empty;

        [Required]
        public short YearStart { get; set; }

        public short? YearEnd { get; set; }

        [MaxLength(50)]
        public string? EngineType { get; set; }
    }
}
