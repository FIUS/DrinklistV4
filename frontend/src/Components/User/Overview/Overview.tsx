import { TextField, Typography } from '@mui/material'
import React, { useEffect } from 'react'
import UserButton from '../UserButton/UserButton'
import style from './overview.module.scss'
import { RootStateOrAny, useDispatch, useSelector } from 'react-redux';
import { CommonReducerType } from '../../../Reducer/CommonReducer';
import { doGetRequest } from '../../Common/StaticFunctions';
import { setDrinkCategories, setDrinks, setMembers } from '../../../Actions/CommonAction';

type Props = {}

const Overview = (props: Props) => {
    const dispatch = useDispatch()
    const common: CommonReducerType = useSelector((state: RootStateOrAny) => state.common);

    useEffect(() => {
        if (common.drinks === null || common.members === null || common.drinkCategories === null) {
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
            doGetRequest("users").then((value) => {
                if (value.code === 200) {
                    dispatch(setMembers(value.content))
                }
            })
        }
    }, [common.drinks, common.members, common.drinkCategories, dispatch])

    return (
        <div className={style.outterContainer}>
            <div className={style.headline}>
                <Typography variant='h4'>Wer bist du?</Typography>
            </div>

            <TextField className={style.input} placeholder="Name" />

            <div className={style.buttonArea}>
                {common.members?.map(value => {
                    if (!value.hidden) {
                        return <UserButton key={value.id} name={value.name} id={value.id} />
                    }
                    return <></>
                })}
            </div>
        </div>
    )
}

export default Overview