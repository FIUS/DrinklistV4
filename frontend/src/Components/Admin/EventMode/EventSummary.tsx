import React, { useEffect, useMemo, useState } from 'react'
import { Button, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { doGetRequest } from '../../Common/StaticFunctions'
import { Drink, Transaction } from '../../../types/ResponseTypes'
import { datetimeToString } from '../../Common/StaticFunctions'
import { convertToLocalDate } from '../../Common/StaticFunctionsTyped'
import { EVENT_DRUCKEN, EVENT_MODE, EVENT_ZUSAMMENFASSUNG, KATEGORIE, UMSATZ, VERKAUFT, ZURUECK } from '../../Common/Internationalization/i18n'
import style from './eventSummary.module.scss'

type SummaryRow = {
    name: string,
    sold: number,
    revenue: number
}

const ignoredDescriptions = ['Checkout', 'Deposit', 'Transfer', 'Barzahlung', 'Auszahlung', 'Event payout', 'Payout']

const EventSummary = () => {
    const navigate = useNavigate()
    const [transactions, setTransactions] = useState<Array<Transaction>>([])
    const [drinks, setDrinks] = useState<Array<Drink>>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let isActive = true

        const load = async () => {
            const [transactionsValue, drinksValue] = await Promise.all([
                doGetRequest('transactions').then((value) => {
                    if (value.code === 200) {
                        return value
                    }
                    return doGetRequest('event/transactions/limit/10000')
                }),
                doGetRequest('drinks')
            ])

            if (!isActive) {
                return
            }

            if (transactionsValue.code === 200) {
                setTransactions((transactionsValue.content as Array<Transaction>).slice())
            }
            if (drinksValue.code === 200) {
                setDrinks(drinksValue.content as Array<Drink>)
            }
            setLoading(false)
        }

        load()

        return () => {
            isActive = false
        }
    }, [])

    const drinkCategoryByName = useMemo(() => {
        const map = new Map<string, string>()
        drinks.forEach((drink) => {
            map.set(drink.name, drink.category)
        })
        return map
    }, [drinks])

    const transactionSales = useMemo(() => {
        return transactions.filter((transaction) => {
            const desc = (transaction.description ?? '').toString().toLowerCase()
            // exclude any explicit cash payments regardless of sign
            if (transaction.amount >= 0) {
                return false
            }
            return !ignoredDescriptions.some((ignored) => desc.includes(ignored.toLowerCase()))
        })
    }, [transactions])

    const totalRevenue = useMemo(() => {
        return Math.round(transactionSales.reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0) * 100) / 100
    }, [transactionSales])

    const totalSoldItems = transactionSales.length

    const itemRows = useMemo(() => {
        const rows = new Map<string, SummaryRow>()
        transactionSales.forEach((transaction) => {
            const current = rows.get(transaction.description)
            const amount = Math.abs(transaction.amount)
            if (current) {
                current.sold += 1
                current.revenue = Math.round((current.revenue + amount) * 100) / 100
                return
            }

            rows.set(transaction.description, {
                name: transaction.description,
                sold: 1,
                revenue: Math.round(amount * 100) / 100
            })
        })

        return Array.from(rows.values()).sort((left, right) => right.sold - left.sold || right.revenue - left.revenue)
    }, [transactionSales])

    const categoryRows = useMemo(() => {
        const rows = new Map<string, SummaryRow>()
        transactionSales.forEach((transaction) => {
            const category = drinkCategoryByName.get(transaction.description) ?? 'Unbekannt'
            const current = rows.get(category)
            const amount = Math.abs(transaction.amount)
            if (current) {
                current.sold += 1
                current.revenue = Math.round((current.revenue + amount) * 100) / 100
                return
            }

            rows.set(category, {
                name: category,
                sold: 1,
                revenue: Math.round(amount * 100) / 100
            })
        })

        return Array.from(rows.values()).sort((left, right) => right.sold - left.sold || right.revenue - left.revenue)
    }, [drinkCategoryByName, transactionSales])

    const categoryHourlyCharts = useMemo(() => {
        const categories = Array.from(new Set(transactionSales.map((transaction) => drinkCategoryByName.get(transaction.description) ?? 'Unbekannt')))
            .sort((left, right) => left.localeCompare(right))

        return categories.map((category) => {
            const data = Array.from({ length: 24 }, (_, hour) => ({
                hour: `${hour.toString().padStart(2, '0')}:00`,
                sold: 0
            }))

            transactionSales.forEach((transaction) => {
                const txCategory = drinkCategoryByName.get(transaction.description) ?? 'Unbekannt'
                if (txCategory !== category) {
                    return
                }

                const hour = convertToLocalDate(transaction.date).getHours()
                data[hour].sold += 1
            })

            return { category, data }
        })
    }, [drinkCategoryByName, transactionSales])

    const itemHourlyCharts = useMemo(() => {
        const items = Array.from(new Set(transactionSales.map((transaction) => transaction.description)))
            .sort((left, right) => left.localeCompare(right))

        return items.map((item) => {
            const data = Array.from({ length: 24 }, (_, hour) => ({
                hour: `${hour.toString().padStart(2, '0')}:00`,
                sold: 0
            }))

            transactionSales.forEach((transaction) => {
                if (transaction.description !== item) {
                    return
                }

                const hour = convertToLocalDate(transaction.date).getHours()
                data[hour].sold += 1
            })

            return { item, data }
        })
    }, [transactionSales])

    const chartDate = useMemo(() => {
        return datetimeToString(new Date())
    }, [])

    return (
        <div className={style.container}>
            <div className={style.header}>
                <div>
                    <Typography variant="overline">{EVENT_MODE}</Typography>
                    <Typography variant="h4">{EVENT_ZUSAMMENFASSUNG}</Typography>
                    <Typography variant="body2">{chartDate}</Typography>
                </div>
                <Stack direction="row" spacing={1} className={style.actions}>
                    <Button variant="outlined" onClick={() => navigate('/admin/event-mode')}>{ZURUECK}</Button>
                    <Button variant="contained" onClick={() => window.print()}>{EVENT_DRUCKEN}</Button>
                </Stack>
            </div>

            <Stack direction="row" spacing={2} flexWrap="wrap">
                <Paper className={style.statBox} elevation={2}>
                    <Typography variant="overline">{UMSATZ}</Typography>
                    <Typography variant="h4">{totalRevenue.toFixed(2)} EUR</Typography>
                </Paper>
                <Paper className={style.statBox} elevation={2}>
                    <Typography variant="overline">{VERKAUFT}</Typography>
                    <Typography variant="h4">{totalSoldItems}</Typography>
                </Paper>
            </Stack>

            <div className={style.grid}>
                <Paper className={style.card} elevation={2}>
                    <Typography variant="h6">Artikel</Typography>
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Artikel</TableCell>
                                    <TableCell align="right">{VERKAUFT}</TableCell>
                                    <TableCell align="right">{UMSATZ}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {itemRows.map((row) => (
                                    <TableRow key={row.name}>
                                        <TableCell>{row.name}</TableCell>
                                        <TableCell align="right">{row.sold}</TableCell>
                                        <TableCell align="right">{row.revenue.toFixed(2)} EUR</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>

                <Paper className={style.card} elevation={2}>
                    <Typography variant="h6">{KATEGORIE}</Typography>
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>{KATEGORIE}</TableCell>
                                    <TableCell align="right">{VERKAUFT}</TableCell>
                                    <TableCell align="right">{UMSATZ}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {categoryRows.map((row) => (
                                    <TableRow key={row.name}>
                                        <TableCell>{row.name}</TableCell>
                                        <TableCell align="right">{row.sold}</TableCell>
                                        <TableCell align="right">{row.revenue.toFixed(2)} EUR</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>

            </div>

            <Typography variant="h5" sx={{ mt: 3, mb: 1 }}>Verkäufe pro Kategorie</Typography>
            <div className={style.hourGrid}>
                {categoryHourlyCharts.map((entry) => (
                    <Paper key={entry.category} className={style.chartCard} elevation={2}>
                        <Typography variant="h6">{entry.category}</Typography>
                        <Typography variant="body2">Verkäufe pro Stunde</Typography>
                        <ResponsiveContainer width="100%" height={280}>
                            <LineChart data={entry.data}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="hour" />
                                <YAxis allowDecimals={false} />
                                <Tooltip contentStyle={{ color: 'black' }} />
                                <Legend />
                                <Line type="monotone" dataKey="sold" name={VERKAUFT} stroke={window.globalTS.ICON_COLOR} strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </Paper>
                ))}
            </div>

            <Typography variant="h5" sx={{ mt: 3, mb: 1 }}>Verkäufe pro Artikel</Typography>
            <div className={style.hourGrid}>
                {itemHourlyCharts.map((entry) => (
                    <Paper key={entry.item} className={style.chartCard} elevation={2}>
                        <Typography variant="h6">{entry.item}</Typography>
                        <Typography variant="body2">Verkäufe pro Stunde</Typography>
                        <ResponsiveContainer width="100%" height={280}>
                            <LineChart data={entry.data}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="hour" />
                                <YAxis allowDecimals={false} />
                                <Tooltip contentStyle={{ color: 'black' }} />
                                <Legend />
                                <Line type="monotone" dataKey="sold" name={VERKAUFT} stroke={window.globalTS.ICON_COLOR_SECONDARY} strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </Paper>
                ))}
            </div>

            {loading ? <Typography variant="body2">Lade Daten...</Typography> : null}
        </div>
    )
}

export default EventSummary