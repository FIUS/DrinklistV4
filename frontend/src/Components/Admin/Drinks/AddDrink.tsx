import { Autocomplete, Button, Paper, TextField } from '@mui/material'
import React, { useEffect, useState } from 'react';
import style from './drinks.module.scss';
import SellOutlinedIcon from '@mui/icons-material/SellOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import Spacer from '../../Common/Spacer';
import { Add } from '@mui/icons-material';
import { doGetRequest, doPostRequest } from '../../Common/StaticFunctions';
import { useDispatch } from 'react-redux';
import { openErrorToast, openToast, setDrinkCategories, setDrinks } from '../../../Actions/CommonAction';
import { FLASCHENZAHL, GETRAENKENAME, GETRAENK_HINZUGEFUEGT, KATEGORIE, PREIS_IN_EURO } from '../../Common/Internationalization/i18n';

type Props = {}

const AddDrink = (props: Props) => {
    const [isHovered, setisHovered] = useState(false)
    const [drinkname, setdrinkname] = useState("")
    const [categoryname, setcategoryname] = useState("")
    const [price, setprice] = useState(0.0)
    const [stock, setstock] = useState(0)
    const [categoryAutofill, setcategoryAutofill] = useState([])
    const dispatch = useDispatch()

    useEffect(() => {
        doGetRequest("drinks/categories").then(value => {
            if (value.code === 200) {
                setcategoryAutofill(value.content)
            }
        })
    }, [])


    return (
        <Paper
            className={style.addDrinkPaper}
            onMouseEnter={() => setisHovered(true)}
            onMouseLeave={() => setisHovered(false)}
            elevation={isHovered ? 5 : 3}
        >
            <TextField
                label={GETRAENKENAME}
                variant='standard'
                style={{ height: "50px" }}
                value={drinkname}
                onChange={(value) => {
                    setdrinkname(value.target.value)
                }} />
            <Spacer vertical={20} />
            <Autocomplete
                freeSolo
                options={categoryAutofill}
                value={categoryname}
                onChange={(event, value) => { setcategoryname(value !== null ? value : "") }}
                renderInput={(params) =>
                    <TextField {...params}
                        label={KATEGORIE}
                        variant='standard'
                        onChange={(value) => { setcategoryname(value.target.value) }}
                    />
                }
            />

            <Spacer vertical={20} />
            <div className={style.buttonsContainer} >
                <div className={style.smallTextFieldContainer}>
                    <TextField
                        className={style.smallTextField}
                        placeholder={PREIS_IN_EURO}
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
                        placeholder={FLASCHENZAHL}
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
                            let requestBody = null;
                            if (categoryname !== "") {
                                requestBody = { name: drinkname, price: price, stock: stock, category: categoryname }
                            } else {
                                requestBody = { name: drinkname, price: price, stock: stock }
                            }
                            doPostRequest("drinks/add", requestBody).then(value => {
                                if (value.code === 200) {
                                    dispatch(openToast({ message: GETRAENK_HINZUGEFUEGT }))
                                    doGetRequest("drinks").then((value) => {
                                        if (value.code === 200) {
                                            dispatch(setDrinks(value.content))
                                            setdrinkname("")
                                            setprice(0)
                                            setstock(0)
                                        }
                                    })
                                    doGetRequest("drinks/categories").then((value) => {
                                        if (value.code === 200) {
                                            dispatch(setDrinkCategories(value.content))
                                        }
                                    })
                                } else {
                                    dispatch(openErrorToast())
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