import style from './checkout.module.scss';
import React, { useEffect, useState } from 'react'
import CheckoutEntry from './CheckoutEntry';
import { doGetRequest } from '../../Common/StaticFunctions';
import { Checkout as CheckoutType } from '../../../types/ResponseTypes';

type Props = {}

const Checkout = (props: Props) => {

    const [checkouts, setcheckouts] = useState<Array<CheckoutType>>([])

    useEffect(() => {
        doGetRequest("checkout").then(value => {
            if (value.code === 200) {
                setcheckouts(value.content)
            }
        })
    }, [])

    return (
        <div className={style.container}>
            {checkouts.map(value => <CheckoutEntry checkout={value} />)}
        </div>
    )
}

export default Checkout