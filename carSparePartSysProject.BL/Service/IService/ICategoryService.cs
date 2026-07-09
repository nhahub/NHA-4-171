using CarSparePartSysProject.Models.Dto.Categories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarSparePartSysProject.BL.Service.IService
{
    public interface ICategoryService
    {
        Task<IEnumerable<CategoryDto>> GetAllAsync();

        Task<CategoryDto?> GetByIdAsync(int id);

        Task<CategoryDto> CreateAsync(CreateCategoryRequestDto dto);

        Task<CategoryDto> UpdateAsync(int id, UpdateCategoryRequestDto dto);

        Task DeleteAsync(int id);
    }
}
