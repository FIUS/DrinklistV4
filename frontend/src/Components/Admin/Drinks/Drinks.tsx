import React, { useEffect } from 'react'
import NavigationButton from '../../Common/NavigationButton/NavigationButton'
import Spacer from '../../Common/Spacer'
import AddDrink from './AddDrink'
import Drink from './Drink'
import style from './drinks.module.scss'
import { useDispatch, useSelector } from 'react-redux';
import { CommonReducerType } from '../../../Reducer/CommonReducer';
import { doGetRequest } from '../../Common/StaticFunctions'
import { setDrinkCategories, setDrinks } from '../../../Actions/CommonAction'
import { Typography } from '@mui/material'
import StatisticBox from '../../Common/InfoBox/StatisticBox'
import ReportGmailerrorredIcon from '@mui/icons-material/ReportGmailerrorred';
import { RootState } from '../../../Reducer/reducerCombiner'


type Props = {}

const Drinks = (props: Props) => {
    const dispatch = useDispatch()
    const common: CommonReducerType = useSelector((state: RootState) => state.common);

    useEffect(() => {

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

    const calcMissing = () => {
        if (common.drinks?.length === 0 || !common.drinks) {
            return "No drinks"
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


    return (
        <>
            <div className={style.drinksOutterContainer}>
                <div className={style.topContainer}>
                    <AddDrink />
                    <StatisticBox
                        headline='Least Stock Drink'
                        icon={<ReportGmailerrorredIcon />}
                        text={calcMissing()}
                        colorCode={window.globalTS.ICON_COLOR}
                        noPadding
                    />
                </div>
                <div className={style.drinksContainer}>
                    {common.drinkCategories?.map(category => {
                        const drinks = common.drinks?.filter(value => {
                            return value.category === category
                        });

                        return <div className={style.drinksContainerInner}>
                            <Typography variant='h4' style={{ width: "100%" }}>{category}</Typography>
                            {drinks?.map((value) => {
                                return <Drink drink={value} />

                            })}
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