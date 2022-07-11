import { Button } from '@mui/material'
import React from 'react'
import style from './drinkbutton.module.scss'
import Rating from '@mui/material/Rating';
import SellOutlinedIcon from '@mui/icons-material/SellOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import Spacer from '../../Common/Spacer';
import { Drink } from '../../../types/ResponseTypes';
import { doGetRequest, doPostRequest } from '../../Common/StaticFunctions';
import { setDrinks, setFavorites, setHistory, setMembers } from '../../../Actions/CommonAction';
import { RootStateOrAny, useDispatch, useSelector } from 'react-redux';
import { CommonReducerType } from '../../../Reducer/CommonReducer';

type Props = {
    drink: Drink,
    memberID: string,
    isFavorite?: boolean
}

const DrinkButton = (props: Props) => {
    const dispatch = useDispatch()
    const common: CommonReducerType = useSelector((state: RootStateOrAny) => state.common);

    return (
        <div className={style.container}>
            <Button className={style.button} variant='contained' onClick={(value) => {
                doPostRequest("drinks/buy",
                    {
                        drinkID: props.drink.id,
                        memberID: props.memberID
                    }).then(value => {
                        if (value.code === 200) {
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
                        }
                    })
            }}>
                <div className={style.innerbutton}>
                    <div>
                        {props.drink.name}
                    </div>
                    <div className={style.innerbuttonright}>
                        <SellOutlinedIcon />
                        <Spacer horizontal={5} />
                        {props.drink.price}€
                        <Spacer horizontal={15} />
                        <Inventory2OutlinedIcon />
                        <Spacer horizontal={5} />
                        {props.drink.stock}
                    </div>
                </div>
            </Button>
            <Rating
                value={common.favorites?.includes(props.drink.id) ? 1 : 0}
                max={1}
                onChange={
                    (value) => {
                        let url = "add"
                        if (common.favorites?.includes(props.drink.id)) {
                            url = "remove"
                        }
                        doPostRequest("users/" + props.memberID + "/favorites/" + url + "/" + props.drink.id, "").then(value => {
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
        </div>
    )
}

export default DrinkButton