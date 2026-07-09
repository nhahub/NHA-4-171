using CarSparePartSys.Model;
using System.Threading.Tasks;

namespace CarSparePartSysProject.DAL.Repositories.Interfaces
{
    public interface ICartRepository : IRepository<Cart>
    {
        Task<Cart?> GetCartByUserIdAsync(int userId);
    }
}
