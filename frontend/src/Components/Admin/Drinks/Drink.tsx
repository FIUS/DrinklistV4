import { Button, Paper } from '@mui/material'
import React, { useState } from 'react';
import style from './drinks.module.scss';
import SellOutlinedIcon from '@mui/icons-material/SellOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import Spacer from '../../Common/Spacer';
import DrinkPriceDialog from './DrinkPriceDialog';
import DrinkStockDialog from './DrinkStockDialog';
import { Drink as DrinkType } from '../../../types/ResponseTypes';
import { doGetRequest, doRequest } from '../../Common/StaticFunctions';
import { useDispatch } from 'react-redux';
import { setDrinkCategories, setDrinks } from '../../../Actions/CommonAction';
import DrinkEditDialog from './DrinkEditDialog';

type Props = {
    drink: DrinkType
}

const Drink = (props: Props) => {
    const [isHovered, setisHovered] = useState(false)
    const [priceDialogOpen, setpriceDialogOpen] = useState(false)
    const [stockDialogOpen, setstockDialogOpen] = useState(false)
    const [drinkEditOpen, setdrinkEditOpen] = useState(false)

    const dispatch = useDispatch()

    return (
        <Paper
            className={style.drinkPaper}
            onMouseEnter={() => setisHovered(true)}
            onMouseLeave={() => setisHovered(false)}
            elevation={isHovered ? 3 : 1}
        >
            <Button onClick={() => setdrinkEditOpen(true)} sx={{ color: "text.primary" }}>
                {props.drink.name}
            </Button>
            <DrinkEditDialog
                isOpen={drinkEditOpen}
                close={() => setdrinkEditOpen(false)}
                drink={props.drink}
            />
            <div className={style.buttonsContainer} >
                <Button onClick={() => setpriceDialogOpen(true)}>
                    {props.drink.price.toFixed(2)}€
                    <Spacer horizontal={5} />
                    <SellOutlinedIcon />
                </Button>
                <Button onClick={() => setstockDialogOpen(true)}>
                    {props.drink.stock}
                    <Spacer horizontal={5} />
                    <Inventory2OutlinedIcon />
                </Button>
                <Button onClick={() => {
                    doRequest("DELETE", "drinks/" + props.drink.id + "/delete", "").then(value => {
                        if (value.code === 200) {
                            doGetRequest("drinks").then((value) => {
                                if (value.code === 200) {
                                    dispatch(setDrinks(value.content))

                                    if (!(value.content as Array<DrinkType>).find(drink => drink.category === props.drink.category)) {
                                        doGetRequest("drinks/categories").then((value) => {
                                            if (value.code === 200) {
                                                dispatch(setDrinkCategories(value.content))
                                            }
                                        })
                                    }
                                }
                            })
                        }


                    })
                }}>
                    <DeleteOutlineOutlinedIcon />
                </Button>
            </div>
            <DrinkPriceDialog
                isOpen={priceDialogOpen}
                close={() => setpriceDialogOpen(false)}
                drink={props.drink}
            />
            <DrinkStockDialog
                isOpen={stockDialogOpen}
                close={() => setstockDialogOpen(false)}
                drink={props.drink} />
        </Paper >
    )
}

export default Drink