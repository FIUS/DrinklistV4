import { AlertColor } from "@mui/material"
import { Drink, Member } from "../types/ResponseTypes"

export const setDrinks = (drinks: Array<Member>) => {
    return {
        type: "SET_DRINKS",
        payload: drinks
    }
}

export const setMembers = (members: Array<Drink>) => {
    return {
        type: "SET_MEMBERS",
        payload: members
    }
}

export const setDrinkCategories = (categories: Array<string>) => {
    return {
        type: "SET_DRINK_CATEGORIES",
        payload: categories
    }
}

export const setFavorites = (favorites: Array<string>) => {
    return {
        type: "SET_FAVORITES",
        payload: favorites
    }
}

export const setHistory = (history: Array<string>) => {
    return {
        type: "SET_HISTORY",
        payload: history
    }
}

export const setLoginState = (isLoggedIn: boolean) => {
    return {
        type: "SET_LOGIN",
        payload: isLoggedIn
    }
}

export const openToast = (settings: {
    message: string,
    headline?: string,
    duration?: number,
    type?: AlertColor
}) => {
    return {
        type: "OPEN_TOAST",
        payload: settings
    }
}

export const closeToast = () => {
    return {
        type: "CLOSE_TOAST",
        payload: ""
    }
}

export const openErrorToast = () => {
    return openToast({ message: "Ein fehler ist aufgetreten", type: "error" })
}