import { Member } from "../../types/ResponseTypes"

export const safeMemberName = (member: Member) => {
    return member.alias === "" ? member.name : member.alias
}