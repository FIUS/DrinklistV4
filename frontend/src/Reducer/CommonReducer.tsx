import { Drink, Member } from "../types/ResponseTypes"

const initialState: CommonReducerType = {
    drinks: null,
    drinkCategories: null,
    members: null,
    favorites: null
}

export type CommonReducerType = {
    drinks: Array<Drink> | null,
    drinkCategories: Array<string> | null,
    members: Array<Member> | null,
    favorites: Array<number> | null,
}

const reducer = (state = initialState, { type, payload }: any) => {

    var newState = { ...state }
    switch (type) {
        case "SET_DRINKS":
            newState.drinks = payload
            return newState

        case "SET_MEMBERS":
            newState.members = payload
            return newState

        case "SET_DRINK_CATEGORIES":
            newState.drinkCategories = payload
            return newState

        case "SET_FAVORITES":
            newState.favorites = payload
            return newState
        default:
            return state
    }

}
export default reducer
