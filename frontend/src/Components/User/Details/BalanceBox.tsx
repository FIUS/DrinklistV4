import { Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { Drink } from '../../../types/ResponseTypes'
import { FAVORITEN } from '../../Common/Internationalization/i18n'
import DrinkButton from '../DrinkButton/DrinkButton'
import style from './details.module.scss'
import { doGetRequest } from '../../Common/StaticFunctions'
import { format } from 'react-string-format'
import { CommonReducerType } from '../../../Reducer/CommonReducer'
import { useSelector } from 'react-redux'
import { RootState } from '../../../Reducer/reducerCombiner'

type Props = {
    favorites: Array<Drink> | undefined,
    memberID: string,
    image: string | null
}

const BalanceBox = (props: Props) => {
    const containerRef = React.useRef(null);
    const common: CommonReducerType = useSelector((state: RootState) => state.common);
    const [favorite, setfavourite] = useState<null | { drinkID: number, confidence: boolean }>(null)
    const generatedFavorite = common.drinks?.find(drink => drink.id === favorite?.drinkID)
    const [showAdditionalDrink, setshowAdditionalDrink] = useState(false)

    useEffect(() => {
        doGetRequest(format("users/{0}/favorites/generated", props.memberID)).then((response) => {
            setfavourite(response.content)
        })
    }, [props.memberID])

    useEffect(() => {
        setshowAdditionalDrink(props.favorites?.find(drink => drink.id === favorite?.drinkID) === undefined && generatedFavorite !== undefined)
    }, [favorite?.drinkID, generatedFavorite, props.favorites])

    if (props.favorites === undefined) {
        return <></>
    }

    return (
        <div className={style.balanceBoxContainer}>
            {props.favorites?.length > 0 || showAdditionalDrink ? <><Typography variant='h4'>{FAVORITEN}</Typography>
                <div className={style.drinkButtonContainer} ref={containerRef}>
                    {showAdditionalDrink ? <DrinkButton
                        image={props.image}
                        drink={generatedFavorite !== undefined ? generatedFavorite : common.drinks![0]}
                        memberID={props.memberID}
                        key={props.memberID}
                        isGeneratedFavorite={true}
                    /> : <></>}
                    {props.favorites?.sort((drink1, drink2) => drink1.name.localeCompare(drink2.name)).map((value) => {
                        return <DrinkButton
                            image={props.image}
                            drink={value}
                            memberID={props.memberID}
                            key={props.memberID}
                            isGeneratedFavorite={favorite?.drinkID === value.id}
                        />
                    })}
                </div></> : <></>}
        </div>
    )
}

export default BalanceBox