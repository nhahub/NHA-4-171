using CarSparePartSysProject.Models.Dto.Suppliers;

namespace CarSparePartSysProject.BL.IServices
{
    public interface ISupplierService
    {
        Task<IEnumerable<SupplierDto>> GetAllAsync();

        Task<SupplierDto?> GetByIdAsync(int id);

        Task<SupplierDto> CreateAsync(CreateSupplierRequestDto dto);

        Task<SupplierDto> UpdateAsync(int id, UpdateSupplierRequestDto dto);

        Task DeleteAsync(int id);
    }
}