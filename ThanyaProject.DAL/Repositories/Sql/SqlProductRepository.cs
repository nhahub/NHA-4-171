using CarSparePartSysProject.DAL.Data;
using CarSparePartSysProject.DAL.Repositories.Interfaces;
using CarSparePartSys.Model;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CarSparePartSysProject.DAL.Repositories.Sql
{
    public class SqlProductRepository : Repository<Product>, IProductRepository
    {
        public SqlProductRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Product>> GetProductsByCategoryAsync(int categoryId)
        {
            return await _dbSet.AsNoTracking()
                .Where(p => p.CategoryId == categoryId)
                .ToListAsync();
        }
    }
}
