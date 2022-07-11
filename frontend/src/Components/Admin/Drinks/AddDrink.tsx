import { Button, Paper, TextField } from '@mui/material'
import React, { useState } from 'react';
import style from './drinks.module.scss';
import SellOutlinedIcon from '@mui/icons-material/SellOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import Spacer from '../../Common/Spacer';
import { Add } from '@mui/icons-material';
import { doGetRequest, doPostRequest } from '../../Common/StaticFunctions';
import { useDispatch } from 'react-redux';
import { setDrinks } from '../../../Actions/CommonAction';

type Props = {}

const AddDrink = (props: Props) => {
    const [isHovered, setisHovered] = useState(false)
    const [drinkname, setdrinkname] = useState("")
    const [price, setprice] = useState(0.0)
    const [stock, setstock] = useState(0)
    const dispatch = useDispatch()

    return (
        <Paper
            className={style.addDrinkPaper}
            onMouseEnter={() => setisHovered(true)}
            onMouseLeave={() => setisHovered(false)}
            elevation={isHovered ? 5 : 3}
        >
            <TextField
                placeholder='Getränkename'
                variant='standard'
                value={drinkname}
                onChange={(value) => {
                    setdrinkname(value.target.value)
                }} />
            <Spacer vertical={20} />
            <div className={style.buttonsContainer} >
                <div className={style.smallTextFieldContainer}>
                    <TextField
                        className={style.smallTextField}
                        placeholder='Preis in Euro'
                        variant='standard'
                        type='number'
                        value={price}
                        onChange={(value) => {
                            if (parseFloat(value.target.value) >= 0) {
                                setprice(parseFloat(value.target.value))
                            }
                        }} />
                    <Spacer horizontal={5} />
                    <SellOutlinedIcon />
                </div>
                <div className={style.smallTextFieldContainer}>
                    <TextField
                        className={style.smallTextField}
                        placeholder='Flaschen-Anzahl'
                        variant='standard'
                        type='number'
                        value={stock}
                        onChange={(value) => {
                            if (parseFloat(value.target.value) >= 0) {
                                setstock(parseInt(value.target.value))
                            }
                        }} />
                    <Spacer horizontal={5} />
                    <Inventory2OutlinedIcon />
                </div>
                <Button
                    variant='outlined'
                    onClick={(value) => {
                        if (drinkname !== "") {

                            doPostRequest("drinks/add", { name: drinkname, price: price, stock: stock }).then(value => {
                                if (value.code === 200) {
                                    doGetRequest("drinks").then((value) => {
                                        if (value.code === 200) {
                                            dispatch(setDrinks(value.content))
                                            setdrinkname("")
                                            setprice(0)
                                            setstock(0)
                                        }
                                    })
                                }
                            })
                        }
                    }}
                >
                    <Add />
                </Button>
            </div>
        </Paper>
    )
}

export default AddDrink