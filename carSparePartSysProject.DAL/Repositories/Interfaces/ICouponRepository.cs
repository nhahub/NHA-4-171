using CarSparePartSys.Model;
using System.Threading.Tasks;

namespace CarSparePartSysProject.DAL.Repositories.Interfaces
{
    public interface ICouponRepository : IRepository<Coupon>
    {
        Task<Coupon?> GetByCodeAsync(string code);
    }
}
