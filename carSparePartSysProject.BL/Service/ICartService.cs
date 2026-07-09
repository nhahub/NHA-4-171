using CarSparePartSysProject.Models.Dto.Cart;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace CarSparePartSysProject.BL.IServices
{
    public interface ICartService
    {
        Task<CartDto?> GetUserCartAsync(int userId);

        Task AddToCartAsync(int userId, AddToCartRequestDto dto);

        Task UpdateQuantityAsync(UpdateCartItemRequesDtot dto);

        Task RemoveItemAsync(int cartItemId);

        Task ClearCartAsync(int userId);
    }
}
