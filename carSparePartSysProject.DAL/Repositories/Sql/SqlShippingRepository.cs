using CarSparePartSysProject.DAL.Data;
using CarSparePartSysProject.DAL.Repositories.Interfaces;
using CarSparePartSys.Model;

namespace CarSparePartSysProject.DAL.Repositories.Sql
{
    public class SqlShippingRepository : Repository<Shipping>, IShippingRepository
    {
        public SqlShippingRepository(AppDbContext context) : base(context)
        {
        }
    }
}
