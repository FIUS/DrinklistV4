import { Typography } from '@mui/material'
import React from 'react'
import { Drink } from '../../../types/ResponseTypes'
import { FAVORITEN } from '../../Common/Internationalization/i18n'
import DrinkButton from '../DrinkButton/DrinkButton'
import style from './details.module.scss'

type Props = {
    favorites: Array<Drink> | undefined,
    memberID: string
}

const BalanceBox = (props: Props) => {
    const containerRef = React.useRef(null);

    if (props.favorites === undefined) {
        return <></>
    }

    return (
        <div className={style.balanceBoxContainer}>
            {props.favorites?.length > 0 ? <><Typography variant='h4'>{FAVORITEN}</Typography>
                <div className={style.drinkButtonContainer} ref={containerRef}>
                    {props.favorites?.sort((drink1, drink2) => drink1.name.localeCompare(drink2.name)).map((value) => {
                        return <DrinkButton drink={value}
                            memberID={props.memberID}
                            key={props.memberID} />
                    })}
                </div></> : <></>}
        </div>
    )
}

export default BalanceBox