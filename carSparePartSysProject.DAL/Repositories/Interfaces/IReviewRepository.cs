using CarSparePartSys.Model;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CarSparePartSysProject.DAL.Repositories.Interfaces
{
    public interface IReviewRepository : IRepository<Review>
    {
        Task<IEnumerable<Review>> GetReviewsByProductIdAsync(int productId);
    }
}
