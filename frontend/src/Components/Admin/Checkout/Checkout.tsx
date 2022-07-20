import style from './checkout.module.scss';
import React from 'react'
import CheckoutEntry from './CheckoutEntry';

type Props = {}

const Checkout = (props: Props) => {
    return (
        <div className={style.container}>
            <CheckoutEntry date={new Date()} />
            <CheckoutEntry date={new Date()} />
            <CheckoutEntry date={new Date()} />
            <CheckoutEntry date={new Date()} />
            <CheckoutEntry date={new Date()} />
        </div>
    )
}

export default Checkout