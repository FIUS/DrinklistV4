import { History, PersonSearch, Search } from '@mui/icons-material'
import { InputAdornment, Paper, TextField, Typography } from '@mui/material'
import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { setDrinkCategories, setDrinks, setMembers } from '../../../Actions/CommonAction'
import { CommonReducerType } from '../../../Reducer/CommonReducer'
import { RootState } from '../../../Reducer/reducerCombiner'
import { Transaction } from '../../../types/ResponseTypes'
import { WER_BIST_DU } from '../../Common/Internationalization/i18n'
import { datetimeToString, doGetRequest } from '../../Common/StaticFunctions'
import UserButton from '../UserButton/UserButton'
import style from './overview.module.scss'

const Overview = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const common: CommonReducerType = useSelector((state: RootState) => state.common)
    const [searchField, setSearchField] = useState('')
    const [history, setHistory] = useState<Array<Transaction>>([])

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

    useEffect(() => {
        if (!common.drinks) {
            return
        }

        doGetRequest('transactions/limit/10').then((value) => {
            if (value.code !== 200) {
                return
            }

            const drinkNames = common.drinks.map((drink) => drink.name.toLocaleLowerCase())
            const purchases = (value.content as Array<Transaction>).filter((transaction) => {
                const description = transaction.description.toLocaleLowerCase()
                return drinkNames.some((drinkName) => description.includes(drinkName))
            })
            setHistory(purchases)
        })
    }, [common.drinks])

    const normalizedSearch = searchField.trim().toLocaleLowerCase()

    const visibleMembers = useMemo(() => {
        return (common.members ?? [])
            .filter((member) => {
                const matchesSearch = normalizedSearch === '' ||
                    member.name.toLocaleLowerCase().includes(normalizedSearch) ||
                    member.alias.toLocaleLowerCase().includes(normalizedSearch)
                const exactSearchMatch = normalizedSearch !== '' &&
                    (member.name.toLocaleLowerCase() === normalizedSearch ||
                        member.alias.toLocaleLowerCase() === normalizedSearch)
                return (!member.hidden && matchesSearch) || exactSearchMatch
            })
            .slice()
            .sort((left, right) => {
                const leftName = left.alias || left.name
                const rightName = right.alias || right.name
                return leftName.localeCompare(rightName)
            })
    }, [common.members, normalizedSearch])

    const memberName = (memberID: number) => {
        const member = common.members?.find((item) => item.id === memberID)
        return member?.alias || member?.name || `Mitglied #${memberID}`
    }

    const redirectToUser = () => {
        if (visibleMembers.length === 1) {
            navigate(`/user/${visibleMembers[0].id}`)
        }
    }

    return (
        <main className={style.container}>
            <div className={style.heroRow}>
                <div className={style.heroMain}>
                    <header className={style.hero}>
                        <div className={style.heroIcon} style={{ backgroundColor: window.globalTS.ICON_COLOR }}>
                            <PersonSearch />
                        </div>
                        <div>
                            <Typography variant="overline" color="text.secondary">Drinklist</Typography>
                            <Typography variant="h3">{WER_BIST_DU}</Typography>
                            <Typography variant="body1" color="text.secondary">
                                Suche deinen Namen und öffne dein persönliches Getränkekonto.
                            </Typography>
                        </div>
                    </header>

                    <form
                        className={style.searchForm}
                        noValidate
                        autoComplete="off"
                        onSubmit={(event) => {
                            event.preventDefault()
                            redirectToUser()
                        }}
                    >
                        <TextField
                            label="Name oder Alias"
                            type="search"
                            value={searchField}
                            autoFocus
                            fullWidth
                            onChange={(event) => setSearchField(event.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search />
                                    </InputAdornment>
                                )
                            }}
                        />
                    </form>
                </div>
            </div>

            <div className={style.contentGrid}>
                <section className={style.memberSection}>
                    <div className={style.sectionHeading}>
                        <div>
                            <Typography variant="h5">Mitglieder</Typography>
                            <Typography variant="body2" color="text.secondary">
                                {visibleMembers.length} Treffer
                            </Typography>
                        </div>
                    </div>

                    {visibleMembers.length > 0 ? (
                        <div className={style.memberGrid}>
                            {visibleMembers.map((member) => (
                                <UserButton key={member.id} member={member} />
                            ))}
                        </div>
                    ) : (
                        <Paper className={style.emptyState} variant="outlined">
                            <Search color="disabled" fontSize="large" />
                            <Typography variant="h6">Niemand gefunden</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Prüfe den Namen oder Alias.
                            </Typography>
                        </Paper>
                    )}
                </section>

                <aside className={style.activitySection}>
                    <div className={style.sectionHeading}>
                        <div>
                            <Typography variant="h5">Letzte Käufe</Typography>
                            <Typography variant="body2" color="text.secondary">Was zuletzt abgestrichen wurde</Typography>
                        </div>
                        <History color="action" />
                    </div>
                    <Paper className={style.activityCard} elevation={1}>
                        {history.slice(0, 5).map((transaction) => (
                            <div className={style.activityItem} key={transaction.id}>
                                <div>
                                    <Typography variant="body2" fontWeight={600}>
                                        {transaction.description}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {memberName(transaction.memberID)}
                                    </Typography>
                                </div>
                                <Typography variant="caption" color="text.secondary">
                                    {datetimeToString(transaction.date)}
                                </Typography>
                            </div>
                        ))}
                        {history.length === 0 ? (
                            <div className={style.activityEmpty}>
                                <History color="disabled" />
                                <Typography variant="body2" color="text.secondary">
                                    Noch keine Käufe vorhanden
                                </Typography>
                            </div>
                        ) : null}
                    </Paper>
                </aside>
            </div>
        </main>
    )
}

export default Overview
