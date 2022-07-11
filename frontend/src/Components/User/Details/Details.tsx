import { Grow, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import DrinkButton from '../DrinkButton/DrinkButton'
import BalanceBox from './BalanceBox'
import style from './details.module.scss'
import NavigationButton from '../../Common/NavigationButton/NavigationButton'
import Spacer from '../../Common/Spacer'
import { RootStateOrAny, useDispatch, useSelector } from 'react-redux';
import { CommonReducerType } from '../../../Reducer/CommonReducer';
import { doGetRequest } from '../../Common/StaticFunctions';
import { setDrinkCategories, setDrinks, setFavorites, setHistory, setMembers } from '../../../Actions/CommonAction';
import { useParams } from 'react-router-dom'

type Props = {}

const Details = (props: Props) => {

    const params = useParams()
    const dispatch = useDispatch()
    const common: CommonReducerType = useSelector((state: RootStateOrAny) => state.common);
    const [searchField, setsearchField] = useState("")

    useEffect(() => {
        if (common.drinks === null || common.members === null || common.drinkCategories === null || common.history === null) {
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


        }
    }, [common.drinks, common.members, common.drinkCategories, common.history, dispatch])

    useEffect(() => {
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
        doGetRequest("users/" + params.userid + "/history").then((value) => {
            if (value.code === 200) {
                dispatch(setHistory(value.content))
            }
        })
    }, [dispatch, params.userid])


    const balancePaper = () => {
        const balance = common.members?.find((value) => {
            return value.id === parseInt(params.userid ? params.userid : "")
        })?.balance
        const balanceNotNull = balance !== undefined ? balance : 0
        if (balanceNotNull > 0) {
            return <Paper className={style.balanceTop} >
                <Typography variant='h3'>Kontostand:</Typography>
                <Typography variant='h2' color="limegreen">
                    {common.members?.find((value) => {
                        return value.id === parseInt(params.userid ? params.userid : "")
                    })?.balance.toFixed(2)}€
                </Typography>
            </Paper>
        } else {
            return <Paper className={style.balanceTop}>
                <Typography variant='h3'>Kontostand:</Typography>
                <Typography variant='h2' color="darkred">
                    {common.members?.find((value) => {
                        return value.id === parseInt(params.userid ? params.userid : "")
                    })?.balance.toFixed(2)}€
                </Typography>
            </Paper>
        }
    }


    return (
        <>
            <div className={style.details}>
                <div className={style.balanceContainer}>
                    {balancePaper()}
                    <BalanceBox favorites={common.drinks?.filter((value) => {
                        return common.favorites?.includes(value.id)
                    })}
                        memberID={params.userid ? params.userid : ""} />
                </div>

                <div className={style.buyDrinkContainer}>
                    <Typography variant='h4'>Ich nehme...</Typography>
                    <TextField placeholder='Suche...' value={searchField} onChange={(value) => setsearchField(value.target.value)} type="search" />
                    <div className={style.buyDrinkContainerInner}>
                        {common.drinkCategories?.map(category => {
                            const drinks = common.drinks?.filter(value => {
                                return value.category === category
                            })
                            if (drinks?.some((value) => searchField === "" || value.name.toLowerCase().includes(searchField.toLowerCase()))) {
                                return <>
                                    <Typography variant='h6' style={{ width: "100%" }}>{category}</Typography>
                                    {drinks?.map((value) => {
                                        return <Grow in={searchField === "" || value.name.toLowerCase().includes(searchField.toLowerCase())}><div><DrinkButton drink={value} memberID={params.userid ? params.userid : ""} /></div></Grow>
                                    })}
                                </>
                            } else {
                                return <></>
                            }
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
                                {common.history?.map(value => {
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