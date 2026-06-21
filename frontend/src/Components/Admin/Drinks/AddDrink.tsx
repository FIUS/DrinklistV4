import {
    Add,
    Category,
    Inventory2Outlined,
    LocalBar,
    SellOutlined
} from '@mui/icons-material'
import { Autocomplete, Avatar, Button, Paper, TextField, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { openErrorToast, openToast, setDrinkCategories, setDrinks } from '../../../Actions/CommonAction'
import {
    FLASCHENZAHL,
    GETRAENKENAME,
    GETRAENK_HINZUGEFUEGT,
    KATEGORIE,
    PREIS_IN_EURO
} from '../../Common/Internationalization/i18n'
import { doGetRequest, doRequest } from '../../Common/StaticFunctions'
import { parseMoneyInputToCents } from '../../Common/StaticFunctionsTyped'
import style from './drinks.module.scss'

const AddDrink = () => {
    const [drinkName, setDrinkName] = useState('')
    const [categoryName, setCategoryName] = useState('')
    const [price, setPrice] = useState(0)
    const [priceInput, setPriceInput] = useState('')
    const [stock, setStock] = useState(0)
    const [categoryAutofill, setCategoryAutofill] = useState<Array<string>>([])
    const dispatch = useDispatch()

    useEffect(() => {
        doGetRequest('drinks/categories').then((value) => {
            if (value.code === 200) {
                setCategoryAutofill(value.content)
            }
        })
    }, [])

    const addDrink = () => {
        if (drinkName.trim() === '') {
            dispatch(openToast({ message: 'Bitte Name eintragen', type: 'error' }))
            return
        }

        const requestBody = {
            name: drinkName.trim(),
            price,
            stock,
            ...(categoryName.trim() ? { category: categoryName.trim() } : {})
        }

        doRequest('PUT', 'drinks/add', requestBody).then((value) => {
            if (value.code === 200) {
                dispatch(openToast({ message: GETRAENK_HINZUGEFUEGT }))
                doGetRequest('drinks').then((drinksValue) => {
                    if (drinksValue.code === 200) {
                        dispatch(setDrinks(drinksValue.content))
                        setDrinkName('')
                        setCategoryName('')
                        setPrice(0)
                        setPriceInput('')
                        setStock(0)
                    }
                })
                doGetRequest('drinks/categories').then((categoriesValue) => {
                    if (categoriesValue.code === 200) {
                        dispatch(setDrinkCategories(categoriesValue.content))
                        setCategoryAutofill(categoriesValue.content)
                    }
                })
            } else {
                dispatch(openErrorToast())
            }
        })
    }

    return (
        <Paper className={style.addDrinkCard} elevation={1}>
            <div className={style.addDrinkHeading}>
                <Avatar sx={{ bgcolor: window.globalTS.ICON_COLOR }}><LocalBar /></Avatar>
                <div>
                    <Typography variant="h6">Neues Getränk</Typography>
                    <Typography variant="body2" color="text.secondary">Alle Angaben können später geändert werden.</Typography>
                </div>
            </div>
            <div className={style.addDrinkForm}>
                <TextField
                    label={GETRAENKENAME}
                    value={drinkName}
                    onChange={(event) => setDrinkName(event.target.value)}
                    size="small"
                    InputProps={{ startAdornment: <LocalBar className={style.fieldIcon} fontSize="small" /> }}
                />
                <Autocomplete
                    freeSolo
                    options={categoryAutofill}
                    value={categoryName}
                    onChange={(_, value) => setCategoryName(value ?? '')}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label={KATEGORIE}
                            size="small"
                            onChange={(event) => setCategoryName(event.target.value)}
                            InputProps={{
                                ...params.InputProps,
                                startAdornment: (
                                    <>
                                        <Category className={style.fieldIcon} fontSize="small" />
                                        {params.InputProps.startAdornment}
                                    </>
                                )
                            }}
                        />
                    )}
                />
                <TextField
                    label={PREIS_IN_EURO}
                    type="number"
                    value={priceInput}
                    onChange={(event) => {
                        setPriceInput(event.target.value)
                        setPrice(Math.max(0, parseMoneyInputToCents(event.target.value)))
                    }}
                    size="small"
                    inputProps={{ min: 0, step: 0.01 }}
                    InputProps={{ startAdornment: <SellOutlined className={style.fieldIcon} fontSize="small" /> }}
                />
                <TextField
                    label={FLASCHENZAHL}
                    type="number"
                    value={stock}
                    onChange={(event) => setStock(Math.max(0, Number(event.target.value)))}
                    size="small"
                    inputProps={{ min: 0, step: 1 }}
                    InputProps={{ startAdornment: <Inventory2Outlined className={style.fieldIcon} fontSize="small" /> }}
                />
                <Button
                    className={style.addDrinkButton}
                    variant="contained"
                    startIcon={<Add />}
                    onClick={addDrink}
                    disabled={drinkName.trim() === ''}
                >
                    Hinzufügen
                </Button>
            </div>
        </Paper>
    )
}

export default AddDrink
