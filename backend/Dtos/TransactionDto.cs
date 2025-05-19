using backend.Models; 

namespace backend.Dtos
{
    public class TransactionDto{
    public int Id {get; set; }
    public int? PayerId { get; set; }
    public decimal Amount {get; set;}
    public DivisionType? DivisionType { get; set; }
    public List<TransactionShareDto> Participants{get;set;} = new();
    }
}