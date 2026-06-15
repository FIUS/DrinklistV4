import {
    Favorite,
    Inventory2Outlined,
    SellOutlined
} from '@mui/icons-material'
import { Badge, ButtonBase, IconButton, Paper, Tooltip, Typography } from '@mui/material'
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
import style from './drinkButton.module.scss'

type Props = {
    drink: Drink,
    memberID: string,
    isGeneratedFavorite?: boolean,
    onPurchased?: () => void,
}

const DrinkButton = ({ drink, memberID, isGeneratedFavorite, onPurchased }: Props) => {
    const dispatch = useDispatch()
    const common: CommonReducerType = useSelector((state: RootState) => state.common)
    const isFavorite = common.favorites?.includes(drink.id) ?? false

    const purchase = () => {
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

    const toggleFavorite = () => {
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
        <Badge
            className={style.badge}
            color="error"
            badgeContent={<Favorite className={style.generatedIcon} />}
            invisible={!isGeneratedFavorite}
        >
            <Paper className={style.card} elevation={1}>
                <ButtonBase className={style.purchaseButton} onClick={purchase} focusRipple>
                    <div className={style.drinkInfo}>
                        <Typography variant="h6">{drink.name}</Typography>
                        <div className={style.facts}>
                            <span>
                                <SellOutlined fontSize="small" />
                                {drink.price.toFixed(2)} €
                            </span>
                            <span>
                                <Inventory2Outlined fontSize="small" />
                                Bestand {drink.stock}
                            </span>
                        </div>
                    </div>
                </ButtonBase>
                <Tooltip title={isFavorite ? 'Favorit entfernen' : 'Als Favorit markieren'}>
                    <IconButton
                        className={style.favoriteButton}
                        color={isFavorite ? 'error' : 'default'}
                        onClick={toggleFavorite}
                    >
                        <Favorite />
                    </IconButton>
                </Tooltip>
            </Paper>
        </Badge>
    )
}

export default DrinkButton
