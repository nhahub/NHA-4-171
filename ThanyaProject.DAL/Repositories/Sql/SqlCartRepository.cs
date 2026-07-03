using CarSparePartSysProject.DAL.Data;
using CarSparePartSysProject.DAL.Repositories.Interfaces;
using CarSparePartSys.Model;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace CarSparePartSysProject.DAL.Repositories.Sql
{
    public class SqlCartRepository : Repository<Cart>, ICartRepository
    {
        public SqlCartRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<Cart?> GetCartByUserIdAsync(int userId)
        {
            return await _dbSet
                .Include(c => c.CartItems)
                .FirstOrDefaultAsync(c => c.UserId == userId);
        }
    }
}
