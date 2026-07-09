using CarSparePartSysProject.DAL.Data;
using CarSparePartSysProject.DAL.Repositories.Interfaces;
using CarSparePartSys.Model;

namespace CarSparePartSysProject.DAL.Repositories.Sql
{
    public class SqlCategoryRepository : Repository<Category>, ICategoryRepository
    {
        public SqlCategoryRepository(AppDbContext context) : base(context)
        {
        }
    }
}
