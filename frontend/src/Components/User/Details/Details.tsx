import { Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material'
import React, { useEffect, useRef, useState } from 'react'
import BalanceBox from './BalanceBox'
import style from './details.module.scss'
import NavigationButton from '../../Common/NavigationButton/NavigationButton'
import Spacer from '../../Common/Spacer'
import { useDispatch, useSelector } from 'react-redux';
import { CommonReducerType } from '../../../Reducer/CommonReducer';
import { dateToString, doGetRequest, doPostRequest, timeToString } from '../../Common/StaticFunctions';
import { openErrorToast, openToast, setDrinkCategories, setDrinks, setFavorites, setHistory, setMembers, setRequestDialogOpen, setTransferDialogOpen } from '../../../Actions/CommonAction';
import { useNavigate, useParams } from 'react-router-dom'
import Cookies from 'js-cookie'
import { RootState } from '../../../Reducer/reducerCombiner'
import { Delete } from '@mui/icons-material'
import { BESCHREIBUNG, BETRAG, DATUM, HALLO, HISTORY, KONTOSTAND, NICHT_DEINE_TRANSAKTION, NICHT_MEHR_ABGESTRICHEN, RUECKGAENGIG, SUCHE_DOT_DOT_DOT, WENDE_DICH_AN_ADMIN_RUECKGAENGIG, ZEIGE_ALLE, ZEIGE_WENIGER, ZEITLIMIT_ABGELAUFEN } from '../../Common/Internationalization/i18n'
import { format } from 'react-string-format';
import TransferDialog from './TransferDialog'
import AvailableDrinkCard from './AvailableDrinkCard'
import { Drink, Transaction } from '../../../types/ResponseTypes'
import CountUp from 'react-countup';
import RequestDialog from './RequestDialog'
import RequestConfirmation from './RequestConfirmation'
import { convertToLocalDate } from '../../Common/StaticFunctionsTyped'

type Props = {}

const Details = (props: Props) => {

    const params = useParams()
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const common: CommonReducerType = useSelector((state: RootState) => state.common);
    const [searchField, setsearchField] = useState("")
    const [confirmationDialogOpen, setconfirmationDialogOpen] = useState(false)
    const [isUser, setisUser] = useState(false)
    const [historyExpanded, sethistoryExpanded] = useState(false)
    const historyRef = useRef<HTMLDivElement>(null)
    const unsafeCurrentMember = common.members?.find((value) => value.id === parseInt(params.userid ? params.userid : "0"))

    const mobileHistroyThreshold = 1270;

    const currentMember = unsafeCurrentMember ? unsafeCurrentMember : {
        id: 0,
        name: '',
        balance: 0,
        hidden: false,
        alias: ''
    };

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
        dispatch(setHistory([]))
        dispatch(setFavorites([]))
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

    useEffect(() => {
        const memberID = Cookies.get(window.globalTS.AUTH_COOKIE_PREFIX + "memberID");
        const notUndefined = memberID !== undefined ? parseInt(memberID) : 0;

        if (notUndefined > 2) {
            setisUser(true)
        }
    }, [])

    const getUsername = () => {
        return common.members?.find(value => value.id === parseInt(params.userid ? params.userid : "-1"))?.name
    }

    const getAlias = () => {
        let alias = common.members?.find(value => value.id === parseInt(params.userid ? params.userid : "-1"))?.alias
        if (alias === "") {
            alias = getUsername()
        }
        return alias
    }

    const balancePaper = () => {
        const balance = common.members?.find((value) => {
            return value.id === parseInt(params.userid ? params.userid : "")
        })?.balance
        const balanceNotNull = balance !== undefined ? balance : 0
        const textColor = balanceNotNull > 0 ? "limegreen" : "darkred"

        const value = common.members?.find((value) => {
            return value.id === parseInt(params.userid ? params.userid : "")
        })?.balance;

        const lastValue = common.history?.find(value => value.memberID === parseInt(params.userid ? params.userid : ""))?.amount

        const saveValue = value ? value : 0;
        const saveLastValue = lastValue ? lastValue : 0;

        return <>
            <Paper className={style.balanceTop}>
                <Typography variant='h3'>{KONTOSTAND}:</Typography>
                <Typography variant='h2' color={textColor}>
                    <CountUp start={saveValue - saveLastValue}
                        end={saveValue}
                        decimals={2}
                        duration={0.5}
                    />€
                </Typography>
            </Paper>
        </>
    }

    const extraFunctions = () => {
        return <Paper className={style.balanceTop}>
            {history}
        </Paper>
    }

    const shouldAddUndoColumn = () => {
        return common.history?.find(value => {
            return value.revertable
        }) !== undefined
    }

    const filterSeachDrinks = (drink: Drink) => {
        return searchField === "" || drink.name.toLowerCase().includes(searchField.toLowerCase())
    }

    const expandButton = <TableRow>
        <TableCell colSpan={3}>
            <Button fullWidth onClick={() => { sethistoryExpanded(!historyExpanded) }}>{historyExpanded ? ZEIGE_WENIGER : ZEIGE_ALLE}</Button>
        </TableCell>
    </TableRow>

    const dateOrRevert = (transaction: Transaction) => {
        if (transaction.revertable) {
            return <Button fullWidth onClick={() => {
                doPostRequest("transactions/" + transaction.id + "/undo", null).then((innerValue) => {
                    if (innerValue.code === 200) {
                        dispatch(openToast({ message: format(NICHT_MEHR_ABGESTRICHEN, transaction.description) }))
                        doGetRequest("users").then((t_value) => {
                            if (t_value.code === 200) {
                                dispatch(setMembers(t_value.content))
                            }
                        })
                        doGetRequest("users/" + params.userid + "/history").then((value) => {
                            if (value.code === 200) {
                                dispatch(setHistory(value.content))
                            }
                        })
                    } else if (innerValue.code === 412) {
                        if (innerValue.content === "TooLate") {
                            dispatch(openToast({
                                message: WENDE_DICH_AN_ADMIN_RUECKGAENGIG,
                                headline: ZEITLIMIT_ABGELAUFEN,
                                duration: 10000,
                                type: "error"
                            }))
                        } else if (innerValue.content === "NotYourTransaction") {
                            dispatch(openToast({
                                message: WENDE_DICH_AN_ADMIN_RUECKGAENGIG,
                                headline: NICHT_DEINE_TRANSAKTION,
                                duration: 10000,
                                type: "error"
                            }))
                        }
                    } else {
                        dispatch(openErrorToast())
                    }
                })
            }}>
                <Delete />
            </Button>
        } else {
            return format("{0} - {1}", dateToString(convertToLocalDate(transaction.date)), timeToString(convertToLocalDate(transaction.date)))
        }
    }

    const historyLegend = common.history?.slice(0, historyExpanded ? common.history.length : 6).map(value => {
        return <>
            <TableRow
                key={value.id}
            >
                <TableCell component="th" scope="row">
                    {value.description}
                </TableCell>
                <TableCell>{value.amount.toFixed(2)}€</TableCell>
                <TableCell>
                    {dateOrRevert(value)}
                </TableCell>
            </TableRow>
        </>
    })

    const getHistoryLegend = () => {
        const notUndefined = historyLegend ? historyLegend : []
        const temp = [...notUndefined]
        temp.splice(6, 0, expandButton)
        return temp
    }

    const history = <div className={style.historyContainer} ref={historyRef}>
        <Typography variant='h5'>{HISTORY}:</Typography>

        <TableContainer component={Paper}>
            <Table aria-label="simple table" size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>{BESCHREIBUNG}</TableCell>
                        <TableCell>{BETRAG}</TableCell>
                        <TableCell>{DATUM + (shouldAddUndoColumn() ? " / " + RUECKGAENGIG : "")}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {getHistoryLegend()}
                </TableBody>
            </Table>
        </TableContainer>
    </div >

    const checkUser = () => {
        return parseInt(Cookies.get(window.globalTS.AUTH_COOKIE_PREFIX + "memberID") as string)
    }

    return (
        <>
            <TransferDialog
                isOpen={common.transferDialogOpen}
                close={() => dispatch(setTransferDialogOpen(false))}
                member={currentMember}
            />
            <RequestDialog
                isOpen={common.requestDialogOpen}
                close={() => dispatch(setRequestDialogOpen(false))}
                showConfirmation={() => {
                    setconfirmationDialogOpen(true);
                }}
                member={currentMember}
                isGroup={true}
            />
            <RequestConfirmation
                isOpen={confirmationDialogOpen}
                close={() => setconfirmationDialogOpen(false)}

            />
            <div className={style.details} onKeyUp={(event) => {
                if (event.key === "Escape") {
                    navigate(checkUser() !== 1 && checkUser() !== 2 ? "/user/" + checkUser() : "/")
                }
            }}>
                <div className={style.balanceContainer}>
                    {balancePaper()}
                    {window.innerWidth > mobileHistroyThreshold ? extraFunctions() : <></>}
                </div>

                <div className={style.buyDrinkContainer}>
                    <Typography variant='h4'><>{HALLO} <b>{getAlias()}</b>!</></Typography>
                    <TextField
                        placeholder={SUCHE_DOT_DOT_DOT}
                        value={searchField}
                        onChange={(value) => setsearchField(value.target.value)}
                        type="search"
                        autoFocus
                    />
                    <BalanceBox favorites={common.drinks?.filter((value) => {
                        return common.favorites?.includes(value.id)
                    })}
                        memberID={params.userid ? params.userid : ""} />
                    <div className={style.buyDrinkContainerInner}>
                        {common.drinkCategories?.sort((category1, category2) => category1.localeCompare(category2)).map(category => {
                            const drinks = common.drinks?.sort((drink1, drink2) => drink1.name.localeCompare(drink2.name)).filter(value => {
                                return value.category === category
                            })
                            if (drinks?.some((value) => filterSeachDrinks(value))) {
                                return <>
                                    <AvailableDrinkCard category={category} drinks={drinks.filter((value) => filterSeachDrinks(value))} memberID={params.userid ? params.userid : ""} />
                                </>
                            } else {
                                return <></>
                            }
                        })}
                    </div>
                </div>
                {window.innerWidth <= mobileHistroyThreshold ? extraFunctions() : <></>}
            </div>
            <Spacer vertical={50} />
            {!isUser ? <NavigationButton destination='/' /> : <></>}
        </>
    )
}

export default Details