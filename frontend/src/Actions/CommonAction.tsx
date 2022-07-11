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
