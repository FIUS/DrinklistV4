import { Stack, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import StatisticBox from '../../Common/InfoBox/StatisticBox'
import { BENUTZER_ZAHL, BUDGET, GELD_VERTEILUNG, LETZE_100_KAEUFE, MITGLIEDER, TOP_10_GETRAENKE, UMSATZ, UMSATZ_NACH_WOCHENTAG, VERSTECKTE_NUTZER } from '../../Common/Internationalization/i18n'
import { Money, Person, VisibilityOff } from '@mui/icons-material'
import TopDepter from '../Common/TopDepter/TopDepter'
import { CommonReducerType } from '../../../Reducer/CommonReducer'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../../Reducer/reducerCombiner'
import { dateToString, doGetRequest } from '../../Common/StaticFunctions'
import { setMembers } from '../../../Actions/CommonAction'
import { Transaction } from '../../../types/ResponseTypes'
import style from './statistics.module.scss';
import Infobox from '../../Common/InfoBox/Infobox'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

type Props = {}

const Statistics = (props: Props) => {


    const common: CommonReducerType = useSelector((state: RootState) => state.common);
    const dispatch = useDispatch()
    const [transactions, settransactions] = useState<Array<Transaction>>([])

    useEffect(() => {
        doGetRequest("users").then((value) => {
            if (value.code === 200) {
                dispatch(setMembers(value.content))
            }
        })
    }, [dispatch])

    useEffect(() => {
        doGetRequest("transactions/limit/" + window.globalTS.TRANSACTION_LIMIT).then((value) => {
            if (value.code === 200) {
                settransactions(value.content)
            }
        })
    }, [])

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

    const getTransactionHistoryDiagramData = () => {
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

    //Calculate the sales volume per week day
    const getTransactionHistoryDiagramDataWeekday = () => {
        //Get the weekday for each transaction and map it to the amount
        const output: Array<{ day: string, total: number, amount: number, avg: number }> = [
            { day: "Sonntag", total: 0, amount: 0, avg: 0 },
            { day: "Montag", total: 0, amount: 0, avg: 0 },
            { day: "Dienstag", total: 0, amount: 0, avg: 0 },
            { day: "Mittwoch", total: 0, amount: 0, avg: 0 },
            { day: "Donnerstag", total: 0, amount: 0, avg: 0 },
            { day: "Freitag", total: 0, amount: 0, avg: 0 },
            { day: "Samstag", total: 0, amount: 0, avg: 0 }
        ]

        transactions.forEach(value => {
            if (value.description.includes("Checkout") || value.description.includes("Deposit") || value.description.includes("Transfer")) { return }
            if (value.amount > 0) { return }

            const weekdayNumber = new Date(value.date).getDay()

            //Add the amount to the corresponding weekday
            output[weekdayNumber].total += Math.abs(value.amount)
            output[weekdayNumber].amount += 1
        })

        //Round the amount to two decimal places
        output.forEach(value => {
            value.total = Math.round(value.total * 100) / 100
        })

        //Calculate the average amount per transaction
        output.forEach(value => {
            if (value.amount === 0) {
                value.avg = 0
            } else {
                value.avg = Math.round((value.total / value.amount) * 100) / 100
            }
        })

        return [output[1], output[2], output[3], output[4], output[5], output[6], output[0]]

    }

    const getMostBoughtDrinks = () => {
        const output = new Map<string, number>()

        transactions.forEach(value => {
            if (value.description.includes("Checkout") || value.description.includes("Deposit") || value.description.includes("Transfer")) { return }
            if (value.amount > 0) { return }

            const drinkName = value.description
            const currentValue = output.get(drinkName)
            output.set(drinkName, currentValue !== undefined ? currentValue + 1 : 1)
        })

        const dataList: Array<{ name: string, "Anzahl Transaktionen": number }> = []
        output.forEach((value, key) => dataList.push({ name: key, "Anzahl Transaktionen": value }))

        const sortedList = dataList.sort((value1, value2) => {
            return value1["Anzahl Transaktionen"] - value2["Anzahl Transaktionen"]
        }).slice(0, 10)
        return sortedList
    }

    return (
        <Stack className={style.container}>
            <Typography variant="h4">{MITGLIEDER}</Typography>
            <Stack direction="row" spacing={2} flexWrap={"wrap"}>
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
            </Stack>
            <Typography variant="h4">{UMSATZ}</Typography>
            <Stack direction="row" spacing={2} flexWrap={"wrap"}>
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
                    <BarChart width={window.innerWidth / 3} height={200} data={getTransactionHistoryDiagramData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <YAxis dataKey="Anzahl Transaktionen" />
                        <XAxis dataKey="date" />
                        <Tooltip contentStyle={{ color: "black" }} />
                        <Legend />
                        <Bar dataKey="Anzahl Transaktionen" fill={window.globalTS.ICON_COLOR} />
                    </BarChart >
                </Infobox>
                <Infobox headline={UMSATZ_NACH_WOCHENTAG} >
                    <AreaChart width={window.innerWidth / 3} height={200} data={getTransactionHistoryDiagramDataWeekday()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <YAxis unit="€" yAxisId={"left"} />
                        <YAxis unit="€" yAxisId={"right"} orientation="right" />
                        <XAxis dataKey="day" />
                        <Tooltip contentStyle={{ color: "black" }} />
                        <Legend />
                        <Area type="monotone" yAxisId="right" dataKey="avg" name='Durchschnittliche Getränkekosten' stroke={window.globalTS.ICON_COLOR_SECONDARY} fillOpacity={0.5} fill={window.globalTS.ICON_COLOR_SECONDARY} />
                        <Area type="monotone" yAxisId="left" dataKey="amount" name='Umsatz' stroke={window.globalTS.ICON_COLOR} fillOpacity={0.5} fill={window.globalTS.ICON_COLOR} />
                    </AreaChart >
                </Infobox>
                <Infobox headline={TOP_10_GETRAENKE} width={window.innerWidth / 3 + "px"}>
                    <ResponsiveContainer width="95%" height={400}>
                        <BarChart width={window.innerWidth / 3} height={200} data={getMostBoughtDrinks()} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" />
                            <YAxis dataKey="name" type="category" reversed />
                            <XAxis dataKey="Anzahl Transaktionen" />
                            <Tooltip contentStyle={{ color: "black" }} />
                            <Legend />
                            <Bar dataKey="Anzahl Transaktionen" fill={window.globalTS.ICON_COLOR} />
                        </BarChart >
                    </ResponsiveContainer>
                </Infobox>

            </Stack>
        </Stack>
    )
}

export default Statistics