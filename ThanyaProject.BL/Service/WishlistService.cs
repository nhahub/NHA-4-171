using CarSparePartSysProject.BL.IServices;
using CarSparePartSysProject.Models.Dto.Wishlist;
using CarSparePartSysProject.DAL.Repositories.Interfaces;

namespace CarSparePartSysProject.BL.Service
{
    public class WishlistService : IWishlistService
    {
        private readonly IWishlistRepository _wishlistRepository;

        public WishlistService(IWishlistRepository wishlistRepository)
        {
            _wishlistRepository = wishlistRepository;
        }

        public Task<IEnumerable<WishlistDto>> GetWishlistAsync(int userId)
        {
            throw new NotImplementedException();
        }

        public Task AddAsync(AddToWishlistRequestDto dto)
        {
            throw new NotImplementedException();
        }

        public Task RemoveAsync(int wishlistId)
        {
            throw new NotImplementedException();
        }
    }
}