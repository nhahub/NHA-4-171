using CarSparePartSys.Model;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CarSparePartSysProject.DAL.Repositories.Interfaces
{
    public interface IWishlistRepository : IRepository<Wishlist>
    {
        Task<IEnumerable<Wishlist>> GetWishlistByUserIdAsync(int userId);
    }
}
