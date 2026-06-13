import React, { useEffect, useMemo, useState } from 'react'
import { Button, Stack, Typography } from '@mui/material'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { doGetRequest, doPostRequest, downloadJSON } from '../../Common/StaticFunctions'
import { Drink, Transaction } from '../../../types/ResponseTypes'
import { datetimeToString } from '../../Common/StaticFunctions'
import style from './eventSummary.module.scss'
import Spacer from '../../Common/Spacer'

const ignoredDescriptions = ['Checkout', 'Deposit', 'Transfer', 'Barzahlung', 'Auszahlung', 'Event payout', 'Payout']

const EventSummaryPrint = () => {
    const [searchParams] = useSearchParams()
    const action = searchParams.get('action') ?? 'transactions_only_keep_balance'
    const navigate = useNavigate()

    const [transactions, setTransactions] = useState<Array<Transaction>>([])
    const [drinks, setDrinks] = useState<Array<Drink>>([])
    const [loading, setLoading] = useState(true)

    const [retryAttempted, setRetryAttempted] = useState(false)

    const loadData = async () => {
        setLoading(true)
        try {
            const [transactionsValue, drinksValue] = await Promise.all([
                doGetRequest('transactions').then((value) => {
                    if (value.code === 200) {
                        return value
                    }
                    return doGetRequest('event/transactions/limit/10000')
                }),
                doGetRequest('drinks')
            ])

            if (transactionsValue.code === 200) setTransactions((transactionsValue.content as Array<Transaction>).slice())
            if (drinksValue.code === 200) setDrinks(drinksValue.content as Array<Drink>)
        } catch {
            // ignore
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        let isActive = true
        if (isActive) loadData()
        return () => { isActive = false }
    }, [action])

    // Retry once if initial load produced no transactions (fixes SPA navigation race)
    useEffect(() => {
        if (!loading && transactions.length === 0 && !retryAttempted) {
            setRetryAttempted(true)
            const t = setTimeout(() => {
                loadData()
            }, 400)
            return () => clearTimeout(t)
        }
    }, [loading, transactions, retryAttempted])

    const drinkCategoryByName = useMemo(() => {
        const map = new Map<string, string>()
        drinks.forEach((drink) => {
            map.set(drink.name, drink.category)
        })
        return map
    }, [drinks])

    const drinkPriceByName = useMemo(() => {
        const map = new Map<string, number>()
        drinks.forEach((drink) => {
            map.set(drink.name, drink.price)
        })
        return map
    }, [drinks])

    const transactionSales = useMemo(() => {
        return transactions.filter((transaction) => {
            const desc = (transaction.description ?? '').toString().toLowerCase()
            if (transaction.amount >= 0) return false
            return !ignoredDescriptions.some((ignored) => desc.includes(ignored.toLowerCase()))
        })
    }, [transactions])

    const totalRevenue = useMemo(() => Math.round(transactionSales.reduce((sum, t) => sum + Math.abs(t.amount), 0) * 100) / 100, [transactionSales])
    const totalSoldItems = transactionSales.length

    const itemRows = useMemo(() => {
        const rows = new Map<string, { name: string, sold: number, revenue: number }>()
        transactionSales.forEach((transaction) => {
            const current = rows.get(transaction.description)
            const amount = Math.abs(transaction.amount)
            if (current) {
                current.sold += 1
                current.revenue = Math.round((current.revenue + amount) * 100) / 100
                return
            }
            rows.set(transaction.description, { name: transaction.description, sold: 1, revenue: Math.round(amount * 100) / 100 })
        })
        return Array.from(rows.values()).sort((l, r) => r.sold - l.sold || r.revenue - l.revenue)
    }, [transactionSales])

    const itemLinesWithTotals = useMemo(() => {
        return itemRows.map(r => {
            const unitPrice = drinkPriceByName.get(r.name) ?? (r.revenue / r.sold)
            const lineTotal = Math.round(unitPrice * r.sold * 100) / 100
            return { ...r, unitPrice, lineTotal }
        })
    }, [itemRows, drinkPriceByName])

    const sumOfItems = useMemo(() => {
        return itemLinesWithTotals.reduce((s, r) => Math.round((s + r.lineTotal) * 100) / 100, 0)
    }, [itemLinesWithTotals])

    const categoryRows = useMemo(() => {
        const rows = new Map<string, { name: string, sold: number, revenue: number }>()
        transactionSales.forEach((transaction) => {
            const category = drinkCategoryByName.get(transaction.description) ?? 'Unbekannt'
            const current = rows.get(category)
            const amount = Math.abs(transaction.amount)
            if (current) {
                current.sold += 1
                current.revenue = Math.round((current.revenue + amount) * 100) / 100
                return
            }
            rows.set(category, { name: category, sold: 1, revenue: Math.round(amount * 100) / 100 })
        })
        return Array.from(rows.values()).sort((l, r) => r.sold - l.sold || r.revenue - l.revenue)
    }, [transactionSales, drinkCategoryByName])

    const chartDate = useMemo(() => datetimeToString(new Date()), [])

    useEffect(() => {
        if (!loading) {
            setTimeout(async () => {
                try {
                    window.print();

                    const now = new Date()
                    const filename = "backup-drinklist-" + now.toLocaleDateString() + "-" + now.toTimeString() + ".json"
                    await downloadJSON('settings/backup', filename)
                } catch {
                    // ignore
                }
            }, 300)
        }
    }, [loading])

    const finalize = async () => {
        const resp = await doPostRequest('event/checkout/finalize', { action: action, dryRun: false })
        if (resp.code === 200) {
            alert('Finalisierung erfolgreich')
            navigate('/admin/event-mode')
        } else {
            alert('Fehler bei Finalisierung')
        }
    }

    return (
        <div className={style.printView}>

            <Typography variant="h4">Endabrechnung</Typography>
            <Typography variant="body2">{chartDate}</Typography>

            <Typography variant="h6" sx={{ mt: 2 }}>Umsatz: {totalRevenue.toFixed(2)} EUR</Typography>
            <Typography variant="h6">Verkauft: {totalSoldItems}</Typography>

            <Typography variant="h6" sx={{ mt: 2 }}>Artikel</Typography>
            <pre>
                {(() => {
                    const lines = itemLinesWithTotals.map(r => `${r.name.padEnd(40)} ${r.sold.toString().padStart(4)} x ${r.unitPrice.toFixed(2).padStart(6)} = ${r.lineTotal.toFixed(2).padStart(8)} EUR`)
                    const sumLabel = 'Summe'
                    const nameAreaLength = 40 + 1 // name padded to 40 + one space in template
                    const partBeforeLineTotal = 1 + 4 + 3 + 6 + 3 // spaces+qty+' x '+unitPrice+' = '
                    const estimatedTotalLength = nameAreaLength + partBeforeLineTotal + 8 + 4 // 8 for amount field, 4 for ' EUR'
                    const totalLineLength = lines.length > 0 ? lines[0].length : estimatedTotalLength
                    const separator = ' '.repeat(nameAreaLength) + '-'.repeat(Math.max(0, totalLineLength - nameAreaLength))
                    const padForSumLabel = nameAreaLength + partBeforeLineTotal
                    const sumAmount = sumOfItems.toFixed(2).padStart(8)
                    lines.push(separator)
                    lines.push(sumLabel.padEnd(padForSumLabel) + sumAmount + ' EUR')
                    return lines.join('\n')
                })()}
            </pre>

            <Typography variant="h6" sx={{ mt: 2 }}>Pro Kategorie</Typography>
            <pre>
                {categoryRows.map(r => `${r.name.padEnd(40)} ${r.sold.toString().padStart(4)} x ${r.revenue.toFixed(2).padStart(8)} EUR`).join('\n')}
            </pre>
            <Spacer vertical={25} />
            <Stack flexDirection="row" gap={2}>
                <Button sx={{ ml: 2 }} onClick={() => navigate('/admin/event-mode')}>Abbrechen</Button>
                <Button variant="contained" onClick={() => { window.print() }}>Drucken</Button>
                <Button variant="contained" color="error" onClick={finalize}>Finalisieren</Button>
            </Stack>
        </div>
    )
}

export default EventSummaryPrint
