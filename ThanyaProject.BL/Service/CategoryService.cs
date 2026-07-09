using CarSparePartSysProject.BL.Service.IService;
using CarSparePartSysProject.Models.Dto.Categories;
using CarSparePartSysProject.DAL.Repositories.Interfaces;
using CarSparePartSys.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CarSparePartSysProject.BL.Service
{
    public class CategoryService : ICategoryService
    {
        private readonly ICategoryRepository _categoryRepository;
        private readonly IProductRepository _productRepository;

        public CategoryService(ICategoryRepository categoryRepository, IProductRepository productRepository)
        {
            _categoryRepository = categoryRepository;
            _productRepository = productRepository;
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
            return categories.Select(c => new CategoryDto
            {
                CategoryId = c.CategoryId,
                CategoryName = c.CategoryName,
                Description = c.Description,
                ImageUrl = c.ImageUrl,
                ParentCategoryId = c.ParentCategoryId
            });
        }

        public async Task<CategoryDto?> GetByIdAsync(int id)
        {
            var c = await _categoryRepository.GetByIdAsync(id);
            return c != null ? MapToDto(c) : null;
        }

        public async Task<CategoryDto> CreateAsync(CreateCategoryRequestDto dto)
        {
            var c = new Category
            {
                CategoryName = dto.CategoryName.Trim(),
                Description = dto.Description?.Trim(),
                ImageUrl = dto.ImageUrl?.Trim(),
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
                throw new KeyNotFoundException("Category not found");
            }

            c.CategoryName = dto.CategoryName.Trim();
            c.Description = dto.Description?.Trim();
            c.ImageUrl = dto.ImageUrl?.Trim();
            c.ParentCategoryId = dto.ParentCategoryId;

            _categoryRepository.Update(c);
            await _categoryRepository.SaveAsync();

            return MapToDto(c);
        }

        public async Task DeleteAsync(int id)
        {
            var c = await _categoryRepository.GetByIdAsync(id);
            if (c != null)
            {
                var products = await _productRepository.GetAllAsync();
                if (products.Any(p => p.CategoryId == id))
                {
                    throw new InvalidOperationException("Cannot delete category because it has products associated with it. Please reassign the products first.");
                }

                var allCategories = await _categoryRepository.GetAllAsync();
                var subcategories = allCategories.Where(x => x.ParentCategoryId == id).ToList();
                foreach (var sub in subcategories)
                {
                    sub.ParentCategoryId = null;
                    _categoryRepository.Update(sub);
                }
                if (subcategories.Any())
                {
                    await _categoryRepository.SaveAsync();
                }

                _categoryRepository.Delete(c);
                await _categoryRepository.SaveAsync();
            }
        }
    }
}