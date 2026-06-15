import {
    Category,
    EditOutlined,
    Inventory2Outlined,
    LocalBar,
    Search,
    WarningAmber
} from '@mui/icons-material'
import {
    Avatar,
    Button,
    Collapse,
    IconButton,
    InputAdornment,
    Paper,
    TextField,
    Tooltip,
    Typography
} from '@mui/material'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { openErrorToast, openToast, setDrinkCategories, setDrinks } from '../../../Actions/CommonAction'
import { CommonReducerType } from '../../../Reducer/CommonReducer'
import { RootState } from '../../../Reducer/reducerCombiner'
import { AENDERN, GETRAENKE, KATEGORIE_GEAENDERT, SORTIERINDEX, SORTIERINDEX_GEAENDERT } from '../../Common/Internationalization/i18n'
import { doGetRequest, doPostRequest } from '../../Common/StaticFunctions'
import { compareCategoriesBySortingIndex, getCategorySortingIndex } from '../../Common/StaticFunctionsTyped'
import AddDrink from './AddDrink'
import Drink from './Drink'
import style from './drinks.module.scss'

type MetricCardProps = {
    label: string,
    value: string,
    helper?: string,
    icon: React.ReactNode,
    accent?: string
}

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

const Drinks = () => {
    const dispatch = useDispatch()
    const common: CommonReducerType = useSelector((state: RootState) => state.common)
    const [categorySortingInput, setCategorySortingInput] = useState<Record<string, number>>({})
    const [categoryNameInput, setCategoryNameInput] = useState<Record<string, string>>({})
    const [sortingEditorOpenByCategory, setSortingEditorOpenByCategory] = useState<Record<string, boolean>>({})
    const [savingCategory, setSavingCategory] = useState<string | null>(null)
    const [renamingCategory, setRenamingCategory] = useState<string | null>(null)
    const [search, setSearch] = useState('')

    const refreshDrinksAndCategories = useCallback(() => {
        doGetRequest('drinks').then((value) => {
            if (value.code === 200) {
                dispatch(setDrinks(value.content))
            }
        })
        doGetRequest('drinks/categories').then((value) => {
            if (value.code === 200) {
                dispatch(setDrinkCategories(value.content))
            }
        })
    }, [dispatch])

    useEffect(() => {
        refreshDrinksAndCategories()
    }, [refreshDrinksAndCategories])

    useEffect(() => {
        const updatedState: Record<string, number> = {}
        common.drinkCategories?.forEach((category) => {
            updatedState[category] = getCategorySortingIndex(category, common.drinks)
        })
        setCategorySortingInput(updatedState)

        setCategoryNameInput((currentState) => {
            const updatedNames: Record<string, string> = {}
            common.drinkCategories?.forEach((category) => {
                updatedNames[category] = currentState[category] ?? category
            })
            return updatedNames
        })
    }, [common.drinkCategories, common.drinks])

    useEffect(() => {
        setSortingEditorOpenByCategory((currentState) => {
            const updatedState: Record<string, boolean> = {}
            common.drinkCategories?.forEach((category) => {
                updatedState[category] = currentState[category] ?? false
            })
            return updatedState
        })
    }, [common.drinkCategories])

    const totalStock = useMemo(() => {
        return common.drinks?.reduce((sum, drink) => sum + drink.stock, 0) ?? 0
    }, [common.drinks])

    const lowStockDrinks = useMemo(() => {
        return (common.drinks ?? []).filter((drink) => drink.stock <= 5)
    }, [common.drinks])

    const lowestStockDrink = useMemo(() => {
        if (!common.drinks?.length) {
            return null
        }
        return common.drinks.reduce((lowest, drink) => drink.stock < lowest.stock ? drink : lowest)
    }, [common.drinks])

    const filteredDrinks = useMemo(() => {
        const normalizedSearch = search.trim().toLocaleLowerCase()
        if (!normalizedSearch) {
            return common.drinks ?? []
        }
        return (common.drinks ?? []).filter((drink) => {
            return drink.name.toLocaleLowerCase().includes(normalizedSearch) ||
                drink.category.toLocaleLowerCase().includes(normalizedSearch)
        })
    }, [common.drinks, search])

    const sortedCategories = useMemo(() => {
        return (common.drinkCategories ?? [])
            .filter((category) => filteredDrinks.some((drink) => drink.category === category))
            .slice()
            .sort((left, right) => compareCategoriesBySortingIndex(left, right, common.drinks))
    }, [common.drinkCategories, common.drinks, filteredDrinks])

    const handleCategorySortingIndexChange = (category: string, value: string) => {
        const parsedValue = parseInt(value, 10)
        setCategorySortingInput((currentState) => ({
            ...currentState,
            [category]: Number.isNaN(parsedValue) ? 0 : parsedValue
        }))
    }

    const toggleCategorySortingEditor = (category: string) => {
        setSortingEditorOpenByCategory((currentState) => ({
            ...currentState,
            [category]: !(currentState[category] ?? false)
        }))
    }

    const saveCategorySortingIndex = (category: string) => {
        const sortingIndex = categorySortingInput[category] ?? 0
        setSavingCategory(category)
        doPostRequest('drinks/categories/sorting-index', { category, sortingIndex }).then((value) => {
            if (value.code === 200) {
                dispatch(openToast({ message: SORTIERINDEX_GEAENDERT }))
                refreshDrinksAndCategories()
                setSortingEditorOpenByCategory((currentState) => ({
                    ...currentState,
                    [category]: false
                }))
            } else {
                dispatch(openErrorToast())
            }
            setSavingCategory(null)
        }).catch(() => {
            dispatch(openErrorToast())
            setSavingCategory(null)
        })
    }

    const renameCategory = async (category: string) => {
        const newCategory = (categoryNameInput[category] ?? '').trim()
        const categoryDrinks = (common.drinks ?? []).filter((drink) => drink.category === category)

        if (!newCategory || newCategory === category || categoryDrinks.length === 0) {
            return
        }

        setRenamingCategory(category)
        try {
            const updateResults = await Promise.allSettled(
                categoryDrinks.map((drink) =>
                    doPostRequest(`drinks/${drink.id}/category`, { category: newCategory })
                )
            )

            const [drinksValue, categoriesValue] = await Promise.all([
                doGetRequest('drinks'),
                doGetRequest('drinks/categories')
            ])

            if (drinksValue.code !== 200 || categoriesValue.code !== 200) {
                dispatch(openErrorToast())
                return
            }

            dispatch(setDrinks(drinksValue.content))
            dispatch(setDrinkCategories(categoriesValue.content))

            const updateFailed = updateResults.some((result) =>
                result.status === 'rejected' || result.value.code !== 200
            )

            if (updateFailed) {
                dispatch(openErrorToast())
            } else {
                dispatch(openToast({ message: KATEGORIE_GEAENDERT }))
            }
        } catch {
            dispatch(openErrorToast())
        } finally {
            setRenamingCategory(null)
        }
    }

    return (
        <main className={style.container}>
            <header className={style.header}>
                <div>
                    <Typography variant="overline" color="text.secondary">Administration</Typography>
                    <Typography variant="h4">{GETRAENKE}</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Sortiment, Preise und Bestände zentral verwalten
                    </Typography>
                </div>
                <Paper className={style.resultSummary} variant="outlined">
                    <LocalBar color="action" />
                    <div>
                        <Typography variant="caption" color="text.secondary">Aktuelle Auswahl</Typography>
                        <Typography variant="body2" fontWeight={600}>
                            {filteredDrinks.length} von {common.drinks?.length ?? 0} Getränken
                        </Typography>
                    </div>
                </Paper>
            </header>

            <section className={style.section}>
                <Typography variant="h5">Auf einen Blick</Typography>
                <div className={style.metricGrid}>
                    <MetricCard label="Getränke" value={`${common.drinks?.length ?? 0}`} icon={<LocalBar />} />
                    <MetricCard label="Kategorien" value={`${common.drinkCategories?.length ?? 0}`} icon={<Category />} />
                    <MetricCard label="Gesamtbestand" value={`${totalStock}`} helper="Flaschen und Einheiten" icon={<Inventory2Outlined />} />
                    <MetricCard
                        label="Niedrigster Bestand"
                        value={lowestStockDrink ? `${lowestStockDrink.stock}` : '–'}
                        helper={lowestStockDrink?.name}
                        icon={<WarningAmber />}
                        accent={window.globalTS.ICON_COLOR_SECONDARY}
                    />
                </div>
            </section>

            <section className={style.section}>
                <div>
                    <Typography variant="h5">Getränk hinzufügen</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Neues Produkt mit Kategorie, Preis und Anfangsbestand anlegen
                    </Typography>
                </div>
                <AddDrink />
            </section>

            <section className={style.section}>
                <div className={style.directoryHeader}>
                    <div>
                        <Typography variant="h5">Sortiment</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Produkte suchen, bearbeiten und nach Kategorien organisieren
                        </Typography>
                    </div>
                    {lowStockDrinks.length > 0 ? (
                        <Paper className={style.stockWarning} variant="outlined">
                            <WarningAmber color="warning" />
                            <Typography variant="body2">
                                {lowStockDrinks.length} {lowStockDrinks.length === 1 ? 'Produkt' : 'Produkte'} mit niedrigem Bestand
                            </Typography>
                        </Paper>
                    ) : null}
                </div>

                <Paper className={style.filterCard} variant="outlined">
                    <TextField
                        label="Getränk oder Kategorie suchen"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        size="small"
                        fullWidth
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search fontSize="small" />
                                </InputAdornment>
                            )
                        }}
                    />
                    {search ? <Button onClick={() => setSearch('')}>Filter löschen</Button> : null}
                </Paper>

                <div className={style.categoryList}>
                    {sortedCategories.map((category) => {
                        const drinks = filteredDrinks
                            .filter((drink) => drink.category === category)
                            .slice()
                            .sort((left, right) => left.name.localeCompare(right.name))
                        const sortingIndex = categorySortingInput[category] ?? getCategorySortingIndex(category, common.drinks)
                        const isSortingEditorOpen = sortingEditorOpenByCategory[category] ?? false

                        return (
                            <Paper className={style.categorySection} elevation={1} key={category}>
                                <div className={style.categoryHeader}>
                                    <div className={style.categoryHeading}>
                                        <Avatar sx={{ bgcolor: window.globalTS.ICON_COLOR }}><Category /></Avatar>
                                        <div>
                                            <Typography variant="h5">{category}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {drinks.length} {drinks.length === 1 ? 'Getränk' : 'Getränke'} · Sortierung {sortingIndex}
                                            </Typography>
                                        </div>
                                    </div>
                                    <Tooltip title="Kategorie-Sortierung ändern">
                                        <IconButton
                                            color={isSortingEditorOpen ? 'primary' : 'default'}
                                            onClick={() => toggleCategorySortingEditor(category)}
                                        >
                                            <EditOutlined />
                                        </IconButton>
                                    </Tooltip>
                                </div>

                                <Collapse in={isSortingEditorOpen}>
                                    <div className={style.categoryEditor}>
                                        <div className={style.categoryEditorRow}>
                                            <TextField
                                                className={style.categoryEditorField}
                                                label={SORTIERINDEX}
                                                size="small"
                                                type="number"
                                                value={sortingIndex}
                                                onChange={(event) => handleCategorySortingIndexChange(category, event.target.value)}
                                            />
                                            <Button
                                                variant="contained"
                                                disabled={savingCategory === category || renamingCategory === category}
                                                onClick={() => saveCategorySortingIndex(category)}
                                            >
                                                {AENDERN}
                                            </Button>
                                        </div>
                                        <div className={style.categoryEditorRow}>
                                            <TextField
                                                className={style.categoryEditorField}
                                                label="Neuer Kategoriename"
                                                size="small"
                                                value={categoryNameInput[category] ?? category}
                                                onChange={(event) => {
                                                    setCategoryNameInput((currentState) => ({
                                                        ...currentState,
                                                        [category]: event.target.value
                                                    }))
                                                }}
                                            />
                                            <Button
                                                variant="outlined"
                                                disabled={
                                                    renamingCategory === category ||
                                                    savingCategory === category ||
                                                    !(categoryNameInput[category] ?? '').trim() ||
                                                    (categoryNameInput[category] ?? '').trim() === category
                                                }
                                                onClick={() => renameCategory(category)}
                                            >
                                                Kategorie umbenennen
                                            </Button>
                                        </div>
                                    </div>
                                </Collapse>

                                <div className={style.drinkGrid}>
                                    {drinks.map((drink) => <Drink key={drink.id} drink={drink} />)}
                                </div>
                            </Paper>
                        )
                    })}
                </div>

                {filteredDrinks.length === 0 ? (
                    <Paper className={style.emptyState} variant="outlined">
                        <Search color="disabled" fontSize="large" />
                        <Typography variant="h6">Keine Getränke gefunden</Typography>
                        <Typography variant="body2" color="text.secondary">Passe den Suchfilter an.</Typography>
                    </Paper>
                ) : null}
            </section>
        </main>
    )
}

export default Drinks
