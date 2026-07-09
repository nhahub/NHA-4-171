using CarSparePartSysProject.Models.Dto.Wishlist;

namespace CarSparePartSysProject.BL.IServices
{
    public interface IWishlistService
    {
        Task<IEnumerable<WishlistDto>> GetWishlistAsync(int userId);

        Task AddAsync(int userId, AddToWishlistRequestDto dto);

        Task RemoveAsync(int wishlistId);
    }
}