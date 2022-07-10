import { Button } from '@mui/material'
import React from 'react'
import style from './drinkbutton.module.scss'
import Rating from '@mui/material/Rating';
import SellOutlinedIcon from '@mui/icons-material/SellOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import Spacer from '../../Common/Spacer';
type Props = {}

const DrinkButton = (props: Props) => {
    return (
        <div className={style.container}>
            <Button variant='contained'>
                Paulaner Spezi
                <Spacer horizontal={15} />
                <SellOutlinedIcon />
                15,50€
                <Spacer horizontal={15} />
                <Inventory2OutlinedIcon />
                15
            </Button>
            <Rating defaultValue={0} max={1} />
        </div>
    )
}

export default DrinkButton