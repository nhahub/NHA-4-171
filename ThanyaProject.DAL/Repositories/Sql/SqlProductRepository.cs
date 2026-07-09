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

        public override async Task<IEnumerable<Product>> GetAllAsync()
        {
            return await _dbSet.AsNoTracking()
                .Include(p => p.Reviews)
                .Include(p => p.Inventories)
                .ToListAsync();
        }

        public override async Task<Product?> GetByIdAsync(int id)
        {
            return await _dbSet
                .Include(p => p.Reviews)
                .Include(p => p.Inventories)
                .FirstOrDefaultAsync(p => p.ProductId == id);
        }

        public async Task<IEnumerable<Product>> GetProductsByCategoryAsync(int categoryId)
        {
            return await _dbSet.AsNoTracking()
                .Include(p => p.Reviews)
                .Include(p => p.Inventories)
                .Where(p => p.CategoryId == categoryId)
                .ToListAsync();
        }
    }
}
