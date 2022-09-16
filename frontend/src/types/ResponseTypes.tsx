export type Member = {
    id: number,
    name: string,
    balance: number,
    hidden: boolean,
    alias: string
}

export type Drink = {
    id: number,
    name: string,
    stock: number,
    price: number,
    category: string
}

export type Transaction = {
    id: number,
    description: string,
    memberID: number,
    memberName?: string,
    amount: number,
    date: string,
    revertable: boolean
}

export type Checkout = {
    id: number,
    date: string,
    currentCash: number,
    transactions?: Array<Transaction>
}

export type Message = {
    text: string,
    memberNameFrom: string,
    emoji: string
}