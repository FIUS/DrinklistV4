import { Typography } from '@mui/material'
import React from 'react'
import DrinkButton from '../DrinkButton/DrinkButton'
import style from './details.module.scss'

type Props = {}

const BalanceBox = (props: Props) => {
    return (
        <div className={style.balanceBoxContainer}>
            <Typography variant='h4'>Favoriten</Typography>
            <div className={style.drinkButtonContainer}>

            </div>
        </div>
    )
}

export default BalanceBox