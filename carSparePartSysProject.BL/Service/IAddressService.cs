using CarSparePartSysProject.Models.Dto.Addresses;

namespace CarSparePartSysProject.BL.IServices
{
    public interface IAddressService
    {
        Task<IEnumerable<AddressDto>> GetUserAddressesAsync(int userId);

        Task<AddressDto?> GetByIdAsync(int id);

        Task<AddressDto> CreateAsync(CreateAddressRequestDto dto);

        Task<AddressDto> UpdateAsync(int id, UpdateAddressRequestDto dto);

        Task DeleteAsync(int id);
        Task SetDefaultAsync(int id, int userId);
    }
}