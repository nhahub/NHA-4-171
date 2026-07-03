using CarSparePartSysProject.DAL.Data;
using CarSparePartSysProject.DAL.Repositories.Interfaces;
using CarSparePartSys.Model;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CarSparePartSysProject.DAL.Repositories.Sql
{
    public class SqlWishlistRepository : Repository<Wishlist>, IWishlistRepository
    {
        public SqlWishlistRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Wishlist>> GetWishlistByUserIdAsync(int userId)
        {
            return await _dbSet.AsNoTracking()
                .Where(w => w.UserId == userId)
                .ToListAsync();
        }
    }
}
