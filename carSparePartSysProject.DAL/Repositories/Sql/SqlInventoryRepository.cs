using CarSparePartSysProject.DAL.Data;
using CarSparePartSysProject.DAL.Repositories.Interfaces;
using CarSparePartSys.Model;

namespace CarSparePartSysProject.DAL.Repositories.Sql
{
    public class SqlInventoryRepository : Repository<Inventory>, IInventoryRepository
    {
        public SqlInventoryRepository(AppDbContext context) : base(context)
        {
        }
    }
}
