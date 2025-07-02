using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options) { }

        public DbSet<Group> Groups => Set<Group>();
        public DbSet<Member> Members => Set<Member>();
        public DbSet<Transaction> Transactions => Set<Transaction>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Group.Members (one-to-many)
            modelBuilder.Entity<Group>()
                .HasMany(g => g.Members)
                .WithOne()
                .HasForeignKey(m => m.GroupId)
                .OnDelete(DeleteBehavior.Cascade);

            // Group.Payer (one-to-one, optional)
            modelBuilder.Entity<Group>()
                .HasOne(g => g.Payer)
                .WithMany()
                .HasForeignKey("PayerId") // shadow property
                .IsRequired(false)
                .OnDelete(DeleteBehavior.Restrict);

            base.OnModelCreating(modelBuilder);
        }
    }
}