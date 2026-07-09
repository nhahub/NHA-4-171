using CarSparePartSysProject.Models.Dto.Coupons;


namespace CarSparePartSysProject.BL.IServices
{
    public interface ICouponService
    {
        Task<IEnumerable<CouponDto>> GetAllAsync();

        Task<CouponDto?> GetByIdAsync(int id);

        Task<CouponDto?> GetByCodeAsync(string code);

        Task<CouponDto> CreateAsync(CreateCouponRequestDto dto);

        Task<CouponDto> UpdateAsync(int id, UpdateCouponRequestDto dto);

        Task DeleteAsync(int id);
    }
}