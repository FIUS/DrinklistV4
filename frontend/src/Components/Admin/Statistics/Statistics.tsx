import { Button, Slider, Stack, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import StatisticBox from '../../Common/InfoBox/StatisticBox'
import { BENUTZER_ZAHL, BUDGET, GELD_VERTEILUNG, GESAMT_UMSATZ_GETRAENKE, LETZTE_KAEUFE, MITGLIEDER, TOP_10_GETRAENKE, UMSATZ, UMSATZ_NACH_WOCHENTAG, VERSTECKTE_NUTZER } from '../../Common/Internationalization/i18n'
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
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';

type Props = {}

const Statistics = (props: Props) => {

    const common: CommonReducerType = useSelector((state: RootState) => state.common);
    const dispatch = useDispatch()
    const [transactions, settransactions] = useState<Array<Transaction>>([])
    const [dateRange, setdateRange] = useState([70, 100])
    const [isRunning, setisRunning] = useState(false)

    useEffect(() => {
        doGetRequest("users").then((value) => {
            if (value.code === 200) {
                dispatch(setMembers(value.content))
            }
        })
    }, [dispatch])

    useEffect(() => {
        doGetRequest("transactions/limit/10000").then((value) => {
            if (value.code === 200) {
                const t = (value.content as Array<Transaction>);
                settransactions(t.reverse())
            }
        })
    }, [dispatch])

    useEffect(() => {
        if (isRunning) {
            const interval = setInterval(() => {
                const toSet = [Math.min(dateRange[0] + 1, 99), Math.min(dateRange[1] + 1, 100)]
                if (toSet[0] === 99 && toSet[1] === 100) {
                    setisRunning(false)
                }
                setdateRange(toSet)
            }, 1000)
            return () => clearInterval(interval)
        }
    }, [isRunning, dateRange])

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
    //get the upper and lower bound of the date range
    const transactionsIndices = (): Array<number> => {
        if (transactions.length === 0) { return [0, 0] }
        const percent = (transactions.length - 1) / 100

        const lowerBound = Math.floor(dateRange[0] * percent)
        const upperBound = Math.ceil(dateRange[1] * percent)
        return [lowerBound, upperBound]
    }

    const indices = transactionsIndices()

    const getTransactionHistoryDiagramData = () => {
        const sortedTransactions = transactions.slice(indices[0], indices[1]).toSorted((value1, value2) => new Date(value2.date).valueOf() - new Date(value1.date).valueOf())
        const output = new Map<string, { date: Date, number: number }>()

        sortedTransactions.forEach(value => {
            const dateString = dateToString(new Date(value.date))
            const currentValue = output.get(dateString)
            output.set(dateString, currentValue !== undefined ? { date: new Date(value.date), number: currentValue.number + 1 } : { date: new Date(value.date), number: 1 })
        })

        const dataList: Array<{ date: Date, "Anzahl Transaktionen": number }> = []
        output.forEach((value, _) => dataList.push({ date: value.date, "Anzahl Transaktionen": value.number }))

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

        transactions.slice(indices[0], indices[1]).forEach(value => {
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

        transactions.slice(indices[0], indices[1]).forEach(value => {
            if (value.description.includes("Checkout") || value.description.includes("Deposit") || value.description.includes("Transfer")) { return }
            if (value.amount > 0) { return }

            const drinkName = value.description
            const currentValue = output.get(drinkName)
            output.set(drinkName, currentValue !== undefined ? currentValue + 1 : 1)
        })

        const dataList: Array<{ name: string, "amount": number }> = []
        output.forEach((value, key) => dataList.push({ name: key, "amount": value }))

        const sortedList = dataList.sort((value1, value2) => {
            return value2["amount"] - value1["amount"]
        }).slice(0, 10)
        return sortedList
    }

    const totalSales = () => {
        let sales = 0
        transactions.slice(indices[0], indices[1]).forEach(value => {
            if (value.description.includes("Checkout") || value.description.includes("Deposit") || value.description.includes("Transfer")) { return }
            if (value.amount > 0) { return }

            sales += Math.abs(value.amount)

        })
        //Round the amount to two decimal places
        sales = Math.round(sales * 100) / 100
        return sales
    }

    const getDateRangeString = () => {
        if (transactions.length === 0) {
            return "??? - ???";
        }
        const startDate = dateToString(new Date(transactions[indices[0]].date));
        const endDate = dateToString(new Date(transactions[indices[1]].date));
        return `Zeitraum ${startDate} - ${endDate}`;
    };

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
            <Stack direction="row" spacing={2} flexWrap={"wrap"} alignItems={"center"}>
                <Typography variant="overline">{getDateRangeString()}</Typography>

                <Button color='success' onClick={() => {
                    setisRunning(!isRunning)
                }}>
                    {!isRunning ? <PlayArrowIcon /> : <PauseIcon />}
                </Button>
            </Stack>

            <Slider
                style={{ maxWidth: innerWidth - 50 }}
                getAriaLabel={() => "Zeitraum"}
                value={dateRange}
                onChange={(_, value) => {
                    setdateRange(value as [number, number])
                }}
                valueLabelFormat={(value) => {
                    if (transactions.length === 0) { return "" }
                    const indices = transactionsIndices()
                    if (value === dateRange[0]) {
                        return dateToString(new Date(transactions[indices[0]].date))
                    }
                    if (value === dateRange[1]) {
                        return dateToString(new Date(transactions[indices[1]].date))
                    }


                }
                }
                valueLabelDisplay="auto"
            />
            <Stack direction="row" spacing={2} flexWrap={"wrap"}>
                <StatisticBox
                    headline={GESAMT_UMSATZ_GETRAENKE}
                    text={totalSales().toFixed(2) + "€"}
                    icon={<Money />}
                    colorCode={window.globalTS.ICON_COLOR} />

                <Infobox headline={LETZTE_KAEUFE} >
                    <AreaChart width={window.innerWidth / 3} height={200} data={getTransactionHistoryDiagramData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <YAxis unit="€" />
                        <XAxis dataKey="date" />
                        <Tooltip contentStyle={{ color: "black" }} />
                        <Legend />
                        <Area type="monotone" dataKey="Anzahl Transaktionen" name='Umsatz' stroke={window.globalTS.ICON_COLOR} fillOpacity={0.5} fill={window.globalTS.ICON_COLOR} />
                    </AreaChart >
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
                        <BarChart data={getMostBoughtDrinks().reverse()} layout="vertical" >
                            <CartesianGrid strokeDasharray="3 3" />
                            <YAxis dataKey="name" type="category" reversed />
                            <XAxis name="Anzahl Transaktionen" />
                            <Tooltip contentStyle={{ color: "black" }} />
                            <Legend />
                            <Bar name="Anzahl Transaktionen" dataKey="amount" fill={window.globalTS.ICON_COLOR} />
                        </BarChart >
                    </ResponsiveContainer>
                </Infobox>

            </Stack>
        </Stack>
    )
}

export default Statistics