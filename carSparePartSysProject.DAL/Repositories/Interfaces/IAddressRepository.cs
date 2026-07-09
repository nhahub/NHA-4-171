using CarSparePartSys.Model;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CarSparePartSysProject.DAL.Repositories.Interfaces
{
    public interface IAddressRepository : IRepository<Address>
    {
        Task<IEnumerable<Address>> GetAddressesByUserIdAsync(int userId);
    }
}
