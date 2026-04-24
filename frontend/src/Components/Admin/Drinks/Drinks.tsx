import React, { useEffect, useState } from 'react'
import NavigationButton from '../../Common/NavigationButton/NavigationButton'
import Spacer from '../../Common/Spacer'
import AddDrink from './AddDrink'
import Drink from './Drink'
import style from './drinks.module.scss'
import { useDispatch, useSelector } from 'react-redux';
import { CommonReducerType } from '../../../Reducer/CommonReducer';
import { doGetRequest, doPostRequest } from '../../Common/StaticFunctions'
import { openErrorToast, openToast, setDrinkCategories, setDrinks } from '../../../Actions/CommonAction'
import { Button, Collapse, IconButton, TextField, Typography } from '@mui/material'
import StatisticBox from '../../Common/InfoBox/StatisticBox'
import ReportGmailerrorredIcon from '@mui/icons-material/ReportGmailerrorred';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { RootState } from '../../../Reducer/reducerCombiner'
import { AENDERN, AM_WENIGSTEN, KEINE_GETRAENKE, SORTIERINDEX, SORTIERINDEX_GEAENDERT } from '../../Common/Internationalization/i18n'
import { compareCategoriesBySortingIndex, getCategorySortingIndex } from '../../Common/StaticFunctionsTyped'

type Props = {}

const Drinks = (props: Props) => {
    const dispatch = useDispatch()
    const common: CommonReducerType = useSelector((state: RootState) => state.common);
    const [categorySortingInput, setcategorySortingInput] = useState<Record<string, number>>({})
    const [sortingEditorOpenByCategory, setsortingEditorOpenByCategory] = useState<Record<string, boolean>>({})
    const [savingCategory, setsavingCategory] = useState<string | null>(null)

    const refreshDrinksAndCategories = React.useCallback(() => {
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
    }, [dispatch])

    useEffect(() => {
        refreshDrinksAndCategories()
    }, [dispatch, refreshDrinksAndCategories])

    useEffect(() => {
        const updatedState: Record<string, number> = {}
        common.drinkCategories?.forEach((category) => {
            updatedState[category] = getCategorySortingIndex(
                category, common.drinks)
        })
        setcategorySortingInput(updatedState)
    }, [common.drinkCategories, common.drinks])

    useEffect(() => {
        setsortingEditorOpenByCategory((currentState) => {
            const updatedState: Record<string, boolean> = {}
            common.drinkCategories?.forEach((category) => {
                updatedState[category] = currentState[category] ?? false
            })
            return updatedState
        })
    }, [common.drinkCategories])

    const calcMissing = () => {
        if (common.drinks?.length === 0 || !common.drinks) {
            return KEINE_GETRAENKE
        }
        let stock = common.drinks[0].stock
        let name = common.drinks[0].name
        common.drinks.forEach(drink => {
            if (drink.stock < stock) {
                stock = drink.stock;
                name = drink.name
            }
        })
        return name + " (" + stock + ")"
    }

    const handleCategorySortingIndexChange = (category: string, value: string) => {
        const parsedValue = parseInt(value, 10)
        setcategorySortingInput((currentState) => {
            return {
                ...currentState,
                [category]: Number.isNaN(parsedValue) ? 0 : parsedValue
            }
        })
    }

    const toggleCategorySortingEditor = (category: string) => {
        setsortingEditorOpenByCategory((currentState) => {
            return {
                ...currentState,
                [category]: !(currentState[category] ?? false)
            }
        })
    }

    const saveCategorySortingIndex = (category: string) => {
        const sortingIndex = categorySortingInput[category] ?? 0
        setsavingCategory(category)
        doPostRequest("drinks/categories/sorting-index", { category: category, sortingIndex: sortingIndex }).then((value) => {
            if (value.code === 200) {
                dispatch(openToast({ message: SORTIERINDEX_GEAENDERT }))
                refreshDrinksAndCategories()
                setsortingEditorOpenByCategory((currentState) => {
                    return {
                        ...currentState,
                        [category]: false
                    }
                })
            } else {
                dispatch(openErrorToast())
            }
            setsavingCategory(null)
        }).catch(() => {
            dispatch(openErrorToast())
            setsavingCategory(null)
        })
    }


    return (
        <>
            <div className={style.drinksOutterContainer}>
                <div className={style.topContainer}>
                    <AddDrink />
                    <StatisticBox
                        headline={AM_WENIGSTEN}
                        icon={<ReportGmailerrorredIcon />}
                        text={calcMissing()}
                        colorCode={window.globalTS.ICON_COLOR}
                        noPadding
                    />
                </div>
                <div className={style.drinksContainer}>
                    {[...(common.drinkCategories ?? [])].sort((category1, category2) => compareCategoriesBySortingIndex(category1, category2, common.drinks)).map(category => {
                        const drinks = common.drinks?.filter(value => {
                            return value.category === category
                        }).sort((value1, value2) => value1.name.localeCompare(value2.name));

                        const sortingIndex = categorySortingInput[category] ?? getCategorySortingIndex(category, common.drinks)
                        const isSortingEditorOpen = sortingEditorOpenByCategory[category] ?? false

                        return <div className={style.drinksContainerInner} key={category}>
                            <div className={style.categoryHeader}>
                                <Typography variant='h4' className={style.categoryTitle}>{category}</Typography>
                                <IconButton
                                    className={style.categoryEditButton}
                                    color={isSortingEditorOpen ? 'primary' : 'default'}
                                    onClick={() => {
                                        toggleCategorySortingEditor(category)
                                    }}
                                >
                                    <EditOutlinedIcon />
                                </IconButton>
                            </div>
                            <Collapse in={isSortingEditorOpen} className={style.sortingIndexCollapse}>
                                <div className={style.sortingIndexControls}>
                                    <TextField
                                        className={style.sortingIndexField}
                                        label={SORTIERINDEX}
                                        variant='standard'
                                        type='number'
                                        value={sortingIndex}
                                        onChange={(value) => {
                                            handleCategorySortingIndexChange(category, value.target.value)
                                        }}
                                    />
                                    <Button
                                        variant='outlined'
                                        disabled={savingCategory === category}
                                        onClick={() => {
                                            saveCategorySortingIndex(category)
                                        }}
                                    >
                                        {AENDERN}
                                    </Button>
                                </div>
                            </Collapse>
                            <div className={style.drinksContainer}>
                                {drinks?.map((value) => {
                                    return <Drink key={value.id} drink={value} />

                                })}
                            </div>
                        </div>


                    })}
                </div>

            </div>
            <Spacer vertical={50} />
            <NavigationButton destination='/admin' />
        </>
    )
}

export default Drinks