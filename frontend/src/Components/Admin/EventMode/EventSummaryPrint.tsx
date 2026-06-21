import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, Stack, Typography } from '@mui/material'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { doGetRequest, doGetRequestWithEventSecret, doPostRequest, downloadJSON } from '../../Common/StaticFunctions'
import { useDispatch } from 'react-redux'
import { openErrorToast, openToast } from '../../../Actions/CommonAction'
import { Drink, Transaction } from '../../../types/ResponseTypes'
import { datetimeToString } from '../../Common/StaticFunctions'
import style from './eventSummary.module.scss'
import Spacer from '../../Common/Spacer'
import { formatMoney } from '../../Common/StaticFunctionsTyped'

const ignoredDescriptions = ['Checkout', 'Deposit', 'Transfer', 'Barzahlung', 'Auszahlung', 'Event payout', 'Payout']

const EventSummaryPrint = () => {
    const [searchParams] = useSearchParams()
    const action = searchParams.get('action') ?? 'transactions_only_keep_balance'
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const [transactions, setTransactions] = useState<Array<Transaction>>([])
    const [drinks, setDrinks] = useState<Array<Drink>>([])
    const [loading, setLoading] = useState(true)
    const [finalizeInProgress, setfinalizeInProgress] = useState(false)
    const [retryAttempted, setRetryAttempted] = useState(false)

    const loadData = useCallback(async () => {
        setLoading(true)
        try {
            const secretResp = await doGetRequest('event/secret')
            const secret = (secretResp.code === 200 && secretResp.content && secretResp.content.secret) ? secretResp.content.secret : null
            if (secretResp.code === 403) {
                dispatch(openErrorToast())
            }

            const [transactionsValue, drinksValue] = await Promise.all([
                doGetRequest('transactions').then((value) => {
                    if (value.code === 200) {
                        return value
                    }
                    return doGetRequestWithEventSecret('event/transactions/limit/10000', secret)
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
    }, [dispatch])

    useEffect(() => {
        loadData()
    }, [loadData])


    // Retry once if initial load produced no transactions (fixes SPA navigation race)
    useCallback(() => {
        if (!loading && transactions.length === 0 && !retryAttempted) {
            setRetryAttempted(true)
            const t = setTimeout(() => {
                loadData()
            }, 400)
            return () => clearTimeout(t)
        }
    }, [loading, transactions, retryAttempted, loadData])

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

    const totalRevenue = useMemo(() => transactionSales.reduce((sum, t) => sum + Math.abs(t.amount), 0), [transactionSales])
    const totalSoldItems = transactionSales.length

    const itemRows = useMemo(() => {
        const rows = new Map<string, { name: string, sold: number, revenue: number }>()
        transactionSales.forEach((transaction) => {
            const current = rows.get(transaction.description)
            const amount = Math.abs(transaction.amount)
            if (current) {
                current.sold += 1
                current.revenue += amount
                return
            }
            rows.set(transaction.description, { name: transaction.description, sold: 1, revenue: amount })
        })
        return Array.from(rows.values()).sort((l, r) => r.sold - l.sold || r.revenue - l.revenue)
    }, [transactionSales])

    const itemLinesWithTotals = useMemo(() => {
        return itemRows.map(r => {
            const unitPrice = drinkPriceByName.get(r.name) ?? Math.round(r.revenue / r.sold)
            const lineTotal = Math.round(unitPrice * r.sold)
            return { ...r, unitPrice, lineTotal }
        })
    }, [itemRows, drinkPriceByName])

    const sumOfItems = useMemo(() => {
        return itemLinesWithTotals.reduce((s, r) => s + r.lineTotal, 0)
    }, [itemLinesWithTotals])

    const categoryRows = useMemo(() => {
        const rows = new Map<string, { name: string, sold: number, revenue: number }>()
        transactionSales.forEach((transaction) => {
            const category = drinkCategoryByName.get(transaction.description) ?? 'Unbekannt'
            const current = rows.get(category)
            const amount = Math.abs(transaction.amount)
            if (current) {
                current.sold += 1
                current.revenue += amount
                return
            }
            rows.set(category, { name: category, sold: 1, revenue: amount })
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
        setfinalizeInProgress(true)
        const resp = await doPostRequest('event/checkout/finalize', { action: action, dryRun: false })
        setfinalizeInProgress(false)
        if (resp.code === 200) {
            dispatch(openToast({ message: 'Event wurde finalisiert. Alle Guthaben wurden zurückgesetzt und die Endabrechnung wurde gespeichert.' }))
            navigate('/admin/event-mode')
        } else {
            dispatch(openErrorToast())
        }
    }

    return (
        <div className={style.printView}>

            <Typography variant="h4">Endabrechnung</Typography>
            <Typography variant="body2">{chartDate}</Typography>

            <Typography variant="h6" sx={{ mt: 2 }}>Umsatz: {formatMoney(totalRevenue)} EUR</Typography>
            <Typography variant="h6">Verkauft: {totalSoldItems}</Typography>

            <Typography variant="h6" sx={{ mt: 2 }}>Artikel</Typography>
            <pre>
                {(() => {
                    const lines = itemLinesWithTotals.map(r => `${r.name.padEnd(40)} ${r.sold.toString().padStart(4)} x ${formatMoney(r.unitPrice).padStart(6)} = ${formatMoney(r.lineTotal).padStart(8)} EUR`)
                    const sumLabel = 'Summe'
                    const nameAreaLength = 40 + 1 // name padded to 40 + one space in template
                    const partBeforeLineTotal = 1 + 4 + 3 + 6 + 3 // spaces+qty+' x '+unitPrice+' = '
                    const estimatedTotalLength = nameAreaLength + partBeforeLineTotal + 8 + 4 // 8 for amount field, 4 for ' EUR'
                    const totalLineLength = lines.length > 0 ? lines[0].length : estimatedTotalLength
                    const separator = ' '.repeat(nameAreaLength) + '-'.repeat(Math.max(0, totalLineLength - nameAreaLength))
                    const padForSumLabel = nameAreaLength + partBeforeLineTotal
                    const sumAmount = formatMoney(sumOfItems).padStart(8)
                    lines.push(separator)
                    lines.push(sumLabel.padEnd(padForSumLabel) + sumAmount + ' EUR')
                    return lines.join('\n')
                })()}
            </pre>

            <Typography variant="h6" sx={{ mt: 2 }}>Pro Kategorie</Typography>
            <pre>
                {categoryRows.map(r => `${r.name.padEnd(40)} ${r.sold.toString().padStart(4)} x ${formatMoney(r.revenue).padStart(8)} EUR`).join('\n')}
            </pre>
            <Spacer vertical={25} />
            <Stack flexDirection="row" gap={2}>
                <Button sx={{ ml: 2 }} onClick={() => navigate('/admin/event-mode')}>Abbrechen</Button>
                <Button variant="contained" onClick={() => { window.print() }}>Drucken</Button>
                <Button variant="contained" disabled={finalizeInProgress} color="error" onClick={finalize}>Finalisieren</Button>
            </Stack>
        </div>
    )
}

export default EventSummaryPrint
