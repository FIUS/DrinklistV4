import { Button, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import SportsBarIcon from '@mui/icons-material/SportsBar';
import PersonIcon from '@mui/icons-material/Person';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { Settings } from '@mui/icons-material';
import style from './overview.module.scss'
import { useNavigate } from 'react-router-dom';
import Spacer from '../../Common/Spacer';
import StatisticBox from '../../Common/InfoBox/StatisticBox';
import { useDispatch, useSelector } from 'react-redux';
import { CommonReducerType } from '../../../Reducer/CommonReducer';
import { Money, Person, VisibilityOff } from '@mui/icons-material';
import { setDrinkCategories, setDrinks, setMembers } from '../../../Actions/CommonAction';
import { dateToString, doGetRequest } from '../../Common/StaticFunctions';
import Infobox from '../../Common/InfoBox/Infobox';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from 'recharts';
import TopDepter from '../Common/TopDepter/TopDepter';
import { RootState } from '../../../Reducer/reducerCombiner';
import { BENUTZER_ZAHL, BUDGET, EINSTELLUNGEN, GELD_VERTEILUNG, GETRAENKE, LETZE_100_KAEUFE, MITGLIEDER, TRANSAKTIONEN, VERSTECKTE_NUTZER } from '../../Common/Internationalization/i18n';
import { Transaction } from '../../../types/ResponseTypes';


type Props = {}

const Overview = (props: Props) => {
    const navigate = useNavigate();
    const [transactions, settransactions] = useState<Array<Transaction>>([])
    const headingType = "h6"
    const buttonSize = { width: 50, height: 50 }
    const dispatch = useDispatch();

    const common: CommonReducerType = useSelector((state: RootState) => state.common);

    useEffect(() => {
        doGetRequest("transactions/limit/100").then((value) => {
            if (value.code === 200) {
                settransactions(value.content)
            }
        })
    }, [])

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
            doGetRequest("transactions/limit/100").then((value) => {
                if (value.code === 200) {
                    settransactions(value.content)
                }
            })
        }
    }, [common.drinks, common.members, common.drinkCategories, dispatch])

    const calcBudget = () => {
        let budget = 0
        common.members?.forEach(member => budget += member.balance)
        return budget
    }

    const calcHiddenUsers = () => {
        let amount = 0
        common.members?.forEach(member => amount += member.hidden ? 1 : 0)
        return amount
    }

    const getDiagramData = () => {
        const sortedTransactions = transactions.sort((value1, value2) => new Date(value2.date).valueOf() - new Date(value1.date).valueOf())
        const output = new Map<string, { date: Date, number: number }>()

        sortedTransactions.forEach(value => {
            const dateString = dateToString(new Date(value.date))
            const currentValue = output.get(dateString)
            output.set(dateString, currentValue !== undefined ? { date: new Date(value.date), number: currentValue.number + 1 } : { date: new Date(value.date), number: 1 })
        })

        const dataList: Array<{ date: Date, "Anzahl Transaktionen": number }> = []
        output.forEach((value, key) => dataList.push({ date: value.date, "Anzahl Transaktionen": value.number }))

        const sortedList = dataList.sort((value1, value2) => {
            const a = new Date(value1.date).valueOf();
            const b = new Date(value2.date).valueOf();
            return a - b;
        }).map((value) => {
            return { date: dateToString(value.date), "Anzahl Transaktionen": value['Anzahl Transaktionen'] }
        })
        return sortedList
    }

    return (
        <>
            <div className={style.overview}>
                <StatisticBox
                    headline={BUDGET}
                    text={calcBudget().toFixed(2) + "€"}
                    icon={<Money />}
                    colorCode={window.globalTS.ICON_COLOR} />
                <StatisticBox
                    headline={BENUTZER_ZAHL}
                    text={common.members ? common.members.length.toString() : "0"}
                    icon={<Person />}
                    colorCode={window.globalTS.ICON_COLOR} />
                <StatisticBox
                    headline={VERSTECKTE_NUTZER}
                    text={calcHiddenUsers().toString()}
                    icon={< VisibilityOff />}
                    colorCode={window.globalTS.ICON_COLOR} />
                <TopDepter members={common.members} />
                <Infobox headline={GELD_VERTEILUNG} >
                    <AreaChart width={window.innerWidth / 3} height={200} data={common.members?.sort(
                        (m1, m2) => m1.balance - m2.balance).map(
                            (value) => {
                                return {
                                    Guthaben: value.balance
                                }
                            }
                        )
                    }>
                        <CartesianGrid strokeDasharray="3 3" />
                        <YAxis unit="€" />
                        <Tooltip contentStyle={{ color: "black" }} />
                        <Legend />
                        <Area type="monotone" dataKey="Guthaben" stroke={window.globalTS.ICON_COLOR} fillOpacity={0.5} fill={window.globalTS.ICON_COLOR} />
                    </AreaChart >
                </Infobox>
                <Infobox headline={LETZE_100_KAEUFE} >
                    <BarChart width={window.innerWidth / 3} height={200} data={getDiagramData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <YAxis dataKey="Anzahl Transaktionen" />
                        <XAxis dataKey="date" />
                        <Tooltip contentStyle={{ color: "black" }} />
                        <Legend />
                        <Bar dataKey="Anzahl Transaktionen" fill={window.globalTS.ICON_COLOR} />
                    </BarChart >
                </Infobox>
            </div>
            <div className={style.overview}>
                <Button
                    size="large"
                    className={style.button}
                    variant='contained'
                    onClick={() => navigate("drinks")}
                >
                    <SportsBarIcon sx={buttonSize} />
                    <Spacer horizontal={10} />
                    <Typography variant={headingType}>{GETRAENKE}</Typography>

                </Button>
                <Button
                    size="large"
                    className={style.button}
                    variant='contained'
                    onClick={() => navigate("members")}
                >
                    <PersonIcon sx={buttonSize} />
                    <Spacer horizontal={10} />
                    <Typography variant={headingType}>{MITGLIEDER}</Typography>
                </Button>
                <Button
                    size="large"
                    className={style.button}
                    variant='contained'
                    onClick={() => navigate("transactions")}
                >
                    <ReceiptLongIcon sx={buttonSize} />
                    <Spacer horizontal={10} />
                    <Typography variant={headingType}>{TRANSAKTIONEN}</Typography>
                </Button>
                <Button
                    size="large"
                    className={style.button}
                    variant='contained'
                    onClick={() => navigate("settings")}
                >
                    <Settings sx={buttonSize} />
                    <Spacer horizontal={10} />
                    <Typography variant={headingType}>{EINSTELLUNGEN}</Typography>
                </Button>
            </div>
        </>
    )
}

export default Overview