import { Typography } from '@mui/material'
import React from 'react'
import { Drink } from '../../../types/ResponseTypes'
import DrinkButton from '../DrinkButton/DrinkButton'
import style from './details.module.scss'

type Props = {
    favorites: Array<Drink> | undefined,
    memberID: string
}

const BalanceBox = (props: Props) => {
    return (
        <div className={style.balanceBoxContainer}>
            <Typography variant='h4'>Favoriten</Typography>
            <div className={style.drinkButtonContainer}>
                {props.favorites?.map((value) => {
                    return <DrinkButton drink={value}
                        memberID={props.memberID}
                        key={props.memberID} />
                })}
            </div>
        </div>
    )
}

export default BalanceBox