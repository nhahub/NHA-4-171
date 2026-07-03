using CarSparePartSysProject.Models.Dto.Products.Inventory;

namespace CarSparePartSysProject.BL.IServices
{
    public interface IInventoryService
    {
        Task<IEnumerable<InventoryDto>> GetAllAsync();

        Task<InventoryDto?> GetByIdAsync(int id);

        Task UpdateStockAsync(UpdateInventoryRequestDto dto);
    }
}