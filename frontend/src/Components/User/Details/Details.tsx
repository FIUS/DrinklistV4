import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import DrinkButton from '../DrinkButton/DrinkButton'
import BalanceBox from './BalanceBox'
import style from './details.module.scss'
import NavigationButton from '../../Common/NavigationButton/NavigationButton'
import Spacer from '../../Common/Spacer'
import { RootStateOrAny, useDispatch, useSelector } from 'react-redux';
import { CommonReducerType } from '../../../Reducer/CommonReducer';
import { doGetRequest } from '../../Common/StaticFunctions';
import { setDrinkCategories, setDrinks, setFavorites, setMembers } from '../../../Actions/CommonAction';
import { useParams } from 'react-router-dom'
import { Transaction } from "../../../types/ResponseTypes"

type Props = {}

const Details = (props: Props) => {

    const params = useParams()
    const dispatch = useDispatch()
    const common: CommonReducerType = useSelector((state: RootStateOrAny) => state.common);
    const [history, sethistory] = useState<Array<Transaction>>([])

    useEffect(() => {
        if (common.drinks === null || common.members === null || common.drinkCategories === null) {
            doGetRequest("drinks").then((value) => {
                if (value.code === 200) {
                    dispatch(setDrinks(value.content))
                }
            })
            doGetRequest("drinks/categories").then((value) => {
                if (value.code === 200) {
                    dispatch(setDrinkCategories(value.content))
                }
            })
            doGetRequest("users").then((value) => {
                if (value.code === 200) {
                    dispatch(setMembers(value.content))
                }
            })
            doGetRequest("users/" + params.userid + "/favorites").then((value) => {
                if (value.code === 200) {
                    dispatch(setFavorites(value.content))
                }
            })

        }
    }, [common.drinks, common.members, common.drinkCategories, dispatch, params.userid])

    useEffect(() => {
        doGetRequest("users/" + params.userid + "/history").then((value) => {
            if (value.code === 200) {
                sethistory(value.content)
            }
        })
    }, [params.userid])


    return (
        <>
            <div className={style.details}>
                <div className={style.balanceContainer}>
                    <div className={style.balanceTop}>
                        <Typography variant='h3'>Kontostand:</Typography>
                        <Typography variant='h3'>38,15€</Typography>
                    </div>
                    <BalanceBox favorites={common.drinks?.filter((value) => {
                        return common.favorites?.includes(value.id)
                    })}
                        memberID={params.userid ? params.userid : ""} />
                </div>

                <div className={style.buyDrinkContainer}>
                    <Typography variant='h4'>Ich nehme...</Typography>
                    <TextField placeholder='Suche...' />
                    <div className={style.buyDrinkContainerInner}>
                        {common.drinkCategories?.map(category => {
                            const drinks = common.drinks?.filter(value => {
                                return value.category === category
                            })
                            return <>
                                <Typography variant='h6' style={{ width: "100%" }}>{category}</Typography>
                                {drinks?.map(value => {
                                    return <DrinkButton drink={value} memberID={params.userid ? params.userid : ""} />
                                })}
                            </>
                        })}
                    </div>
                </div>

                <div className={style.historyContainer}>
                    <Typography variant='h4'>History</Typography>

                    <TableContainer component={Paper}>
                        <Table aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Beschreibung</TableCell>
                                    <TableCell>Betrag</TableCell>
                                    <TableCell>Datum</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {history.map(value => {
                                    return <>
                                        <TableRow
                                            key={value.id}
                                        >
                                            <TableCell component="th" scope="row">
                                                {value.description}
                                            </TableCell>
                                            <TableCell>{value.amount.toFixed(2)}€</TableCell>
                                            <TableCell>{new Date(value.date).toISOString()}</TableCell>
                                        </TableRow>
                                    </>
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>


            </div>
            <Spacer vertical={50} />
            <NavigationButton destination='/' />
        </>
    )
}

export default Details