import React from 'react'
import NavigationButton from '../../Common/NavigationButton/NavigationButton'
import AddDrink from './AddDrink'
import Drink from './Drink'
import style from './drinks.module.scss'

type Props = {}

const Drinks = (props: Props) => {
    return (
        <>
            <div className={style.drinksOutterContainer}>
                <AddDrink />
                <div className={style.drinksContainer}>

                    <Drink />
                    <Drink />
                    <Drink />
                    <Drink />
                    <Drink />
                    <Drink />
                    <Drink />
                    <Drink />
                    <Drink />

                </div>

            </div>
            <NavigationButton destination='/admin' />
        </>
    )
}

export default Drinks