using CarSparePartSysProject.DAL.Data;
using CarSparePartSysProject.DAL.Repositories.Interfaces;
using CarSparePartSys.Model;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CarSparePartSysProject.DAL.Repositories.Sql
{
    public class SqlOrderRepository : Repository<Order>, IOrderRepository
    {
        public SqlOrderRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Order>> GetOrdersByUserIdAsync(int userId)
        {
            return await _dbSet.AsNoTracking()
                .Where(o => o.CustomerId == userId)
                .ToListAsync();
        }
    }
}
