using CarSparePartSysProject.Models.Dto.Shipping;

namespace CarSparePartSysProject.BL.IServices
{
    public interface IShippingService
    {
        Task<IEnumerable<ShippingDto>> GetAllAsync();

        Task<ShippingDto?> GetByIdAsync(int id);

        Task<ShippingDto> CreateAsync(CreateShippingRequestDto dto);

        Task UpdateStatusAsync(int shippingId, string status);
    }
}
