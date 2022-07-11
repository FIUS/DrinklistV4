import { Button } from '@mui/material'
import React from 'react'
import style from './drinkbutton.module.scss'
import Rating from '@mui/material/Rating';
import SellOutlinedIcon from '@mui/icons-material/SellOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import Spacer from '../../Common/Spacer';
import { Drink } from '../../../types/ResponseTypes';

type Props = {
    drink: Drink
}

const DrinkButton = (props: Props) => {
    return (
        <div className={style.container}>
            <Button variant='contained'>
                {props.drink.name}
                <Spacer horizontal={15} />
                <SellOutlinedIcon />
                {props.drink.price}€
                <Spacer horizontal={15} />
                <Inventory2OutlinedIcon />
                {props.drink.stock}
            </Button>
            <Rating defaultValue={0} max={1} />
        </div>
    )
}

export default DrinkButton