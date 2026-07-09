using CarSparePartSys.Model;
using CarSparePartSysProject.BL.IServices;
using CarSparePartSysProject.DAL.Repositories.Interfaces;
using CarSparePartSysProject.Models.Dto.Products.Inventory;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CarSparePartSysProject.BL.Service
{
    public class InventoryService : IInventoryService
    {
        private readonly IInventoryRepository _inventoryRepository;

        public InventoryService(IInventoryRepository inventoryRepository)
        {
            _inventoryRepository = inventoryRepository;
        }

        public async Task<IEnumerable<InventoryDto>> GetAllAsync()
        {
            var items = await _inventoryRepository.GetAllAsync();
            return items.Select(i => new InventoryDto
            {
                InventoryId = i.InventoryId,
                ProductId = i.ProductId,
                QuantityInStock = i.QuantityInStock,
                ReorderLevel = i.ReorderLevel
            });
        }

        public async Task<InventoryDto?> GetByIdAsync(int id)
        {
            var i = await _inventoryRepository.GetByIdAsync(id);
            if (i == null) return null;
            return new InventoryDto
            {
                InventoryId = i.InventoryId,
                ProductId = i.ProductId,
                QuantityInStock = i.QuantityInStock,
                ReorderLevel = i.ReorderLevel
            };
        }

        public async Task UpdateStockAsync(UpdateInventoryRequestDto dto)
        {
            var items = await _inventoryRepository.GetAllAsync();
            var i = items.FirstOrDefault();
            if (i != null)
            {
                i.QuantityInStock = dto.QuantityInStock ?? i.QuantityInStock;
                i.ReorderLevel = dto.ReorderLevel ?? i.ReorderLevel;
                _inventoryRepository.Update(i);
                await _inventoryRepository.SaveAsync();
            }
        }
    }
}
