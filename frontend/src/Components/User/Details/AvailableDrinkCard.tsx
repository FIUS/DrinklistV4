import {
    Favorite,
    Inventory2Outlined,
    SellOutlined
} from '@mui/icons-material'
import { ButtonBase, IconButton, Paper, Tooltip, Typography } from '@mui/material'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { format } from 'react-string-format'
import {
    openErrorToast,
    openToast,
    setDrinks,
    setFavorites,
    setHistory,
    setMembers
} from '../../../Actions/CommonAction'
import { CommonReducerType } from '../../../Reducer/CommonReducer'
import { RootState } from '../../../Reducer/reducerCombiner'
import { Drink } from '../../../types/ResponseTypes'
import { ABGESTRICHEN } from '../../Common/Internationalization/i18n'
import { doGetRequest, doPostRequest, doRequest } from '../../Common/StaticFunctions'
import style from './availableDrinkBox.module.scss'

type Props = {
    category: string,
    drinks: Drink[] | undefined,
    memberID: string,
    onPurchased?: () => void
}

const AvailableDrinkCard = ({ category, drinks = [], memberID, onPurchased }: Props) => {
    const dispatch = useDispatch()
    const common: CommonReducerType = useSelector((state: RootState) => state.common)

    const purchase = (drink: Drink) => {
        doPostRequest('drinks/buy', {
            drinkID: drink.id,
            memberID
        }).then((value) => {
            if (value.code !== 200) {
                dispatch(openErrorToast())
                return
            }

            dispatch(openToast({ message: format(ABGESTRICHEN, drink.name) }))
            doGetRequest('drinks').then((response) => {
                if (response.code === 200) {
                    dispatch(setDrinks(response.content))
                }
            })
            doGetRequest(`users/${memberID}/history`).then((response) => {
                if (response.code === 200) {
                    dispatch(setHistory(response.content))
                }
            })
            doGetRequest('users').then((response) => {
                if (response.code === 200) {
                    dispatch(setMembers(response.content))
                }
            })
            onPurchased?.()
        })
    }

    const toggleFavorite = (drink: Drink) => {
        const isFavorite = common.favorites?.includes(drink.id) ?? false
        const action = isFavorite ? 'remove' : 'add'
        const method = isFavorite ? 'DELETE' : 'PUT'

        doRequest(method, `users/${memberID}/favorites/${action}/${drink.id}`, '').then((value) => {
            if (value.code === 200) {
                doGetRequest(`users/${memberID}/favorites`).then((response) => {
                    if (response.code === 200) {
                        dispatch(setFavorites(response.content))
                    }
                })
            }
        })
    }

    return (
        <Paper className={style.container} elevation={1}>
            <div className={style.heading}>
                <Typography variant="h5">{category}</Typography>
                <Typography variant="caption" color="text.secondary">
                    {drinks.length} {drinks.length === 1 ? 'Getränk' : 'Getränke'}
                </Typography>
            </div>
            <div className={style.list}>
                {drinks.map((drink) => {
                    const isFavorite = common.favorites?.includes(drink.id) ?? false
                    return (
                        <div className={style.row} key={drink.id}>
                            <ButtonBase className={style.purchaseButton} onClick={() => purchase(drink)} focusRipple>
                                <div className={style.drinkName}>
                                    <Typography variant="body1" fontWeight={600}>{drink.name}</Typography>
                                    <span>
                                        <Inventory2Outlined fontSize="small" />
                                        Bestand {drink.stock}
                                    </span>
                                </div>
                                <span className={style.price}>
                                    <SellOutlined fontSize="small" />
                                    {drink.price.toFixed(2)} €
                                </span>
                            </ButtonBase>
                            <Tooltip title={isFavorite ? 'Favorit entfernen' : 'Als Favorit markieren'}>
                                <IconButton
                                    className={style.favoriteButton}
                                    color={isFavorite ? 'error' : 'default'}
                                    onClick={() => toggleFavorite(drink)}
                                >
                                    <Favorite />
                                </IconButton>
                            </Tooltip>
                        </div>
                    )
                })}
            </div>
        </Paper>
    )
}

export default AvailableDrinkCard
