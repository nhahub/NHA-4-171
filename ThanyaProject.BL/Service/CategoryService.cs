using CarSparePartSysProject.BL.Service.IService;
using CarSparePartSysProject.Models.Dto.Categories;
using CarSparePartSysProject.DAL.Repositories.Interfaces;
using CarSparePartSys.Model;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CarSparePartSysProject.BL.Service
{
    public class CategoryService : ICategoryService
    {
        private readonly ICategoryRepository _categoryRepository;

        public CategoryService(ICategoryRepository categoryRepository)
        {
            _categoryRepository = categoryRepository;
        }

        private CategoryDto MapToDto(Category c)
        {
            return new CategoryDto
            {
                CategoryId = c.CategoryId,
                CategoryName = c.CategoryName,
                Description = c.Description,
                ImageUrl = c.ImageUrl,
                ParentCategoryId = c.ParentCategoryId,
                SubCategories = c.SubCategories?.Select(MapToDto).ToList() ?? new List<CategoryDto>()
            };
        }

        public async Task<IEnumerable<CategoryDto>> GetAllAsync()
        {
            var categories = await _categoryRepository.GetAllAsync();
            return categories.Select(MapToDto).ToList();
        }

        public async Task<CategoryDto?> GetByIdAsync(int id)
        {
            var c = await _categoryRepository.GetByIdAsync(id);
            if (c == null) return null;
            return MapToDto(c);
        }

        public async Task<CategoryDto> CreateAsync(CreateCategoryRequestDto dto)
        {
            var c = new Category
            {
                CategoryName = dto.CategoryName,
                Description = dto.Description,
                ImageUrl = dto.ImageUrl,
                ParentCategoryId = dto.ParentCategoryId
            };

            await _categoryRepository.AddAsync(c);
            await _categoryRepository.SaveAsync();

            return MapToDto(c);
        }

        public async Task<CategoryDto> UpdateAsync(int id, UpdateCategoryRequestDto dto)
        {
            var c = await _categoryRepository.GetByIdAsync(id);
            if (c == null)
            {
                throw new KeyNotFoundException("Category not found.");
            }

            c.CategoryName = dto.CategoryName ?? c.CategoryName;
            c.Description = dto.Description ?? c.Description;
            c.ImageUrl = dto.ImageUrl ?? c.ImageUrl;
            c.ParentCategoryId = dto.ParentCategoryId ?? c.ParentCategoryId;

            _categoryRepository.Update(c);
            await _categoryRepository.SaveAsync();

            return MapToDto(c);
        }

        public async Task DeleteAsync(int id)
        {
            var c = await _categoryRepository.GetByIdAsync(id);
            if (c != null)
            {
                _categoryRepository.Delete(c);
                await _categoryRepository.SaveAsync();
            }
        }
    }
}