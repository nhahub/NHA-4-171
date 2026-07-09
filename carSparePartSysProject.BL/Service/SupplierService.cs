using CarSparePartSys.Model;
using CarSparePartSysProject.BL.IServices;
using CarSparePartSysProject.DAL.Repositories.Interfaces;
using CarSparePartSysProject.Models.Dto.Suppliers;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CarSparePartSysProject.BL.Service
{
    public class SupplierService : ISupplierService
    {
        private readonly ISupplierRepository _supplierRepository;

        public SupplierService(ISupplierRepository supplierRepository)
        {
            _supplierRepository = supplierRepository;
        }

        public async Task<IEnumerable<SupplierDto>> GetAllAsync()
        {
            var suppliers = await _supplierRepository.GetAllAsync();
            return suppliers.Select(s => new SupplierDto
            {
                SupplierId = s.SupplierId,
                SupplierName = s.SupplierName,
                ContactPerson = s.ContactPerson,
                Email = s.Email,
                Phone = s.Phone,
                Address = s.Address,
                TaxNumber = s.TaxNumber,
                IsActive = s.IsActive
            });
        }

        public async Task<SupplierDto?> GetByIdAsync(int id)
        {
            var s = await _supplierRepository.GetByIdAsync(id);
            if (s == null) return null;
            return new SupplierDto
            {
                SupplierId = s.SupplierId,
                SupplierName = s.SupplierName,
                ContactPerson = s.ContactPerson,
                Email = s.Email,
                Phone = s.Phone,
                Address = s.Address,
                TaxNumber = s.TaxNumber,
                IsActive = s.IsActive
            };
        }

        public async Task<SupplierDto> CreateAsync(CreateSupplierRequestDto dto)
        {
            var s = new Supplier
            {
                SupplierName = dto.SupplierName,
                ContactPerson = dto.ContactPerson,
                Email = dto.Email,
                Phone = dto.Phone,
                Address = dto.Address,
                TaxNumber = dto.TaxNumber,
                IsActive = dto.IsActive
            };

            await _supplierRepository.AddAsync(s);
            await _supplierRepository.SaveAsync();

            return new SupplierDto
            {
                SupplierId = s.SupplierId,
                SupplierName = s.SupplierName,
                ContactPerson = s.ContactPerson,
                Email = s.Email,
                Phone = s.Phone,
                Address = s.Address,
                TaxNumber = s.TaxNumber,
                IsActive = s.IsActive
            };
        }

        public async Task<SupplierDto> UpdateAsync(int id, UpdateSupplierRequestDto dto)
        {
            var s = await _supplierRepository.GetByIdAsync(id);
            if (s == null)
            {
                throw new KeyNotFoundException("Supplier not found.");
            }

            s.SupplierName = dto.SupplierName ?? s.SupplierName;
            s.ContactPerson = dto.ContactPerson ?? s.ContactPerson;
            s.Email = dto.Email ?? s.Email;
            s.Phone = dto.Phone ?? s.Phone;
            s.Address = dto.Address ?? s.Address;
            s.TaxNumber = dto.TaxNumber ?? s.TaxNumber;
            s.IsActive = dto.IsActive ?? s.IsActive;

            _supplierRepository.Update(s);
            await _supplierRepository.SaveAsync();

            return new SupplierDto
            {
                SupplierId = s.SupplierId,
                SupplierName = s.SupplierName,
                ContactPerson = s.ContactPerson,
                Email = s.Email,
                Phone = s.Phone,
                Address = s.Address,
                TaxNumber = s.TaxNumber,
                IsActive = s.IsActive
            };
        }

        public async Task DeleteAsync(int id)
        {
            var s = await _supplierRepository.GetByIdAsync(id);
            if (s != null)
            {
                _supplierRepository.Delete(s);
                await _supplierRepository.SaveAsync();
            }
        }
    }
}
