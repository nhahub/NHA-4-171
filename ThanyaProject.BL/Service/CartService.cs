using CarSparePartSysProject.BL.IServices;
using CarSparePartSysProject.Models.Dto.Cart;
using CarSparePartSysProject.DAL.Repositories.Interfaces;

namespace CarSparePartSysProject.BL.Service
{
    public class CartService : ICartService
    {
        private readonly ICartRepository _cartRepository;

        public CartService(ICartRepository cartRepository)
        {
            _cartRepository = cartRepository;
        }

        public Task<CartDto?> GetUserCartAsync(int userId)
        {
            throw new NotImplementedException();
        }

        public Task AddToCartAsync(AddToCartRequestDto dto)
        {
            throw new NotImplementedException();
        }

        public Task UpdateQuantityAsync(UpdateCartItemRequesDtot dto)
        {
            throw new NotImplementedException();
        }

        public Task RemoveItemAsync(int cartItemId)
        {
            throw new NotImplementedException();
        }

        public Task ClearCartAsync(int userId)
        {
            throw new NotImplementedException();
        }
    }
}
