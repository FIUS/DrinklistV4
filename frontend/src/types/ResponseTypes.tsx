export type Member = {
    id: number,
    name: string,
    balance: number,
    hidden: boolean
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
    date: string
}           