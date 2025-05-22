using Microsoft.AspNetCore.Mvc;
using backend.Data;
using backend.Models;
using backend.Dtos;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GroupsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public GroupsController(AppDbContext context) => _context = context;

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Group>>> GetGroups()
        {
            return await _context.Groups
                .Include(g => g.Transactions)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Group>> GetGroupById(int id)
        {
            var group = await _context.Groups
                .Include(g => g.Transactions)
                .FirstOrDefaultAsync(g => g.Id == id);

            return group is null ? NotFound() : group;
        }

        [HttpGet("{id}/dto")]
        public async Task<ActionResult<GroupDto>> GetGroupDto(int id)
        {
            var group = await _context.Groups
                .Include(g => g.Members)
                .FirstOrDefaultAsync(g => g.Id == id);

            if (group == null)
                return NotFound();

            var groupDto = new GroupDto
            {
                Id = group.Id,
                Name = group.Name,
                Members = group.Members?
                .Select(m => new MemberDto
                {
                    Id = m.Id,
                    Name = m.Name
                }).ToList() ?? new List<MemberDto>()
            };

            return Ok(groupDto);
        }

        [HttpPost]
        public async Task<ActionResult<Group>> CreateGroup(Group group)
        {
            _context.Groups.Add(group);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetGroupById), new { id = group.Id }, group);
        }
        [HttpGet("{id}/transactions/by-group")]
        public async Task<ActionResult<IEnumerable<Transaction>>> GetTransactionsByGroupId(int id)
        {
            var groupExists = await _context.Groups.AnyAsync(g => g.Id == id);
            if (!groupExists)
                return NotFound("Group not found");

            var transactions = await _context.Transactions
                .Where(t => t.GroupId == id)
                .ToListAsync();

            return Ok(transactions);
        }
    }
}