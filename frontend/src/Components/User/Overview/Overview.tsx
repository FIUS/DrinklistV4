import { Grow, TextField, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
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
    const [searchfield, setsearchfield] = useState("")

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

            <TextField
                className={style.input}
                placeholder="Name"
                type="search"
                value={searchfield}
                onChange={
                    (value) => { setsearchfield(value.target.value) }
                }
            />

            <div className={style.buttonArea}>
                {common.members?.map(value => {
                    if (!value.hidden) {
                        return <Grow in={searchfield === "" || value.name.toLowerCase().includes(searchfield.toLowerCase())} key={value.id}>
                            <div >
                                <UserButton key={value.id} name={value.name} id={value.id} />
                            </div>
                        </Grow>
                    }
                    return <></>
                })}
            </div>
        </div>
    )
}

export default Overview
//