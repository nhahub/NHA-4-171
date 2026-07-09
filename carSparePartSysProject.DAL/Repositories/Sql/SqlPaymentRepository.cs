using CarSparePartSysProject.DAL.Data;
using CarSparePartSysProject.DAL.Repositories.Interfaces;
using CarSparePartSys.Model;

namespace CarSparePartSysProject.DAL.Repositories.Sql
{
    public class SqlPaymentRepository : Repository<Payment>, IPaymentRepository
    {
        public SqlPaymentRepository(AppDbContext context) : base(context)
        {
        }
    }
}
