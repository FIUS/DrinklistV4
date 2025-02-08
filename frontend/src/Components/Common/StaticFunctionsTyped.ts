import { Member } from "../../types/ResponseTypes"

export const safeMemberName = (member: Member) => {
    return member.alias === "" ? member.name : member.alias
}

export const stringToColor = (string: String) => {
    let hash = 0;
    let i;

    for (i = 0; i < string.length; i += 1) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = '#';

    for (i = 0; i < 3; i += 1) {
        const value = (hash >> (i * 8)) & 0xff;
        color += `00${value.toString(16)}`.slice(-2);
    }

    return color;
}

export const calculateAvatarText = (text: String) => {
    const emojiFilterd = text.match(/\p{Emoji}+/gu)
    const emoji = emojiFilterd ? emojiFilterd[0] : "?"
    const short = text.substring(0, 2)

    return emoji !== "?" ? emoji : short
}

export const convertToLocalDate = (date: string) => {
    //Check if date is already a Date object
    if ((date as any) instanceof Date) {
        return new Date(date)
    }
    return new Date(date.replace("Z", ""))
}