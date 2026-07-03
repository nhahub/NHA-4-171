using CarSparePartSysProject.BL.Service.IService;
using CarSparePartSysProject.Models.Dto.Categories;
using CarSparePartSysProject.DAL.Repositories.Interfaces;

namespace CarSparePartSysProject.BL.Service
{
    public class CategoryService : ICategoryService
    {
        private readonly ICategoryRepository _categoryRepository;

        public CategoryService(ICategoryRepository categoryRepository)
        {
            _categoryRepository = categoryRepository;
        }

        public Task<IEnumerable<CategoryDto>> GetAllAsync()
        {
            throw new NotImplementedException();
        }

        public Task<CategoryDto?> GetByIdAsync(int id)
        {
            throw new NotImplementedException();
        }

        public Task<CategoryDto> CreateAsync(CreateCategoryRequestDto dto)
        {
            throw new NotImplementedException();
        }

        public Task<CategoryDto> UpdateAsync(int id, UpdateCategoryRequestDto dto)
        {
            throw new NotImplementedException();
        }

        public Task DeleteAsync(int id)
        {
            throw new NotImplementedException();
        }
    }
}