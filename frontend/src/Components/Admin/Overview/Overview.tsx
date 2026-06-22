import {
    AccountBalance,
    ArrowForward,
    InsertChart,
    Money,
    Person,
    ReceiptLong,
    Settings,
    SportsBar,
    VisibilityOff
} from '@mui/icons-material'
import { Avatar, ButtonBase, Paper, Typography, useMediaQuery, useTheme } from '@mui/material'
import React, { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
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
import { setDrinkCategories, setDrinks, setMembers } from '../../../Actions/CommonAction'
import { CommonReducerType } from '../../../Reducer/CommonReducer'
import { RootState } from '../../../Reducer/reducerCombiner'
import { Transaction } from '../../../types/ResponseTypes'
import {
    ABRECHNUNGEN,
    EINSTELLUNGEN,
    GETRAENKE,
    MITGLIEDER,
    STATISTIKEN,
    TRANSAKTIONEN
} from '../../Common/Internationalization/i18n'
import { dateToString, doGetRequest } from '../../Common/StaticFunctions'
import { centsToEuroNumber, convertToLocalDate, formatMoney } from '../../Common/StaticFunctionsTyped'
import style from './overview.module.scss'

type MetricCardProps = {
    label: string,
    value: string,
    helper?: string,
    icon: React.ReactNode,
    accent?: string
}

type NavigationItem = {
    title: string,
    description: string,
    path: string,
    icon: React.ReactNode
}

const ignoredDescriptions = ['checkout', 'deposit', 'transfer', 'barzahlung', 'auszahlung', 'payout']

const MetricCard = ({ label, value, helper, icon, accent = window.globalTS.ICON_COLOR }: MetricCardProps) => (
    <Paper className={style.metricCard} elevation={1} sx={{ borderTopColor: accent }}>
        <div>
            <Typography variant="overline" color="text.secondary">{label}</Typography>
            <Typography variant="h5" className={style.metricValue}>{value}</Typography>
            {helper ? <Typography variant="body2" color="text.secondary">{helper}</Typography> : null}
        </div>
        <Avatar sx={{ bgcolor: accent }}>{icon}</Avatar>
    </Paper>
)

const Overview = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
    const common: CommonReducerType = useSelector((state: RootState) => state.common)
    const [transactions, setTransactions] = React.useState<Array<Transaction>>([])

    useEffect(() => {
        let isActive = true

        doGetRequest('transactions/limit/100').then((value) => {
            if (isActive && value.code === 200) {
                setTransactions(value.content as Array<Transaction>)
            }
        })

        return () => {
            isActive = false
        }
    }, [])

    useEffect(() => {
        if (common.drinks === null) {
            doGetRequest('drinks').then((value) => {
                if (value.code === 200) {
                    dispatch(setDrinks(value.content))
                }
            })
        }

        if (common.drinkCategories === null) {
            doGetRequest('drinks/categories').then((value) => {
                if (value.code === 200) {
                    dispatch(setDrinkCategories(value.content))
                }
            })
        }

        if (common.members === null) {
            doGetRequest('users').then((value) => {
                if (value.code === 200) {
                    dispatch(setMembers(value.content))
                }
            })
        }
    }, [common.drinkCategories, common.drinks, common.members, dispatch])

    const totalBalance = useMemo(() => {
        return common.members?.reduce((sum, member) => sum + member.balance, 0) ?? 0
    }, [common.members])

    const hiddenUsers = useMemo(() => {
        return common.members?.filter((member) => member.hidden).length ?? 0
    }, [common.members])

    const lowestBalanceMember = useMemo(() => {
        if (!common.members?.length) {
            return null
        }
        return common.members.reduce((lowest, member) => member.balance < lowest.balance ? member : lowest)
    }, [common.members])

    const sales = useMemo(() => {
        return transactions.filter((transaction) => {
            const description = transaction.description.toLocaleLowerCase()
            return transaction.amount < 0 &&
                !ignoredDescriptions.some((ignored) => description.includes(ignored))
        })
    }, [transactions])

    const recentRevenue = useMemo(() => {
        return sales.reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0)
    }, [sales])

    const purchasesByDate = useMemo(() => {
        const output = new Map<string, { date: Date, purchases: number }>()

        sales.forEach((transaction) => {
            const date = convertToLocalDate(transaction.date)
            const dateLabel = dateToString(date)
            const current = output.get(dateLabel)
            output.set(dateLabel, {
                date,
                purchases: (current?.purchases ?? 0) + 1
            })
        })

        return Array.from(output.values())
            .sort((left, right) => left.date.valueOf() - right.date.valueOf())
            .map((entry) => ({
                date: dateToString(entry.date),
                Käufe: entry.purchases
            }))
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

    const navigationItems: Array<NavigationItem> = [
        {
            title: GETRAENKE,
            description: 'Sortiment, Preise und Bestand verwalten',
            path: '/admin/drinks',
            icon: <SportsBar />
        },
        {
            title: MITGLIEDER,
            description: 'Konten, Guthaben und Zugänge verwalten',
            path: '/admin/members',
            icon: <Person />
        },
        {
            title: TRANSAKTIONEN,
            description: 'Buchungen prüfen und rückgängig machen',
            path: '/admin/transactions',
            icon: <ReceiptLong />
        },
        {
            title: ABRECHNUNGEN,
            description: 'Abrechnungen erstellen und einsehen',
            path: '/admin/checkout',
            icon: <AccountBalance />
        },
        {
            title: STATISTIKEN,
            description: 'Umsatz und Konsum genauer auswerten',
            path: '/admin/statistics',
            icon: <InsertChart />
        },
        {
            title: EINSTELLUNGEN,
            description: 'Drinklist konfigurieren und anpassen',
            path: '/admin/settings',
            icon: <Settings />
        }
    ]

    const chartMargin = isMobile
        ? { top: 8, right: 4, left: -24, bottom: 0 }
        : { top: 8, right: 16, left: 0, bottom: 0 }

    return (
        <main className={style.container}>
            <header className={style.header}>
                <div>
                    <Typography variant="overline" color="text.secondary">Administration</Typography>
                    <Typography variant="h4">Übersicht</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Die wichtigsten Zahlen und Bereiche deiner Drinklist
                    </Typography>
                </div>
                <Paper className={style.activitySummary} variant="outlined">
                    <ReceiptLong color="action" />
                    <div>
                        <Typography variant="caption" color="text.secondary">Letzte 100 Transaktionen</Typography>
                        <Typography variant="body2" fontWeight={600}>
                            {sales.length} Käufe · {formatMoney(recentRevenue)} € Umsatz
                        </Typography>
                    </div>
                </Paper>
            </header>

            <section className={style.section}>
                <Typography variant="h5">Auf einen Blick</Typography>
                <div className={style.metricGrid}>
                    <MetricCard label="Gesamtguthaben" value={`${formatMoney(totalBalance)} €`} icon={<Money />} />
                    <MetricCard label="Mitglieder" value={`${common.members?.length ?? 0}`} icon={<Person />} />
                    <MetricCard label="Versteckte Nutzer" value={`${hiddenUsers}`} icon={<VisibilityOff />} />
                    <MetricCard
                        label="Niedrigstes Guthaben"
                        value={lowestBalanceMember ? `${formatMoney(lowestBalanceMember.balance)} €` : '–'}
                        helper={lowestBalanceMember?.name}
                        icon={<AccountBalance />}
                    />
                </div>
            </section>

            <section className={style.section}>
                <div>
                    <Typography variant="h5">Schnellzugriff</Typography>
                    <Typography variant="body2" color="text.secondary">Direkt zum gewünschten Verwaltungsbereich</Typography>
                </div>
                <div className={style.navigationGrid}>
                    {navigationItems.map((item) => (
                        <ButtonBase
                            key={item.path}
                            className={style.navigationButton}
                            onClick={() => navigate(item.path)}
                            focusRipple
                        >
                            <Paper className={style.navigationCard} elevation={1}>
                                <Avatar className={style.navigationIcon} sx={{ bgcolor: window.globalTS.ICON_COLOR }}>
                                    {item.icon}
                                </Avatar>
                                <div className={style.navigationText}>
                                    <Typography variant="h6">{item.title}</Typography>
                                    <Typography variant="body2" color="text.secondary">{item.description}</Typography>
                                </div>
                                <ArrowForward className={style.navigationArrow} color="action" />
                            </Paper>
                        </ButtonBase>
                    ))}
                </div>
            </section>

            <section className={style.section}>
                <div>
                    <Typography variant="h5">Aktuelle Entwicklung</Typography>
                    <Typography variant="body2" color="text.secondary">Ein kompakter Blick auf Guthaben und die letzten Käufe</Typography>
                </div>
                <div className={style.chartGrid}>
                    <Paper className={style.chartCard} elevation={1}>
                        <div>
                            <Typography variant="h6">Guthabenverteilung</Typography>
                            <Typography variant="body2" color="text.secondary">Vom niedrigsten zum höchsten Guthaben</Typography>
                        </div>
                        <div className={style.chart}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={balanceData} margin={chartMargin}>
                                    <defs>
                                        <linearGradient id="adminBalanceGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={window.globalTS.ICON_COLOR} stopOpacity={0.48} />
                                            <stop offset="95%" stopColor={window.globalTS.ICON_COLOR} stopOpacity={0.04} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="member" hide />
                                    <YAxis unit=" €" />
                                    <Tooltip labelFormatter={() => 'Guthaben'} contentStyle={{ color: 'black' }} />
                                    <Area
                                        type="monotone"
                                        dataKey="Guthaben"
                                        stroke={window.globalTS.ICON_COLOR}
                                        strokeWidth={2}
                                        fill="url(#adminBalanceGradient)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Paper>

                    <Paper className={style.chartCard} elevation={1}>
                        <div>
                            <Typography variant="h6">Letzte Käufe</Typography>
                            <Typography variant="body2" color="text.secondary">Verkaufte Getränke pro Tag</Typography>
                        </div>
                        <div className={style.chart}>
                            {purchasesByDate.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={purchasesByDate} margin={chartMargin}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="date" minTickGap={isMobile ? 36 : 18} />
                                        <YAxis allowDecimals={false} />
                                        <Tooltip contentStyle={{ color: 'black' }} />
                                        <Bar dataKey="Käufe" fill={window.globalTS.ICON_COLOR_SECONDARY} radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className={style.chartEmpty}>
                                    <Typography color="text.secondary">Noch keine Käufe vorhanden</Typography>
                                </div>
                            )}
                        </div>
                    </Paper>
                </div>
            </section>
        </main>
    )
}

export default Overview
