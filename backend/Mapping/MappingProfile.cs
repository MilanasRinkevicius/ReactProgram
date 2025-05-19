using AutoMapper;
using backend.Models;
using backend.Dtos;

namespace backend.Mapping
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<Group, GroupDto>();
            CreateMap<Member, MemberDto>();
        }
    }
}