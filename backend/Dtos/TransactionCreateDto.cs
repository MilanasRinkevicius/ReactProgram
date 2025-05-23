using System;
using System.Collections.Generic;
using backend.Dtos;
using backend.Models;

namespace backend.Dtos
{

    public class TransactionCreateDto
    {
        public int Id { get; set; }
        public int PayerId { get; set; }
        public Member Payer { get; set; } = new();
        public decimal Amount { get; set; }
        public List<TransactionShareDto> Participants { get; set; } = new();
        public DivisionType? divisiontype { get; set; }
    }
}
