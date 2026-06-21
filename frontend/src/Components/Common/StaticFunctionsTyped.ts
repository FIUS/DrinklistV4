import { Drink, Member } from "../../types/ResponseTypes"

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

const avatarEmojiPattern = /(?:\p{Regional_Indicator}{2}|\p{Extended_Pictographic}(?:\uFE0F|\uFE0E)?(?:\p{Emoji_Modifier})?(?:\u200D\p{Extended_Pictographic}(?:\uFE0F|\uFE0E)?(?:\p{Emoji_Modifier})?)*)/u

export const calculateAvatarText = (text: String, fallbackText: String = "") => {
    const primary = text.toString()
    const fallback = fallbackText.toString()
    const emoji = primary.match(avatarEmojiPattern)?.[0] ?? fallback.match(avatarEmojiPattern)?.[0]

    if (emoji) {
        return emoji
    }

    const source = primary.trim() || fallback.trim()
    const letters = source.match(/\p{L}/gu)
    const initials = letters?.slice(0, 2).join("") ||
        Array.from(source.replace(/\s+/g, "")).slice(0, 2).join("")

    return initials.toLocaleUpperCase() || "?"
}

export const convertToLocalDate = (date: string) => {
    //Check if date is already a Date object
    if ((date as any) instanceof Date) {
        return new Date(date)
    }
    return new Date(date.replace("Z", ""))
}

export const getCategorySortingIndex = (category: string, drinks: Array<Drink> | null | undefined) => {
    const categoryDrink = drinks?.find((drink) => drink.category === category)
    return categoryDrink?.sortingIndex ?? 0
}

export const compareCategoriesBySortingIndex = (
    category1: string,
    category2: string,
    drinks: Array<Drink> | null | undefined
) => {
    const sortingIndexCategory1 = getCategorySortingIndex(category1, drinks)
    const sortingIndexCategory2 = getCategorySortingIndex(category2, drinks)

    if (sortingIndexCategory1 !== sortingIndexCategory2) {
        return sortingIndexCategory1 - sortingIndexCategory2
    }

    return category1.localeCompare(category2)
}

export const formatMoney = (cents: number | null | undefined) => {
    const safeCents = Math.trunc(cents ?? 0)
    const sign = safeCents < 0 ? "-" : ""
    const absolute = Math.abs(safeCents)
    const euros = Math.floor(absolute / 100)
    const remainder = (absolute % 100).toString().padStart(2, "0")

    return `${sign}${euros}.${remainder}`
}

export const centsToEuroNumber = (cents: number | null | undefined) => {
    return Math.trunc(cents ?? 0) / 100
}

export const parseMoneyInputToCents = (value: string | number | null | undefined) => {
    if (value === null || value === undefined) {
        return 0
    }

    const rawValue = value.toString().trim().replace(",", ".")
    if (rawValue === "" || rawValue === "-") {
        return 0
    }

    const match = rawValue.match(/^(-)?(\d*)(?:\.(\d*))?$/)
    if (!match) {
        return 0
    }

    const [, negative, wholePartRaw, fractionalPartRaw = ""] = match
    const wholePart = parseInt(wholePartRaw || "0", 10)
    const centsPart = parseInt((fractionalPartRaw + "00").slice(0, 2), 10)
    const shouldRoundUp = (fractionalPartRaw[2] ?? "0") >= "5"
    const absoluteCents = wholePart * 100 + centsPart + (shouldRoundUp ? 1 : 0)

    return negative ? -absoluteCents : absoluteCents
}
