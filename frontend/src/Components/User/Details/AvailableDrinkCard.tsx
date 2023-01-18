import { Button, Paper, Rating, Typography } from '@mui/material'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { openErrorToast, openToast, setDrinks, setFavorites, setHistory, setMembers } from '../../../Actions/CommonAction'
import { CommonReducerType } from '../../../Reducer/CommonReducer'
import { RootState } from '../../../Reducer/reducerCombiner'
import { Drink } from '../../../types/ResponseTypes'
import { ABGESTRICHEN } from '../../Common/Internationalization/i18n'
import Spacer from '../../Common/Spacer'
import { doGetRequest, doPostRequest, doRequest } from '../../Common/StaticFunctions'
import { format } from 'react-string-format';
import style from './availableDrinkBox.module.scss'

type Props = {
    category: string,
    drinks: Drink[] | undefined,
    memberID: string
}

const AvailableDrinkCard = (props: Props) => {
    const dispatch = useDispatch()
    const common: CommonReducerType = useSelector((state: RootState) => state.common);
    return (
        <Paper className={style.container}>
            <Typography variant='h4'>{props.category}</Typography>
            <Spacer vertical={10} />
            {props.drinks?.map(drink => {
                return <><Button variant='outlined' className={style.button}>
                    <div className={style.clickable}  onClick={(value) => {
                    doPostRequest("drinks/buy",
                        {
                            drinkID: drink.id,
                            memberID: props.memberID
                        }).then(value => {
                            if (value.code === 200) {
                                dispatch(openToast({ message: format(ABGESTRICHEN, drink.name) }))
                                doGetRequest("drinks").then((value) => {
                                    if (value.code === 200) {
                                        dispatch(setDrinks(value.content))
                                    }
                                })
                                doGetRequest("users/" + props.memberID + "/history").then((value) => {
                                    if (value.code === 200) {
                                        dispatch(setHistory(value.content))
                                    }
                                })
                                doGetRequest("users").then((value) => {
                                    if (value.code === 200) {
                                        dispatch(setMembers(value.content))
                                    }
                                })
                            } else {
                                dispatch(openErrorToast())
                            }
                        })
                }}>
                        <div>{drink.name}</div><Spacer horizontal={10} /> <div className={style.dots}>{drink.price.toFixed(2)}€</div>
                    </div>
                    <Spacer horizontal={5} />
                    <Rating
                        className={style.rating}
                        value={common.favorites?.includes(drink.id) ? 1 : 0}
                        max={1}
                        onChange={
                            (value) => {
                                let url = "add"
                                let method = "PUT"
                                if (common.favorites?.includes(drink.id)) {
                                    url = "remove"
                                    method = "DELETE"
                                }
                                doRequest(method, "users/" + props.memberID + "/favorites/" + url + "/" + drink.id, "").then(value => {
                                    if (value.code === 200) {
                                        doGetRequest("users/" + props.memberID + "/favorites").then((value) => {
                                            if (value.code === 200) {
                                                dispatch(setFavorites(value.content))
                                            }
                                        })
                                    }
                                })

                            }
                        } />
                </Button>
                <Spacer vertical={5} />
                </>
            })}
        </Paper>

    )
}

export default AvailableDrinkCard