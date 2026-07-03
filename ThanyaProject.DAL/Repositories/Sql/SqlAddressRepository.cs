using CarSparePartSysProject.DAL.Data;
using CarSparePartSysProject.DAL.Repositories.Interfaces;
using CarSparePartSys.Model;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CarSparePartSysProject.DAL.Repositories.Sql
{
    public class SqlAddressRepository : Repository<Address>, IAddressRepository
    {
        public SqlAddressRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Address>> GetAddressesByUserIdAsync(int userId)
        {
            return await _dbSet.AsNoTracking()
                .Where(a => a.UserId == userId)
                .ToListAsync();
        }
    }
}
