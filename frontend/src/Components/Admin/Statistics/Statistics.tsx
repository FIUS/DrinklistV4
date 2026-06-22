import {
    Avatar,
    Button,
    Paper,
    Slider,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material'
import {
    CalendarMonth,
    Euro,
    Groups,
    LocalBar,
    LocalFireDepartment,
    Money,
    Person,
    ReceiptLong,
    VisibilityOff
} from '@mui/icons-material'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts'
import { setMembers } from '../../../Actions/CommonAction'
import { CommonReducerType } from '../../../Reducer/CommonReducer'
import { RootState } from '../../../Reducer/reducerCombiner'
import { Transaction } from '../../../types/ResponseTypes'
import { dateToString, doGetRequest } from '../../Common/StaticFunctions'
import { centsToEuroNumber, convertToLocalDate, formatMoney } from '../../Common/StaticFunctionsTyped'
import { MITGLIEDER, UMSATZ } from '../../Common/Internationalization/i18n'
import PauseIcon from '@mui/icons-material/Pause'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import style from './statistics.module.scss'

type MetricCardProps = {
    label: string,
    value: string,
    helper?: string,
    icon: React.ReactNode,
    accent?: string
}

type WeekdayData = {
    day: string,
    shortDay: string,
    revenue: number,
    purchases: number,
    average: number
}

const ignoredDescriptions = [
    'checkout',
    'deposit',
    'transfer',
    'barzahlung',
    'auszahlung',
    'event payout',
    'payout'
]

const MetricCard = ({ label, value, helper, icon, accent = window.globalTS.ICON_COLOR }: MetricCardProps) => (
    <Paper className={style.metricCard} elevation={1} sx={{ borderTopColor: accent }}>
        <div className={style.metricContent}>
            <div>
                <Typography variant="overline" color="text.secondary">{label}</Typography>
                <Typography variant="h5" className={style.metricValue}>{value}</Typography>
                {helper ? <Typography variant="body2" color="text.secondary">{helper}</Typography> : null}
            </div>
            <Avatar sx={{ bgcolor: accent }}>{icon}</Avatar>
        </div>
    </Paper>
)

const Statistics = () => {
    const common: CommonReducerType = useSelector((state: RootState) => state.common)
    const dispatch = useDispatch()
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
    const [transactions, setTransactions] = useState<Array<Transaction>>([])
    const [dateRange, setDateRange] = useState<[number, number]>([70, 100])
    const [isRunning, setIsRunning] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        doGetRequest('users').then((value) => {
            if (value.code === 200) {
                dispatch(setMembers(value.content))
            }
        })
    }, [dispatch])

    useEffect(() => {
        let isActive = true

        doGetRequest('transactions/limit/10000').then((value) => {
            if (!isActive) {
                return
            }

            if (value.code === 200) {
                const sortedTransactions = (value.content as Array<Transaction>)
                    .slice()
                    .sort((left, right) => convertToLocalDate(left.date).valueOf() - convertToLocalDate(right.date).valueOf())
                setTransactions(sortedTransactions)
            }
            setIsLoading(false)
        })

        return () => {
            isActive = false
        }
    }, [])

    useEffect(() => {
        if (!isRunning) {
            return
        }

        const interval = window.setInterval(() => {
            setDateRange((currentRange) => {
                const windowSize = currentRange[1] - currentRange[0]
                const nextEnd = Math.min(currentRange[1] + 1, 100)
                const nextStart = Math.max(0, nextEnd - windowSize)

                if (nextEnd === 100) {
                    setIsRunning(false)
                }
                return [nextStart, nextEnd]
            })
        }, 700)

        return () => window.clearInterval(interval)
    }, [isRunning])

    const percentToIndex = useCallback((percent: number) => {
        if (transactions.length <= 1) {
            return 0
        }
        return Math.round((percent / 100) * (transactions.length - 1))
    }, [transactions.length])

    const rangeIndices = useMemo<[number, number]>(() => {
        return [percentToIndex(dateRange[0]), percentToIndex(dateRange[1])]
    }, [dateRange, percentToIndex])

    const selectedTransactions = useMemo(() => {
        if (transactions.length === 0) {
            return []
        }
        return transactions.slice(rangeIndices[0], rangeIndices[1] + 1)
    }, [rangeIndices, transactions])

    const sales = useMemo(() => {
        return selectedTransactions.filter((transaction) => {
            const description = transaction.description.toLocaleLowerCase()
            return transaction.amount < 0 &&
                !ignoredDescriptions.some((ignored) => description.includes(ignored))
        })
    }, [selectedTransactions])

    const totalBalance = useMemo(() => {
        return common.members?.reduce((sum, member) => sum + member.balance, 0) ?? 0
    }, [common.members])

    const hiddenUsers = useMemo(() => {
        return common.members?.filter((member) => member.hidden).length ?? 0
    }, [common.members])

    const topDebtor = useMemo(() => {
        if (!common.members?.length) {
            return null
        }
        return common.members.reduce((lowest, member) => member.balance < lowest.balance ? member : lowest)
    }, [common.members])

    const totalRevenue = useMemo(() => {
        return sales.reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0)
    }, [sales])

    const averagePurchase = sales.length > 0 ? Math.round(totalRevenue / sales.length) : 0
    const activeBuyers = useMemo(() => new Set(sales.map((transaction) => transaction.memberID)).size, [sales])

    const purchasesByDate = useMemo(() => {
        const output = new Map<string, { date: Date, purchases: number }>()
        sales.forEach((transaction) => {
            const date = convertToLocalDate(transaction.date)
            const key = dateToString(date)
            const current = output.get(key)
            output.set(key, { date, purchases: (current?.purchases ?? 0) + 1 })
        })

        return Array.from(output.values())
            .sort((left, right) => left.date.valueOf() - right.date.valueOf())
            .map((entry) => ({
                date: dateToString(entry.date),
                Käufe: entry.purchases
            }))
    }, [sales])

    const weekdayData = useMemo<Array<WeekdayData>>(() => {
        const output: Array<WeekdayData> = [
            { day: 'Sonntag', shortDay: 'So', revenue: 0, purchases: 0, average: 0 },
            { day: 'Montag', shortDay: 'Mo', revenue: 0, purchases: 0, average: 0 },
            { day: 'Dienstag', shortDay: 'Di', revenue: 0, purchases: 0, average: 0 },
            { day: 'Mittwoch', shortDay: 'Mi', revenue: 0, purchases: 0, average: 0 },
            { day: 'Donnerstag', shortDay: 'Do', revenue: 0, purchases: 0, average: 0 },
            { day: 'Freitag', shortDay: 'Fr', revenue: 0, purchases: 0, average: 0 },
            { day: 'Samstag', shortDay: 'Sa', revenue: 0, purchases: 0, average: 0 }
        ]

        sales.forEach((transaction) => {
            const entry = output[convertToLocalDate(transaction.date).getDay()]
            entry.revenue += Math.abs(transaction.amount)
            entry.purchases += 1
        })

        output.forEach((entry) => {
            entry.average = entry.purchases > 0 ? Math.round(entry.revenue / entry.purchases) : 0
        })

        return [output[1], output[2], output[3], output[4], output[5], output[6], output[0]]
    }, [sales])

    const strongestWeekday = useMemo(() => {
        return weekdayData.reduce((strongest, day) => day.revenue > strongest.revenue ? day : strongest, weekdayData[0])
    }, [weekdayData])

    const topDrinks = useMemo(() => {
        const output = new Map<string, { name: string, purchases: number, revenue: number }>()
        sales.forEach((transaction) => {
            const current = output.get(transaction.description)
            output.set(transaction.description, {
                name: transaction.description,
                purchases: (current?.purchases ?? 0) + 1,
                revenue: (current?.revenue ?? 0) + Math.abs(transaction.amount)
            })
        })

        return Array.from(output.values())
            .sort((left, right) => right.purchases - left.purchases || right.revenue - left.revenue)
            .slice(0, 10)
            .reverse()
    }, [sales])

    const balanceData = useMemo(() => {
        return (common.members ?? [])
            .slice()
            .sort((left, right) => left.balance - right.balance)
            .map((member, index) => ({
                member: index + 1,
                Guthaben: centsToEuroNumber(member.balance)
            }))
    }, [common.members])

    const weekdayChartData = useMemo(() => {
        return weekdayData.map((entry) => ({
            ...entry,
            revenue: centsToEuroNumber(entry.revenue),
            average: centsToEuroNumber(entry.average)
        }))
    }, [weekdayData])

    const formatRangeDate = (percent: number) => {
        if (transactions.length === 0) {
            return ''
        }
        return dateToString(convertToLocalDate(transactions[percentToIndex(percent)].date))
    }

    const rangeLabel = transactions.length > 0
        ? `${formatRangeDate(dateRange[0])} - ${formatRangeDate(dateRange[1])}`
        : 'Keine Transaktionen verfügbar'

    const togglePlayback = () => {
        if (!isRunning && dateRange[1] === 100) {
            const windowSize = Math.max(10, dateRange[1] - dateRange[0])
            setDateRange([0, Math.min(windowSize, 100)])
        }
        setIsRunning((running) => !running)
    }

    const currencyTooltip = (value: number | string) => `${Number(value).toFixed(2)} €`
    const chartMargin = isMobile
        ? { top: 8, right: 4, left: -24, bottom: 0 }
        : { top: 8, right: 16, left: 0, bottom: 0 }

    return (
        <main className={style.container}>
            <header className={style.header}>
                <div>
                    <Typography variant="overline" color="text.secondary">Administration</Typography>
                    <Typography variant="h4">Statistiken</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Mitglieder, Guthaben und Konsum auf einen Blick
                    </Typography>
                </div>
                <Paper className={style.rangeSummary} variant="outlined">
                    <CalendarMonth color="action" />
                    <div>
                        <Typography variant="caption" color="text.secondary">Ausgewählter Zeitraum</Typography>
                        <Typography variant="body2" fontWeight={600}>{rangeLabel}</Typography>
                    </div>
                </Paper>
            </header>

            <section className={style.section}>
                <Typography variant="h5">{MITGLIEDER}</Typography>
                <div className={style.metricGrid}>
                    <MetricCard label="Gesamtguthaben" value={`${formatMoney(totalBalance)} €`} icon={<Money />} />
                    <MetricCard label="Mitglieder" value={`${common.members?.length ?? 0}`} icon={<Person />} />
                    <MetricCard label="Versteckte Nutzer" value={`${hiddenUsers}`} icon={<VisibilityOff />} />
                    <MetricCard
                        label="Niedrigstes Guthaben"
                        value={topDebtor ? `${formatMoney(topDebtor.balance)} €` : '–'}
                        helper={topDebtor?.name}
                        icon={<LocalFireDepartment />}
                    />
                </div>
            </section>

            <section className={style.section}>
                <div>
                    <Typography variant="h5">{UMSATZ}</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Alle Kennzahlen und Diagramme folgen dem gewählten Zeitraum.
                    </Typography>
                </div>

                <Paper className={style.rangeCard} variant="outlined">
                    <div className={style.rangeHeader}>
                        <div>
                            <Typography variant="overline" color="text.secondary">Zeitraum filtern</Typography>
                            <Typography variant="body1" fontWeight={600}>{rangeLabel}</Typography>
                        </div>
                        <Button
                            variant={isRunning ? 'contained' : 'outlined'}
                            color="success"
                            onClick={togglePlayback}
                            startIcon={isRunning ? <PauseIcon /> : <PlayArrowIcon />}
                            disabled={transactions.length < 2}
                        >
                            {isRunning ? 'Pausieren' : 'Abspielen'}
                        </Button>
                    </div>
                    <Slider
                        getAriaLabel={() => 'Zeitraum'}
                        value={dateRange}
                        onChange={(_, value) => {
                            setIsRunning(false)
                            setDateRange(value as [number, number])
                        }}
                        valueLabelFormat={formatRangeDate}
                        valueLabelDisplay="auto"
                        disableSwap
                        disabled={transactions.length < 2}
                    />
                </Paper>

                <div className={style.metricGrid}>
                    <MetricCard label="Getränkeumsatz" value={`${formatMoney(totalRevenue)} €`} icon={<Euro />} />
                    <MetricCard label="Verkaufte Getränke" value={`${sales.length}`} icon={<ReceiptLong />} />
                    <MetricCard label="Ø pro Kauf" value={`${formatMoney(averagePurchase)} €`} icon={<LocalBar />} />
                    <MetricCard label="Aktive Mitglieder" value={`${activeBuyers}`} helper="mit mindestens einem Kauf" icon={<Groups />} />
                </div>

                <div className={style.insightGrid}>
                    <Paper className={style.insightCard} variant="outlined">
                        <CalendarMonth color="primary" />
                        <div>
                            <Typography variant="caption" color="text.secondary">Stärkster Wochentag</Typography>
                            <Typography variant="h6">{strongestWeekday?.revenue > 0 ? strongestWeekday.day : '–'}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                {strongestWeekday?.revenue > 0 ? `${formatMoney(strongestWeekday.revenue)} € Umsatz` : 'Noch keine Verkäufe'}
                            </Typography>
                        </div>
                    </Paper>
                    <Paper className={style.insightCard} variant="outlined">
                        <LocalBar color="primary" />
                        <div>
                            <Typography variant="caption" color="text.secondary">Beliebtestes Getränk</Typography>
                            <Typography variant="h6">{topDrinks.at(-1)?.name ?? '–'}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                {topDrinks.at(-1) ? `${topDrinks.at(-1)?.purchases} Käufe` : 'Noch keine Verkäufe'}
                            </Typography>
                        </div>
                    </Paper>
                </div>

                {isLoading ? (
                    <Paper className={style.emptyState} variant="outlined">
                        <Typography color="text.secondary">Statistiken werden geladen…</Typography>
                    </Paper>
                ) : null}

                {!isLoading && transactions.length === 0 ? (
                    <Paper className={style.emptyState} variant="outlined">
                        <ReceiptLong color="disabled" />
                        <Typography variant="h6">Noch keine Transaktionen</Typography>
                        <Typography color="text.secondary">Sobald Käufe vorhanden sind, erscheinen hier die Auswertungen.</Typography>
                    </Paper>
                ) : null}

                {transactions.length > 0 ? (
                    <div className={style.chartGrid}>
                        <Paper className={`${style.chartCard} ${style.chartWide}`} elevation={1}>
                            <div>
                                <Typography variant="h6">Käufe im Zeitverlauf</Typography>
                                <Typography variant="body2" color="text.secondary">Anzahl verkaufter Getränke pro Tag</Typography>
                            </div>
                            <div className={style.chart}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={purchasesByDate} margin={chartMargin}>
                                        <defs>
                                            <linearGradient id="purchaseGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={window.globalTS.ICON_COLOR} stopOpacity={0.55} />
                                                <stop offset="95%" stopColor={window.globalTS.ICON_COLOR} stopOpacity={0.05} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="date" minTickGap={isMobile ? 36 : 18} />
                                        <YAxis allowDecimals={false} />
                                        <Tooltip contentStyle={{ color: 'black' }} />
                                        <Area type="monotone" dataKey="Käufe" stroke={window.globalTS.ICON_COLOR} strokeWidth={2} fill="url(#purchaseGradient)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </Paper>

                        <Paper className={style.chartCard} elevation={1}>
                            <div>
                                <Typography variant="h6">Umsatz nach Wochentag</Typography>
                                <Typography variant="body2" color="text.secondary">Welcher Tag trägt am meisten zum Umsatz bei?</Typography>
                            </div>
                            <div className={style.chart}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={weekdayChartData} margin={chartMargin}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey={isMobile ? 'shortDay' : 'day'} />
                                        <YAxis unit=" €" />
                                        <Tooltip formatter={currencyTooltip} contentStyle={{ color: 'black' }} />
                                        <Bar dataKey="revenue" name="Umsatz" fill={window.globalTS.ICON_COLOR_SECONDARY} radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Paper>

                        <Paper className={style.chartCard} elevation={1}>
                            <div>
                                <Typography variant="h6">Guthabenverteilung</Typography>
                                <Typography variant="body2" color="text.secondary">Mitgliederguthaben, vom niedrigsten zum höchsten</Typography>
                            </div>
                            <div className={style.chart}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={balanceData} margin={chartMargin}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="member" hide />
                                        <YAxis unit=" €" />
                                        <Tooltip formatter={currencyTooltip} labelFormatter={() => 'Guthaben'} contentStyle={{ color: 'black' }} />
                                        <Area type="monotone" dataKey="Guthaben" stroke={window.globalTS.ICON_COLOR} strokeWidth={2} fill={window.globalTS.ICON_COLOR} fillOpacity={0.22} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </Paper>

                        <Paper className={`${style.chartCard} ${style.chartWide}`} elevation={1}>
                            <div>
                                <Typography variant="h6">Top 10 Getränke</Typography>
                                <Typography variant="body2" color="text.secondary">Die meistgekauften Getränke im Zeitraum</Typography>
                            </div>
                            <div className={style.topDrinksChart}>
                                {topDrinks.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={topDrinks} layout="vertical" margin={{ top: 8, right: 20, left: isMobile ? 0 : 28, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                            <XAxis type="number" allowDecimals={false} />
                                            <YAxis dataKey="name" type="category" width={isMobile ? 88 : 130} tick={{ fontSize: isMobile ? 11 : 12 }} />
                                            <Tooltip contentStyle={{ color: 'black' }} />
                                            <Bar dataKey="purchases" name="Käufe" fill={window.globalTS.ICON_COLOR} radius={[0, 6, 6, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className={style.chartEmpty}>
                                        <Typography color="text.secondary">Keine Verkäufe im gewählten Zeitraum</Typography>
                                    </div>
                                )}
                            </div>
                        </Paper>
                    </div>
                ) : null}
            </section>
        </main>
    )
}

export default Statistics
