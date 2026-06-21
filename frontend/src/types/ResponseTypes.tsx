export type Member = {
    id: number,
    name: string,
    /** Signed integer cents. */
    balance: number,
    hidden: boolean,
    alias: string,
    isAdmin?: boolean
}

export type Drink = {
    id: number,
    name: string,
    stock: number,
    /** Integer cents. */
    price: number,
    category: string,
    sortingIndex?: number
}

export type Transaction = {
    id: number,
    description: string,
    memberID: number,
    memberName?: string,
    /** Signed integer cents. */
    amount: number,
    date: string,
    revertable: boolean,
    partOfCheckout: boolean
}

export type Checkout = {
    id: number,
    date: string,
    /** Integer cents. */
    currentCash: number,
    transactions?: Array<Transaction>
}

export type Message = {
    id: number,
    text: string,
    memberNameFrom: string,
    emoji: string,
    request?: {
        to: number,
        /** Integer cents. */
        amount: number
    }
}

export type LowBalanceQrCode = {
    type: string,
    payload: string
}

export type LowBalanceWarningResponse = {
    showWarning: boolean,
    /** Signed integer cents. */
    balance: number,
    /** Integer cents. */
    threshold: number | null,
    /** Integer cents. */
    depositAmount: number,
    qrCodes: Array<LowBalanceQrCode>
}

export type EventModeStatus = {
    enabled: boolean,
    frontendDomain: string | null
}

export type EventDrinksResponse = {
    drinks: Array<Drink>,
    categories: Array<string>
}

export type EventGuestResponse = {
    member: Member
}

export type EventGuestLoginResponse = {
    memberID: number,
    member: Member
}

export type EventPurchaseResponse = {
    /** Signed integer cents. */
    balance: number,
    /** Integer cents. */
    total: number,
    /** Integer cents. */
    cash: number
}
