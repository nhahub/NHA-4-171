using Microsoft.AspNetCore.Identity;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CarSparePartSys.Model
{
    public class Role : IdentityRole<int>
    {
        public string? Description { get; set; }

        public ICollection<User> Users { get; set; } = new List<User>();
    }
}
