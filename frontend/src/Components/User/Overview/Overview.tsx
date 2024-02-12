import { Box, Fab, FormControl, Grow, Slide, TextField, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import UserButton from '../UserButton/UserButton'
import style from './overview.module.scss'
import { useDispatch, useSelector } from 'react-redux';
import { CommonReducerType } from '../../../Reducer/CommonReducer';
import { datetimeToString, doGetRequest } from '../../Common/StaticFunctions';
import { setDrinkCategories, setDrinks, setMembers } from '../../../Actions/CommonAction';
import { RootState } from '../../../Reducer/reducerCombiner';
import { NAME, WER_BIST_DU } from '../../Common/Internationalization/i18n';
import { Member, Transaction } from '../../../types/ResponseTypes';
import HistoryIcon from '@mui/icons-material/History';
import Spacer from '../../Common/Spacer';
import { useNavigate } from 'react-router-dom';

type Props = {}

const Overview = (props: Props) => {
    const dispatch = useDispatch()
    const common: CommonReducerType = useSelector((state: RootState) => state.common);
    const [searchfield, setsearchfield] = useState("")
    const anchor = React.useRef(null);
    const [history, sethistory] = useState<Array<Transaction> | null>(null)
    const navigate = useNavigate()
    
    const memberHistoryName = () => {
        const member = common.members?.find((member) => historyItemToDisplay?.memberID === member.id)
        if (member?.alias !== "") {
            return member?.alias
        }
        else return member.name
    }

    const [historyState, sethistoryState] = useState(0)
    const historyItemToDisplay = history?.at(Math.floor(historyState / 3))

    useEffect(() => {

        setTimeout(() => {
            sethistoryState((historyState + 1) % 9)
        }, (historyState % 3 === 1) ? 10000 : 200);

    }, [historyState])

    useEffect(() => {
        doGetRequest("transactions/limit/10").then((value) => {
            if (value.code === 200) {
                const transactions: Array<Transaction> = value.content;
                const filteredTransactions = transactions.filter((transaction) => {
                    let nameMatches = false;
                    common.drinks?.forEach((drink) => {
                        if (transaction.description.toLocaleLowerCase().includes(drink.name.toLocaleLowerCase())) {
                            nameMatches = true;
                        }
                    })
                    return nameMatches;
                })
                sethistory(filteredTransactions)
            }
        })
    }, [common.drinks])


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
        }
    }, [common.drinks, common.members, common.drinkCategories, dispatch])

    const userVisible = (member: Member) => {
        return (searchfield === "" ||
            member.name.toLowerCase().includes(searchfield.toLowerCase()) ||
            member.alias.toLowerCase().includes(searchfield.toLowerCase())) && !member.hidden
    }

    const exactSearchMatch = (member: Member) => {
        return (member.name.toLowerCase() === (searchfield.toLowerCase()) ||
            member.alias.toLowerCase() === (searchfield.toLowerCase())) && searchfield !== ""
    }

    const historyBox = () => {
        if (history !== null && window.innerWidth > window.globalTS.MOBILE_THRESHOLD && history.length > 2) {
            return <Box sx={{ position: 'fixed', bottom: '10px', left: '10px' }}>
                <Fab variant="extended"
                    size="medium"
                    color="default"
                    ref={anchor}
                    className={style.historyContainer}
                >
                    <HistoryIcon />
                    <Spacer horizontal={10} />

                    <Slide in={(historyState % 3) === 1}
                        container={anchor.current}
                        direction={(historyState % 3) < 2 ? "down" : "up"}
                        timeout={200}>
                        <Typography>
                            {memberHistoryName() + " - " + historyItemToDisplay?.description + " - " + datetimeToString(historyItemToDisplay?.date)}
                        </Typography>
                    </Slide>
                </Fab>


            </Box>
        } else {
            return <></>
        }
    }

    const redirectToUser = () => {
        const visibleUsers = common.members?.filter(value => {
            if (!value.hidden && (exactSearchMatch(value) || userVisible(value))) {
                console.log(value.name + " " + !value.hidden + " " + exactSearchMatch(value))
                return true
            }
            return false
        })
        if (visibleUsers?.length === 1) {
            navigate("/user/" + visibleUsers[0].id)
        }
    }

    return (
        <>
            <div className={style.outterContainer}>
                <div className={style.headline}>
                    <Typography variant='h4'>{WER_BIST_DU}</Typography>
                </div>
                <form className={style.textfieldForm} noValidate autoComplete="off" onSubmit={(event) => { event.preventDefault(); redirectToUser() }}>
                    <FormControl className={style.form}>
                        <TextField
                            className={style.input}
                            placeholder={NAME}
                            type="search"
                            value={searchfield}
                            autoFocus
                            fullWidth
                            onChange={
                                (value) => { setsearchfield(value.target.value) }
                            }
                        />
                    </FormControl>
                </form>
                <div className={style.buttonArea}>
                    {common.members?.sort((value1, value2) => {
                        const name1 = value1.alias !== "" ? value1.alias : value1.name
                        const name2 = value2.alias !== "" ? value2.alias : value2.name
                        return name1.localeCompare(name2)
                    }
                    )?.map(value => {
                        if (!value.hidden || (exactSearchMatch(value))) {
                            return <Grow in={userVisible(value) || exactSearchMatch(value)} key={value.id} unmountOnExit>
                                <div style={{ width: "100%" }}>
                                    <UserButton key={value.id} name={value.alias === "" ? value.name : value.alias} id={value.id} />
                                </div>
                            </Grow>
                        }
                        return <></>
                    })}
                </div>

            </div >
            {historyBox()}
        </>
    )
}

export default Overview
//