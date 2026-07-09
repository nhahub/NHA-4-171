using CarSparePartSysProject.DAL.Data;
using CarSparePartSysProject.DAL.Repositories.Interfaces;
using CarSparePartSys.Model;

namespace CarSparePartSysProject.DAL.Repositories.Sql
{
    public class SqlSupplierRepository : Repository<Supplier>, ISupplierRepository
    {
        public SqlSupplierRepository(AppDbContext context) : base(context)
        {
        }
    }
}
