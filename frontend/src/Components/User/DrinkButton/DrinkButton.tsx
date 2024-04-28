import { Badge, Box, Button, Typography } from '@mui/material'
import React from 'react'
import style from './drinkbutton.module.scss'
import Rating from '@mui/material/Rating';
import SellOutlinedIcon from '@mui/icons-material/SellOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import Spacer from '../../Common/Spacer';
import { Drink } from '../../../types/ResponseTypes';
import { doGetRequest, doPostRequest, doRequest } from '../../Common/StaticFunctions';
import { openErrorToast, openToast, setDrinks, setFavorites, setHistory, setMembers } from '../../../Actions/CommonAction';
import { useDispatch, useSelector } from 'react-redux';
import { CommonReducerType } from '../../../Reducer/CommonReducer';
import { RootState } from '../../../Reducer/reducerCombiner';
import { format } from 'react-string-format';
import { ABGESTRICHEN } from '../../Common/Internationalization/i18n';
import FavoriteIcon from '@mui/icons-material/Favorite';

type Props = {
    drink: Drink,
    memberID: string,
    isGeneratedFavorite?: boolean,
}

const DrinkButton = (props: Props) => {
    const dispatch = useDispatch()
    const common: CommonReducerType = useSelector((state: RootState) => state.common);

    return (
        <Badge color="error"
            badgeContent={<FavoriteIcon className={style.favouriteIcon} />}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            sx={{
                '& .MuiBadge-badge': {
                    width: 29,
                },
            }}
            invisible={!props.isGeneratedFavorite}
        >
            <Box className={style.container} >

                <Button className={style.button} variant='contained'>
                    <div className={style.innerbutton} onClick={(value) => {
                        doPostRequest("drinks/buy",
                            {
                                drinkID: props.drink.id,
                                memberID: props.memberID
                            }).then(value => {
                                if (value.code === 200) {
                                    dispatch(openToast({ message: format(ABGESTRICHEN, props.drink.name) }))
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
                        <Typography variant='h6'>
                            {props.drink.name}
                        </Typography>
                        <div className={style.innerbuttonContainer}>
                            <div className={style.pricetag} >
                                <SellOutlinedIcon />
                                <Spacer horizontal={5} />
                                {props.drink.price.toFixed(2)}€
                            </div>
                            <div className={style.stockTag}>
                                <Inventory2OutlinedIcon />
                                <Spacer horizontal={5} />
                                {props.drink.stock}
                            </div>
                        </div>
                    </div>

                    <Rating

                        className={style.rating}
                        value={common.favorites?.includes(props.drink.id) ? 1 : 0}
                        max={1}
                        onChange={
                            (value) => {
                                let url = "add"
                                let method = "PUT"
                                if (common.favorites?.includes(props.drink.id)) {
                                    url = "remove"
                                    method = "DELETE"
                                }
                                doRequest(method, "users/" + props.memberID + "/favorites/" + url + "/" + props.drink.id, "").then(value => {
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

            </Box>
        </Badge>
    )
}

export default DrinkButton