import { Button, Paper, Typography } from '@mui/material'
import React, { useState } from 'react';
import style from './drinks.module.scss';
import SellOutlinedIcon from '@mui/icons-material/SellOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import Spacer from '../../Common/Spacer';
import DrinkPriceDialog from './DrinkPriceDialog';
import DrinkStockDialog from './DrinkStockDialog';

type Props = {}

const Drink = (props: Props) => {
    const [isHovered, setisHovered] = useState(false)
    const [priceDialogOpen, setpriceDialogOpen] = useState(false)
    const [stockDialogOpen, setstockDialogOpen] = useState(false)

    return (
        <Paper
            className={style.drinkPaper}
            onMouseEnter={() => setisHovered(true)}
            onMouseLeave={() => setisHovered(false)}
            elevation={isHovered ? 3 : 1}
        >
            <Typography variant="h6">
                Johinnesbeer-Zitrone
            </Typography>
            <div className={style.buttonsContainer} >
                <Button onClick={() => setpriceDialogOpen(true)}>
                    0,60€
                    <Spacer horizontal={5} />
                    <SellOutlinedIcon />
                </Button>
                <Button onClick={() => setstockDialogOpen(true)}>
                    25
                    <Spacer horizontal={5} />
                    <Inventory2OutlinedIcon />
                </Button>
                <Button>
                    <DeleteOutlineOutlinedIcon />
                </Button>
            </div>
            <DrinkPriceDialog isOpen={priceDialogOpen} close={() => setpriceDialogOpen(false)} drinkname="Paulaner Spezi" />
            <DrinkStockDialog isOpen={stockDialogOpen} close={() => setstockDialogOpen(false)} drinkname="Paulaner Spezi" />
        </Paper>
    )
}

export default Drink